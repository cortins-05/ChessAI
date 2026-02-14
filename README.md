# ♟️ Cortins Chess AI (v2) ♟️

¡Bienvenido/a a **Cortins Chess AI v2**!

Esta es la **segunda versión mejorada** de mi mini-motor de ajedrez experimental.
Sigue siendo un proyecto personal de aprendizaje, pero ahora es **más estable, más consistente y mucho más sólido que la v1**.

🚀 **Estado:** Versión 2 – Reescrita y optimizada
📌 **Repositorio:**[https://github.com/cortins-05/ChessAI](https://github.com/cortins-05/ChessAI)
📜 **Changelog:**`CHANGELOG.md`

---

## 🔥 ¿Qué mejora la v2?

La versión 2 no es solo un pequeño ajuste — es una mejora real del algoritmo:

✅ Corrección de bugs críticos detectados en v1
✅ Mejor filtrado de movimientos inválidos
✅ Menos dependencia del modo aleatorio
✅ Mejor priorización de jugadas ofensivas y defensivas
✅ Mayor estabilidad en partidas largas
✅ Mejor integración con `chess.js`

Ahora la IA toma decisiones más coherentes y reduce significativamente situaciones donde devolvía movimientos inconsistentes.

---

## ❗ Aclaración Importante

* No pretende competir con motores profesionales como Stockfish.
* Es un motor experimental basado en mi propia lógica y forma de pensar el ajedrez.
* Está diseñado para aprender, experimentar y evolucionar.

La v2 representa un salto de calidad respecto a la v1, pero seguirá mejorando.

---

## ✨ ¿Qué hace?

* Devuelve un movimiento estratégico basado en análisis propio.
* Evalúa jaques, amenazas y riesgos.
* Reduce movimientos puramente aleatorios.
* Permite modo random si se desea.
* Usa `chess.js` para validación y control del tablero.

---

## 📦 Instalación

<pre class="overflow-visible! px-0!" data-start="1673" data-end="1722"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(var(--sticky-padding-top)+9*var(--spacing))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm install cortins-chess-ai chess.js
</span></span></code></div></div></pre>

---

## 🧑‍💻 Uso rápido

<pre class="overflow-visible! px-0!" data-start="1750" data-end="2139"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(var(--sticky-padding-top)+9*var(--spacing))]"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { </span><span>Chess</span><span> } </span><span>from</span><span> </span><span>"chess.js"</span><span>;
</span><span>import</span><span> { </span><span>CortinsChessAlgorithmV2</span><span> } </span><span>from</span><span> </span><span>"cortins-chess-ai"</span><span>;

</span><span>// Crear partida</span><span>
</span><span>const</span><span> chess = </span><span>new</span><span> </span><span>Chess</span><span>();

</span><span>// Crear la IA indicando su color</span><span>
</span><span>const</span><span> ai = </span><span>new</span><span> </span><span>CortinsChessAlgorithmV2</span><span>(</span><span>"w"</span><span>);

</span><span>// Obtener movimiento sugerido</span><span>
</span><span>const</span><span> move = ai.</span><span>CortinsMoveV2</span><span>(chess);

</span><span>console</span><span>.</span><span>log</span><span>(</span><span>"Movimiento sugerido:"</span><span>, move);

</span><span>// Aplicarlo al tablero</span><span>
chess.</span><span>move</span><span>(move.</span><span>san</span><span>);
</span></span></code></div></div></pre>

---

## 🧠 Filosofía del Proyecto

Cortins Chess AI no está basada en búsqueda profunda tipo minimax clásica,
sino en una aproximación más “cerebral” y estructurada por fases:

* Análisis de jaque mate futuro
* Evaluación de riesgos
* Defensa estratégica
* Ataque ordenado por calidad de pieza
* Fallback controlado

La idea es que evolucione como si fuera mi propio estilo de juego codificado.
