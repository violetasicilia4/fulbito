"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, Minus, Plus, X, type LucideIcon } from "lucide-react";
import { TeamBadge } from "@/components/TeamBadge";
import { StatusPill } from "@/components/StatusPill";
import { formatMatchDate, formatMatchTime, hasKickedOff } from "@/lib/format";
import type { MatchWithTeams, Prediction } from "@/lib/supabase/types";

const SWIPE_THRESHOLD = 110;
const LOCKED_MESSAGE = "Este partido ya empezó: tu pronóstico quedó cerrado.";

type Scores = { home: string; away: string };
type Direction = "left" | "right";

function scoresFromPrediction(prediction: Prediction | undefined): Scores {
  return {
    home: prediction ? String(prediction.predicted_home_score) : "",
    away: prediction ? String(prediction.predicted_away_score) : "",
  };
}

export function SwipePredictions({
  matches,
  initialPredictions,
}: {
  matches: MatchWithTeams[];
  initialPredictions: Prediction[];
}) {
  const [index, setIndex] = useState(0);
  const [predictionsByMatch, setPredictionsByMatch] = useState<Record<string, Prediction>>(() =>
    Object.fromEntries(initialPredictions.map((p) => [p.match_id, p])),
  );
  const [scoresByMatch, setScoresByMatch] = useState<Record<string, Scores>>(() => {
    const byMatch = new Map(initialPredictions.map((p) => [p.match_id, p]));
    return Object.fromEntries(matches.map((m) => [m.id, scoresFromPrediction(byMatch.get(m.id))]));
  });
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [errorByMatch, setErrorByMatch] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const total = matches.length;
  const current = matches[index];
  const upcoming = matches.slice(index + 1, index + 3);
  const currentLocked = current ? hasKickedOff(current.match_date) : false;

  const sentCount = useMemo(
    () => matches.filter((m) => predictionsByMatch[m.id]).length,
    [matches, predictionsByMatch],
  );

  function updateScore(matchId: string, side: "home" | "away", value: string) {
    if (value !== "" && !/^\d{1,2}$/.test(value)) return;
    setScoresByMatch((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [side]: value } }));
    setErrorByMatch((prev) => ({ ...prev, [matchId]: "" }));
  }

  function step(matchId: string, side: "home" | "away", delta: number) {
    setScoresByMatch((prev) => {
      const current = Number(prev[matchId]?.[side] || 0);
      const next = Math.min(99, Math.max(0, current + delta));
      return { ...prev, [matchId]: { ...prev[matchId], [side]: String(next) } };
    });
    setErrorByMatch((prev) => ({ ...prev, [matchId]: "" }));
  }

  async function trySave(match: MatchWithTeams): Promise<boolean> {
    const scores = scoresByMatch[match.id];
    if (!scores || scores.home === "" || scores.away === "") {
      setErrorByMatch((prev) => ({ ...prev, [match.id]: "Completá los dos resultados antes de enviarlo." }));
      return false;
    }

    const homeScore = Number(scores.home);
    const awayScore = Number(scores.away);
    const saved = predictionsByMatch[match.id];
    const dirty =
      !saved || saved.predicted_home_score !== homeScore || saved.predicted_away_score !== awayScore;

    if (!dirty) return true;

    setSavingId(match.id);
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
        setErrorByMatch((prev) => ({ ...prev, [match.id]: json?.error ?? "No pudimos enviar tu pronóstico." }));
        return false;
      }

      setPredictionsByMatch((prev) => ({ ...prev, [match.id]: json.prediction as Prediction }));
      return true;
    } catch {
      setErrorByMatch((prev) => ({ ...prev, [match.id]: "Revisá tu conexión e intentá de nuevo." }));
      return false;
    } finally {
      setSavingId(null);
    }
  }

  async function attemptDecision(direction: Direction): Promise<boolean> {
    if (!current) return false;

    if (currentLocked) return true;

    if (direction === "right") {
      const ok = await trySave(current);
      if (!ok) return false;
      setPendingIds((prev) => {
        if (!prev.has(current.id)) return prev;
        const next = new Set(prev);
        next.delete(current.id);
        return next;
      });
    } else {
      setPendingIds((prev) => new Set(prev).add(current.id));
    }

    return true;
  }

  function advance() {
    setIndex((i) => Math.min(total, i + 1));
  }

  function goTo(targetIndex: number) {
    setIndex(Math.max(0, Math.min(total, targetIndex)));
  }

  function goToFirstPending() {
    const target = matches.findIndex((m) => pendingIds.has(m.id) && !predictionsByMatch[m.id]);
    goTo(target >= 0 ? target : 0);
  }

  if (total === 0) {
    return (
      <p className="premium-card p-6 text-center text-sm text-ink/60">
        Todavía no hay partidos cargados para pronosticar. ⚽️
      </p>
    );
  }

  if (!current) {
    return (
      <SwipeCompletionCard
        sentCount={sentCount}
        total={total}
        pendingCount={pendingIds.size}
        onReview={goToFirstPending}
        onRestart={() => goTo(0)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SwipeProgress index={index} total={total} sentCount={sentCount} />

      <div className="relative h-[28rem] sm:h-[31rem]">
        {upcoming
          .slice()
          .reverse()
          .map((match, i) => (
            <div
              key={match.id}
              aria-hidden
              className="premium-card absolute inset-0"
              style={{
                transform: `scale(${1 - (upcoming.length - i) * 0.045}) translateY(${(upcoming.length - i) * 14}px)`,
                opacity: 0.45 + i * 0.25,
                zIndex: i,
              }}
            />
          ))}

        <SwipeCard
          key={current.id}
          match={current}
          scores={scoresByMatch[current.id] ?? { home: "", away: "" }}
          savedPrediction={predictionsByMatch[current.id] ?? null}
          saving={savingId === current.id}
          error={errorByMatch[current.id]}
          onScoreChange={updateScore}
          onStep={step}
          onAttempt={attemptDecision}
          onExited={advance}
        />
      </div>

      <SwipeActionBar
        locked={currentLocked}
        sending={savingId === current.id}
        onBack={index > 0 ? () => goTo(index - 1) : undefined}
        onLater={async () => {
          const ok = await attemptDecision("left");
          if (ok) advance();
        }}
        onSend={async () => {
          const ok = await attemptDecision("right");
          if (ok) advance();
        }}
      />
    </div>
  );
}

function SwipeCard({
  match,
  scores,
  savedPrediction,
  saving,
  error,
  onScoreChange,
  onStep,
  onAttempt,
  onExited,
}: {
  match: MatchWithTeams;
  scores: Scores;
  savedPrediction: Prediction | null;
  saving: boolean;
  error?: string;
  onScoreChange: (matchId: string, side: "home" | "away", value: string) => void;
  onStep: (matchId: string, side: "home" | "away", delta: number) => void;
  onAttempt: (direction: Direction) => Promise<boolean>;
  onExited: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [exiting, setExiting] = useState<Direction | null>(null);
  const [resolving, setResolving] = useState<Direction | null>(null);
  const startXRef = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const locked = useMemo(() => hasKickedOff(match.match_date, new Date(now)), [match.match_date, now]);
  const finished = match.status === "finished";

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (locked || exiting || resolving) return;
    startXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: 0, active: true });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (startXRef.current === null) return;
    setDrag({ x: event.clientX - startXRef.current, active: true });
  }

  async function handleRelease() {
    if (startXRef.current === null) return;
    const x = drag.x;
    startXRef.current = null;

    if (Math.abs(x) <= SWIPE_THRESHOLD) {
      setDrag({ x: 0, active: false });
      return;
    }

    const direction: Direction = x > 0 ? "right" : "left";
    setResolving(direction);
    const accepted = await onAttempt(direction);
    setResolving(null);

    if (accepted) {
      setExiting(direction);
    } else {
      setDrag({ x: 0, active: false });
    }
  }

  function handleTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (exiting && event.propertyName === "transform") {
      onExited();
    }
  }

  const dragX = exiting ? (exiting === "right" ? 640 : -640) : drag.x;
  const rotation = dragX / 18;
  const progress = Math.max(-1, Math.min(1, dragX / SWIPE_THRESHOLD));

  let statusTone = "pendiente";
  let statusLabel = "Pendiente";
  if (finished && savedPrediction?.points !== null && savedPrediction?.points !== undefined) {
    statusTone = "puntos";
    statusLabel = `${savedPrediction.points} ${savedPrediction.points === 1 ? "punto" : "puntos"}`;
  } else if (locked) {
    statusTone = "cerrada";
    statusLabel = "Cerrada";
  } else if (savedPrediction) {
    statusTone = "guardada";
    statusLabel = "Enviada";
  }

  return (
    <div
      role="group"
      aria-label={`${match.home_team?.name ?? "Local"} vs ${match.away_team?.name ?? "Visitante"}`}
      className="swipe-card-enter premium-card absolute inset-0 flex select-none flex-col overflow-hidden p-5 sm:p-6"
      style={{
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition:
          drag.active && !exiting ? "none" : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        touchAction: "pan-y",
        zIndex: 10,
        cursor: locked ? "default" : drag.active ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handleRelease}
      onPointerCancel={handleRelease}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className="pointer-events-none absolute left-5 top-6 -rotate-12 rounded-2xl border-[3px] border-purple px-3 py-1 text-base font-black uppercase tracking-wider text-purple sm:text-lg"
        style={{ opacity: Math.max(0, progress) }}
      >
        Enviar ✓
      </div>
      <div
        className="pointer-events-none absolute right-5 top-6 rotate-12 rounded-2xl border-[3px] border-rose-400 px-3 py-1 text-base font-black uppercase tracking-wider text-rose-500 sm:text-lg"
        style={{ opacity: Math.max(0, -progress) }}
      >
        Después ⏰
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="eyebrow truncate">
          Grupo {match.group_name} · {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)} hs
        </span>
        <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-7">
        <div className="flex w-full items-center justify-between gap-3">
          <TeamBadge team={match.home_team} />
          <span className="font-display text-xs font-black uppercase tracking-widest text-ink/25">vs</span>
          <TeamBadge team={match.away_team} align="end" />
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <BigScoreStepper
            value={scores.home}
            disabled={locked}
            label={`Goles de ${match.home_team?.name ?? "el equipo local"}`}
            onChange={(v) => onScoreChange(match.id, "home", v)}
            onStep={(d) => onStep(match.id, "home", d)}
          />
          <span className="font-display text-2xl font-black text-ink/20 sm:text-3xl">:</span>
          <BigScoreStepper
            value={scores.away}
            disabled={locked}
            label={`Goles de ${match.away_team?.name ?? "el equipo visitante"}`}
            onChange={(v) => onScoreChange(match.id, "away", v)}
            onStep={(d) => onStep(match.id, "away", d)}
          />
        </div>
      </div>

      <div className="mt-4 min-h-[3.5rem] text-center text-sm">
        {locked && finished && match.home_score !== null && match.away_score !== null ? (
          <p className="text-xs font-medium text-ink/50">
            Resultado real: {match.home_score} – {match.away_score}
          </p>
        ) : locked ? (
          <p className="rounded-2xl bg-cream px-3 py-2 text-xs font-medium text-ink/60">{LOCKED_MESSAGE}</p>
        ) : error ? (
          <p className="text-sm font-medium text-rose-600" role="alert">
            {error}
          </p>
        ) : savedPrediction ? (
          <p className="text-xs font-semibold text-ink/50">
            Ya lo enviaste: {savedPrediction.predicted_home_score} – {savedPrediction.predicted_away_score}.
            Si lo cambiás, deslizá a la derecha de nuevo para actualizarlo.
          </p>
        ) : (
          <p className="text-xs font-medium text-ink/40">
            Cargá el resultado y deslizá → para enviarlo, o ← para dejarlo para después.
          </p>
        )}
      </div>

      {(saving || resolving === "right") && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/65 backdrop-blur-sm">
          <span className="text-xs font-black uppercase tracking-wider text-purple">Enviando…</span>
        </div>
      )}
    </div>
  );
}

