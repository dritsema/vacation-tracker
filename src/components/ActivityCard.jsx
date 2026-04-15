import { CAT } from "../constants";

export default function ActivityCard({ a, onEdit, onDelete }) {
  const cat = CAT[a.category];
  const stars = Array.from({ length: 3 }, (_, i) => i < a.priority ? "★" : "☆").join("");
  const mapsUrl = a.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`
    : null;

  return (
    <div className={`activity-card card-${a.category}`}>
      <div className="card-header">
        <span className="badge" style={{ background: cat.color, color: cat.text }}>{cat.label}</span>
        <span className="card-stars">{stars}</span>
      </div>

      <div className="card-name">{a.emoji ? `${a.emoji} ${a.name}` : a.name}</div>

      {a.address && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="card-address">
          {a.address}
        </a>
      )}

      {a.highlights?.length > 0 && (
        <div className="card-highlights">
          {a.highlights.map((h, i) => (
            <span key={i} className="card-highlight">{h}</span>
          ))}
        </div>
      )}

      {a.notes && (
        <div className="card-notes">💡 {a.notes}</div>
      )}

      <div className="card-actions">
        <button onClick={onEdit}>Edit</button>
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
