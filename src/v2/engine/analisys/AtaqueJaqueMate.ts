import { Chess, Move } from "chess.js";
import isValidMove from "../../utils/ValidMove";
import { scoreKingCage } from "../../utils/FindKing";

interface PropsJugadas {
  moves: Move[];
  profundidad: number; // plies adicionales a explorar desde cada move inicial
  slice: number;       // poda: cuántos moves considerar por nodo
}

export default function JugadasJaqueMate({ moves, profundidad, slice }: PropsJugadas): Move[][] {
    const lineas: Move[][] = [];

    const chessBefore = new Chess(moves[0].before);

    function dfs(chess: Chess, lineaActual: Move[], depthLeft: number) {
        // Si la posición actual ya es mate, guardamos la línea (la que llevó aquí)
        if (chess.isCheckmate()) {
            lineas.push([...lineaActual]);
            return;
        }
        if (depthLeft === 0 || chess.isGameOver()) return;
        
        const all = chess.moves({ verbose: true });

        const attacker = chess.turn(); // el que va a mover AHORA

        // Calculamos score por candidato (en la posición DESPUÉS del move)
        const scored = all.map(m => {
        const next = new Chess(m.after);
        let s = scoreKingCage(next, m.after, attacker);

        // extras opcionales
        if (m.captured) s += 3;
        if (next.inCheck()) s += 5; // deja al rival en jaque

        return { m, s };
        });

        // Si quieres mantener tu prioridad checks>captures>rest,
        // puedes conservar el “bucket” pero ordenar dentro por score:
        const checks = scored.filter(x => new Chess(x.m.after).inCheck());
        const captures = scored.filter(x => x.m.captured && !new Chess(x.m.after).inCheck());
        const rest = scored.filter(x => !x.m.captured && !new Chess(x.m.after).inCheck());

        checks.sort((a,b) => b.s - a.s);
        captures.sort((a,b) => b.s - a.s);
        rest.sort((a,b) => b.s - a.s);

        const siguientes = [...checks, ...captures, ...rest]
        .slice(0, slice)
        .map(x => x.m);


        for (const m of siguientes) {
            const next = new Chess(m.after);

            lineaActual.push(m);

            if (next.isCheckmate()) {
                lineas.push([...lineaActual]);
                lineaActual.pop();
                continue;
            }

            if (!next.isGameOver() && depthLeft - 1 > 0) {
                dfs(next, lineaActual, depthLeft - 1);
            }

            lineaActual.pop();
        }

    }

    if (moves.length === 0) return [];

    for (const m0 of moves) {
        const chess0 = new Chess(m0.after);
        dfs(chess0, [m0], profundidad);
    }

    return lineas
    .filter(l => l.length > 0)
    .filter(l => isValidMove(chessBefore.fen(), l[0].san))
    .map(l=>l.filter(jugada=>jugada.color==moves[0].color))
    .sort((a,b) => a.length - b.length);
}