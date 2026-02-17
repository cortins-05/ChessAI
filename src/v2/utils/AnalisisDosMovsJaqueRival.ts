import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";

type MateIn2Result = {
  first: Move;
  second: Move;
  viaReply?: Move;
  score: number;
};

const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

function invert(c: Color): Color {
  return c === "w" ? "b" : "w";
}

function trySetTurn(ch: Chess, color: Color): boolean {
  const setter = (ch as any).setTurn;
  if (typeof setter === "function") {
    try {
      setter.call(ch, color);
    } catch {
      return false;
    }
  } else if (ch.turn() !== color) {
    return false;
  }

  return ch.turn() === color;
}

function getLegalMovesForColorFromFen(fen: string, color: Color): Move[] {
  const probe = new Chess(fen);
  if (!trySetTurn(probe, color)) {
    return [];
  }

  return probe.moves({ verbose: true }) as Move[];
}

function getKingMobilityFromFen(fen: string, color: Color): number {
  const probe = new Chess(fen);
  if (!trySetTurn(probe, color)) {
    return 0;
  }

  const kingSq = findKingSquare(probe, color);
  if (!kingSq) return 0;

  return (probe.moves({ square: kingSq, verbose: true }) as Move[]).length;
}

function getDefensiveMovesOrderedByKingMobility(
  fen: string,
  defender: Color,
  limit?: number
): Move[] {
  const candidates = getLegalMovesForColorFromFen(fen, defender);
  if (candidates.length === 0) return [];

  const baseMobility = getKingMobilityFromFen(fen, defender);
  const scored: Array<{ m: Move; score: number; improves: boolean }> = [];

  for (const candidate of candidates) {
    const sim = new Chess(fen);
    if (!trySetTurn(sim, defender)) {
      continue;
    }

    let applied: Move;
    try {
      applied = sim.move(candidate) as Move;
    } catch {
      continue;
    }

    if (!applied) continue;

    const mobility = getKingMobilityFromFen(sim.fen(), defender);
    const delta = mobility - baseMobility;
    const score = delta * 100 + mobility * 10 + (applied.captured ? 5 : 0);

    scored.push({
      m: applied,
      score,
      improves: delta > 0,
    });
  }

  scored.sort((a, b) => {
    if (a.improves !== b.improves) return Number(b.improves) - Number(a.improves);
    return b.score - a.score;
  });

  const ordered = scored.map((x) => x.m);
  return typeof limit === "number" ? ordered.slice(0, limit) : ordered;
}

function findKingSquare(ch: Chess, color: Color): Square | null {
  const b = ch.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = b[r][f];
      if (p && p.type === "k" && p.color === color) {
        const file = "abcdefgh"[f];
        const rank = String(8 - r);
        return (file + rank) as Square;
      }
    }
  }
  return null;
}

function sameRay(a: Square, b: Square) {
  const fa = a.charCodeAt(0) - 97, ra = Number(a[1]) - 1;
  const fb = b.charCodeAt(0) - 97, rb = Number(b[1]) - 1;
  const df = fb - fa, dr = rb - ra;

  const stepF = Math.sign(df);
  const stepR = Math.sign(dr);

  if (df === 0 && dr !== 0) return { stepF: 0, stepR };
  if (dr === 0 && df !== 0) return { stepF, stepR: 0 };
  if (Math.abs(df) === Math.abs(dr) && df !== 0) return { stepF, stepR };
  return null;
}

function squaresBetween(a: Square, b: Square): Square[] {
  const ray = sameRay(a, b);
  if (!ray) return [];
  const fa = a.charCodeAt(0) - 97, ra = Number(a[1]) - 1;
  const fb = b.charCodeAt(0) - 97, rb = Number(b[1]) - 1;

  const out: Square[] = [];
  let f = fa + ray.stepF;
  let r = ra + ray.stepR;

  while (f !== fb || r !== rb) {
    out.push(("abcdefgh"[f] + String(r + 1)) as Square);
    f += ray.stepF;
    r += ray.stepR;
  }

  out.pop(); // quita el destino (queremos “entre”)
  return out;
}

/**
 * Heurística rápida SIN crear Chess nuevos:
 * asume que el move YA está aplicado en `ch` cuando se llama.
 */
