// ============================================================
// MyBirdFinder — Dashboard Page
// Today's summary, recent sightings, quick log button.
// ============================================================

import { useNavigate } from 'react-router-dom';
import { Sighting, User } from '../../types';
import { todaySightings, speciesFrequency, formatDateTime } from '../../utils/helpers';
import './Dashboard.css';

/** Returns time-appropriate greeting emoji and phrase */
function getGreeting(displayName: string): { headline: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { headline: `Good morning, ${displayName}!`, emoji: '🌅' };
  if (hour < 17) return { headline: `Good afternoon, ${displayName}!`, emoji: '☀️' };
  return { headline: `Good evening, ${displayName}!`, emoji: '🌙' };
}

interface DashboardProps {
  sightings: Sighting[];
  currentUser: User;
}

export default function Dashboard({ sightings, currentUser }: DashboardProps) {
  const navigate = useNavigate();
  const { headline, emoji } = getGreeting(currentUser.displayName);
  const today = todaySightings(sightings);
  const freq = speciesFrequency(sightings);
  const topBird = freq[0];

  // New species seen in the last 7 days
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const recentSpecies = new Set(
    sightings
      .filter(s => new Date(s.dateTime).getTime() > sevenDaysAgo)
      .map(s => s.commonName)
  );
  const allTimeBefore = new Set(
    sightings
      .filter(s => new Date(s.dateTime).getTime() <= sevenDaysAgo)
      .map(s => s.commonName)
  );
  const newThisWeek = [...recentSpecies].filter(n => !allTimeBefore.has(n));

  // Recent 5 sightings
  const recent = [...sightings]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{headline} {emoji}</h1>
          <p className="page-subtitle">Here's what's happening in your backyard.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/add')}>
          ➕ Log a Bird
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card stat-card--green">
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-value">{today.length}</div>
            <div className="stat-label">Sightings Today</div>
          </div>
        </div>

        <div className="stat-card stat-card--amber">
          <div className="stat-icon">⭐</div>
          <div>
            <div className="stat-value">{topBird?.name ?? '—'}</div>
            <div className="stat-label">Most Common Visitor</div>
            {topBird && <div className="stat-sub">{topBird.count} sightings</div>}
          </div>
        </div>

        <div className="stat-card stat-card--blue">
          <div className="stat-icon">🆕</div>
          <div>
            <div className="stat-value">{newThisWeek.length}</div>
            <div className="stat-label">New Species This Week</div>
            {newThisWeek.length > 0 && (
              <div className="stat-sub">{newThisWeek.slice(0, 2).join(', ')}</div>
            )}
          </div>
        </div>

        <div className="stat-card stat-card--rose">
          <div className="stat-icon">🐦</div>
          <div>
            <div className="stat-value">{freq.length}</div>
            <div className="stat-label">Total Species Logged</div>
          </div>
        </div>
      </div>

      {/* Recent sightings */}
      <div className="section-header">
        <h2 className="section-title">Recent Visitors</h2>
        <button className="btn btn-ghost" onClick={() => navigate('/log')}>
          View all →
        </button>
      </div>

      {recent.length === 0 ? (
        <EmptyState onAdd={() => navigate('/add')} />
      ) : (
        <div className="recent-list">
          {recent.map(s => (
            <RecentCard key={s.id} sighting={s} />
          ))}
        </div>
      )}

      {/* Activity summary */}
      {sightings.length > 0 && (
        <div className="activity-summary">
          <h2 className="section-title" style={{ marginBottom: 16 }}>Backyard Activity</h2>
          <div className="activity-grid">
            {freq.slice(0, 6).map(f => (
              <div key={f.name} className="activity-chip">
                <span className="activity-name">{f.name}</span>
                <span className="activity-count">{f.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecentCard({ sighting }: { sighting: Sighting }) {
  const confidenceColors: Record<string, string> = {
    certain: '#4caf50', 'pretty sure': '#8bc34a', maybe: '#ff9800', unknown: '#9e9e9e',
  };
  return (
    <div className="recent-card">
      <div className="recent-card-img">
        {sighting.image
          ? <img src={sighting.image} alt={sighting.commonName} />
          : <span>{sighting.isMystery ? '❓' : '🐦'}</span>
        }
      </div>
      <div className="recent-card-info">
        <div className="recent-card-name">
          {sighting.commonName}
          {sighting.isMystery && <span className="badge badge--mystery">Mystery</span>}
        </div>
        {sighting.scientificName && (
          <div className="recent-card-sci">{sighting.scientificName}</div>
        )}
        <div className="recent-card-meta">
          <span>📍 {sighting.location}</span>
          <span>🎭 {sighting.behavior}</span>
          <span>🔢 ×{sighting.count}</span>
        </div>
      </div>
      <div className="recent-card-right">
        <div className="recent-card-time">{formatDateTime(sighting.dateTime)}</div>
        <span
          className="confidence-dot"
          title={`Confidence: ${sighting.confidence}`}
          style={{ background: confidenceColors[sighting.confidence] }}
        />
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🌿</div>
      <h3>No birds logged yet.</h3>
      <p>Let's add your first backyard visitor!</p>
      <button className="btn btn-primary" onClick={onAdd}>
        ➕ Log Your First Bird
      </button>
    </div>
  );
}
