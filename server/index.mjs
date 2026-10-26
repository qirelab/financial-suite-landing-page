// Contact form API: receives form submissions and forwards them to Brevo.
// Runs on the VPS behind nginx (location /api/), so the Brevo API key never
// reaches the browser and requests come from the IP authorized in Brevo.
// No dependencies — requires Node.js 18+ (global fetch).

import { createServer } from 'node:http';

const PORT = Number(process.env.PORT) || 1804;
const HOST = process.env.HOST || '127.0.0.1';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || 'noreply@f-suite.com';
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Financial Suite';
const MAIL_TO = process.env.MAIL_TO;

if (!BREVO_API_KEY || !MAIL_TO) {
  console.error('BREVO_API_KEY and MAIL_TO must be set');
  process.exit(1);
}

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
    sender: { email: MAIL_FROM, name: MAIL_FROM_NAME },
    to: [{ email: MAIL_TO }],
    replyTo: { email: data.email, name: data.name },
    subject: `${formType}: ${data.name} (${data.company})`,
    htmlContent: `<h2>${formType}</h2><table>${htmlRows}</table>`,
    textContent: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
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
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildEmail(data)),
    });

    if (!response.ok) {
      console.error(`Brevo error ${response.status}: ${await response.text()}`);
      return sendJson(res, 502, { error: 'Failed to send email' });
    }

    return sendJson(res, 200, { success: true });
  } catch (error) {
    console.error('Brevo request failed:', error);
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
