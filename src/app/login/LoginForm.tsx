"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarPreview = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : null), [avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
  }

  async function signIn(cleanEmail: string, rawPassword: string) {
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: rawPassword,
    });
    return signInError;
  }

  async function handleLogin(cleanEmail: string) {
    if (!cleanEmail || !password) {
      setError("Completá tu email y tu clave para ingresar.");
      return;
    }

    setLoading(true);
    const signInError = await signIn(cleanEmail, password);
    setLoading(false);

    if (signInError) {
      setError("Email o clave incorrecta. Revisá los datos y probá de nuevo.");
      return;
    }

    const redirectTo = searchParams.get("redirectTo") || "/predicciones";
    router.replace(redirectTo);
    router.refresh();
  }

  async function handleSignup(cleanEmail: string) {
    const cleanDisplayName = displayName.trim();

    if (!cleanEmail || !cleanDisplayName || !password) {
      setError("Completá tu email, tu nombre visible y tu clave.");
      return;
    }
    if (!avatarFile) {
      setError("Subí una foto de perfil para crear tu cuenta.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las claves no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("email", cleanEmail);
      formData.set("display_name", cleanDisplayName);
      formData.set("password", password);
      formData.set("avatar", avatarFile);

      const response = await fetch("/api/auth/signup", { method: "POST", body: formData });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error || "No pudimos crear tu cuenta. Probá de nuevo.");
        setLoading(false);
        return;
      }

      const signInError = await signIn(cleanEmail, password);
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

    const cleanEmail = email.trim().toLowerCase();

    if (mode === "login") {
      await handleLogin(cleanEmail);
    } else {
      await handleSignup(cleanEmail);
    }
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-pink px-4 py-10">
      <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-purple/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-7">
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-purple text-lg">
            🏆
          </div>
          <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-purple">
            Predecí el
            <br />
            Mundial
            <br />
            sin esfuerzo
          </h1>
          <p className="mt-3 max-w-[280px] text-[13px] font-medium leading-relaxed text-purple/80">
            Cargá tus predicciones del Mundial 2026, competí con tus amigas y seguí el
            ranking en una app pensada para el grupo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-white/40 p-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`rounded-full px-3 py-2 text-sm font-bold transition-colors ${
                mode === "login" ? "bg-purple text-pink shadow-sm" : "text-purple/60"
              }`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`rounded-full px-3 py-2 text-sm font-bold transition-colors ${
                mode === "signup" ? "bg-purple text-pink shadow-sm" : "text-purple/60"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {mode === "signup" && (
            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-purple/30 bg-white/60 text-2xl text-purple/40 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-colors hover:border-purple"
                aria-label="Subir foto de perfil"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span aria-hidden>📷</span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs font-semibold text-purple/70">
                {avatarFile ? "Foto lista. Tocá para cambiarla." : "Subí tu foto de perfil (obligatoria)"}
              </p>
            </div>
          )}

          <Field label="Email">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ej: vale@gmail.com"
              className="loginInput"
            />
          </Field>

          {mode === "signup" && (
            <Field label="Nombre visible">
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ej: Valen"
                className="loginInput"
              />
            </Field>
          )}

          <Field label="Clave">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "login" ? "Ingresá tu clave" : "Elegí una clave (mín. 6 caracteres)"}
              className="loginInput"
            />
          </Field>

          {mode === "signup" && (
            <Field label="Repetí la clave">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Volvé a escribirla"
                className="loginInput"
              />
            </Field>
          )}

          {error && (
            <p
              className="rounded-2xl border border-white/50 bg-white/40 px-4 py-2.5 text-center text-xs font-bold text-purple backdrop-blur-sm"
              role="alert"
            >
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-purple px-4 py-3.5 text-sm font-black text-pink shadow-[0_10px_25px_rgba(18,51,25,0.25)] transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
          >
            {loading
              ? mode === "login"
                ? "Ingresando…"
                : "Creando cuenta…"
              : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
          </button>

          <p className="text-center text-xs font-semibold text-purple/70">
            {mode === "login" ? (
              <>
                ¿No tenés cuenta todavía?{" "}
                <button type="button" onClick={() => switchMode("signup")} className="font-black text-purple underline">
                  Creá la tuya
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{" "}
                <button type="button" onClick={() => switchMode("login")} className="font-black text-purple underline">
                  Ingresá acá
                </button>
              </>
            )}
          </p>
        </form>
      </div>

      <style jsx global>{`
        .loginInput {
          width: 100%;
          height: 2.75rem;
          border-radius: 9999px;
          border: none;
          background-color: rgba(255, 255, 255, 0.55);
          padding: 0 1.15rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-prode-purple);
          outline: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: all 0.15s ease;
        }
        .loginInput::placeholder {
          color: color-mix(in srgb, var(--color-prode-purple) 38%, transparent);
        }
        .loginInput:focus {
          background-color: #fff;
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-prode-purple) 25%, transparent);
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block pl-1 text-[10px] font-black uppercase tracking-wider text-purple/70">{label}</span>
      {children}
    </label>
  );
}
