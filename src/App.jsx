import { useState, useEffect } from "react";
import { CATEGORIES, CAT, emptyForm } from "./constants";
import { supabase } from "./supabase";
import { getDestinationEmoji } from "./destinationEmoji";
import ActivityCard from "./components/ActivityCard";
import ActivityModal from "./components/ActivityModal";
import SuggestModal from "./components/SuggestModal";
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
  const [showSuggest, setShowSuggest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: dests }, { data: acts }] = await Promise.all([
        supabase.from("destinations").select("*").is("deleted_at", null).order("id"),
        supabase.from("activities").select("*").is("deleted_at", null).order("id"),
      ]);
      const combined = (dests ?? []).map(d => ({
        ...d,
        activities: (acts ?? []).filter(a => a.destination_id === d.id),
      }));
      setDestinations(combined);
      if (combined.length) setActiveDest(combined[0].id);
      setLoading(false);
    }
    load();
  }, []);

  const addDestination = async () => {
    if (!newDest.trim()) return;
    const id = Date.now();
    await supabase.from("destinations").insert({ id, name: newDest.trim() });
    const d = { id, name: newDest.trim(), activities: [] };
    const next = [...destinations, d];
    setDestinations(next);
    setActiveDest(d.id);
    setNewDest("");
    setShowAddDest(false);
  };

  const deleteDestination = async (id) => {
    const deletedAt = new Date().toISOString();
    await Promise.all([
      supabase.from("destinations").update({ deleted_at: deletedAt }).eq("id", id),
      supabase.from("activities").update({ deleted_at: deletedAt }).eq("destination_id", id),
    ]);
    const next = destinations.filter(d => d.id !== id);
    setDestinations(next);
    if (activeDest === id) setActiveDest(next[0]?.id ?? null);
  };

  const enrichActivity = async (activityId, activityName, category, destinationName) => {
    try {
      const { data } = await supabase.functions.invoke("enrich-activity", {
        body: { activityName, category, destinationName },
      });
      if (!data) return;
      const { emoji, highlights, maps_query } = data;
      const address = maps_query ?? null;
      await supabase.from("activities").update({
        emoji: emoji ?? null,
        highlights: highlights?.length ? highlights : null,
        address,
      }).eq("id", activityId);
      setDestinations(prev => prev.map(d => ({
        ...d,
        activities: d.activities.map(a => a.id !== activityId ? a : {
          ...a,
          emoji: emoji ?? a.emoji,
          highlights: highlights?.length ? highlights : a.highlights,
          address,
        }),
      })));
    } catch {
      // enrichment is best-effort; silently ignore errors
    }
  };

  const addActivity = async () => {
    if (!form.name.trim()) return;
    const id = Date.now();
    await supabase.from("activities").insert({
      id,
      destination_id: activeDest,
      name: form.name.trim(),
      category: form.category,
      notes: form.notes,
      priority: form.priority,
      address: form.address || null,
      highlights: form.highlights?.length ? form.highlights : null,
    });
    const next = destinations.map(d => {
      if (d.id !== activeDest) return d;
      return { ...d, activities: [...d.activities, { id, ...form, name: form.name.trim() }] };
    });
    setDestinations(next);
    setShowAddActivity(false);
    setForm(emptyForm);
    enrichActivity(id, form.name.trim(), form.category, dest?.name ?? "");
  };

  const saveEdit = async () => {
    if (!editActivity.name.trim()) return;
    await supabase.from("activities").update({
      name: editActivity.name.trim(),
      category: editActivity.category,
      notes: editActivity.notes,
      priority: editActivity.priority,
      address: editActivity.address || null,
      highlights: editActivity.highlights?.length ? editActivity.highlights : null,
    }).eq("id", editActivity.id);
    const next = destinations.map(d => {
      if (d.id !== activeDest) return d;
      return { ...d, activities: d.activities.map(a => a.id === editActivity.id ? editActivity : a) };
    });
    setDestinations(next);
    setEditActivity(null);
    enrichActivity(editActivity.id, editActivity.name.trim(), editActivity.category, dest?.name ?? "");
  };

  const deleteActivity = async (actId) => {
    await supabase.from("activities").update({ deleted_at: new Date().toISOString() }).eq("id", actId);
    const next = destinations.map(d => {
      if (d.id !== activeDest) return d;
      return { ...d, activities: d.activities.filter(a => a.id !== actId) };
    });
    setDestinations(next);
  };

  const dest = destinations.find(d => d.id === activeDest);
  const filtered = dest
    ? (filterCat === "all" ? dest.activities : dest.activities.filter(a => a.category === filterCat))
    : [];
  const grouped = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = filtered.filter(a => a.category === c.id);
    return acc;
  }, {});

  if (loading) {
    return <p style={{ padding: "2rem", color: "#aaa" }}>Loading...</p>;
  }

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
          <div className="dest-list">
            {destinations.length === 0 && (
              <p style={{ fontSize: 13, color: "#aaa" }}>No destinations yet</p>
            )}
            {destinations.map(d => (
              <div key={d.id} className={`dest-item${activeDest === d.id ? " active" : ""}`}
                onClick={() => { setActiveDest(d.id); setFilterCat("all"); }}>
                <span>{d.name} {getDestinationEmoji(d.name)}</span>
                <button onClick={e => { e.stopPropagation(); deleteDestination(d.id); }} title="Remove">✕</button>
              </div>
            ))}
          </div>
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
                <h2>{dest.name} {getDestinationEmoji(dest.name)}</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="suggest" onClick={() => setShowSuggest(true)}>✨ Suggest</button>
                  <button className="primary" onClick={() => { setShowAddActivity(true); setForm(emptyForm); }}>
                    + Add activity
                  </button>
                </div>
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
                        <ActivityCard key={a.id} a={a}
                          onEdit={() => setEditActivity({ ...a, highlights: a.highlights ?? [] })}
                          onDelete={() => deleteActivity(a.id)} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-list">
                  {filtered.length === 0 && <p style={{ color: "#aaa", fontSize: 14 }}>No activities in this category yet.</p>}
                  {filtered.map(a => (
                    <ActivityCard key={a.id} a={a}
                      onEdit={() => setEditActivity({ ...a, highlights: a.highlights ?? [] })}
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

      {showSuggest && (
        <SuggestModal
          destinationName={dest?.name ?? ""}
          existingNames={(dest?.activities ?? []).map(a => a.name)}
          onSelect={s => {
            setShowSuggest(false);
            setForm({ ...emptyForm, name: s.name, category: s.category, notes: s.notes ?? "" });
            setShowAddActivity(true);
          }}
          onClose={() => setShowSuggest(false)}
        />
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
