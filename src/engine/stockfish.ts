export interface RawLine {
  rank: number;
  depth: number;
  cp?: number;
  mate?: number;
  pvUci: string[];
}

export interface SearchResult {
  bestMove: string | null;
  lines: RawLine[];
}

interface PendingSearch {
  resolve: (result: SearchResult) => void;
  reject: (error: Error) => void;
  lines: Map<number, RawLine>;
}

const ENGINE_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-nnue-16-single.js`;

export class StockfishEngine {
  private worker: Worker;
  private pending: PendingSearch | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private resolveReady!: () => void;
  private rejectReady!: (error: Error) => void;
  private ready: Promise<void>;
  private hasFailed = false;

  constructor() {
    this.ready = new Promise<void>((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    this.ready.catch(() => undefined);

    this.worker = new Worker(ENGINE_URL);
    this.worker.onmessage = (event: MessageEvent<unknown>) => this.handleLine(String(event.data));
    this.worker.onerror = () => this.fail(new Error('The chess engine could not start.'));

    this.send('uci');
    this.send('setoption name Use NNUE value false');
    this.send('setoption name Hash value 64');
    this.send('isready');
  }

  get failed(): boolean {
    return this.hasFailed;
  }

  analyze(fen: string, depth: number, multiPV: number): Promise<SearchResult> {
    const run = () =>
      this.ready.then(
        () =>
          new Promise<SearchResult>((resolve, reject) => {
            this.pending = { resolve, reject, lines: new Map() };
            this.send(`setoption name MultiPV value ${multiPV}`);
            this.send(`position fen ${fen}`);
            this.send(`go depth ${depth}`);
          }),
      );
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  stop(): void {
    if (this.pending) this.send('stop');
  }

  terminate(): void {
    this.worker.terminate();
    this.fail(new Error('The analysis was stopped.'));
  }

  private send(command: string): void {
    this.worker.postMessage(command);
  }

  private fail(error: Error): void {
    this.hasFailed = true;
    this.rejectReady(error);
    this.pending?.reject(error);
    this.pending = null;
  }

  private handleLine(line: string): void {
    if (line === 'readyok') {
      this.resolveReady();
      return;
    }
    if (line.startsWith('bestmove')) {
      const search = this.pending;
      if (!search) return;
      this.pending = null;
      const bestMove = line.split(' ')[1];
      search.resolve({
        bestMove: bestMove && bestMove !== '(none)' ? bestMove : null,
        lines: [...search.lines.values()].sort((a, b) => a.rank - b.rank),
      });
      return;
    }
    if (line.startsWith('info ') && this.pending) {
      const parsed = parseInfoLine(line);
      if (!parsed) return;
      const existing = this.pending.lines.get(parsed.rank);
      if (!existing || existing.depth <= parsed.depth) this.pending.lines.set(parsed.rank, parsed);
    }
  }
}

function parseInfoLine(line: string): RawLine | null {
  const tokens = line.split(' ');
  const valueAfter = (key: string) => {
    const i = tokens.indexOf(key);
    return i >= 0 ? tokens[i + 1] : undefined;
  };
  const depth = Number(valueAfter('depth'));
  const scoreIndex = tokens.indexOf('score');
  if (scoreIndex < 0 || Number.isNaN(depth)) return null;

  const kind = tokens[scoreIndex + 1];
  const value = Number(tokens[scoreIndex + 2]);
  const pvIndex = tokens.indexOf('pv');
  return {
    rank: Number(valueAfter('multipv') ?? 1),
    depth,
    cp: kind === 'cp' ? value : undefined,
    mate: kind === 'mate' ? value : undefined,
    pvUci: pvIndex >= 0 ? tokens.slice(pvIndex + 1) : [],
  };
}
