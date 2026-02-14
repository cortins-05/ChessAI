import { Chess, Color } from "chess.js";

export default function cambiarTurno(chess: Chess, turn: Color) {
  if (chess.isGameOver()) return false;

  try {
    chess.setTurn(turn);
  } catch {
    return false; // aquí cae el "Null move not allowed when in check"
  }

  if (chess.turn() !== turn) return false;
  if (chess.isGameOver()) return false;

  return chess;
}
