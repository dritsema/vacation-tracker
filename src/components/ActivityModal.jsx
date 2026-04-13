import Modal from "./Modal";
import { CATEGORIES } from "../constants";

export default function ActivityModal({ form, setForm, onSave, onClose, title }) {
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
