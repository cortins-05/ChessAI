import { Chess, Color, Move, Piece, Square } from "chess.js";
import { Jugada, Movimientos, PIECE_VALUE } from '../types/types';
import { ordenarPorCalidadPieza } from "./Ordenamiento";

/**
 * Busca las primeras N líneas (secuencias de jugadas) que TERMINEN en jaque mate
 * usando un algoritmo con límite de profundidad y corte temprano.
 *
 * - Usa SAN (lo que devuelve chess.moves()).
 * - No explora más allá de una línea que ya encontró jaque mate.
 */
export function primerasJugadasPosibles(params: {
  fenInicial: string;        // Tablero Inicial
  maxResults?: number;       // por defecto 5
  onlySide?: "w" | "b";      // si lo pones, solo cuenta mates de ese bando
  maxInteracciones?: number; // por defecto 15
}): Jugada[] {
  const {
    fenInicial,
    maxResults = 9,
    onlySide,
    maxInteracciones = 15,
  } = params;

  const chess = new Chess(fenInicial);
  const movimientosTablero = chess
  .moves({ verbose: true })
  .sort((a, b) =>
    ordenarPorCalidadPieza(a.piece, b.piece)
  );

  const lista_movimientos: Jugada[] = [];

  // Recorremos cada posible primer movimiento desde la posición inicial
  for (const move of movimientosTablero) {
    // Corte temprano global
    if (lista_movimientos.length >= maxResults) break;

    const ChessCopy = new Chess(fenInicial);
    
    let moveCopy = move;

    const lista_movimientos_secundaria: Move[] = [];

    for (let i = 0; i < maxInteracciones; i++) {
      if (lista_movimientos.length >= maxResults) break;
      if (!moveCopy) break;

      const applied = ChessCopy.move(moveCopy);
      if (!applied) break;

      lista_movimientos_secundaria.push(moveCopy);

      // Comprobar si hay jaque mate
      if (ChessCopy.isCheckmate()) {
        // El bando que acaba de mover es el que dio mate
        // turno actual es el perdedor, el anterior es el ganador
        const bandoGanador = ChessCopy.turn() === "w" ? "b" : "w";
        
        if (!onlySide || bandoGanador === onlySide) {
          lista_movimientos.push({
            Tipo: "mate",
            Jugada: [...lista_movimientos_secundaria]
          });
        }
        break;
      }

      // Comprobar si hay jaque (línea prometedora, guardarla si es corta)
      if (ChessCopy.isCheck() && lista_movimientos_secundaria.length <= 4) {
        const bandoAtacante = ChessCopy.turn() === "w" ? "b" : "w";
        if (!onlySide || bandoAtacante === onlySide) {
          lista_movimientos.push({
            Tipo: "jaque",
            Jugada: [...lista_movimientos_secundaria]
          });
        }
      }

      // Elegimos el siguiente movimiento aleatorio desde la posición actual
      const movesNow = ChessCopy.moves({verbose:true});
      if (movesNow.length === 0) break;
      moveCopy = movesNow[Math.floor(Math.random() * movesNow.length)];
    }
  }

  return lista_movimientos;
}

/** 
 * Funcion que comprueba en todos las casillas del color indicado si esta siendo atacada la pieza
 * en funcion de eso devuelve sus movimientos defensorios y si es un peón o no.
*/
export function defensa(chess: Chess,colorRival:Color,colorPropio:Color):Movimientos[]|false {
  const board = chess.board();
  const movimientos:Movimientos[] = [];

  for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
          const pieza = board[row][col];
          if (!pieza || pieza.color !== colorPropio) continue;

          const square = ("abcdefgh"[col] + (8 - row)) as Square;
          
          if (chess.isAttacked(square, colorRival)) {
              const moves = chess.moves({ square, verbose: true });
              const sans = moves.map(m => m.san);
              console.log("Sans:",sans);
              let expuestas:Piece[];
              if(sans.length>0){
                expuestas = piezasExpuestas(chess,colorRival,colorPropio, sans[0]);
              }else{
                expuestas = [];
              }
              if (moves.length > 0) movimientos.push({
                Pieza:pieza,
                Square:square,
                MovimientosPosibles: moves,
                PiezasExpuestas: expuestas,
                CalidadPieza: PIECE_VALUE[pieza.type]
              });
          }
      }
  }

  if(movimientos.length>0) return movimientos.sort((a,b)=>ordenarPorCalidadPieza(a.Pieza.type,b.Pieza.type));

  return false;
}


