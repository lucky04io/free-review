import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowUpRight, Copy, Download, Eye, EyeOff, ArrowUpDown, Link2, Undo2 } from 'lucide-react';
import type { Classification, Color, ParsedGame } from '@/types';
import { parseGame, buildAnnotatedPgn } from '@/utils/pgn';
import { buildShareHash, readShareHash } from '@/utils/share';
import { hashText, readCachedAnalysis } from '@/utils/analysisCache';
import { EMPTY_GAME } from '@/data/emptyGame';
import { useEngine } from '@/engine/useEngine';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useGame } from '@/hooks/useGame';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useLiveEval } from '@/hooks/useLiveEval';
import { useSettings } from '@/hooks/useSettings';
import { useElementWidth, useWindowSize } from '@/hooks/useElementWidth';
import { BoardView, type BoardArrow } from '@/components/Board/BoardView';
import { PlayerBar, PLAYER_BAR_HEIGHT } from '@/components/Board/PlayerBar';
import { EvalBar } from '@/components/EvalBar/EvalBar';
import { EvalGraph } from '@/components/EvalGraph/EvalGraph';
import { MoveList } from '@/components/MoveList/MoveList';
import { EngineLines } from '@/components/EngineLines/EngineLines';
import { GameInfo } from '@/components/GameInfo/GameInfo';
import { GameSummary } from '@/components/GameSummary/GameSummary';
import { MoveCoach } from '@/components/Review/MoveCoach';
import { ReviewCta } from '@/components/Review/ReviewCta';
import { PgnForm, PgnImportModal } from '@/components/PgnImport/PgnImportModal';
import { SettingsModal } from '@/components/Settings/SettingsModal';
import { Header, NavControls } from '@/components/Header/Header';

type Tab = 'moves' | 'report' | 'lines' | 'info';

const TABS: { id: Tab; label: string }[] = [
  { id: 'moves', label: 'Moves' },
  { id: 'report', label: 'Report' },
  { id: 'lines', label: 'Lines' },
  { id: 'info', label: 'Info' },
];

const HEADER_HEIGHT = 56;
const UTILITY_ROW_HEIGHT = 40;
const EVAL_BAR_WIDTH = 28;
const BOARD_GAP = 8;
const BEST_MOVE_COLOR = '#81b64c';
const WEAK_MOVES: Classification[] = ['inaccuracy', 'mistake', 'miss', 'blunder'];

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function clockAt(game: ParsedGame, ply: number, color: Color): number | undefined {
  for (let i = Math.min(ply, game.moves.length) - 1; i >= 0; i--) {
    const move = game.moves[i];
    if (move.color === color && move.clock !== undefined) return move.clock;
  }
  return undefined;
}

