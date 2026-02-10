import { Chess, PieceSymbol, Square } from "chess.js";

/**
 *  Convierte un movimiento en un Square
 */ 
export const changeToSquare = (move: string): Square => {
    // Elimina caracteres especiales y extrae las últimas 2-3 caracteres (la casilla de destino)
    const cleaned = move.replace(/[+#]/g, ''); // Quita jaque y jaque mate
    
    // Para capturas (Nxe4, exd5)
    if (cleaned.includes('x')) {
        return cleaned.split('x')[1] as Square;
    }
    
    // Para movimientos normales (Nf3, e4, O-O)
    // Extrae los últimos 2 caracteres (la casilla)
    const match = cleaned.match(/[a-h][1-8]$/);
    if (match) {
        return match[0] as Square;
    }
    
    // Fallback (no debería llegar aquí si el movimiento es válido)
    return cleaned.slice(-2) as Square;
}

/**
 * Función que se encarga de obtener la pieza en el DESTINO del movimiento (la capturada).
 */
export function getPiece(posicionComida: string, fen: string): PieceSymbol | null {
    const chess = new Chess(fen);

    const pieza = chess.get(changeToSquare(posicionComida));

    return pieza ? pieza.type : null;
}

/**
 * Función que obtiene la pieza que realiza el movimiento (la que se mueve).
 */
export function getPieceFrom(movimiento: string, fen: string): PieceSymbol | null {
    const chess = new Chess(fen);
    
    try {
        const move = chess.move(movimiento);
        if (move) {
            chess.undo();
            return move.piece;
        }
    } catch {
        return null;
    }
    return null;
}