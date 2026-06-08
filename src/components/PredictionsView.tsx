"use client";

import { useState } from "react";
import { PredictionCard } from "@/components/PredictionCard";
import { SwipePredictions } from "@/components/SwipePredictions";
import type { MatchWithTeams, Prediction } from "@/lib/supabase/types";

type Mode = "swipe" | "list";

export function PredictionsView({
  groups,
  matches,
  predictions,
}: {
  groups: [string, MatchWithTeams[]][];
  matches: MatchWithTeams[];
  predictions: Prediction[];
}) {
  const [mode, setMode] = useState<Mode>("swipe");
  const predictionByMatch = new Map(predictions.map((p) => [p.match_id, p]));

  return (
    <div className="space-y-5">
      <div className="inline-flex w-full gap-1 rounded-full bg-cream p-1 sm:w-auto">
        <ModeButton active={mode === "swipe"} onClick={() => setMode("swipe")}>
          🔥 Modo rápido
        </ModeButton>
        <ModeButton active={mode === "list"} onClick={() => setMode("list")}>
          📋 Lista completa
        </ModeButton>
      </div>

      {mode === "swipe" ? (
        <SwipePredictions matches={matches} initialPredictions={predictions} />
      ) : (
        <div className="space-y-6">
          {groups.length === 0 && (
            <p className="premium-card p-6 text-center text-sm text-ink/60">
              Todavía no hay partidos cargados. Cuando la organizadora publique el fixture vas a
              poder cargar tus predicciones acá. ⚽️
            </p>
          )}

          {groups.map(([groupName, groupMatches]) => (
            <section key={groupName}>
              <h2 className="mb-3 inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-purple">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink/20 text-sm font-black text-purple">
                  {groupName}
                </span>
                Grupo {groupName}
              </h2>
              <ul className="space-y-3">
                {groupMatches.map((match) => (
                  <PredictionCard key={match.id} match={match} prediction={predictionByMatch.get(match.id) ?? null} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2 text-xs font-black uppercase tracking-tight transition-colors sm:flex-none ${
        active ? "bg-purple text-pink shadow-sm" : "text-ink/40 hover:text-ink/60"
      }`}
    >
      {children}
    </button>
  );
}
