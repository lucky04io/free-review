<div align="center">

# ChessSight

**Engine-powered chess game analysis — entirely in your browser.**

Paste a PGN from Chess.com or Lichess and get a Chess.com-style Game Review:
move-by-move classifications, accuracy scores, evaluation graph, and engine lines.
No server, no account, no moves leaving your machine.

[Live demo](#) · [Report a bug](/.github/ISSUE_TEMPLATE/bug_report.md) · [Request a feature](/.github/ISSUE_TEMPLATE/feature_request.md)

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Stockfish](https://img.shields.io/badge/Stockfish-16%20WASM-b58863)

</div>

---

## Features

### Full Game Review
- **Every move analyzed** by Stockfish 16 (WASM) at a configurable depth (12–24, default 18)
- **Chess.com-style classifications**: Brilliant, Great, Best, Excellent, Good, Book, Inaccuracy, Mistake, Blunder, and Miss
- **Accuracy %** per player using the win-probability formula, plus average centipawn loss (ACPL)
- **Estimated game rating** per player, derived from accuracy (an estimate, not an official rating)
- **Summary report** with a move-quality distribution bar for each side

### Interactive board
- Drag pieces, see legal-move dots, last-move highlight, and check glow
- Right-click drag to draw your own arrows; flip the board; keyboard navigation (arrows, Home/End, F to flip)
- 3 board themes (Green, Walnut, Ocean) and 2 piece sets (Classic, Glyph)
- Move badge on the board (brilliant, blunder, …) and a green best-move arrow; after a weak move the arrow shows the move that should have been played
- Review panel with Moves, Report, Lines and Info tabs, plus player bars with clocks

### Analysis tools
- **Evaluation bar** beside the board with smooth animated swings
- **Evaluation graph** across the whole game — click any point to jump to that move
- **Top 3 engine lines** with eval, depth, and clickable continuations that preview on the board
- **Opening detection** with ECO code, name, and a link to the Chess.com opening page
- **Clock data** from PGN `%clk` comments, with low-time highlighting

### Import, export, share
- Paste a PGN, upload a `.pgn` file, or open a shared link — the game is encoded in the URL hash
- Export an annotated PGN with engine evaluations embedded as comments
- Copy the current FEN to the clipboard
- Analysis results are cached locally, so re-opening a game is instant

### Comfort
- Dark (default) and light mode, persisted with your other settings

## Getting started

```bash
git clone https://github.com/<your-user>/chesssight.git
cd chesssight
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`) and paste a PGN or upload a `.pgn` file in the Game Review panel.

### Other commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## How to use

1. **Import** — paste a PGN or upload a file. Headers (players, event, ECO, time control) are detected automatically.
2. **Analyze** — the full game review starts automatically; watch the progress bar as each position is evaluated.
3. **Review** — step through moves (or click the eval graph) and read the classification badges, engine lines, and final accuracy report.

## Architecture overview

```
src/
├── components/        # UI: board, eval bar/graph, move list, panels, modals
│   └── Board/         # react-chessboard wrapper, themes, custom piece set
├── engine/
│   ├── stockfish.ts   # UCI client around the Stockfish 16 WASM worker
│   ├── evaluate.ts    # Position evaluation (MultiPV 3) and batching
│   ├── classify.ts    # Move classification rules + game report builder
│   └── useEngine.ts   # Engine lifecycle (one worker, lazy restart)
├── hooks/             # Analysis runner, navigation, live eval, settings, keyboard
├── utils/             # PGN parsing, accuracy math, share links, result cache
├── data/              # Opening book (ECO lines), empty-board placeholder
└── types/             # Shared TypeScript interfaces
```

- **Everything is client-side.** Stockfish runs in a Web Worker, so the UI stays responsive; results stream back through a queued UCI client.
- **Classification** compares each played move against the engine's best line before the move, factoring in sacrifices, forced mates, and how sharp the position was.
- **Accuracy** maps win probability (before vs. after each move) through the standard exponential formula and combines per-move values into a score for each player.
- **Caching** stores the last 8 analyzed games (keyed by PGN hash + depth) in `localStorage`.

## Deployment

The app is a static site. A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `main`.

1. Push the repo to GitHub.
2. In the repository settings, set **Pages → Source: GitHub Actions**.
3. Push to `main` — the site goes live at `https://<user>.github.io/chesssight/`.

The Pages build sets `GITHUB_PAGES=true` so Vite uses the `/chesssight/` base path; locally and elsewhere it stays at `/`.

## Contributing

1. Fork and create a branch (`git checkout -b my-feature`).
2. Make your change and run `npm run typecheck && npm run lint && npm run build`.
3. Keep the scope focused; open a pull request describing the what and the why.

Ideas that would be welcome: sound effects, play-vs-engine mode, a deeper opening book, PGN variation support, and cloud-free PGN export styling improvements.

## License

[MIT](LICENSE) for the application code. The bundled Stockfish WASM build in `public/stockfish/` is [GPLv3](https://github.com/nmrugg/stockfish.js/blob/master/license.txt), by the Stockfish team and the stockfish.js project — its license applies to those files.
