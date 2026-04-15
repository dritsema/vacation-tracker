import { useState } from "react";
import Modal from "./Modal";
import { CATEGORIES } from "../constants";

export default function ActivityModal({ form, setForm, onSave, onClose, title }) {
  const [highlightInput, setHighlightInput] = useState("");

  const addHighlight = (e) => {
    if (e.key === "Enter" && highlightInput.trim()) {
      e.preventDefault();
      setForm(f => ({ ...f, highlights: [...(f.highlights ?? []), highlightInput.trim()] }));
      setHighlightInput("");
    }
  };

  const removeHighlight = (i) => {
    setForm(f => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));
  };

  return (
    <Modal onClose={onClose} title={title}>
      <div className="modal-form">
        <input
          autoFocus
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Activity name"
        />
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input
          value={form.address ?? ""}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          placeholder="Address (optional)"
        />
        <div>
          <label className="priority-label">Highlights</label>
          <input
            value={highlightInput}
            onChange={e => setHighlightInput(e.target.value)}
            onKeyDown={addHighlight}
            placeholder="Type a highlight and press Enter"
          />
          {(form.highlights ?? []).length > 0 && (
            <div className="highlight-tags">
              {(form.highlights ?? []).map((h, i) => (
                <span key={i} className="highlight-tag">
                  {h}
                  <button onClick={() => removeHighlight(i)}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Notes (optional)"
          rows={3}
          style={{ resize: "vertical" }}
        />
        <div>
          <label className="priority-label">Priority</label>
          <div className="priority-btns">
            {[1, 2, 3].map(v => (
              <button
                key={v}
                className={form.priority === v ? "selected" : ""}
                onClick={() => setForm(f => ({ ...f, priority: v }))}
              >
                {"★".repeat(v)}{"☆".repeat(3 - v)}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={onSave}>Save</button>
        </div>
      </div>
    </Modal>
  );
}