/** 
 * Funcion que comprueba en todos las casillas del color indicado si tiene posibilidad de atacar
 * el color indicado y devuelve una lista de tipo Movimientos.
*/
export function ataque(chess:Chess, colorRival:Color, colorPropio:Color):Movimientos[]|false{
  const board = chess.board();
  const movimientos:Movimientos[] = [];

  for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const pieza = board[row][col]; // Piece | null
        if (!pieza || pieza.color !== colorPropio) continue;

        const square = ("abcdefgh"[col] + (8 - row)) as Square;

        if (chess.turn() !== colorPropio) continue;
        const moves = chess.moves({ square, verbose: true });
        const capturas = moves
          .filter(m => m.flags.includes("c") || m.flags.includes("e"))
          .map(m => m.san);

        if (capturas.length > 0) {
          // Calcular piezas expuestas para el primer movimiento de captura
          const expuestas = piezasExpuestas(chess,colorRival,colorPropio, capturas[0]);
          movimientos.push({
            Pieza: pieza,
            Square: square,
            MovimientosPosibles: moves,
            PiezasExpuestas: expuestas,
            CalidadPieza: PIECE_VALUE[pieza.type]
          });
        }
      }
  }

  if (movimientos.length > 0) {
      return movimientos
      .filter(movimiento =>
        movimiento.MovimientosPosibles.some(mov => mov.captured!=undefined)
      )
      .sort((a, b) =>
        ordenarPorCalidadPieza(a.Pieza.type, b.Pieza.type)
      );
  }

  return false;
}

/**
 * Devuelve las piezas propias que quedan expuestas (atacadas) como 
 * consecuencia directa de realizar el movimiento indicado.
 * Solo incluye piezas que NO estaban atacadas antes y SÍ lo están después.
 */
function piezasExpuestas(chess:Chess, colorRival:Color, colorPropio:Color, san:string): Piece[] {

  function analisisSimple(chess:Chess, colorRival:Color, colorPropio:Color){
    const board = chess.board();
    const movimientos:Movimientos[] = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const pieza = board[row][col];
            if (!pieza || pieza.color !== colorPropio) continue;

            const square = ("abcdefgh"[col] + (8 - row)) as Square;
            
            if (chess.isAttacked(square, colorRival)) {
              const moves = chess.moves({ square, verbose: true });
              const sans = moves.map(m => m.san);
              movimientos.push({
                Pieza:pieza,
                Square:square,
                MovimientosPosibles:moves,
                PiezasExpuestas: [],
                CalidadPieza: PIECE_VALUE[pieza.type]
              });
            }
        }
    }

    if(movimientos.length>0) return movimientos.sort((a,b)=>ordenarPorCalidadPieza(a.Pieza.type,b.Pieza.type));

    return false;
  }

  if(!san) return [];

  const defensaAntes = analisisSimple(chess,colorRival,colorPropio);

  const chessCopy = new Chess(chess.fen());
  try {
    const moveResult = chessCopy.move(san);
    if (!moveResult) return [];
  } catch {
    return [];
  }
  const defensaDespues = analisisSimple(chessCopy,colorRival,colorPropio);

  if(defensaAntes&&defensaDespues){
    const resultado: Piece[] = [];
    for(const defensaD of defensaDespues){
      const yaEstaba = defensaAntes.some(defensaA => defensaA.Square === defensaD.Square);
      if(!yaEstaba){
        resultado.push(defensaD.Pieza);
      }
    }
    return resultado;
  }

  return [];
}

/**
 * true => la pieza movida queda atacada tras mover
 */
export function quedaAtacadaTrasMover(fen: string, san: string): boolean {
  const chess = new Chess(fen);

  try {
    const result = chess.move(san);     // si es SAN válido, devuelve objeto
    if (!result) return false;          // movimiento ilegal => decide tú (yo devuelvo false)

    const square = result.to as Square; // casilla real destino
    const atacante = chess.turn() as Color; // tras mover, le toca al rival: es quien ataca

    return chess.isAttacked(square, atacante);
  } catch {
    return false;
  }
}

export function evitaTablasSiVasGanando(chess: Chess, candidatoSan: string): boolean {
  const copy = new Chess(chess.fen());
  copy.move(candidatoSan);

  // Si el movimiento provoca repetición / draw, lo evitamos
  if (copy.isThreefoldRepetition()) return false;
  if (copy.isDraw()) return false; // incluye 50-move, insuficiente, etc.

  return true;
}

export function movimientoValido(fen:string,san:string):boolean{
  const chess = new Chess(fen);
  try{
    const result = chess.move(san); 
    return result !== null;
  }catch {
    return false;
  }
}