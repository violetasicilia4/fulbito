"use client";

import { useEffect, useMemo, useState } from "react";
import { TeamBadge } from "@/components/TeamBadge";
import { StatusPill } from "@/components/StatusPill";
import { formatMatchDate, formatMatchTime, hasKickedOff } from "@/lib/format";
import type { MatchWithTeams, Prediction } from "@/lib/supabase/types";

const LOCKED_MESSAGE = "La predicción ya está cerrada porque el partido comenzó.";

type SaveState = "idle" | "saving" | "saved" | "error";

export function PredictionCard({
  match,
  prediction,
}: {
  match: MatchWithTeams;
  prediction: Prediction | null;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [home, setHome] = useState(prediction ? String(prediction.predicted_home_score) : "");
  const [away, setAway] = useState(prediction ? String(prediction.predicted_away_score) : "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedPrediction, setSavedPrediction] = useState<Prediction | null>(prediction);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const locked = useMemo(() => hasKickedOff(match.match_date, new Date(now)), [match.match_date, now]);
  const finished = match.status === "finished";

  const dirty =
    !savedPrediction ||
    home !== String(savedPrediction.predicted_home_score) ||
    away !== String(savedPrediction.predicted_away_score);

  let statusTone = "pendiente";
  let statusLabel = "Pendiente";
  if (finished && savedPrediction?.points !== null && savedPrediction?.points !== undefined) {
    statusTone = "puntos";
    statusLabel = `${savedPrediction.points} ${savedPrediction.points === 1 ? "punto" : "puntos"}`;
  } else if (locked) {
    statusTone = "cerrada";
    statusLabel = "Cerrada";
  } else if (savedPrediction && !dirty) {
    statusTone = "guardada";
    statusLabel = "Guardada";
  } else if (savedPrediction && dirty) {
    statusTone = "pendiente";
    statusLabel = "Editada sin guardar";
  }

  async function handleSave() {
    setErrorMessage(null);

    if (locked) {
      setErrorMessage(LOCKED_MESSAGE);
      return;
    }

    if (home.trim() === "" || away.trim() === "") {
      setErrorMessage("Completá los goles de ambos equipos antes de guardar.");
      return;
    }

    const homeScore = Number(home);
    const awayScore = Number(away);

    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      setErrorMessage("Los goles deben ser números enteros desde 0 en adelante.");
      return;
    }

    setSaveState("saving");
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: match.id,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setSaveState("error");
        setErrorMessage(json?.error ?? "No pudimos guardar tu predicción. Probá de nuevo.");
        return;
      }

      setSavedPrediction(json.prediction as Prediction);
      setSaveState("saved");
    } catch {
      setSaveState("error");
      setErrorMessage("No pudimos guardar tu predicción. Revisá tu conexión y probá de nuevo.");
    }
  }

  function handleScoreChange(setter: (v: string) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (value === "" || /^\d{1,2}$/.test(value)) {
        setter(value);
        setSaveState("idle");
        setErrorMessage(null);
      }
    };
  }

  return (
    <li className="rounded-3xl border border-line bg-white p-4 shadow-sm shadow-pink/5 sm:p-5">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink/40">
        <span>
          {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)} hs
        </span>
        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamBadge team={match.home_team} />

        <div className="flex items-center gap-2">
          <ScoreInput
            value={home}
            onChange={handleScoreChange(setHome)}
            disabled={locked}
            label={`Goles de ${match.home_team?.name ?? "el equipo local"}`}
          />
          <span className="font-display text-lg font-bold text-ink/30">–</span>
          <ScoreInput
            value={away}
            onChange={handleScoreChange(setAway)}
            disabled={locked}
            label={`Goles de ${match.away_team?.name ?? "el equipo visitante"}`}
          />
        </div>

        <TeamBadge team={match.away_team} align="end" />
      </div>

      {finished && match.home_score !== null && match.away_score !== null && (
        <p className="mt-3 text-center text-xs font-medium text-ink/50">
          Resultado real: {match.home_team?.name} {match.home_score} – {match.away_score}{" "}
          {match.away_team?.name}
        </p>
      )}

      {locked ? (
        <p className="mt-3 rounded-2xl bg-zinc-100 px-3 py-2 text-center text-xs font-medium text-ink/60">
          {LOCKED_MESSAGE}
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving" || (!dirty && saveState !== "error")}
            className="flex-1 rounded-2xl bg-pink px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-pink/30 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveState === "saving" ? "Guardando…" : "Guardar predicción"}
          </button>
          {saveState === "saved" && !dirty && (
            <span className="text-sm font-semibold text-emerald-600">✓ Guardada</span>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="mt-2 text-sm font-medium text-pink-dark" role="alert">
          {errorMessage}
        </p>
      )}
    </li>
  );
}

function ScoreInput({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={99}
      step={1}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-label={label}
      placeholder="-"
      className="h-12 w-12 rounded-2xl border border-line bg-cream text-center text-lg font-bold text-ink outline-none transition-colors focus:border-pink focus:ring-2 focus:ring-pink/30 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-ink/40"
    />
  );
}
