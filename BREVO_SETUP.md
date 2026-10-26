# Brevo email setup

The demo form (home page) and the partner form (`/partner`) send submissions through
[Brevo](https://www.brevo.com/) SMTP relay (nodemailer) — same setup as qirewebsite.

```
browser ──POST /api/contact──▶ nginx ──▶ server/index.mjs (127.0.0.1:1804) ──SMTP──▶ smtp-relay.brevo.com:587
```

SMTP credentials live only on the VPS. Connections to Brevo come from the VPS IP, which must be
in Brevo's authorized IPs list (Brevo > Security > Authorized IPs).

## API endpoint

`POST /api/contact`, JSON body:

| Field | Required | Limit |
|---|---|---|
| `formType` | yes — `demo` or `partner` | |
| `name` | yes | 200 chars |
| `email` | yes, valid email | 200 chars |
| `company` | yes | 200 chars |
| `phone` | no | 50 chars |
| `message` | no | 5000 chars |

Responses: `200 {success: true}`, `400` invalid data, `429` rate limit (5 requests per IP per 10 minutes),
`502` SMTP send failed (details in the service log).

The email goes to `CONTACT_TO`, from `SMTP_FROM`, with Reply-To set to the visitor's address,
so you can answer straight from your inbox.

## One-time VPS setup

Run everything as the SSH user from the `VPS_USERNAME` secret — pm2 runs the API under that user.

1. Check Node.js 20+ (required by nodemailer 10) and pm2 (`npm i -g pm2` if missing). Both must also be on `PATH` in a
   non-interactive SSH session (deploy runs `pm2` that way — watch out for nvm installs):

   ```bash
   node --version && pm2 --version
   ssh <user>@<host> 'pm2 --version'   # from your machine
   ```

2. Put the API config into the `ENV_FILE` repository secret
   (GitHub → Settings → Secrets and variables → Actions), template:
   [server/.env.example](server/.env.example). Deploy writes it to
   `/var/www/f-suite-api/.env` with `chmod 600` on every push — edit the secret, not the file on the server.

3. Make pm2 start on boot: run `pm2 startup` and execute the command it prints (needs sudo once).

4. Add the `location /api/` block from [nginx.conf](nginx.conf) to the site config, then
   `sudo nginx -t && sudo systemctl reload nginx`.

5. Push to `master`. The deploy copies `index.mjs`, `ecosystem.config.cjs` and `.env` to
   `/var/www/f-suite-api/`, runs `npm ci --omit=dev` there, then `pm2 startOrReload ... --update-env` and `pm2 save`
   (see [.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

6. Check it end to end:

   ```bash
   curl -i -X POST https://f-suite.com/api/contact \
     -H 'Content-Type: application/json' \
     -d '{"formType":"partner","name":"Test","email":"test@example.com","company":"Test"}'
   ```

The API listens on `127.0.0.1:1804` — only nginx reaches it, no firewall changes needed.
To change a variable, update `ENV_FILE` and re-run the deploy workflow.

Logs: `pm2 logs f-suite-api`.

## Local development

```bash
(cd server && npm ci)
cp server/.env.example server/.env   # fill in SMTP_USER, SMTP_PASS, CONTACT_TO
npm run api                          # API on 127.0.0.1:1804 (needs Node 20.6+ for --env-file)
npm run dev                          # Vite proxies /api to the API
```

If your local IP is not in Brevo's authorized IPs list, Brevo will reject requests from your
machine with an authentication error — add it temporarily or test on the VPS.
