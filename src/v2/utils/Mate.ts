import { Chess } from "chess.js";

export function isMateAfter(fen: string, san: string): boolean {
  const c = new Chess(fen);
  const ok = c.move(san);
  if (!ok) return false;
  return c.isCheckmate();
}