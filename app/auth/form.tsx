"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setBusy(true);

    try {
      if (mode === "register") {
        if (!name.trim()) {
          setError("Please enter your name.");
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (!data.session) {
          setSuccess(
            "Account created. Please check your email if email confirmation is enabled."
          );
          return;
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 460,
        margin: "60px auto",
        padding: 20,
      }}
    >
      <div className="card" style={{ padding: 28 }}>
        <h1 style={{ marginBottom: 8 }}>
          {mode === "register"
            ? "Create your ParkPing account"
            : "Welcome back"}
        </h1>

        <p className="muted" style={{ marginBottom: 24 }}>
          {mode === "register"
            ? "Register your vehicle and create your QR code."
            : "Sign in to manage your vehicles and messages."}
        </p>

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              borderRadius: 8,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              borderRadius: 8,
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            {success}
          </div>
        )}

        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gap: 14,
          }}
        >
          {mode === "register" && (
            <input
              className="field"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            className="field"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <input
            className="field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={
              mode === "register"
                ? "new-password"
                : "current-password"
            }
          />

          <button
            className="btn btn-dark"
            type="submit"
            disabled={busy}
          >
            {busy
              ? "Please wait…"
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p className="muted">
            {mode === "register"
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(
                  mode === "register" ? "login" : "register"
                );
                setError("");
                setSuccess("");
              }}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {mode === "register" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}