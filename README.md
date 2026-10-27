# Mentawai Indah: booking website and property management system (prototype)

A clickable prototype for Mentawai Indah: a guest booking website (villas and speedboat seats)
and a staff property management system (PMS), in one static site plus one serverless function.

Live: https://mentawai-indah.vercel.app

## What's in this folder

- `index.html` – the page, with all styles
- `js/` – the app, loaded in this order: app, users, profile, core, cart, pms, pms-cal, pms-ext, pms-boat, pms-nav, pms-pier, pms-back, site-text, chat
- `api/chat.js` – serverless function for the AI chat (needs `ANTHROPIC_API_KEY` set in Vercel)
- `assets/` – logos
- `vercel.json` – Vercel settings

No build step: Vercel serves the files as they are.

## Demo logins

- Guest: anna.keller@example.com / demo1234
- Staff: Sign in → Staff tab → admin@mentawaiindah.example / demo1234

Data is stored in each visitor's browser (localStorage). Payments and WhatsApp messages are simulated.
