import { useState } from "react";
import Modal from "./Modal";
import { supabase } from "../supabase";
import { CATEGORIES, CAT } from "../constants";

export default function SuggestModal({ destinationName, existingNames, onSelect, onClose }) {
  const [context, setContext] = useState("");
  const [category, setCategory] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSuggestions = async () => {
    if (!context.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("suggest-activity", {
        body: { destinationName, context: context.trim(), existingNames, category: category || null },
      });
      if (fnError) {
        let body;
        try { body = await fnError.context?.json(); } catch {}
        if (body?.detail?.code === 429) throw new Error("rate_limit");
        throw new Error(body?.error ?? fnError.message);
      }
      if (data?.error) throw new Error(data.error === "No results found. Try different search terms." ? "no_results" : data.error);
      setSuggestions(data);
    } catch (err) {
      const msg = err.message === "rate_limit"
        ? "Too many requests — wait a moment and try again."
        : err.message === "no_results"
        ? "No matching venues found. Try broadening your search."
        : "Something went wrong. Try again.";
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title="✨ Suggest an activity">
      {!suggestions ? (
        <div className="modal-form">
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Any category</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <textarea
            autoFocus
            value={context}
            onChange={e => setContext(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), getSuggestions())}
            placeholder="What are you looking for? Be specific — mention views, landmarks, vibe, dietary needs, etc."
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
            <button onClick={() => { setSuggestions(null); setContext(""); setCategory(""); }}>Try again</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