export default function App() {
  const { settings, updateSettings } = useSettings();
  const getEngine = useEngine();
  const [game, setGame] = useState<ParsedGame | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [previewFen, setPreviewFen] = useState<string | null>(null);
  const [showEngineMoves, setShowEngineMoves] = useState(true);
  const [tab, setTab] = useState<Tab>('moves');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();
  const pendingPly = useRef<number | null>(null);
  const autoStart = useRef(false);
  const wasRunning = useRef(false);

  const activeGame = game ?? EMPTY_GAME;
  const [areaRef, areaWidth] = useElementWidth<HTMLElement>();
  const windowSize = useWindowSize();
  const isWide = windowSize.width >= 1280;
  const fitToWidth = areaWidth - EVAL_BAR_WIDTH - BOARD_GAP;
  const fitToHeight = isWide
    ? windowSize.height - HEADER_HEIGHT - PLAYER_BAR_HEIGHT * 2 - UTILITY_ROW_HEIGHT - 24
    : Number.POSITIVE_INFINITY;
  const boardSize = Math.floor(Math.max(240, Math.min(fitToWidth, fitToHeight, 840)) / 8) * 8;

  const { status, progress, analysis, error: analysisError, start, cancel } = useAnalysis(activeGame, settings.depth, getEngine);
  const moveNav = useGame(activeGame, 0);
  const { fen, ply, total, lastMove, goTo } = moveNav;

  const liveFen = previewFen ?? fen;
  const isLive = previewFen !== null;
  const liveEval = useLiveEval(isLive ? liveFen : null, settings.depth, true, getEngine).evaluation;

  const positionEval = game && analysis && !isLive ? analysis.positions[ply] ?? null : null;
  const boardEval = isLive ? liveEval : positionEval;
  const playedAnalysis = game && !isLive ? analysis?.moves[ply - 1] : undefined;

  // Open a shared link on first load. The ply is applied once the game has rendered.
  useEffect(() => {
    const shared = readShareHash(window.location.hash);
    if (!shared) return;
    try {
      pendingPly.current = shared.ply;
      setGame(parseGame(shared.pgn));
    } catch (err) {
      pendingPly.current = null;
      setError(err instanceof Error ? err.message : 'The shared game could not be loaded.');
    }
  }, []);

  useEffect(() => {
    if (game && pendingPly.current !== null) {
      goTo(pendingPly.current);
      pendingPly.current = null;
    }
  }, [game, goTo]);

  // Runs after useAnalysis has switched to the new game, so start() targets the right positions.
  useEffect(() => {
    if (!game || !autoStart.current) return;
    autoStart.current = false;
    void start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  useEffect(() => {
    if (status === 'done' && wasRunning.current) setTab('report');
    wasRunning.current = status === 'running';
  }, [status]);

  useEffect(() => {
    if (!toast) return;
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(toastTimer.current);
  }, [toast]);

  const flip = useCallback(() => setOrientation((o) => (o === 'white' ? 'black' : 'white')), []);

  useKeyboard({
    onPrev: moveNav.prev,
    onNext: moveNav.next,
    onFirst: moveNav.first,
    onLast: moveNav.last,
    onFlip: flip,
    enabled: game !== null,
  });

  const handleImport = useCallback((pgnText: string) => {
    try {
      const parsed = parseGame(pgnText);
      autoStart.current = readCachedAnalysis(`${hashText(parsed.pgn)}:${settings.depth}`) === null;
      setGame(parsed);
      setError(null);
      setPreviewFen(null);
      setImportOpen(false);
      setTab('moves');
      goTo(0);
      window.location.hash = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'This PGN could not be read.');
    }
  }, [goTo, settings.depth]);

  const arrows: BoardArrow[] = useMemo(() => {
    if (!showEngineMoves) return [];
    // Exploring a line: show the engine's best reply for the position on the board.
    if (isLive) {
      return liveEval?.bestUci
        ? [{ from: liveEval.bestUci.slice(0, 2), to: liveEval.bestUci.slice(2, 4), color: BEST_MOVE_COLOR }]
        : [];
    }
    // After a weak move, point at the move that should have been played.
    // Otherwise point at the engine's suggestion for the side to move.
    let uci: string | null | undefined = positionEval?.bestUci;
    if (
      playedAnalysis?.bestUci &&
      playedAnalysis.bestUci !== playedAnalysis.uci &&
      WEAK_MOVES.includes(playedAnalysis.classification)
    ) {
      uci = playedAnalysis.bestUci;
    }
    return uci ? [{ from: uci.slice(0, 2), to: uci.slice(2, 4), color: BEST_MOVE_COLOR }] : [];
  }, [isLive, liveEval, playedAnalysis, positionEval, showEngineMoves]);

  const badge = useMemo(() => {
    if (isLive || !playedAnalysis || !lastMove) return null;
    return { square: lastMove.to, classification: playedAnalysis.classification };
  }, [isLive, lastMove, playedAnalysis]);

  const copyFen = () => {
    void navigator.clipboard.writeText(liveFen);
    setToast('FEN copied');
  };

  const copyShareLink = () => {
    if (!game) return;
    window.location.hash = buildShareHash(game.pgn, ply);
    void navigator.clipboard.writeText(window.location.href);
    setToast('Share link copied');
  };

  const exportPgn = () => {
    if (!game) return;
    downloadFile('chesssight-annotated.pgn', buildAnnotatedPgn(game, analysis), 'application/x-chess-pgn');
    setToast('Annotated PGN downloaded');
  };

  const players = useMemo(() => ({
    white: { name: game?.headers.White ?? 'White', elo: game?.headers.WhiteElo },
    black: { name: game?.headers.Black ?? 'Black', elo: game?.headers.BlackElo },
  }), [game]);

  const topColor: Color = orientation === 'white' ? 'b' : 'w';
  const bottomColor: Color = orientation === 'white' ? 'w' : 'b';
  const playerFor = (color: Color) => (color === 'w' ? players.white : players.black);
  const goToPly = (target: number) => {
    setPreviewFen(null);
    goTo(target);
  };

  const reviewCta = (
    <ReviewCta
      status={status}
      progress={progress}
      depth={settings.depth}
      error={analysisError}
      onStart={() => void start()}
      onCancel={cancel}
    />
  );

  return (
    <div className="min-h-screen bg-page">
      <Header
        onImport={() => setImportOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        theme={settings.theme}
        onToggleTheme={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
      />

      <main className="mx-auto flex max-w-[1500px] flex-col gap-3 p-3 xl:flex-row xl:items-stretch">
        <section ref={areaRef} className="min-w-0 flex-1">
          {error && (
            <div className="mx-auto mb-3 flex items-center gap-2 rounded-lg bg-error-500/15 px-4 py-3 text-sm text-ink" role="alert" style={{ maxWidth: boardSize + EVAL_BAR_WIDTH + BOARD_GAP }}>
              <AlertTriangle className="h-4 w-4 shrink-0 text-error-400" /> {error}
            </div>
          )}
          <div className="mx-auto" style={{ width: boardSize + EVAL_BAR_WIDTH + BOARD_GAP }}>
            <div className="flex" style={{ gap: BOARD_GAP }}>
              <div className="shrink-0" style={{ marginTop: PLAYER_BAR_HEIGHT, height: boardSize }}>
                <EvalBar score={boardEval?.score ?? null} orientation={orientation} />
              </div>
              <div style={{ width: boardSize }}>
                <PlayerBar
                  name={playerFor(topColor).name}
                  elo={playerFor(topColor).elo}
                  color={topColor}
                  clock={game ? clockAt(game, ply, topColor) : undefined}
                />
                <BoardView
                  fen={liveFen}
                  orientation={orientation}
                  boardTheme={settings.boardTheme}
                  pieceSet={settings.pieceSet}
                  width={boardSize}
                  lastMove={isLive ? null : lastMove}
                  arrows={arrows}
                  badge={badge}
                  interactive={game !== null}
                  onUserMove={(newFen) => {
                    setPreviewFen(newFen);
                    setToast('Exploring a line. Pick a move to return to the game.');
                  }}
                />
                <PlayerBar
                  name={playerFor(bottomColor).name}
                  elo={playerFor(bottomColor).elo}
                  color={bottomColor}
                  clock={game ? clockAt(game, ply, bottomColor) : undefined}
                />
              </div>
            </div>
            {game && (
              <div className="flex flex-wrap items-center gap-0.5" style={{ marginLeft: EVAL_BAR_WIDTH + BOARD_GAP, minHeight: UTILITY_ROW_HEIGHT }}>
                <button type="button" className="btn-tool" onClick={flip} title="Flip board (F)">
                  <ArrowUpDown className="h-4 w-4" /> Flip
                </button>
                <button type="button" className="btn-tool" onClick={() => setShowEngineMoves((v) => !v)} aria-pressed={showEngineMoves} title="Show or hide the best-move arrow">
                  {showEngineMoves ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} Best<span className="hidden sm:inline"> move</span>
                </button>
                <button type="button" className="btn-tool" onClick={copyFen}>
                  <Copy className="h-4 w-4" /> FEN
                </button>
                <button type="button" className="btn-tool" onClick={copyShareLink}>
                  <Link2 className="h-4 w-4" /> Share
                </button>
                <button type="button" className="btn-tool" onClick={exportPgn}>
                  <Download className="h-4 w-4" /> PGN
                </button>
                {isLive && (
                  <button type="button" className="btn-tool ml-auto !text-accent-500" onClick={() => setPreviewFen(null)}>
                    <Undo2 className="h-4 w-4" /> Back to game
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="relative h-[34rem] w-full shrink-0 xl:h-auto xl:w-[420px]">
          <div className="flex h-full flex-col overflow-hidden rounded-lg bg-panel xl:absolute xl:inset-0">
            <div className="flex items-center gap-2 bg-deep px-4 py-3">
              <h2 className="text-base font-extrabold text-ink">Game Review</h2>
              {analysis && <span className="ml-auto text-xs text-subtle">Stockfish 16 · depth {analysis.depth}</span>}
            </div>

            {!game ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                <p className="text-sm leading-relaxed text-muted">
                  Paste a PGN from Chess.com or Lichess to rate every move, see your accuracy, and find the best move in each position.
                </p>
                <PgnForm onImport={handleImport} textareaClassName="min-h-40 flex-1" />
              </div>
            ) : (
              <>
                <nav className="flex border-b border-line" aria-label="Review sections">
                  {TABS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      aria-current={tab === item.id}
                      className={`flex-1 border-b-2 py-2.5 text-sm font-bold transition-colors ${
                        tab === item.id ? 'border-primary-500 text-ink' : 'border-transparent text-subtle hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="flex min-h-0 flex-1 flex-col">
                  {tab === 'moves' && (
                    <>
                      {!analysis ? (
                        <div className="border-b border-line">{reviewCta}</div>
                      ) : (
                        <div className="border-b border-line bg-deep/40">
                          <MoveCoach
                            ply={ply}
                            move={game.moves[ply - 1]}
                            annotation={playedAnalysis}
                            evaluation={positionEval}
                            openingName={analysis.opening?.name ?? null}
                            hasAnalysis
                          />
                        </div>
                      )}
                      {!analysis && ply > 0 && (
                        <div className="border-b border-line bg-deep/40">
                          <MoveCoach ply={ply} move={game.moves[ply - 1]} annotation={undefined} evaluation={null} openingName={null} hasAnalysis={false} />
                        </div>
                      )}
                      <MoveList moves={game.moves} analysis={analysis?.moves ?? null} ply={ply} onSelect={goToPly} />
                    </>
                  )}

                  {tab === 'report' && (
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      {analysis ? (
                        <div className="space-y-4 p-4">
                          <EvalGraph positions={analysis.positions} ply={ply} onSelect={goToPly} />
                          <GameSummary analysis={analysis} white={players.white} black={players.black} />
                        </div>
                      ) : (
                        <div className="py-2">
                          <p className="px-4 pt-3 text-sm text-muted">Accuracy, game rating and move quality for both players appear here once the review finishes.</p>
                          {reviewCta}
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'lines' && (
                    <div className="min-h-0 flex-1 overflow-y-auto p-3">
                      <EngineLines
                        lines={boardEval?.lines ?? null}
                        fen={liveFen}
                        emptyMessage={
                          status === 'done'
                            ? 'No engine lines for this position.'
                            : 'Start the review to see the engine’s top three lines for every position.'
                        }
                        onPreview={setPreviewFen}
                      />
                      {isLive && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-subtle">
                          <ArrowUpRight className="h-3.5 w-3.5" /> Exploring a line. Pick a move in the list to return.
                        </p>
                      )}
                    </div>
                  )}

                  {tab === 'info' && (
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      <GameInfo game={game} analysis={analysis} ply={ply} />
                    </div>
                  )}
                </div>

                <div className="border-t border-line bg-deep p-2">
                  <NavControls
                    onFirst={moveNav.first}
                    onPrev={moveNav.prev}
                    onNext={moveNav.next}
                    onLast={moveNav.last}
                    canPrev={ply > 0}
                    canNext={ply < total}
                  />
                </div>
              </>
            )}
          </div>
        </aside>
      </main>

      <PgnImportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
      <SettingsModal open={settingsOpen} settings={settings} onChange={updateSettings} onClose={() => setSettingsOpen(false)} />

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-fade-up rounded-lg bg-[#1d1c1a] px-4 py-2.5 text-sm font-semibold text-white shadow-lg" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
