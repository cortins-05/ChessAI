import { Move } from "chess.js";
import { FiltradoDefensaV2 } from "../filter/Defensa";

export default function ordenPorRiesgo(a: Move, b: Move) {
  const sa = FiltradoDefensaV2(a);
  const sb = FiltradoDefensaV2(b);

  if (sa === sb) return 0;     // ambos seguros o ambos no
  return sa ? 1 : -1;          // deja "seguros" al final (para luego coger el last)
}
