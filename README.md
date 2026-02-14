# **♟️ Cortins Chess AI (v2) ♟️**

¡Bienvenido/a a **Cortins Chess AI v2**!

Esta es la **segunda versión mejorada** de mi mini-motor de ajedrez experimental. Sigue siendo un proyecto personal de aprendizaje, pero ahora es **más estable, más consistente y mucho más sólido que la v1**.

🚀 **Estado:** Versión 2 – Reescrita y optimizada

📌 **Repositorio:**[https://github.com/cortins-05/ChessAI](https://github.com/cortins-05/ChessAI)

No pretende ser un motor profesional tipo Stockfish ni ganar torneos; la idea es **jugar, aprender y mejorarla poco a poco**.

---

## 🙀LA V2 YA ESTA AQUI 🙀

### **🔥 ¿Qué mejora la v2?**

La versión 2 no es solo un pequeño ajuste — es una mejora real del algoritmo:

✅ Corrección de bugs críticos detectados en v1

✅ Mejor filtrado de movimientos inválidos

✅ Menos dependencia del modo aleatorio

✅ Mejor priorización de jugadas ofensivas y defensivas

✅ Mayor estabilidad en partidas largas

✅ Mejor integración con `chess.js`

✅ Mayor probabilidad de jaque mate

---

## **❗ Aclaración Importante**

* No pretende competir con motores profesionales como Stockfish.
* Es un motor experimental basado en mi propia lógica y forma de pensar el ajedrez.
* Está diseñado para aprender, experimentar y evolucionar.

La v2 representa un salto de calidad respecto a la v1, pero seguirá mejorando.

---

## **📦 Instalación**

```
npm install cortins-chess-ai chess.js
```

---

## **🧑‍💻 Uso rápido**

```tsx
import {Chess }from"chess.js";
import {CortinsChessAlgorithmV2 }from"cortins-chess-ai";

// Crear partida
const chess =newChess();
// Crear la IA indicando su color
const ai =newCortinsChessAlgorithmV2("w");

// Obtener movimiento sugerido
const move = ai.CortinsMoveV2(chess);

//Mostrar la logica que sigue
console.log(move.code);

// Aplicarlo al tablero
chess.move(move.san);
```