function scoreAppliedMoveHeuristic(ch: Chess, m: Move, attacker: Color): number {
  const defender = invert(attacker);
  let s = 0;

  if (ch.isCheckmate()) s += 100000;
  if (ch.inCheck()) s += 2000;

  if (m.captured) s += 50 + 10 * PIECE_VALUE[m.captured];
  if (m.promotion) s += 80;

  // “entra en línea de tiro del rey” (x-ray con 1 bloqueador)
  const kingSq = findKingSquare(ch, defender);
  if (kingSq) {
    const df = Math.abs(m.to.charCodeAt(0) - kingSq.charCodeAt(0));
    const dr = Math.abs(Number(m.to[1]) - Number(kingSq[1]));
    const dist = Math.max(df, dr);
    if (dist <= 4) s += (5 - dist) * 8;

    // tipo de pieza movida: lo obtenemos desde la SAN verbose (m.piece)
    if (m.piece === "b" || m.piece === "r" || m.piece === "q") {
      const ray = sameRay(m.to as Square, kingSq);
      if (ray) {
        const between = squaresBetween(m.to as Square, kingSq);
        let blockers = 0;
        let blockerColor: Color | null = null;

        for (const sq of between) {
          const p = ch.get(sq);
          if (p) {
            blockers++;
            blockerColor = p.color;
            if (blockers > 1) break;
          }
        }
        if (blockers === 1 && blockerColor === defender) s += 120;
      }
    }
  }

  return s;
}

function getOrderedMoves(ch: Chess, colorToAnalyze: Color): Move[] {
  if (!trySetTurn(ch, colorToAnalyze)) return [];

  const moves = ch.moves({ verbose: true }) as Move[];

  // Ordenación barata: aplica/undo para score
  const scored = moves.map((m) => {
    const applied = ch.move(m) as Move;
    const s = scoreAppliedMoveHeuristic(ch, applied, colorToAnalyze);
    ch.undo();
    return { m, s };
  });

  scored.sort((a, b) => b.s - a.s);
  return scored.map((x) => x.m);
}

export function findMateIn2ThreatFast(
  chess: Chess,
  colorToAnalyze: Color,
  options?: {
    maxFirstMoves?: number;
    maxReplies?: number;
    maxSecondMoves?: number;
  }
): MateIn2Result | null {
  const { maxFirstMoves = 20, maxReplies = 12, maxSecondMoves = 20 } = options ?? {};

  const rootFen = chess.fen();
  const defender = invert(colorToAnalyze);
  const rootDefensiveMoves = getDefensiveMovesOrderedByKingMobility(rootFen, defender);
  const preferredDefensiveReply = rootDefensiveMoves[0];

  // 1) primeras jugadas del atacante (ordenadas por “probabilidad”)
  const firstMoves = getOrderedMoves(chess, colorToAnalyze).slice(0, maxFirstMoves);

  for (const m1 of firstMoves) {
    const applied1 = chess.move(m1) as Move;

    // 2) respuestas del defensor (NO hace falta heurística ultra fina aquí)
    //    pero al menos limitamos. Si quieres, también puedes ordenarlas.
    const replies = getDefensiveMovesOrderedByKingMobility(
      chess.fen(),
      defender,
      maxReplies
    );

    for (const r1 of replies) {
      const appliedR = chess.move(r1) as Move;

      // 3) segundas del atacante (ordenadas por heurística)
      const secondMoves = getOrderedMoves(chess, colorToAnalyze).slice(0, maxSecondMoves);

      for (const m2 of secondMoves) {
        const applied2 = chess.move(m2) as Move;

        if (chess.isCheckmate()) {
          const score =
            scoreAppliedMoveHeuristic(chess, applied1, colorToAnalyze) +
            scoreAppliedMoveHeuristic(chess, applied2, colorToAnalyze);

          chess.load(rootFen);
          return preferredDefensiveReply
            ? { first: applied1, second: applied2, viaReply: preferredDefensiveReply, score }
            : { first: applied1, second: applied2, score };
        }

        chess.undo(); // deshace m2
      }

      chess.undo(); // deshace r1
    }

    chess.undo(); // deshace m1
  }

  chess.load(rootFen);
  return null;
}
