import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("token", data.token);

      alert("Uspješno ste prijavljeni");
      navigate("/admin");
    } catch (err) {
      setError("Greška pri povezivanju sa serverom");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#181818] px-4 py-8 sm:px-6">
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-[#ffaf01]/15 blur-[120px]" />
      <div className="absolute -right-40 -bottom-40 h-[450px] w-[450px] rounded-full bg-[#ffaf01]/10 blur-[120px]" />

      {/* Login */}
      <div className="relative z-10 w-full max-w-[430px]">
        {/* Title */}
        <div className="mb-7 text-center sm:mb-9">
          <p className="mb-1 font-caveat text-3xl text-[#ffaf01] sm:text-4xl">
            Burger Pub
          </p>

          <h1 className="font-anton text-4xl tracking-wide text-white sm:text-5xl">
            ADMIN
          </h1>

          <div className="mx-auto mt-3 h-[4px] w-14 bg-[#ffaf01]" />

          <p className="mt-5 px-2 font-montserrat text-xs text-neutral-400 sm:text-sm">
            Prijavite se za upravljanje sadržajem
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="border border-white/10 bg-[#222222] p-5 shadow-2xl sm:p-9"
        >
          {/* Username */}
          <div className="mb-9">
            <label className="mb-3 block font-oswald text-xs tracking-[0.18em] text-neutral-300 uppercase">
              Korisničko ime
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Unesite korisničko ime"
              className="h-[58px] w-full border border-white/15 bg-[#181818] px-5 font-montserrat text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-[#ffaf01]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-3 block font-oswald text-xs tracking-[0.18em] text-neutral-300 uppercase">
              Lozinka
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Unesite lozinku"
              className="h-[58px] w-full border border-white/15 bg-[#181818] px-5 font-montserrat text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-[#ffaf01]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="font-montserrat text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            className="mt-8 h-[58px] w-full bg-[#ffaf01] font-oswald text-sm font-semibold tracking-[0.15em] text-black uppercase transition duration-200 hover:bg-white"
          >
            Prijavi se
          </button>
        </form>

        <p className="mt-5 text-center font-montserrat text-[10px] tracking-wider text-neutral-500 uppercase sm:text-[11px]">
          Burger Pub München · Administration
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
