# Decoding Movement from the Brain

An interactive, visual explainer of the math behind decoding intended movement direction
from motor cortex activity — built around Georgopoulos's population vector model
(Georgopoulos et al., 1982, 1986).

Made as a project for a math communication class, aimed at readers with a solid math
background but no neuroscience knowledge.

## What's here

- Cosine tuning law for a single neuron, with an interactive tuning-curve explorer
- A vector/dot-product reformulation of the tuning law
- The population vector decoding algorithm, with an interactive simulated neuron population
- A derivation of why the population vector recovers the true movement direction in the limit
  of many, evenly-distributed preferred directions
- A simulation showing how decoding error falls as the number of neurons grows, even with
  per-trial noise
- A short bridge to modern, learned decoders (e.g. Willett et al. 2021's handwriting BCI)

## Stack

Vite + React + TypeScript + Tailwind CSS v4, Framer Motion for scroll reveals, KaTeX for math
typesetting. All neuron/population simulations are implemented from scratch in
[`src/lib/neuro.ts`](src/lib/neuro.ts).

## Development

```bash
npm install
npm run dev
```

## Deployment

Pushing to `main` builds and deploys to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Enable it once under
**Settings → Pages → Source: GitHub Actions** on the repository.
