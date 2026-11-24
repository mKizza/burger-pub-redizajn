import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { FieldLabel, TextField } from "../../components/ui/Field";
import { controlClass } from "../../components/ui/fieldStyles";
import Icon from "../../components/ui/Icon";
import { useToast } from "../../components/ui/toastContext";
import { apiFetch } from "../../lib/api";
import { getToken, isTokenUsable, setToken } from "../../lib/auth";

function AdminLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const expired = location.state?.reason === "expired";

  if (isTokenUsable(getToken())) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Unesite korisničko ime i lozinku");
      return;
    }

    setSending(true);

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { username: username.trim(), password },
      });

      setToken(data.token);
      toast.success("Uspješno ste prijavljeni");
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.status === 0
          ? "Greška pri povezivanju sa serverom"
          : err.serverMessage || "Prijava nije uspjela",
      );
      setSending(false);
    }
  }

  return (
    <main className="grain relative flex min-h-dvh items-center justify-center overflow-hidden bg-char px-4 py-10">
      <title>Prijava | Burger Pub Admin</title>
      <div className="pointer-events-none absolute -top-40 -left-40 size-[450px] rounded-full bg-brand/15 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 size-[450px] rounded-full bg-brand/10 blur-[120px]" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-[430px] flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/Logo/burger-pub-logo.webp" alt="" className="w-20" />
          <p className="font-caveat text-3xl text-brand sm:text-4xl">Burger Pub</p>
          <h1 className="font-anton text-4xl tracking-wide text-white sm:text-5xl">ADMIN</h1>
          <span className="h-1 w-14 bg-brand" aria-hidden="true" />
          <p className="font-montserrat text-sm text-neutral-400">
            Prijavite se za upravljanje sadržajem
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 border border-white/10 bg-smoke p-6 shadow-2xl sm:p-9"
        >
          {expired && !error && (
            <p role="status" className="flex items-start gap-3 border border-brand/40 bg-brand/10 p-3 font-montserrat text-sm text-white">
              <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-brand" />
              Sesija je istekla. Prijavite se ponovno.
            </p>
          )}

          <TextField
            id="admin-username"
            label="Korisničko ime"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Unesite korisničko ime"
          />

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="admin-password">Lozinka</FieldLabel>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Unesite lozinku"
                className={controlClass(false, "h-12 pr-12 pl-4")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-pressed={showPassword}
                className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center text-white/50 transition hover:text-brand"
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} />
                <span className="sr-only">{showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}</span>
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-3 border border-red-500/30 bg-red-500/10 p-3 font-montserrat text-sm text-red-200">
              <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={sending} className="w-full">
            {sending && <Icon name="spinner" className="size-5" />}
            {sending ? "Prijava …" : "Prijavi se"}
          </Button>
        </form>

        <p className="text-center font-montserrat text-[11px] uppercase tracking-wider text-neutral-500">
          Burger Pub München · Administration
        </p>
      </div>
    </main>
  );
}

export default AdminLogin;
