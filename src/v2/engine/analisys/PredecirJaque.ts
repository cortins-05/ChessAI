import { Chess, Move } from "chess.js";
import { scoreKingCage } from "../../utils/FindKing";

type CheckReplyInfo = {
  count: number;      // cuántos jaques tiene el rival como respuesta
  worst: number;      // el jaque más peligroso (max score)
  bestMove: Move | null; // el jaque más peligroso (por si quieres ver cuál era)
};

// Devuelve info sobre JAQUES INMEDIATOS del bando que mueve en `pos`.
function immediateCheckReplies(pos: Chess, slice: number): CheckReplyInfo {
  if (pos.isGameOver()) return { count: 0, worst: -Infinity, bestMove: null };

  const attacker = pos.turn();
  const all = pos.moves({ verbose: true });

  const checks = all
    .map((m) => {
      const next = new Chess(m.after);

      // Tras mover el rival, le toca a "tú". Si next.inCheck() => tu rey está en jaque.
      const isCheck = next.inCheck();
      if (!isCheck) return null;

      let s = scoreKingCage(next, m.after, attacker);

      if (m.captured) s += 3;
      if (next.isCheckmate()) s += 50_000;

      return { m, s };
    })
    .filter((x): x is { m: Move; s: number } => x !== null)
    .sort((a, b) => b.s - a.s)
    .slice(0, slice);

  if (checks.length === 0) return { count: 0, worst: -Infinity, bestMove: null };

  return {
    count: checks.length,
    worst: checks[0].s,      // el más peligroso (ya están ordenados desc)
    bestMove: checks[0].m,
  };
}

/**
 * Devuelve tu movimiento defensivo óptimo si existe amenaza de jaque (JAQUE INMEDIATO del rival tras tu jugada).
 * Si NO hay amenaza (según umbral), devuelve null.
 */
export default function MovimientoDefensivoContraJaqueClaro(
  chess: Chess,
  slice: number,
  umbral: number = 0.25 // “probabilidad”: % de tus jugadas que permiten un jaque inmediato del rival
): Move | null {
  if (chess.isGameOver()) return null;

  const myMoves = chess.moves({ verbose: true });
  if (myMoves.length === 0) return null;

  // 1) Medimos, para cada jugada tuya, cuántos JAQUES inmediatos tiene el rival y cuán peligrosos son.
  const evals = myMoves.map((m) => {
    const afterMy = new Chess(m.after); // ahora mueve el rival
    const info = immediateCheckReplies(afterMy, slice);
    return { m, ...info };
  });

  // 2) ¿Existe amenaza real? => en cuántas de tus jugadas el rival tiene al menos un jaque inmediato.
  const amenazas = evals.reduce((acc, e) => acc + (e.count > 0 ? 1 : 0), 0);
  const hayAmenaza = amenazas > Math.floor(myMoves.length * umbral);
  if (!hayAmenaza) return null;

  // 3) Elegimos la mejor defensa:
  //    Prioridad: (a) dejar 0 jaques, (b) minimizar cantidad de jaques, (c) minimizar el peor jaque.
  evals.sort((a, b) => {
    if (a.count === 0 && b.count !== 0) return -1;
    if (b.count === 0 && a.count !== 0) return 1;

    if (a.count !== b.count) return a.count - b.count;
    return a.worst - b.worst;
  });

  return evals[0].m;
}
