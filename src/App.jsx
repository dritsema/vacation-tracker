import { useState, useEffect } from "react";
import { CATEGORIES, CAT, STORAGE_KEY, emptyForm } from "./constants";
import ActivityCard from "./components/ActivityCard";
import ActivityModal from "./components/ActivityModal";
import Modal from "./components/Modal";

export default function App() {
  const [destinations, setDestinations] = useState([]);
  const [activeDest, setActiveDest] = useState(null);
  const [showAddDest, setShowAddDest] = useState(false);
  const [newDest, setNewDest] = useState("");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState("all");
  const [editActivity, setEditActivity] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const d = JSON.parse(stored);
        setDestinations(d);
        if (d.length) setActiveDest(d[0].id);
      }
    } catch {}
  }, []);

  const save = (d) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
  };

  const addDestination = () => {
    if (!newDest.trim()) return;
    const d = { id: Date.now(), name: newDest.trim(), activities: [] };
    const next = [...destinations, d];
    setDestinations(next);
    setActiveDest(d.id);
    setNewDest("");
    setShowAddDest(false);
    save(next);
  };

  const deleteDestination = (id) => {
    const next = destinations.filter(d => d.id !== id);
    setDestinations(next);
    if (activeDest === id) setActiveDest(next[0]?.id ?? null);
    save(next);
  };

  const addActivity = () => {
    if (!form.name.trim()) return;
    const next = destinations.map(d => {
      if (d.id !== activeDest) return d;
      return { ...d, activities: [...d.activities, { id: Date.now(), ...form, name: form.name.trim() }] };
    });
    setDestinations(next);
    setShowAddActivity(false);
    setForm(emptyForm);
    save(next);
  };

  const saveEdit = () => {
    if (!editActivity.name.trim()) return;
    const next = destinations.map(d => {
      if (d.id !== activeDest) return d;
      return { ...d, activities: d.activities.map(a => a.id === editActivity.id ? editActivity : a) };
    });
    setDestinations(next);
    setEditActivity(null);
    save(next);
  };

  const deleteActivity = (actId) => {
    const next = destinations.map(d => {
      if (d.id !== activeDest) return d;
      return { ...d, activities: d.activities.filter(a => a.id !== actId) };
    });
    setDestinations(next);
    save(next);
  };

  const dest = destinations.find(d => d.id === activeDest);
  const filtered = dest
    ? (filterCat === "all" ? dest.activities : dest.activities.filter(a => a.category === filterCat))
    : [];
  const grouped = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = filtered.filter(a => a.category === c.id);
    return acc;
  }, {});

  return (
    <>
      <h1 style={{ marginBottom: "1.25rem" }}>Vacation Tracker</h1>
      <div className="app">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <span>Destinations</span>
            <button onClick={() => setShowAddDest(true)} title="Add destination">+</button>
          </div>
          {destinations.length === 0 && (
            <p style={{ padding: "0 1rem", fontSize: 13, color: "#aaa" }}>No destinations yet</p>
          )}
          {destinations.map(d => (
            <div key={d.id} className={`dest-item${activeDest === d.id ? " active" : ""}`}
              onClick={() => { setActiveDest(d.id); setFilterCat("all"); }}>
              <span>{d.name}</span>
              <button onClick={e => { e.stopPropagation(); deleteDestination(d.id); }} title="Remove">✕</button>
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="main">
          {!dest ? (
            <div className="empty">
              <p>Add a destination to get started</p>
              <button onClick={() => setShowAddDest(true)}>Add destination</button>
            </div>
          ) : (
            <>
              <div className="main-header">
                <h2>{dest.name}</h2>
                <button className="primary" onClick={() => { setShowAddActivity(true); setForm(emptyForm); }}>
                  + Add activity
                </button>
              </div>

              <div className="filters">
                {["all", ...CATEGORIES.map(c => c.id)].map(cat => {
                  const active = filterCat === cat;
                  const catObj = CAT[cat];
                  return (
                    <button key={cat} className="filter-btn" onClick={() => setFilterCat(cat)}
                      style={{
                        background: active ? (catObj ? catObj.color : "#f5f5f3") : "transparent",
                        color: active ? (catObj ? catObj.text : "#1a1a1a") : "#888",
                        borderColor: active ? "transparent" : "#e0e0dc",
                      }}>
                      {cat === "all" ? "All" : catObj.label}
                    </button>
                  );
                })}
              </div>

              {filterCat === "all" ? (
                CATEGORIES.map(cat => grouped[cat.id].length > 0 && (
                  <div key={cat.id}>
                    <div className="section-label">
                      <span className="badge" style={{ background: cat.color, color: cat.text }}>{cat.label}</span>
                      <span className="count">{grouped[cat.id].length}</span>
                    </div>
                    <div className="activity-list">
                      {grouped[cat.id].map(a => (
                        <ActivityCard key={a.id} a={a} cat={cat}
                          onEdit={() => setEditActivity({ ...a })}
                          onDelete={() => deleteActivity(a.id)} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-list">
                  {filtered.length === 0 && <p style={{ color: "#aaa", fontSize: 14 }}>No activities in this category yet.</p>}
                  {filtered.map(a => (
                    <ActivityCard key={a.id} a={a} cat={CAT[a.category]}
                      onEdit={() => setEditActivity({ ...a })}
                      onDelete={() => deleteActivity(a.id)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAddDest && (
        <Modal onClose={() => setShowAddDest(false)} title="Add destination">
          <div className="modal-form">
            <input autoFocus value={newDest} onChange={e => setNewDest(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addDestination()}
              placeholder="e.g. Kyoto, Japan" />
            <div className="modal-actions">
              <button onClick={() => setShowAddDest(false)}>Cancel</button>
              <button className="primary" onClick={addDestination}>Add</button>
            </div>
          </div>
        </Modal>
      )}

      {showAddActivity && (
        <ActivityModal form={form} setForm={setForm} onSave={addActivity}
          onClose={() => setShowAddActivity(false)} title="Add activity" />
      )}

      {editActivity && (
        <ActivityModal form={editActivity} setForm={setEditActivity} onSave={saveEdit}
          onClose={() => setEditActivity(null)} title="Edit activity" />
      )}
    </>
  );
}
