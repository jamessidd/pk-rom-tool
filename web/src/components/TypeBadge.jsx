import { TYPE_COLORS } from '../utils/types';

export default function TypeBadge({ type }) {
  const bg = TYPE_COLORS[type] || '#666';
  return <span className="type-badge" style={{ background: bg }}>{type}</span>;
}
