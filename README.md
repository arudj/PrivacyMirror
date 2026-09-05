# Privacy Mirror

Privacy Mirror is a Chrome extension that locally analyzes a webpage's
third-party requests and fingerprinting signals, explains what these signals
could reveal about the user, and lets the user block selected tracking
activity. No browsing data leaves the device.

## Stack

TypeScript · Chrome Extension Manifest V3 · Vite · React · `chrome.storage.local`
No backend, no external API.

## Getting started

```bash
npm install
npm run dev        # rebuild on change (dist/)
npm run build       # one-off production build
```

Then in Chrome: `chrome://extensions` → activer "Mode développeur" →
"Charger l'extension non empaquetée" → sélectionner le dossier `dist/`.
Après chaque changement : cliquer sur le bouton reload de l'extension.

## Project structure & ownership

| Path | Owner | Role |
|---|---|---|
| `src/background/`, `src/content/`, `src/blocking/` | Personne A | Extension, détection réseau/fingerprint, blocking |
| `src/analyzer/`, `src/popup/` | Personne B | Tracker/inference/risk analysis, React UI |
| `src/types/` | Partagé | Contrat de données/messages, ne pas modifier sans se prévenir |
| `src/data/` | Partagé | Listes statiques (trackers connus, signaux de fingerprinting) |

## MVP scope

- ✅ Third-party requests detection
- ✅ Known trackers / categories
- ✅ Fingerprinting signals (presence, not proof)
- ✅ Local rule-based inference ("what can they infer")
- ✅ Blocking via `declarativeNetRequest`
- ❌ Full browsing history, longitudinal profiling, ML model, extension probing (bonus only)
