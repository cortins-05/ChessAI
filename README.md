# ♟️ Cortins Chess AI (v1)  ♟️

¡Bienvenido/a! Esto es **Cortins Chess AI**, una mini-IA de ajedrez hecha por mí como **entretenimiento** y experimento personal.

🚧 **Estado:** Versión 1 (la iré puliendo y ampliando)

📌 [**Repo**](https://github.com/cortins-05/ChessAI)

📜 [**Changelog**](./CHANGELOG.md)

---

## ❗️Aclaración

- No pretende ser un motor profesional tipo Stockfish ni ganar torneos; la idea es **jugar, aprender y mejorarla poco a poco**.
- No aseguro su funcionalidad al 100%, estoy avanzando en esto de la programación e intento depender lo mínimo posible de la IA por lo que iré revisando y adaptando el codigo poco a poco a medida que vayan surgiendo problemas.

## ✨ ¿Qué hace?

* Devuelve un movimiento “decente” según mi propia forma de pensar.
* Incluye un modo de movimiento aleatorio.
* Usa `chess.js` para gestionar el tablero y validar jugadas.

---

## 📦 Instalación

```bash
npm install cortins-chess-ai chess.js
```

## 🧑‍💻Uso rápido

```php
import { Chess } from "chess.js";
import { CortinsChessAlgorithm } from "cortins-chess-ai";

// Crear una partida
const chess = new Chess();

// Crear la IA (le indicamos el color del rival)
const ai = new CortinsChessAlgorithm("w");

// Obtener un movimiento propuesto por la IA
const move = ai.cortinsMove(chess);

console.log("Movimiento sugerido:", move);

// Aplicar el movimiento al tablero
chess.move(move);
```
