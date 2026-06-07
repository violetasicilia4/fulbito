"use client";

import { useState } from "react";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import type { MatchWithTeams, Team } from "@/lib/supabase/types";

const PHASES = [
  { value: "group", label: "Fase de grupos" },
  { value: "round_of_32", label: "Dieciseisavos" },
  { value: "round_of_16", label: "Octavos" },
  { value: "quarter", label: "Cuartos" },
  { value: "semi", label: "Semifinal" },
  { value: "third_place", label: "Tercer puesto" },
  { value: "final", label: "Final" },
];

const STATUSES = [
  { value: "scheduled", label: "Próximo" },
  { value: "live", label: "En juego" },
  { value: "finished", label: "Finalizado" },
];

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function MatchesAdmin({ teams, initialMatches }: { teams: Team[]; initialMatches: MatchWithTeams[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [phase, setPhase] = useState("group");
  const [groupName, setGroupName] = useState("");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!homeTeamId || !awayTeamId || !matchDate) {
      setError("Elegí ambos equipos y la fecha/hora del partido.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          group_name: groupName || null,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          match_date: matchDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "No pudimos crear el partido.");
        return;
      }
      setMatches((prev) =>
        [...prev, json.match as MatchWithTeams].sort(
          (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
        ),
      );
      setGroupName("");
      setHomeTeamId("");
      setAwayTeamId("");
      setMatchDate("");
    } catch {
      setError("No pudimos conectar con el servidor.");
    } finally {
      setCreating(false);
    }
  }

  function handleUpdated(updated: MatchWithTeams) {
    setMatches((prev) =>
      prev
        .map((m) => (m.id === updated.id ? updated : m))
        .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()),
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="space-y-3 rounded-3xl border border-line bg-white p-5 shadow-sm shadow-purple/5">
        <h2 className="font-display text-base font-bold text-ink">Nuevo partido</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Fase">
            <select value={phase} onChange={(e) => setPhase(e.target.value)} className="input">
              {PHASES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Grupo (si aplica)">
            <input value={groupName} onChange={(e) => setGroupName(e.target.value.toUpperCase())} placeholder="ej: A" maxLength={2} className="input" />
          </Field>
          <Field label="Equipo local">
            <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className="input">
              <option value="">Elegir equipo…</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.flag_emoji} {t.name} {t.group_name ? `(Grupo ${t.group_name})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Equipo visitante">
            <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className="input">
              <option value="">Elegir equipo…</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.flag_emoji} {t.name} {t.group_name ? `(Grupo ${t.group_name})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha y hora de inicio">
            <input
              type="datetime-local"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        {error && <p className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={creating}
          className="rounded-2xl bg-purple px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-purple/30 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {creating ? "Creando…" : "Crear partido"}
        </button>
      </form>

      <ul className="space-y-2.5">
        {matches.map((match) => (
          <MatchRow key={match.id} match={match} teams={teams} onUpdated={handleUpdated} />
        ))}
        {matches.length === 0 && (
          <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-center text-sm text-ink/60">
            Todavía no cargaste partidos.
          </p>
        )}
      </ul>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid var(--color-prode-line);
          background: var(--color-prode-cream);
          padding: 0.55rem 0.85rem;
          font-size: 0.875rem;
          color: var(--color-prode-ink);
          outline: none;
        }
        :global(.input:focus) {
          border-color: var(--color-prode-pink);
          box-shadow: 0 0 0 3px rgba(255, 79, 147, 0.2);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-ink/70">{label}</span>
      {children}
    </label>
  );
}

function MatchRow({
  match,
  teams,
  onUpdated,
}: {
  match: MatchWithTeams;
  teams: Team[];
  onUpdated: (m: MatchWithTeams) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [groupName, setGroupName] = useState(match.group_name ?? "");
  const [homeTeamId, setHomeTeamId] = useState(match.home_team_id ?? "");
  const [awayTeamId, setAwayTeamId] = useState(match.away_team_id ?? "");
  const [matchDate, setMatchDate] = useState(toLocalInputValue(match.match_date));
  const [status, setStatus] = useState(match.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_name: groupName,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          match_date: new Date(matchDate).toISOString(),
          status,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "No pudimos guardar los cambios.");
        return;
      }
      onUpdated(json.match as MatchWithTeams);
      setEditing(false);
    } catch {
      setError("No pudimos conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded-3xl border border-line bg-white p-4 shadow-sm shadow-purple/5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
            {match.group_name ? `Grupo ${match.group_name} · ` : ""}
            {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)} hs
          </p>
          <p className="truncate font-display text-base font-bold text-ink">
            {match.home_team?.flag_emoji} {match.home_team?.name} vs {match.away_team?.flag_emoji} {match.away_team?.name}
          </p>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink/60 transition-colors hover:border-purple hover:text-purple"
        >
          {editing ? "Cerrar" : "Editar"}
        </button>
      </div>

      {editing && (
        <div className="mt-3 space-y-2.5 border-t border-line pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Grupo">
              <input value={groupName} onChange={(e) => setGroupName(e.target.value.toUpperCase())} maxLength={2} className="input" />
            </Field>
            <Field label="Estado">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Equipo local">
              <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className="input">
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.flag_emoji} {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Equipo visitante">
              <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className="input">
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.flag_emoji} {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fecha y hora de inicio">
              <input type="datetime-local" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="input" />
            </Field>
          </div>

          {error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-purple px-4 py-2 text-sm font-bold text-white shadow-sm shadow-purple/30 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      )}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid var(--color-prode-line);
          background: var(--color-prode-cream);
          padding: 0.5rem 0.85rem;
          font-size: 0.875rem;
          color: var(--color-prode-ink);
          outline: none;
        }
      `}</style>
    </li>
  );
}
