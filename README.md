# Financial Suite — Landing Page

Marketing site for **Financial Suite**, an AI-powered cost optimization tool.
Single-page React app with a partner page, legal pages, three languages, and PWA support.

Production: [f-suite.com](https://f-suite.com)
Original design: [Figma](https://www.figma.com/design/NqGKIYuDybTBHNCENVBqiM/Financial-Suite-Landing-Page--Community-)

## Tech stack

| Area | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 (`@vitejs/plugin-react-swc`) |
| Routing | React Router 7 (`BrowserRouter`) |
| Styling | Tailwind CSS v4 (prebuilt into `src/index.css`) + per-component CSS |
| UI primitives | Radix UI, `lucide-react`, `class-variance-authority` |
| Animation | AOS (scroll animations) |
| Forms → email | EmailJS (`@emailjs/browser`) |
| Images | `vite-plugin-image-optimizer` (PNG/JPEG q80) |
| Hosting | nginx on a VPS, deployed by GitHub Actions |

## Getting started

Requirements: Node.js 20+ (CI builds on Node 23) and npm.

```bash
npm i                  # install dependencies
cp .env.example .env   # fill in EmailJS credentials
npm run dev            # dev server on http://localhost:3000 (opens automatically)
npm run build          # production build into build/
```

There is no `preview` script — to check a production build locally, run `npx vite preview --outDir build`.

## Environment variables

All variables are `VITE_`-prefixed, so they are **embedded into the client bundle** — never put anything secret here. See [.env.example](.env.example).

| Variable | Purpose |
|---|---|
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `VITE_CONTACT_EMAIL` | Address that receives form submissions |

If they are missing, [src/services/emailService.ts](src/services/emailService.ts) falls back to placeholder values and email sending will fail.
Full walkthrough: [EMAILJS_SETUP.md](EMAILJS_SETUP.md).

## Project structure

```
index.html            # entry HTML: SEO, Open Graph, PWA meta tags
vite.config.ts        # aliases (incl. figma:asset/*), build.outDir = build/
nginx.conf            # production server block for f-suite.com
public/               # manifest.json, service-worker.js, robots.txt
src/
  main.tsx            # providers + service worker registration
  App.tsx             # header, footer, routes
  pages/              # HomePage, PartnerPage, PrivacyPolicy, TermsOfService
  components/         # shared components
    ui/               # Radix-based primitives
    figma/            # components imported from Figma
  context/            # LocalizationContext, AlertContext
  locales/            # en.ts, pl.ts, ru.ts
  services/           # emailService.ts
  styles/             # globals.css (design tokens), FormStyles.css
  index.css           # generated Tailwind v4 output — do not hand-edit
  assets/ icons/ imports/
```

### Routes

| Path | Page |
|---|---|
| `/` | HomePage (sections: `#why-us`, `#how-it-works`, `#faq`, `#demo-form`) |
| `/partner` | Partner page + contact form |
| `/privacy-policy` | Privacy policy |
| `/terms-of-service` | Terms of service |

Routing is history-based, so any host must fall back to `index.html` (nginx already does via `try_files $uri /index.html`).

## Localization

Three languages — English, Polish, Russian — live in [src/locales/](src/locales/) and are served through `LocalizationContext`. Components read copy via `const { t } = useLocalization()`. To add a string, add the key to **all three** locale files.

## PWA

The app ships a manifest, icon set and a service worker (`financial-suite-v1` cache). Details and how to bump the cache version: [PWA_SETUP.md](PWA_SETUP.md).

## Deployment

Pushing to `master` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

1. `npm ci` and `npm audit --audit-level=critical` (the job fails on critical vulnerabilities)
2. writes `.env` from the `ENV_FILE` secret, sources it, runs `npm run build`
3. packs `build/` into `f-suite-landing.tar.gz` and copies it to the VPS over SCP
4. replaces `/var/www/f-suite-landing/build` with the new bundle

Required repository secrets:

| Secret | Purpose |
|---|---|
| `ENV_FILE` | Full contents of the production `.env` |
| `VPS_HOST` | Server host |
| `VPS_USERNAME` | SSH user |
| `VPS_KEY` | SSH private key |
| `VPS_PORT` | SSH port (defaults to 22) |

nginx serves the extracted `build/` directory — see [nginx.conf](nginx.conf). The deploy step only replaces static files and does not reload nginx; that is fine because the document root path never changes.

## Notes for contributors

- `build/`, `node_modules/` and `.env` are gitignored; only `.env.example` is committed.
- `src/index.css` is compiled Tailwind output — change design tokens in [src/styles/globals.css](src/styles/globals.css) instead.
- `vite.config.ts` maps `figma:asset/<hash>.png` specifiers to files in `src/assets/`; keep the alias list in sync when new Figma assets are added.
- Asset credits: [src/Attributions.md](src/Attributions.md).
