import Link from "next/link";

export default function Login() {
  return (
    <main className="container" style={{ padding: "70px 0", maxWidth: 520 }}>
      <div className="card" style={{ padding: 28 }}>
        <Link href="/" style={{ color: "#666" }}>← Back</Link>
        <h1>Owner login</h1>
        <p style={{ color: "#666" }}>
          Log in securely with your email and password.
        </p>
        <form action="/dashboard" style={{ display: "grid", gap: 14 }}>
          <input name="email" type="email" required placeholder="Email address" style={field} />
          <input name="password" type="password" required placeholder="Password" style={field} />
          <button className="btn btn-dark">Log In →</button>
        </form>
        <p style={{ color: "#666", marginTop: 18 }}>
          <a href="#"><u>Forgot password?</u></a>
        </p>
        <p style={{ color: "#666", marginTop: 12 }}>
          New here? <Link href="/auth/register"><u>Create account</u></Link>
        </p>
      </div>
    </main>
  );
}

const field = {
  padding: "15px 16px",
  border: "1px solid #ddd",
  borderRadius: 14,
  width: "100%"
};
