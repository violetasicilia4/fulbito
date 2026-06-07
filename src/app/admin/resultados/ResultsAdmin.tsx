"use client";

import { useState } from "react";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { StatusPill } from "@/components/StatusPill";
import type { MatchWithTeams } from "@/lib/supabase/types";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  scheduled: { label: "Próximo", tone: "proximo" },
  live: { label: "En juego", tone: "en juego" },
  finished: { label: "Finalizado", tone: "finalizado" },
};

export function ResultsAdmin({ initialMatches }: { initialMatches: MatchWithTeams[] }) {
  const [matches, setMatches] = useState(initialMatches);

  function handleUpdated(updated: MatchWithTeams) {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  return (
    <ul className="space-y-2.5">
      {matches.map((match) => (
        <ResultRow key={match.id} match={match} onUpdated={handleUpdated} />
      ))}
      {matches.length === 0 && (
        <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-center text-sm text-ink/60">
          Todavía no hay partidos cargados. Cargalos primero desde “Partidos”.
        </p>
      )}
    </ul>
  );
}

function ResultRow({ match, onUpdated }: { match: MatchWithTeams; onUpdated: (m: MatchWithTeams) => void }) {
  const [home, setHome] = useState(match.home_score !== null ? String(match.home_score) : "");
  const [away, setAway] = useState(match.away_score !== null ? String(match.away_score) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const status = STATUS_LABEL[match.status] ?? STATUS_LABEL.scheduled;

  async function handleSave() {
    setError(null);
    setNotice(null);

    if (home.trim() === "" || away.trim() === "") {
      setError("Cargá el resultado de ambos equipos.");
      return;
    }

    const homeScore = Number(home);
    const awayScore = Number(away);
    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
      setError("El resultado debe ser un número entero desde 0 en adelante.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: match.id, home_score: homeScore, away_score: awayScore }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "No pudimos guardar el resultado.");
        return;
      }
      onUpdated(json.match as MatchWithTeams);
      setNotice(`Resultado guardado. Recalculamos los puntos de ${json.recalculated} predicción(es).`);
    } catch {
      setError("No pudimos conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded-3xl border border-line bg-white p-4 shadow-sm shadow-purple/5">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink/40">
        <span>
          {match.group_name ? `Grupo ${match.group_name} · ` : ""}
          {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)} hs
        </span>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className="truncate text-sm font-semibold text-ink">
          {match.home_team?.flag_emoji} {match.home_team?.name}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={home}
            onChange={(e) => setHome(e.target.value)}
            className="h-11 w-14 rounded-2xl border border-line bg-cream text-center text-base font-bold text-ink outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
          />
          <span className="font-display text-lg font-bold text-ink/30">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={away}
            onChange={(e) => setAway(e.target.value)}
            className="h-11 w-14 rounded-2xl border border-line bg-cream text-center text-base font-bold text-ink outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
          />
        </div>
        <p className="truncate text-right text-sm font-semibold text-ink">
          {match.away_team?.name} {match.away_team?.flag_emoji}
        </p>
      </div>

      {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
      {notice && <p className="mt-2 text-sm font-medium text-emerald-700">{notice}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 w-full rounded-2xl bg-purple px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-purple/30 transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Guardar resultado y recalcular puntos"}
      </button>
    </li>
  );
}
