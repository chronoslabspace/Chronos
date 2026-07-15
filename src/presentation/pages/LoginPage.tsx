import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../infrastructure/auth/SupabaseAuthService";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await authService.signInWithMagicLink(email, window.location.origin + "/#/dashboard");
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Check your email for a login link!");
      }
    } catch (err) {
      setMessage("Failed to send login link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-bg-soft p-8">
        <h1 className="font-serif text-4xl text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-ink-dim">Access your Chronos workspace dashboard</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-line bg-bg px-4 py-2 text-ink placeholder-ink-faint focus:border-chronos focus:outline-none"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-ink px-4 py-2 font-medium text-bg transition hover:bg-chronos disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {message && (
          <div className={`mt-4 rounded-lg p-3 text-sm ${message.includes("Error") ? "bg-red-500/10 text-red-600" : "bg-chronos/10 text-chronos"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
