// ============================================================
// FeatherLog — Bird Profiles / Visitor Directory
// Auto-generated species summaries from sightings.
// ============================================================

import { Sighting } from '../../types';
import { buildProfiles, formatDate } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import './BirdProfiles.css';

interface BirdProfilesProps {
  sightings: Sighting[];
}

const BADGE_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  'Regular Visitor':  { bg: '#e8f5e9', color: '#2e7d32', icon: '🏡' },
  'New Visitor':      { bg: '#e3f2fd', color: '#1565c0', icon: '🆕' },
  'Frequent Flyer':   { bg: '#fff3e0', color: '#e65100', icon: '✈️' },
  'Feeder Favorite':  { bg: '#fce4ec', color: '#880e4f', icon: '⭐' },
  'Mystery Bird':     { bg: '#f3e5f5', color: '#6a1b9a', icon: '❓' },
  'First Visit':      { bg: '#e0f7fa', color: '#00695c', icon: '🎉' },
};

const FOOD_EMOJI: Record<string, string> = {
  seed: '🌾', suet: '🧇', nectar: '🌸', fruit: '🍒', insects: '🐛', unknown: '❓',
};
const LOC_EMOJI: Record<string, string> = {
  feeder: '🪣', 'bird bath': '🛁', tree: '🌳', fence: '🪵', ground: '🌿', garden: '🌺', other: '📍',
};

export default function BirdProfiles({ sightings }: BirdProfilesProps) {
  const navigate = useNavigate();
  const profiles = buildProfiles(sightings);

  if (sightings.length === 0) {
    return (
      <div className="bird-profiles">
        <div className="page-header">
          <h1 className="page-title">🐦 Visitor Directory</h1>
          <p className="page-subtitle">Your backyard bird profiles will appear here.</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🌿</div>
          <h3>No visitors logged yet.</h3>
          <p>Start logging sightings to build your personal bird directory!</p>
          <button className="btn btn-primary" onClick={() => navigate('/add')}>
            ➕ Log Your First Bird
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bird-profiles">
      <div className="page-header">
        <div>
          <h1 className="page-title">🐦 Visitor Directory</h1>
          <p className="page-subtitle">
            {profiles.length} unique species in your backyard
          </p>
        </div>
      </div>

      <div className="profiles-grid">
        {profiles.map(p => (
          <div key={p.commonName} className="profile-card">
            {/* Header */}
            <div className="profile-card-header">
              <div className="profile-thumb">
                {p.recentImage
                  ? <img src={p.recentImage} alt={p.commonName} />
                  : <span>{p.commonName === 'Mystery Bird' ? '❓' : '🐦'}</span>
                }
              </div>
              <div className="profile-identity">
                <h3 className="profile-name">{p.commonName}</h3>
                {p.scientificName && (
                  <p className="profile-sci">{p.scientificName}</p>
                )}
              </div>
            </div>

            {/* Badges */}
            {p.badges.length > 0 && (
              <div className="profile-badges">
                {p.badges.map(b => {
                  const style = BADGE_STYLES[b] ?? { bg: '#f5f5f5', color: '#555', icon: '🏷️' };
                  return (
                    <span
                      key={b}
                      className="profile-badge"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {style.icon} {b}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Stats */}
            <div className="profile-stats">
              <ProfileStat icon="🔢" label="Total Sightings" value={String(p.totalSightings)} />
              <ProfileStat icon="📅" label="First Seen" value={formatDate(p.firstSeen)} />
              <ProfileStat icon="🕐" label="Last Seen" value={formatDate(p.lastSeen)} />
              <ProfileStat
                icon={FOOD_EMOJI[p.favoriteFood] ?? '🍽️'}
                label="Favorite Food"
                value={p.favoriteFood.charAt(0).toUpperCase() + p.favoriteFood.slice(1)}
              />
              <ProfileStat
                icon={LOC_EMOJI[p.favoriteLocation] ?? '📍'}
                label="Favorite Spot"
                value={p.favoriteLocation.charAt(0).toUpperCase() + p.favoriteLocation.slice(1)}
              />
            </div>

            {/* Common behaviors */}
            {p.commonBehaviors.length > 0 && (
              <div className="profile-behaviors">
                <span className="behaviors-label">Usually seen:</span>
                {p.commonBehaviors.map(b => (
                  <span key={b} className="behavior-chip">
                    {b.charAt(0).toUpperCase() + b.slice(1)}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="profile-stat">
      <span className="profile-stat-icon">{icon}</span>
      <div>
        <div className="profile-stat-label">{label}</div>
        <div className="profile-stat-value">{value}</div>
      </div>
    </div>
  );
}
