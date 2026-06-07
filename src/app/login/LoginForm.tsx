"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usernameToEmail, normalizeUsername } from "@/lib/username";

type Mode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function signIn(cleanUsername: string, rawPassword: string) {
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(cleanUsername),
      password: rawPassword,
    });
    return signInError;
  }

  async function handleLogin(cleanUsername: string) {
    if (!cleanUsername || !password) {
      setError("Completá tu usuario y tu clave para ingresar.");
      return;
    }

    setLoading(true);
    const signInError = await signIn(cleanUsername, password);
    setLoading(false);

    if (signInError) {
      setError("Usuario o clave incorrecta. Revisá los datos y probá de nuevo.");
      return;
    }

    const redirectTo = searchParams.get("redirectTo") || "/predicciones";
    router.replace(redirectTo);
    router.refresh();
  }

  async function handleSignup(cleanUsername: string) {
    const cleanDisplayName = displayName.trim();

    if (!cleanUsername || !cleanDisplayName || !password) {
      setError("Completá tu usuario, tu nombre visible y tu clave.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las claves no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, display_name: cleanDisplayName, password }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error || "No pudimos crear tu cuenta. Probá de nuevo.");
        setLoading(false);
        return;
      }

      const signInError = await signIn(cleanUsername, password);
      setLoading(false);

      if (signInError) {
        setError("Tu cuenta se creó, pero no pudimos iniciar sesión automáticamente. Probá ingresar de nuevo.");
        switchMode("login");
        return;
      }

      const redirectTo = searchParams.get("redirectTo") || "/predicciones";
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setLoading(false);
      setError("No pudimos crear tu cuenta. Probá de nuevo.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanUsername = normalizeUsername(username);

    if (mode === "login") {
      await handleLogin(cleanUsername);
    } else {
      await handleSignup(cleanUsername);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-pink/10 via-background to-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-pink/15 text-3xl">
            ⚽️🏆
          </div>
          <h1 className="font-display text-3xl font-bold text-pink-dark">
            Prode Mundial 2026
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Cargá tus predicciones del Mundial 2026 y competí con el grupo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-line bg-white p-6 shadow-[0_8px_30px_-12px_rgba(255,79,147,0.35)]"
        >
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-cream p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                mode === "login" ? "bg-white text-pink-dark shadow-sm" : "text-ink/50"
              }`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                mode === "signup" ? "bg-white text-pink-dark shadow-sm" : "text-ink/50"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-semibold text-ink">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: vale_campeona"
              className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-base text-ink outline-none transition-colors focus:border-pink focus:ring-2 focus:ring-pink/30"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="displayName" className="mb-1 block text-sm font-semibold text-ink">
                Nombre visible
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ej: Valen"
                className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-base text-ink outline-none transition-colors focus:border-pink focus:ring-2 focus:ring-pink/30"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-ink">
              Clave
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-base text-ink outline-none transition-colors focus:border-pink focus:ring-2 focus:ring-pink/30"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-semibold text-ink">
                Repetí la clave
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-base text-ink outline-none transition-colors focus:border-pink focus:ring-2 focus:ring-pink/30"
              />
            </div>
          )}

          {error && (
            <p className="rounded-2xl bg-pink/10 px-4 py-3 text-sm font-medium text-pink-dark" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pink px-4 py-3 text-base font-bold text-white shadow-lg shadow-pink/30 transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {loading
              ? mode === "login"
                ? "Ingresando…"
                : "Creando cuenta…"
              : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
          </button>

          <p className="text-center text-xs text-ink/50">
            {mode === "login" ? (
              <>
                ¿No tenés cuenta todavía?{" "}
                <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-pink-dark underline">
                  Creá la tuya
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{" "}
                <button type="button" onClick={() => switchMode("login")} className="font-semibold text-pink-dark underline">
                  Ingresá acá
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </main>
  );
}
