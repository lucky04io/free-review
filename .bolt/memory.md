# Project memory

## Product intent & audience

- **ChessSight**: a web-based chess application, likely including board visualization and/or analysis powered by the Stockfish engine.
- Intended for deployment as a static site via GitHub Pages; source structured for open-source publishing (README, LICENSE, issue templates included).

## Brand personality & voice

- Tone is helpful and technical; communication is concise and action-oriented.

## Visual design & UX direction

- Framework: Vite + React with JSX, Tailwind CSS, and Lucide React icons.
- Path alias `@/` maps to `src/` for module imports.
- Aesthetic direction: production-quality, distinctive (non-cookie-cutter) design — see `.bolt/prompt` for the authoritative instruction.

## Decisions, constraints & rationale

- Project can be packaged as a tar.gz archive excluding `node_modules` and build output; restored via `npm install` + `npm run build`.
- GitHub Actions workflow included for automatic build and publish to GitHub Pages (Pages source must be set to "GitHub Actions").
- Stockfish engine files are part of the project asset set and included in exports.
- No additional UI theme or icon packages should be installed unless absolutely necessary — see `.bolt/prompt`.

## Open questions & assumptions

- Exact feature set of ChessSight (analysis, training, visualization, or combination) is not yet detailed.
- No specific color palette, typography, or layout decisions have been inferred beyond the general aesthetic directive in `.bolt/prompt`.
- Chess UI implementation details (board rendering, move input, analysis display) are not yet established.