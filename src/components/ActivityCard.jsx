export default function ActivityCard({ a, cat, onEdit, onDelete }) {
  const stars = Array.from({ length: 3 }, (_, i) => i < a.priority ? "★" : "☆").join("");
  return (
    <div className="activity-card">
      <div className="info">
        <div className="name">
          <span>{a.name}</span>
          <span className="badge" style={{ background: cat.color, color: cat.text }}>{cat.label}</span>
        </div>
        {a.notes && <p className="notes">{a.notes}</p>}
        <div className="stars">{stars}</div>
      </div>
      <div className="actions">
        <button onClick={onEdit}>Edit</button>
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
