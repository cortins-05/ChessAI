import { Chess, Move } from "chess.js";
import { scoreKingCage } from "../../utils/FindKing";

type Threat = { move: Move | null; score: number; givesCheckSoon: boolean };

// Evalúa la mejor “amenaza de jaque” del bando que mueve en `pos` (normalmente el rival).
function bestCheckThreat(pos: Chess, profundidad: number, slice: number): Threat {
  if (pos.isGameOver()) return { move: null, score: -Infinity, givesCheckSoon: false };

  let best: Threat = { move: null, score: -Infinity, givesCheckSoon: false };

  function orderMoves(ch: Chess): { m: Move; s: number; isCheck: boolean }[] {
    const attacker = ch.turn();
    const all = ch.moves({ verbose: true });

    const scored = all.map((m) => {
      const next = new Chess(m.after);
      let s = scoreKingCage(next, m.after, attacker);

      if (m.captured) s += 3;
      if (next.inCheck()) s += 8;      // jaque = muy relevante
      if (next.isCheckmate()) s += 50_000;

      return { m, s, isCheck: next.inCheck() };
    });

    // checks > captures > resto, y dentro por score
    const checks = scored.filter(x => x.isCheck).sort((a,b)=>b.s-a.s);
    const captures = scored.filter(x => x.m.captured && !x.isCheck).sort((a,b)=>b.s-a.s);
    const rest = scored.filter(x => !x.m.captured && !x.isCheck).sort((a,b)=>b.s-a.s);

    return [...checks, ...captures, ...rest].slice(0, slice);
  }

  function dfs(ch: Chess, depthLeft: number, firstMove: Move | null) {
    if (depthLeft === 0 || ch.isGameOver()) return;

    const candidates = orderMoves(ch);

    for (const c of candidates) {
      const next = new Chess(c.m.after);
      const fm = firstMove ?? c.m;

      // “amenaza” = consigue jaque en algún punto de la línea
      // (si es mate, ya va super-premiado arriba)
      if (c.isCheck || next.isCheckmate()) {
        const score = c.s + (1000 / (profundidad - depthLeft + 1)); // antes = más peligroso
        if (score > best.score) {
          best = { move: fm, score, givesCheckSoon: true };
        }
      }

      dfs(next, depthLeft - 1, fm);
    }
  }

  dfs(pos, profundidad, null);
  return best;
}

/**
 * Devuelve el movimiento defensivo óptimo (tu jugada) si existe amenaza de jaque probable.
 * Si no hay amenaza relevante, devuelve null.
 *
 * IMPORTANTE: `chess` debe estar en TU turno (antes de mover tú).
 */
export default function MovimientoDefensivoContraJaque(
  chess: Chess,
  profundidad: number,
  slice: number
): Move | null {
  if (chess.isGameOver()) return null;

  // 1) Amenaza actual (rival tras tu “no-move” => no podemos pasar turno, así que aproximamos):
  //    Evaluamos amenaza del rival DESPUÉS de cada jugada tuya y buscamos si existe alguna que la “active”.
  //    Mejor criterio: comparamos el mejor “anti” vs el promedio; pero aquí lo simple:
  const myMoves = chess.moves({ verbose: true });
  if (myMoves.length === 0) return null;

  // 2) Para cada jugada tuya, medimos la mejor amenaza de jaque del rival en la posición resultante.
  //    Queremos MINIMIZAR esa amenaza.
  let bestDefense: { m: Move; threatScore: number; rivalHasCheckThreat: boolean } | null = null;

  for (const m of myMoves) {
    const afterMy = new Chess(m.after); // ahora mueve el rival
    const threat = bestCheckThreat(afterMy, profundidad, slice);

    const candidate = { m, threatScore: threat.score, rivalHasCheckThreat: threat.givesCheckSoon };

    if (!bestDefense) {
      bestDefense = candidate;
      continue;
    }

    // Prioridad: primero elimina amenaza (givesCheckSoon=false), luego menor score
    if (bestDefense.rivalHasCheckThreat && !candidate.rivalHasCheckThreat) {
      bestDefense = candidate;
      continue;
    }
    if (bestDefense.rivalHasCheckThreat === candidate.rivalHasCheckThreat) {
      if (candidate.threatScore < bestDefense.threatScore) {
        bestDefense = candidate;
      }
    }
  }

  if (!bestDefense) return null;

  // 3) ¿“Existe probabilidad de jaque”? => si en la mayoría de jugadas el rival amenaza.
  //    Versión simple: si incluso la mejor defensa sigue teniendo amenaza fuerte, igual es inevitable.
  //    Para tu frase, devolvemos defensa solo si había amenaza en general:
  const amenazas = myMoves.reduce((acc, m) => {
    const t = bestCheckThreat(new Chess(m.after), profundidad, slice);
    return acc + (t.givesCheckSoon ? 1 : 0);
  }, 0);

  const hayAmenaza = amenazas > Math.floor(myMoves.length * 0.25); // umbral (tócalo)
  if (!hayAmenaza) return null;

  return bestDefense.m;
}