function BigScoreStepper({
  value,
  disabled,
  label,
  onChange,
  onStep,
}: {
  value: string;
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  onStep: (delta: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label={`Sumar un gol — ${label}`}
        disabled={disabled}
        onClick={() => onStep(1)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-light/60 text-purple transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus className="h-4 w-4" strokeWidth={3} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={99}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder="–"
        className="h-16 w-16 rounded-2xl border-2 border-line bg-cream text-center font-display text-3xl font-black text-ink outline-none transition-colors focus:border-purple focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:h-20 sm:w-20 sm:text-4xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={`Restar un gol — ${label}`}
        disabled={disabled || value === "" || value === "0"}
        onClick={() => onStep(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-light/60 text-purple transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus className="h-4 w-4" strokeWidth={3} />
      </button>
    </div>
  );
}

function SwipeProgress({ index, total, sentCount }: { index: number; total: number; sentCount: number }) {
  const pct = Math.round((Math.min(index, total) / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-ink/50">
        <span>
          Partido {Math.min(index + 1, total)} de {total}
        </span>
        <span>✓ {sentCount} enviados</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-cream">
        <div className="h-full rounded-full bg-purple transition-all duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SwipeActionBar({
  locked,
  sending,
  onBack,
  onLater,
  onSend,
}: {
  locked: boolean;
  sending: boolean;
  onBack?: () => void;
  onLater: () => void;
  onSend: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {onBack && <RoundButton tone="neutral" icon={ChevronLeft} label="Volver al partido anterior" onClick={onBack} small />}

      {locked ? (
        <button
          type="button"
          onClick={onSend}
          className="rounded-full bg-purple px-6 py-3 text-sm font-black uppercase tracking-tight text-pink shadow-md shadow-purple/20 transition-transform active:scale-[0.98]"
        >
          Siguiente →
        </button>
      ) : (
        <>
          <RoundButton tone="later" icon={X} label="Dejar para más tarde" onClick={onLater} />
          <RoundButton tone="send" icon={Check} label="Enviar pronóstico" onClick={onSend} disabled={sending} />
        </>
      )}
    </div>
  );
}

function RoundButton({
  tone,
  icon: Icon,
  label,
  onClick,
  disabled,
  small,
}: {
  tone: "later" | "send" | "neutral";
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  const toneClass =
    tone === "send"
      ? "bg-purple text-pink shadow-lg shadow-purple/30"
      : tone === "later"
        ? "border border-rose-200 bg-white text-rose-500 shadow-md shadow-rose-200/40"
        : "border border-line bg-white text-ink/40";
  const sizeClass = small ? "h-11 w-11" : "h-14 w-14";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex items-center justify-center rounded-full transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${toneClass}`}
    >
      <Icon className={small ? "h-5 w-5" : "h-6 w-6"} strokeWidth={2.5} />
    </button>
  );
}

function SwipeCompletionCard({
  sentCount,
  total,
  pendingCount,
  onReview,
  onRestart,
}: {
  sentCount: number;
  total: number;
  pendingCount: number;
  onReview: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="premium-card flex flex-col items-center gap-3 p-8 text-center">
      <span className="text-4xl">🎉</span>
      <h2 className="font-display text-xl font-bold tracking-tight text-ink">¡Recorriste todos los partidos!</h2>
      <p className="text-sm leading-relaxed text-ink/60">
        Enviaste {sentCount} de {total} pronósticos.{" "}
        {pendingCount > 0
          ? `Dejaste ${pendingCount} ${pendingCount === 1 ? "partido" : "partidos"} para más tarde — podés revisarlos cuando quieras.`
          : "¡No dejaste ninguno pendiente! 🙌"}
      </p>
      <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
        {pendingCount > 0 && (
          <button
            type="button"
            onClick={onReview}
            className="flex-1 rounded-full bg-purple px-4 py-3 text-sm font-black uppercase tracking-tight text-pink shadow-md shadow-purple/20 transition-transform active:scale-[0.98]"
          >
            Revisar pendientes
          </button>
        )}
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 rounded-full border border-line bg-cream px-4 py-3 text-sm font-black uppercase tracking-tight text-ink/70 transition-transform active:scale-[0.98]"
        >
          Repasar desde el principio
        </button>
      </div>
    </div>
  );
}
