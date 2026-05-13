// ============================================================
// FeatherLog — Bird Log Page
// Full sightings list with search, filter, sort, edit, delete.
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sighting, Behavior, Location, FoodType, Confidence } from '../../types';
import { formatDateTime, CONFIDENCE_COLORS, COLOR_MAP } from '../../utils/helpers';
import AddSighting from '../AddSighting/AddSighting';
import './BirdLog.css';

interface BirdLogProps {
  sightings: Sighting[];
  onUpdate: (s: Sighting) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'newest' | 'oldest' | 'most frequent';

export default function BirdLog({ sightings, onUpdate, onDelete }: BirdLogProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterBehavior, setFilterBehavior] = useState<Behavior | ''>('');
  const [filterLocation, setFilterLocation] = useState<Location | ''>('');
  const [filterFood, setFilterFood] = useState<FoodType | ''>('');
  const [filterConfidence, setFilterConfidence] = useState<Confidence | ''>('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [editingSighting, setEditingSighting] = useState<Sighting | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter + search
  let filtered = sightings.filter(s => {
    if (search && !s.commonName.toLowerCase().includes(search.toLowerCase()) &&
        !(s.scientificName ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterBehavior && s.behavior !== filterBehavior) return false;
    if (filterLocation && s.location !== filterLocation) return false;
    if (filterFood && s.foodType !== filterFood) return false;
    if (filterConfidence && s.confidence !== filterConfidence) return false;
    return true;
  });

  // Sort
  if (sortKey === 'newest') {
    filtered = [...filtered].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  } else if (sortKey === 'oldest') {
    filtered = [...filtered].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  } else {
    // Most frequent — sort by species count
    const counts: Record<string, number> = {};
    for (const s of sightings) counts[s.commonName] = (counts[s.commonName] || 0) + 1;
    filtered = [...filtered].sort((a, b) => (counts[b.commonName] || 0) - (counts[a.commonName] || 0));
  }

  function clearFilters() {
    setSearch('');
    setFilterBehavior('');
    setFilterLocation('');
    setFilterFood('');
    setFilterConfidence('');
  }

  const activeFilters = [filterBehavior, filterLocation, filterFood, filterConfidence].filter(Boolean).length;

  if (editingSighting) {
    return (
      <AddSighting
        sightings={sightings}
        onSave={onUpdate}
        editingSighting={editingSighting}
        onDone={() => setEditingSighting(null)}
      />
    );
  }

  return (
    <div className="bird-log">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Bird Log</h1>
          <p className="page-subtitle">{sightings.length} sightings recorded</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add')}>
          ➕ Log a Bird
        </button>
      </div>

      {/* Search bar + sort */}
      <div className="log-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by bird name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="log-controls-right">
          <button
            className={`btn btn-ghost ${showFilters ? 'btn-active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            🎛️ Filters {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
          </button>
          <select
            className="sort-select"
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most frequent">Most frequent</option>
          </select>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <FilterSelect
              label="Behavior"
              value={filterBehavior}
              onChange={v => setFilterBehavior(v as Behavior | '')}
              options={['feeding','bathing','nesting','singing','fighting','flying by','perching','unknown']}
            />
            <FilterSelect
              label="Location"
              value={filterLocation}
              onChange={v => setFilterLocation(v as Location | '')}
              options={['feeder','bird bath','tree','fence','ground','garden','other']}
            />
            <FilterSelect
              label="Food Type"
              value={filterFood}
              onChange={v => setFilterFood(v as FoodType | '')}
              options={['seed','suet','nectar','fruit','insects','unknown']}
            />
            <FilterSelect
              label="Confidence"
              value={filterConfidence}
              onChange={v => setFilterConfidence(v as Confidence | '')}
              options={['certain','pretty sure','maybe','unknown']}
            />
          </div>
          {activeFilters > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{sightings.length === 0 ? '🌿' : '🔍'}</div>
          <h3>
            {sightings.length === 0
              ? 'No birds logged yet.'
              : 'No sightings match your search.'}
          </h3>
          <p>
            {sightings.length === 0
              ? "Let's add your first backyard visitor!"
              : 'Try adjusting your search or filters.'}
          </p>
          {sightings.length === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              ➕ Log Your First Bird
            </button>
          )}
          {sightings.length > 0 && (
            <button className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      ) : (
        <div className="sighting-list">
          {filtered.map(s => (
            <SightingCard
              key={s.id}
              sighting={s}
              onEdit={() => setEditingSighting(s)}
              onDelete={() => setDeleteConfirm(s.id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3>Delete this sighting?</h3>
            <p>This can't be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sighting Card ─────────────────────────────────────────────

function SightingCard({
  sighting: s,
  onEdit,
  onDelete,
}: {
  sighting: Sighting;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sighting-card">
      <div className="sighting-card-header" onClick={() => setExpanded(!expanded)}>
        {/* Image / placeholder */}
        <div className="sighting-thumb">
          {s.image
            ? <img src={s.image} alt={s.commonName} />
            : <span>{s.isMystery ? '❓' : '🐦'}</span>
          }
        </div>

        {/* Core info */}
        <div className="sighting-core">
          <div className="sighting-name-row">
            <span className="sighting-name">{s.commonName}</span>
            {s.isMystery && <span className="badge badge--mystery">Mystery</span>}
            <span
              className="badge"
              style={{ background: CONFIDENCE_COLORS[s.confidence] + '22', color: CONFIDENCE_COLORS[s.confidence] }}
            >
              {s.confidence}
            </span>
          </div>
          {s.scientificName && <div className="sighting-sci">{s.scientificName}</div>}
          <div className="sighting-meta">
            <span>📍 {s.location}</span>
            <span>🎭 {s.behavior}</span>
            <span>🍽️ {s.foodType}</span>
            <span>🔢 ×{s.count}</span>
          </div>
        </div>

        {/* Right side */}
        <div className="sighting-card-right">
          <div className="sighting-date">{formatDateTime(s.dateTime)}</div>
          {s.colors.length > 0 && (
            <div className="color-dots">
              {s.colors.map(c => (
                <span
                  key={c}
                  className="color-dot"
                  title={c}
                  style={{
                    background: COLOR_MAP[c] ?? '#ccc',
                    border: c === 'white' ? '1px solid #ccc' : 'none',
                  }}
                />
              ))}
            </div>
          )}
          <span className="expand-arrow">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="sighting-details">
          <div className="detail-grid">
            <DetailItem label="Weather" value={s.weather} />
            <DetailItem label="Food" value={s.foodType} />
            <DetailItem label="Count" value={`${s.count} bird${s.count !== 1 ? 's' : ''}`} />
            <DetailItem label="Confidence" value={s.confidence} />
          </div>
          {s.notes && (
            <div className="detail-notes">
              <strong>Notes:</strong> {s.notes}
            </div>
          )}
          {s.idNotes && (
            <div className="detail-notes detail-notes--id">
              <strong>🔍 ID Clues:</strong> {s.idNotes}
            </div>
          )}
          <div className="sighting-actions">
            <button className="btn btn-ghost btn-sm" onClick={onEdit}>✏️ Edit</button>
            <button className="btn btn-danger btn-sm" onClick={onDelete}>🗑️ Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="filter-field">
      <label className="filter-label">{label}</label>
      <select className="form-input" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map(o => (
          <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}
