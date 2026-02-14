import { type Square, type Move, type Color, Chess } from "chess.js";

const FILES = "abcdefgh" as const;

function isOnBoard(file: number, rank: number) {
  return file >= 0 && file < 8 && rank >= 1 && rank <= 8;
}

/** Devuelve las 8 casillas adyacentes a un rey en `kingSq` (pueden ser 3..8 si está en borde). */
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

/** Devuelve las 8 casillas adyacentes a un rey en `kingSq` QUE ESTAN ATACADAS(pueden ser 3..8 si está en borde). */
export function kingAdjacentSquaresAttaqued(kingSq: Square,fen:string,colorRival:Color): Square[] {
  const file = FILES.indexOf(kingSq[0] as any);
  const rank = Number(kingSq[1]);
  const chess = new Chess(fen);

  const out: Square[] = [];
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (df === 0 && dr === 0) continue;
      const nf = file + df;
      const nr = rank + dr;
      if (!isOnBoard(nf, nr)) continue;
      const square = `${FILES[nf]}${nr}` as Square;
  
      if(chess.isAttacked(square,colorRival)){
        out.push(square);
      }
    }
  }
  return out;
}

/** Filtra movimientos para que TU rey no pueda moverse a casillas adyacentes al rey rival. */
export function filterKingNotAdjacentToEnemyKing(moves: Move[], enemyKingSq?: Square): Move[] {
  if (!enemyKingSq) return moves;

  return moves.filter(m => !kingAdjacentSquares(enemyKingSq).includes(m.to));
}
