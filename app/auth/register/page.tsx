import Link from "next/link";

export default function Register() {
  return (
    <main className="container" style={{ padding: "50px 0", maxWidth: 560 }}>
      <div className="card" style={{ padding: 28 }}>
        <Link href="/" style={{ color: "#666" }}>← Back</Link>
        <h1>Create your ParkPing account</h1>
        <p style={{ color: "#666" }}>
          Sign up with email and password. No phone number or SMS OTP is required.
        </p>
        <form action="/dashboard" style={{ display: "grid", gap: 14 }}>
          <input name="name" required placeholder="Your name" style={field} />
          <input name="email" type="email" required placeholder="Email address" style={field} />
          <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" style={field} />
          <input name="confirmPassword" type="password" required minLength={8} placeholder="Confirm password" style={field} />
          <button className="btn btn-dark">Create Account →</button>
        </form>
        <p style={{ color: "#666", marginTop: 20 }}>
          Already have an account? <Link href="/auth/login"><u>Log in</u></Link>
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
