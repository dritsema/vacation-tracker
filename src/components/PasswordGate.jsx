import { useState } from "react";
import { supabase } from "../supabase";

export default function PasswordGate({ children }) {
  const [authed, setAuthed] = useState(
    sessionStorage.getItem("vt-auth-token") !== null
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const { data, error: fnError } = await supabase.functions.invoke("verify-password", {
      body: { password },
    });

    setLoading(false);

    if (fnError || !data?.token) {
      setError(true);
      setPassword("");
      return;
    }

    sessionStorage.setItem("vt-auth-token", data.token);
    setAuthed(true);
  };

  if (authed) return children;

  return (
    <div className="password-gate">
      <h1>Vacation Tracker</h1>
      <form onSubmit={handleSubmit}>
        <input
          autoFocus
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false); }}
          placeholder="Enter password"
          disabled={loading}
        />
        {error && <p className="gate-error">Incorrect password</p>}
        <button type="submit" className="primary" disabled={loading}>
          {loading ? "Verifying..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
