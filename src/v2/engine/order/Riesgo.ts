import { Move } from "chess.js";
import { FiltradoDefensaV2 } from "../filter/Defensa";

export default function ordenPorRiesgo(a: Move, b: Move) {
  const sa = FiltradoDefensaV2(a);
  const sb = FiltradoDefensaV2(b);

  if (sa === sb) return 0;     
  return sa ? -1 : 1;         
}
