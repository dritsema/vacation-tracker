import { useState } from "react";
import Modal from "./Modal";
import { supabase } from "../supabase";
import { CATEGORIES, CAT } from "../constants";

export default function SuggestModal({ destinationName, existingNames, onSelect, onClose }) {
  const [context, setContext] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSuggestions = async () => {
    if (!context.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("suggest-activity", {
        body: { destinationName, context: context.trim(), existingNames },
      });
      if (fnError || data?.error) throw new Error(fnError?.message ?? data?.error);
      setSuggestions(data);
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title="✨ Suggest an activity">
      {!suggestions ? (
        <div className="modal-form">
          <textarea
            autoFocus
            value={context}
            onChange={e => setContext(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), getSuggestions())}
            placeholder={`What are you looking for? (e.g. "romantic dinner with views" or "kid-friendly breakfast")`}
            rows={3}
            style={{ resize: "none" }}
          />
          {error && <p className="gate-error">{error}</p>}
          <div className="modal-actions">
            <button onClick={onClose}>Cancel</button>
            <button className="primary" onClick={getSuggestions} disabled={loading || !context.trim()}>
              {loading ? "Thinking…" : "Get suggestions"}
            </button>
          </div>
        </div>
      ) : (
        <div className="suggest-results">
          {suggestions.map((s, i) => {
            const cat = CAT[s.category] ?? CAT["activity"];
            return (
              <div key={i} className="suggest-card">
                <div className="suggest-card-header">
                  <span className="badge" style={{ background: cat.color, color: cat.text }}>{cat.label}</span>
                  <button className="primary suggest-use-btn" onClick={() => onSelect(s)}>Use this</button>
                </div>
                <div className="suggest-card-name">{s.name}</div>
                {s.notes && <div className="suggest-card-notes">{s.notes}</div>}
              </div>
            );
          })}
          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button onClick={() => { setSuggestions(null); setContext(""); }}>Try again</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
