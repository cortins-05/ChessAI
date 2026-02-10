import { Chess, Color } from "chess.js";
import { ataque, quedaAtacadaTrasMover, defensa, movimientoValido, primerasJugadasPosibles } from '../utils/Principales';
import { ordenarPorCalidadPieza } from "../utils/Ordenamiento";
import { AtaqueDefensorio, Jugada, Movimientos } from "../types/types";
import { FiltradoDefensaPrincipal, FiltradoDefensaSecundario, FiltradoRiesgo } from "../utils/Filtrado";
import { getPiece, getPieceFrom } from "../utils/translators";

export class CortinsChessAlgorithmV1 {

  private jugadasCalculadas?:Jugada[];

  private jugadaJaque?:Jugada;

  private colorRival:Color;
  private colorPropio:Color;

  public constructor(colorRival:Color){
    this.colorRival = colorRival;
    this.colorPropio = colorRival==="b" ? "w" : "b";
  }
  
  public randomMove(chess:Chess){
    const moves = chess.moves();
    return moves[Math.floor(Math.random() * moves.length)];
  }

  //Este es el jefe de cocina del algoritmo, se encarga de que lleve un razonamiento estructurado y por partes
  public cortinsMove(chess:Chess):string{

    let move;

    const historial = chess.history();
    console.log("Historial:",historial);

    //1º: Comprobamos si hay jugada de jaque y que sea valida; en función de que esté a huevo y de que si no lo está que no haya riesgo.
    // Si no, reestablecemos la jugada de jaque.
    if (this.jugadaJaque && this.jugadaJaque.Jugada.length > 0) {

      const next = this.jugadaJaque.Jugada[0];
      const piezaFrom = getPieceFrom(next, chess.fen());
      const esUltimoMovimientoMate = this.jugadaJaque.Tipo === "mate" && this.jugadaJaque.Jugada.length === 1;

      // Si es el ultimo movimiento de mate, ejecutar sin verificar riesgo (ganamos igual)
      // En cualquier otro caso, verificar FiltradoRiesgo
      const esSeguro = esUltimoMovimientoMate || (piezaFrom && FiltradoRiesgo(chess.fen(), next, piezaFrom));

      if (next && movimientoValido(chess.fen(), next) && esSeguro) {
        const shifted = this.jugadaJaque.Jugada.shift();
        console.log("Siguiento la siguiente jugada jaque:", shifted, this.jugadaJaque);
        if (shifted) return shifted;
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
        const piezaJaque = getPieceFrom(movimiento, chess.fen());
        console.log("Jaque mate establecido, recemos...", jaqueMateDecidido);
        // Solo seguir la linea de mate si el primer movimiento no sacrifica la reina
        if(movimiento && movimientoValido(chess.fen(),movimiento) && piezaJaque && FiltradoRiesgo(chess.fen(), movimiento, piezaJaque)){
          this.jugadaJaque = jaqueMateDecidido;
          jaqueMateDecidido.Jugada.shift();
          console.log("Movimiento jaque:", movimiento);
          return movimiento;
        }
      }
    }

    //3º Llamamos a la función defensa, la cual nos hace un barrido de todas las piezas vulnerables y nos devuelve un array
    // con los posibles movimientos defensorios filtrados por los que si se hacen no expongan a una pieza de calidad superior.
    const defensas = defensa(chess,this.colorRival,this.colorPropio);
    const defensasPulidas:Movimientos[] = [];
    if(defensas){
      console.log("Defensas:",defensas);
      const defensas_mod = defensas.filter((a)=>FiltradoDefensaPrincipal(a)).sort((a,b)=>ordenarPorCalidadPieza(a.Pieza.type,b.Pieza.type));
      console.log("Defensas Ordenadas Por Calidad De Pieza:",defensas);
      for(const defensa of defensas_mod){
        // Filtrar tanto por defensa secundaria como por riesgo (evitar perder la reina)
        const movimientosPulidos = defensa.MovimientosPosibles.filter((a)=>
          FiltradoDefensaSecundario(chess.fen(),a,this.colorRival,defensas_mod) && 
          FiltradoRiesgo(chess.fen(), a, defensa.Pieza.type)
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
        move = defensasPulidas[0].MovimientosPosibles[0];
        console.log("Movimiento defensorio seguro: ",move);
      }
    }

    //4º Mismo mecanismo que en el 3 pero para ataques.
    const ataques = ataque(chess,this.colorRival,this.colorPropio);
    const ataquesPulidos:Movimientos[] = [];
    if(ataques){
      const ataques_mod = ataques.filter((a)=>FiltradoDefensaPrincipal(a)).sort((a,b)=>ordenarPorCalidadPieza(a.Pieza.type,b.Pieza.type));
      for(const ataque of ataques_mod){
        const movimientosPulidos = ataque.MovimientosPosibles.filter((a)=>FiltradoRiesgo(chess.fen(),a,ataque.Pieza.type));
        if(movimientosPulidos.length>0) ataquesPulidos.push({
          Pieza: ataque.Pieza,
          Square:ataque.Square,
          MovimientosPosibles: movimientosPulidos,
          PiezasExpuestas: ataque.PiezasExpuestas,
          CalidadPieza: ataque.CalidadPieza
        });
      }
      if(ataquesPulidos.length>0) {
        move = ataquesPulidos[0].MovimientosPosibles[0];
        console.log("Movimiento de ataque:",move);
      }
      console.log("Ataques ordenados por calidad de pieza:",ataques);
      console.log("Ataques ordenados por calidad de pieza mod:",ataques_mod);
      console.log("Ataques pulidos:",ataquesPulidos);
    }

    //5º Comprobar cuantos movimientos de ataques y defensas coinciden y se elige el mejor.
    if(ataquesPulidos.length>0&&defensasPulidas){
      const ataquesDefensorios:AtaqueDefensorio[] = [];
      for(const defensa of defensasPulidas){
        for(const ataque of ataquesPulidos){
          for(const movimientoAtaque of ataque.MovimientosPosibles){
            if(defensa.MovimientosPosibles.includes(movimientoAtaque)){
              ataquesDefensorios.push({
                movimiento: movimientoAtaque,
                CalidadPieza: defensa.CalidadPieza ?? 0
              })
            }
          }
        }
      }
      if(ataquesDefensorios.length>0){
        ataquesDefensorios.sort((a,b)=> b.CalidadPieza - a.CalidadPieza );
        move = ataquesDefensorios[0].movimiento;
        console.log("Movimiento comparativo ataque+defensa:",move);
      }
    }
    
    if(!move&&this.jugadasCalculadas&&this.jugadasCalculadas.length>0){
      const jugada_optima = this.jugadasCalculadas.sort((a,b)=>a.Jugada.length-b.Jugada.length);
      const movimientoOptimo = jugada_optima[0].Jugada[0];
      const piezaOptima = getPieceFrom(movimientoOptimo, chess.fen());
      // Solo usar si no sacrifica la reina
      if(movimientoOptimo && movimientoValido(chess.fen(), movimientoOptimo) && piezaOptima && FiltradoRiesgo(chess.fen(), movimientoOptimo, piezaOptima)){
        move = movimientoOptimo;
      }
    }

    //Si no encontro nada, fomentamos el avance seguro de los peones.
    if(!move){
      console.log("Entramos en movimiento aleatorio...");
      const moves = chess.moves().filter((a)=>!quedaAtacadaTrasMover(chess.fen(),a));
      move = moves.sort((a,b)=>ordenarPorCalidadPieza(getPiece(a,chess.fen())!,getPiece(b,chess.fen())!)).reverse()[0];
    }
    
    return move ?? this.randomMove(chess);
  }
}