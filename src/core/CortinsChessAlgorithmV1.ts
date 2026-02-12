import { Chess, Color, Move } from 'chess.js';
import { ataque, quedaAtacadaTrasMover, defensa, movimientoValido, primerasJugadasPosibles, evitaTablasSiVasGanando } from '../utils/Principales';
import { ordenarPorCalidadPieza } from "../utils/Ordenamiento";
import { AtaqueDefensorio, Jugada, Movimientos } from "../types/types";
import { FiltradoDefensaPrincipal, FiltradoDefensaSecundario, FiltradoRiesgo } from "../utils/Filtrado";

export class CortinsChessAlgorithmV1 {

  private jugadasCalculadas?:Jugada[];

  private jugadaJaque?:Jugada;

  private colorRival:Color;
  private colorPropio:Color;

  public constructor(colorRival:Color){
    this.colorRival = colorRival;
    this.colorPropio = colorRival==="b" ? "w" : "b";
  }
  
  public randomMove(chess: Chess): string {
    const moves = chess.moves({ verbose: true });

    if (moves.length === 0) return "";

    const move = moves[Math.floor(Math.random() * moves.length)];
    return move.san;
  }

  //Este es el jefe de cocina del algoritmo, se encarga de que lleve un razonamiento estructurado y por partes
  public cortinsMove(chess:Chess):string{

    let move:string|undefined=undefined;

    const historial = chess.history();
    console.log("Historial:",historial);

    //1º: Comprobamos si hay jugada de jaque y que sea valida; en función de que esté a huevo y de que si no lo está que no haya riesgo.
    // Si no, reestablecemos la jugada de jaque.
    if (this.jugadaJaque && this.jugadaJaque.Jugada.length > 0) {

      const next = this.jugadaJaque.Jugada[0];
      const esUltimoMovimientoMate = this.jugadaJaque.Tipo === "mate" && this.jugadaJaque.Jugada.length === 2;

      // Si es el ultimo movimiento de mate, ejecutar sin verificar riesgo (ganamos igual)
      // En cualquier otro caso, verificar FiltradoRiesgo
      const esSeguro = esUltimoMovimientoMate || (next.from && FiltradoRiesgo(chess.fen(), next));

      if (next && movimientoValido(chess.fen(), next.san) && esSeguro) {
        const shifted = this.jugadaJaque.Jugada.shift();
        console.log("Siguiendo la siguiente jugada jaque:", shifted, this.jugadaJaque);
        if (shifted) return shifted.san;
      } else {
        this.jugadaJaque = undefined;
      }
    }

    //2º Si hemos llegado a este paso es porque el paso 1 no funcionó, aquí establecemos las jugadas posibles, y además si hay algún jaque mate lo establecemos.
    this.jugadasCalculadas = primerasJugadasPosibles({fenInicial:chess.fen()});
    if(this.jugadasCalculadas){
      const jaqueMate = this.jugadasCalculadas.filter(jugada=>jugada.Tipo=="mate"&&jugada.Jugada.length>0);
      if(jaqueMate.length>0){
        const jaqueMateDecidido = jaqueMate.sort((a,b)=>a.Jugada.length-b.Jugada.length)[0];
        const movimiento = jaqueMateDecidido.Jugada[0];
        console.log("Jaque mate establecido, recemos...", jaqueMateDecidido);
        // Solo seguir la linea de mate si el primer movimiento no sacrifica la reina
        if(movimiento && movimientoValido(chess.fen(),movimiento.san) && FiltradoRiesgo(chess.fen(), movimiento)){
          this.jugadaJaque = jaqueMateDecidido;
          jaqueMateDecidido.Jugada.shift();
          console.log("Movimiento jaque:", movimiento);
          return movimiento.san;
        }
      }
    }

    //3º Llamamos a la función defensa, la cual nos hace un barrido de todas las piezas vulnerables y nos devuelve un array
    // con los posibles movimientos defensorios filtrados por los que si se hacen no expongan a una pieza de calidad superior.
    const defensas = defensa(chess,this.colorRival,this.colorPropio);
    const defensasPulidas:Movimientos[] = [];
    if(defensas){
      console.log("Defensas:",defensas);
      const defensas_mod = defensas.filter((a)=>FiltradoDefensaPrincipal(a,chess,this.colorRival)).sort((a,b)=>ordenarPorCalidadPieza(a.Pieza.type,b.Pieza.type));
      console.log("Defensas Ordenadas Por Calidad De Pieza:",defensas);
      for(const defensa of defensas_mod){
        // Filtrar tanto por defensa secundaria como por riesgo (evitar perder la reina)
        const movimientosPulidos = defensa.MovimientosPosibles.filter((a)=>
          FiltradoDefensaSecundario(chess.fen(),a.san,this.colorRival,defensas_mod) && 
          FiltradoRiesgo(chess.fen(), a)
        );
        if(movimientosPulidos.length>0) defensasPulidas.push({
          Pieza: defensa.Pieza,
          Square:defensa.Square,
          MovimientosPosibles: movimientosPulidos,
          PiezasExpuestas: defensa.PiezasExpuestas,
          CalidadPieza: defensa.CalidadPieza
        });
      }
      if(defensasPulidas.length>0){
        const candidatos = defensasPulidas[0].MovimientosPosibles.map(m => m.san);
        const elegido = candidatos.find(san => evitaTablasSiVasGanando(chess, san));
        move = elegido ?? candidatos[0];
        console.log("Movimiento defensorio seguro: ",move);
      }
    }

    //4º Mismo mecanismo que en el 3 pero para ataques.
    const ataques = ataque(chess,this.colorRival,this.colorPropio);
    const ataquesPulidos:Movimientos[] = [];
    if(ataques){
      const ataques_mod = ataques.filter((a)=>FiltradoDefensaPrincipal(a,chess,this.colorRival)).sort((a,b)=>ordenarPorCalidadPieza(a.Pieza.type,b.Pieza.type));
      for(const ataque of ataques_mod){
        const movimientosPulidos = ataque.MovimientosPosibles.filter((a)=>FiltradoRiesgo(chess.fen(),a));
        if(movimientosPulidos.length>0) ataquesPulidos.push({
          Pieza: ataque.Pieza,
          Square:ataque.Square,
          MovimientosPosibles: movimientosPulidos,
          PiezasExpuestas: ataque.PiezasExpuestas,
          CalidadPieza: ataque.CalidadPieza
        });
      }
      if (ataquesPulidos.length > 0) {
        const candidatos = ataquesPulidos[0].MovimientosPosibles.map(m => m.san);

        const elegido = candidatos.find(san => evitaTablasSiVasGanando(chess, san));
        move = elegido ?? candidatos[0];

        console.log("Movimiento de ataque:", move);
      }
      console.log("Ataques ordenados por calidad de pieza:",ataques);
      console.log("Ataques ordenados por calidad de pieza mod:",ataques_mod);
      console.log("Ataques pulidos:",ataquesPulidos);
    }

    //5º Comprobar cuantos movimientos de ataques y defensas coinciden y se elige el mejor.
    if (ataquesPulidos.length > 0 && defensasPulidas.length > 0) {
      const ataquesDefensorios: AtaqueDefensorio[] = [];

      for (const defensa of defensasPulidas) {
        const setDef = new Set(defensa.MovimientosPosibles.map(m => m.san)); // 👈 set por SAN

        for (const ataque of ataquesPulidos) {
          for (const mov of ataque.MovimientosPosibles) {
            if (setDef.has(mov.san)) {
              ataquesDefensorios.push({
                movimiento: mov,
                CalidadPieza: defensa.CalidadPieza ?? 0,
              });
            }
          }
        }
      }

      if (ataquesDefensorios.length > 0) {
        ataquesDefensorios.sort((a, b) => b.CalidadPieza - a.CalidadPieza);

        const candidatos = ataquesDefensorios.filter(x => x.movimiento.captured!=undefined);
        const elegido = candidatos.find(move => evitaTablasSiVasGanando(chess, move.movimiento.san))?.movimiento.san;

        move = elegido ?? candidatos[0].movimiento.san;
        console.log("Movimiento comparativo ataque+defensa:", move);
      }
    }
    
    if(!move&&this.jugadasCalculadas&&this.jugadasCalculadas.length>0){
      const jugada_optima = this.jugadasCalculadas.sort((a,b)=>a.Jugada.length-b.Jugada.length);
      const movimientoOptimo = jugada_optima[0].Jugada[0];
      // Solo usar si no sacrifica la reina
      if(movimientoOptimo && movimientoValido(chess.fen(), movimientoOptimo.san) && FiltradoRiesgo(chess.fen(), movimientoOptimo)){
        move = movimientoOptimo.san;
      }
    }

    //Si no encontro nada, fomentamos el avance seguro de los peones.
    if(!move){
      console.log("Entramos en movimiento aleatorio...");
      const moves = chess.moves({verbose:true}).filter((a)=>!quedaAtacadaTrasMover(chess.fen(),a.san));
      move = moves.sort((a,b)=>ordenarPorCalidadPieza(a.piece,b.piece)).reverse()[0].san;
    }
    
    return move ?? this.randomMove(chess);
  }
}