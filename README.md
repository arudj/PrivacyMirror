<!-- README.md -->
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
npm run build        # one-off production build -> dist/
npm run typecheck    # type-check only, no build
```

Then in Chrome: `chrome://extensions` → activer "Mode développeur" →
"Charger l'extension non empaquetée" → sélectionner le dossier `dist/`.
Après chaque changement de code : `npm run build` puis cliquer sur le
bouton reload de l'extension dans `chrome://extensions`.

## Tester avec la page de démo

Un site de test est fourni dans `demo/index.html` (trackers simulés,
signaux de fingerprinting, contenu gaming/shopping pour l'inference engine).

```bash
npx serve demo
# ou
python3 -m http.server 3000 --directory demo
```

Ouvrez l'URL affichée, puis :
1. Cliquez sur l'icône de l'extension → observez `Privacy risk`, la liste de
   trackers, les signaux de fingerprinting et les inférences.
2. Cliquez **Protect me**.
3. Rechargez la page (F5) et rouvrez l'extension → les compteurs de
   trackers/fingerprinting doivent avoir chuté, le site reste fonctionnel.

C'est la séquence Detection → Explanation → Prevention → Verification
décrite dans le PDF (section 9).

## Project structure & ownership

| Path | Owner | Role |
|---|---|---|
| `src/background/`, `src/content/`, `src/blocking/` | Personne A | Extension, détection réseau/fingerprint, blocking |
| `src/analyzer/`, `src/popup/` | Personne B | Tracker/inference/risk analysis, React UI |
| `src/types/` | Partagé | Contrat de données/messages — **ne pas modifier sans se prévenir** |
| `src/data/` | Partagé | Listes statiques (trackers connus, règles d'inférence, sévérité fingerprint) |
| `demo/` | — | Page de test pour la démo devant le jury |

## Comment les deux moitiés se branchent

1. **Capture (Personne A)** : `service-worker.ts` écoute `chrome.webRequest`
   (requêtes réseau brutes) et les messages du content script (signaux de
   fingerprinting, métadonnées de page). Il stocke un état brut par domaine,
   *sans catégoriser ni scorer quoi que ce soit*.
2. **Analyse (Personne B)** : à chaque mutation, le service worker appelle
   `analyzeTrackers()`, `inferFromPage()` et `computeRiskScore()`
   (`src/analyzer/`) pour transformer cet état brut en `PageAnalysis` complet,
   qu'il persiste dans `chrome.storage.local` sous la clé `analysis:<domaine>`.
3. **UI (Personne B)** : la popup demande cet objet via un message
   `GET_ANALYSIS` (`src/types/index.ts` définit le contrat complet des
   messages `chrome.runtime`), jamais en lisant `chrome.storage.local`
   directement.

## MVP scope

- ✅ Third-party requests detection
- ✅ Known trackers / categories
- ✅ Fingerprinting signals (presence, not proof)
- ✅ Local rule-based inference ("what they may infer")
- ✅ Blocking via `declarativeNetRequest`
- ❌ Full browsing history, longitudinal profiling, ML model, extension probing (bonus only)