// Contact form API: receives form submissions and sends them via Brevo SMTP relay.
// Runs on the VPS behind nginx (location /api/), so SMTP credentials never
// reach the browser and connections come from the IP authorized in Brevo.

import { createServer } from 'node:http';
import nodemailer from 'nodemailer';

const PORT = Number(process.env.PORT) || 1804;
const HOST = process.env.HOST || '127.0.0.1';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@f-suite.com';
const CONTACT_TO = process.env.CONTACT_TO;

if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !CONTACT_TO) {
  console.error('SMTP_USER, SMTP_PASS and CONTACT_TO must be set');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const MAX_BODY_BYTES = 10 * 1024;
const FIELD_LIMITS = { name: 200, email: 200, company: 200, phone: 50, message: 5000 };
const FORM_TYPES = { demo: 'Demo Request', partner: 'Partner Request' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limit: RATE_LIMIT requests per IP per window
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();

const isRateLimited = (ip) => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
};

setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of hits) {
    if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

// Returns normalized fields or null if the payload is invalid
const validate = (payload) => {
  if (!payload || typeof payload !== 'object' || !FORM_TYPES[payload.formType]) return null;

  const fields = {};
  for (const [key, limit] of Object.entries(FIELD_LIMITS)) {
    const value = payload[key] ?? '';
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (trimmed.length > limit) return null;
    fields[key] = trimmed;
  }

  if (!fields.name || !fields.company || !EMAIL_RE.test(fields.email)) return null;
  return { formType: payload.formType, ...fields };
};

const buildEmail = (data) => {
  const formType = FORM_TYPES[data.formType];
  const rows = [
    ['Name', data.name],
    ['Email', data.email],
    ['Company', data.company],
    ['Phone', data.phone || 'Not provided'],
    ['Message', data.message || 'No message provided'],
  ];
  if (data.formType === 'demo') rows.splice(3, 2);

  const htmlRows = rows
    .map(([label, value]) => `<tr><td style="padding:4px 12px 4px 0"><b>${label}</b></td><td style="padding:4px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`)
    .join('');

  return {
    from: `"Financial Suite website" <${SMTP_FROM}>`,
    to: CONTACT_TO,
    replyTo: { name: data.name, address: data.email },
    subject: `${formType}: ${data.name} (${data.company})`,
    html: `<h2>${formType}</h2><table>${htmlRows}</table>`,
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
  };
};

const handleContact = async (req, res) => {
  const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
  if (isRateLimited(ip)) return sendJson(res, 429, { error: 'Too many requests' });

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { error: 'Invalid request body' });
  }

  const data = validate(payload);
  if (!data) return sendJson(res, 400, { error: 'Invalid form data' });

  try {
    await transporter.sendMail(buildEmail(data));
    return sendJson(res, 200, { success: true });
  } catch (error) {
    console.error('Failed to send email via SMTP:', error);
    return sendJson(res, 502, { error: 'Failed to send email' });
  }
};

createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/contact') {
    handleContact(req, res);
    return;
  }
  sendJson(res, 404, { error: 'Not found' });
}).listen(PORT, HOST, () => {
  console.log(`Contact API listening on http://${HOST}:${PORT}`);
});
