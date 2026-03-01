import { useMemo, useState } from "react";
import "./App.css";

type ResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: unknown }
  | { status: "error"; message: string };

function buildValidationUrl(apiUrl: string, email: string) {
  const base =
    "https://yhxzjyykdsfkdrmdxgho.supabase.co/functions/v1/application-task";
  const u = new URL(base);
  u.searchParams.set("url", apiUrl);
  u.searchParams.set("email", email);
  return u.toString();
}

export default function App() {
  const [email, setEmail] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [result, setResult] = useState<ResultState>({ status: "idle" });

  const validationUrl = useMemo(() => {
    if (!email.trim() || !apiUrl.trim()) return "";
    try {
      return buildValidationUrl(apiUrl.trim(), email.trim());
    } catch {
      return "";
    }
  }, [apiUrl, email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const e1 = email.trim();
    const u1 = apiUrl.trim();

    if (!e1) return setResult({ status: "error", message: "Email is required." });
    if (!u1) return setResult({ status: "error", message: "API URL is required." });

    let urlToFetch = "";
    try {
      urlToFetch = buildValidationUrl(u1, e1);
    } catch {
      return setResult({ status: "error", message: "API URL looks invalid." });
    }

    setResult({ status: "loading" });

    try {
      const res = await fetch(urlToFetch, { method: "GET" });
      const contentType = res.headers.get("content-type") || "";

      const data = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        setResult({
          status: "error",
          message: `Validator returned ${res.status}. Response: ${
            typeof data === "string" ? data : JSON.stringify(data)
          }`,
        });
        return;
      }

      setResult({ status: "success", data });
    } catch (err) {
      setResult({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>One Eleven – API Validation Tester</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            inputMode="email"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          API Endpoint URL (POST /webhook)
          <input
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://your-domain.com/webhook"
          />
        </label>

        <button type="submit" disabled={result.status === "loading"}>
          {result.status === "loading" ? "Testing..." : "Test Endpoint"}
        </button>
      </form>

      {validationUrl && (
        <p style={{ marginTop: 14, fontSize: 14 }}>
          Validator URL preview:{" "}
          <a href={validationUrl} target="_blank" rel="noreferrer">
            open
          </a>
        </p>
      )}

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Result</h3>

        {result.status === "idle" && <p>No result yet.</p>}
        {result.status === "loading" && <p>Running validation…</p>}
        {result.status === "error" && (
          <p style={{ whiteSpace: "pre-wrap" }}>❌ {result.message}</p>
        )}
        {result.status === "success" && (
          <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
