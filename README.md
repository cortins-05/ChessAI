# ♟️ Cortins Chess AI (v1) — “mi motorcito de ajedrez” 😄

📜 [Changelog](./CHANGELOG.md)

¡Bienvenido/a! Esto es **Cortins Chess AI**, una mini-IA de ajedrez hecha por mí como **entretenimiento** y experimento personal.

No pretende ser un motor profesional tipo Stockfish ni ganar torneos; la idea es **jugar, aprender y mejorarla poco a poco**.

📌 **Repo:** cortins-05 (GitHub)

🚧 **Estado:** Versión 1 (la iré puliendo y ampliando)

---

## ✨ ¿Qué hace?

* Devuelve un movimiento “decente” según unas heurísticas propias.
* Incluye un modo de movimiento aleatorio para el “caos controlado”.
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
