"use client";

import { useState } from "react";
import type { Participant } from "@/lib/supabase/types";

export function ParticipantsAdmin({ initialParticipants }: { initialParticipants: Participant[] }) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setCreating(true);

    try {
      const res = await fetch("/api/admin/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, display_name: displayName, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? "No pudimos crear la participante.");
        return;
      }

      setParticipants((prev) => [...prev, json.participant as Participant]);
      setNotice(
        `Listo. Compartile a ${displayName} → usuario "${json.participant.username}" y la clave que elegiste.`,
      );
      setUsername("");
      setDisplayName("");
      setPassword("");
    } catch {
      setError("No pudimos conectar con el servidor. Probá de nuevo.");
    } finally {
      setCreating(false);
    }
  }

  function handleUpdated(updated: Participant) {
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-3xl border border-line bg-white p-5 shadow-sm shadow-purple/5"
      >
        <h2 className="font-display text-base font-bold text-ink">Nueva participante</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Usuario">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: vale_campeona"
              autoCapitalize="none"
              className="input"
              required
            />
          </Field>
          <Field label="Nombre visible">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ej: Valen"
              className="input"
              required
            />
          </Field>
          <Field label="Clave">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 6 caracteres"
              type="text"
              className="input"
              required
            />
          </Field>
        </div>

        {error && <p className="rounded-2xl bg-pink/10 px-4 py-2.5 text-sm font-medium text-pink-dark">{error}</p>}
        {notice && <p className="rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">{notice}</p>}

        <button
          type="submit"
          disabled={creating}
          className="rounded-2xl bg-purple px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-purple/30 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {creating ? "Creando…" : "Crear participante"}
        </button>
      </form>

      <ul className="space-y-2.5">
        {participants.map((participant) => (
          <ParticipantRow key={participant.id} participant={participant} onUpdated={handleUpdated} />
        ))}
        {participants.length === 0 && (
          <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-center text-sm text-ink/60">
            Todavía no creaste participantes.
          </p>
        )}
      </ul>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid var(--color-prode-line);
          background: var(--color-prode-cream);
          padding: 0.6rem 0.9rem;
          font-size: 0.9rem;
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

function ParticipantRow({
  participant,
  onUpdated,
}: {
  participant: Participant;
  onUpdated: (p: Participant) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(participant.display_name);
  const [isAdmin, setIsAdmin] = useState(participant.is_admin);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/participants/${participant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          is_admin: isAdmin,
          new_password: newPassword || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "No pudimos guardar los cambios.");
        return;
      }
      onUpdated(json.participant as Participant);
      setNotice("Cambios guardados.");
      setNewPassword("");
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
          <p className="truncate font-display text-base font-bold text-ink">
            {participant.display_name} {participant.is_admin && <span className="text-xs font-semibold text-purple">· admin</span>}
          </p>
          <p className="text-xs text-ink/50">usuario: {participant.username}</p>
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
          <Field label="Nombre visible">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" />
          </Field>
          <Field label="Nueva clave (opcional)">
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="dejar vacío para no cambiarla"
              className="input"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
            <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            Es administradora
          </label>

          {error && <p className="rounded-2xl bg-pink/10 px-3 py-2 text-sm font-medium text-pink-dark">{error}</p>}
          {notice && <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{notice}</p>}

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
