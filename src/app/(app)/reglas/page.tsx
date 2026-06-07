const RULES = [
  "Cada participante carga sus predicciones antes de que empiece cada partido.",
  "Se pueden editar las predicciones hasta el horario de inicio del partido.",
  "Una vez que el partido empezó, la predicción queda cerrada y no se puede modificar.",
  "Resultado exacto: sumás 3 puntos.",
  "Adivinar el ganador o el empate (sin el resultado exacto): sumás 1 punto.",
  "Errar el resultado y el ganador: sumás 0 puntos.",
  "El ranking se actualiza automáticamente cuando se cargan los resultados reales.",
  "¡Gana quien tenga más puntos acumulados al final del campeonato!",
];

const EXAMPLES = [
  {
    real: "Argentina 2 – 1 Francia",
    predictions: [
      { text: "Argentina 2 – 1 Francia", points: 3, detail: "resultado exacto" },
      { text: "Argentina 1 – 0 Francia", points: 1, detail: "acertó que ganaba Argentina" },
      { text: "Argentina 1 – 1 Francia", points: 0, detail: "no acertó ni resultado ni ganador" },
    ],
  },
  {
    real: "Argentina 1 – 1 Francia",
    predictions: [
      { text: "Argentina 0 – 0 Francia", points: 1, detail: "acertó que era empate" },
      { text: "Argentina 1 – 1 Francia", points: 3, detail: "resultado exacto" },
      { text: "Argentina 2 – 1 Francia", points: 0, detail: "no era empate" },
    ],
  },
];

export default function ReglasPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Reglas del juego</h1>
        <p className="mt-1 text-sm text-ink/60">
          Simple, claro y sin vueltas: así se juega el prode. 🎉
        </p>
      </header>

      <section className="rounded-3xl border border-line bg-white p-5 shadow-sm shadow-pink/5">
        <ol className="space-y-3">
          {RULES.map((rule, index) => (
            <li key={rule} className="flex gap-3 text-sm leading-relaxed text-ink/80">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink/15 text-xs font-bold text-pink-dark">
                {index + 1}
              </span>
              {rule}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-purple">Ejemplos de puntaje</h2>
        <div className="space-y-4">
          {EXAMPLES.map((example) => (
            <div
              key={example.real}
              className="rounded-3xl border border-line bg-white p-5 shadow-sm shadow-pink/5"
            >
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-sm font-bold text-ink">
                ⚽️ Resultado real: {example.real}
              </p>
              <ul className="space-y-2">
                {example.predictions.map((p) => (
                  <li
                    key={p.text}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-cream/70 px-3 py-2 text-sm"
                  >
                    <span className="text-ink/80">
                      Predicción: <span className="font-semibold">{p.text}</span>{" "}
                      <span className="text-ink/40">· {p.detail}</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                        p.points === 3
                          ? "bg-emerald-100 text-emerald-700"
                          : p.points === 1
                            ? "bg-gold/25 text-amber-800"
                            : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      +{p.points} {p.points === 1 ? "punto" : "puntos"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
