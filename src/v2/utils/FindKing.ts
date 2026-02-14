import { Chess, type Color, type Square, type Move } from "chess.js";
import { kingAdjacentSquaresAttaqued } from "./KingSquares"; // ajusta ruta

const FILES = "abcdefgh" as const;

function isOnBoard(file: number, rank: number) {
  return file >= 0 && file < 8 && rank >= 1 && rank <= 8;
}

function kingAdjacentSquares(kingSq: Square): Square[] {
  const file = FILES.indexOf(kingSq[0] as any);
  const rank = Number(kingSq[1]);
  const out: Square[] = [];

  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const nf = file + df;
      const nr = rank + dr;
      if (!isOnBoard(nf, nr)) continue;
      out.push(`${FILES[nf]}${nr}` as Square);
    }
  }
  return out;
}

function opposite(c: Color): Color {
  return c === "w" ? "b" : "w";
}

function findKingSq(chess: Chess, color: Color): Square | undefined {
  const b = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = b[r][f];
      if (p && p.type === "k" && p.color === color) {
        // board(): r=0 es rank 8, r=7 es rank 1
        const file = FILES[f];
        const rank = (8 - r) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
        return `${file}${rank}` as Square;
      }
    }
  }
  return undefined;
}

/**
 * Score: prioriza "encerrar" al rey rival:
 *  - base: nº de adyacentes atacadas
 *  - bonus MUY grande si llega a (adyacentesTotales - 1)
 *  - opcional: pequeño extra si es jaque / captura
 */
export function scoreKingCage(next: Chess, fenAfter: string, attacker: Color): number {
  const enemy = opposite(attacker);
  const enemyKing = findKingSq(next, enemy);
  if (!enemyKing) return 0;

  const adj = kingAdjacentSquares(enemyKing);
  const attacked = kingAdjacentSquaresAttaqued(enemyKing, fenAfter, attacker).length;

  const target = Math.max(0, adj.length - 1); // lo que pides
  const bonus = attacked >= target ? 1_000 : 0;

  return attacked * 10 + bonus;
}
