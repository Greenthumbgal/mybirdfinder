// ============================================================
// FeatherLog — Stats Page
// Charts and summaries using Recharts.
// ============================================================

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Sighting } from '../../types';
import { speciesFrequency, sightingsByMonth, sightingsByHour } from '../../utils/helpers';
import './Stats.css';

interface StatsProps {
  sightings: Sighting[];
}

const PIE_COLORS = ['#5c8a4a', '#e07b3a', '#4b88b8', '#c45c9a', '#8e5ea8', '#c8a035', '#3aa0a0'];

export default function Stats({ sightings }: StatsProps) {
  if (sightings.length === 0) {
    return (
      <div className="stats-page">
        <div className="page-header">
          <h1 className="page-title">📊 Stats</h1>
          <p className="page-subtitle">Your backyard activity analytics</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No data yet.</h3>
          <p>Log some sightings and your stats will appear here!</p>
        </div>
      </div>
    );
  }

  const bySpecies = speciesFrequency(sightings).slice(0, 10);
  const byMonth = sightingsByMonth(sightings);
  const byHour = sightingsByHour(sightings);

  // Food breakdown
  const foodMap: Record<string, number> = {};
  for (const s of sightings) foodMap[s.foodType] = (foodMap[s.foodType] || 0) + 1;
  const foodData = Object.entries(foodMap).map(([name, value]) => ({ name: cap(name), value }));

  // Behavior breakdown
  const behaviorMap: Record<string, number> = {};
  for (const s of sightings) behaviorMap[s.behavior] = (behaviorMap[s.behavior] || 0) + 1;
  const behaviorData = Object.entries(behaviorMap)
    .map(([name, value]) => ({ name: cap(name), value }))
    .sort((a, b) => b.value - a.value);

  // Location breakdown
  const locMap: Record<string, number> = {};
  for (const s of sightings) locMap[s.location] = (locMap[s.location] || 0) + 1;
  const locData = Object.entries(locMap).map(([name, value]) => ({ name: cap(name), value }));

  const topSpecies = bySpecies[0];
  const totalBirds = sightings.reduce((n, s) => n + s.count, 0);

  return (
    <div className="stats-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Stats</h1>
          <p className="page-subtitle">Your backyard activity at a glance</p>
        </div>
      </div>

      {/* Top-line numbers */}
      <div className="stat-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card stat-card--green">
          <div className="stat-icon">📋</div>
          <div>
            <div className="stat-value">{sightings.length}</div>
            <div className="stat-label">Total Sightings</div>
          </div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-icon">🐦</div>
          <div>
            <div className="stat-value">{bySpecies.length}</div>
            <div className="stat-label">Unique Species</div>
          </div>
        </div>
        <div className="stat-card stat-card--amber">
          <div className="stat-icon">🔢</div>
          <div>
            <div className="stat-value">{totalBirds}</div>
            <div className="stat-label">Total Birds Counted</div>
          </div>
        </div>
        <div className="stat-card stat-card--rose">
          <div className="stat-icon">⭐</div>
          <div>
            <div className="stat-value">{topSpecies?.name ?? '—'}</div>
            <div className="stat-label">Backyard Favorite</div>
            {topSpecies && <div className="stat-sub">{topSpecies.count} sightings</div>}
          </div>
        </div>
      </div>

      {/* Species frequency */}
      <ChartCard title="Most Frequent Species" subtitle="Top 10 most spotted birds">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={bySpecies} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v} sightings`, 'Sightings']} />
            <Bar dataKey="count" fill="var(--accent)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* By month */}
      {byMonth.length > 1 && (
        <ChartCard title="Sightings by Month" subtitle="When are your birds most active?">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byMonth} margin={{ left: 0, right: 10 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} sightings`, 'Sightings']} />
              <Bar dataKey="count" fill="#4b88b8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* By hour */}
      {byHour.length > 0 && (
        <ChartCard title="Sightings by Time of Day" subtitle="Your backyard's busiest hours">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byHour} margin={{ left: 0, right: 10 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} sightings`, 'Sightings']} />
              <Bar dataKey="count" fill="#c45c9a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Pie charts row */}
      <div className="pie-row">
        <ChartCard title="Food Preferences" subtitle="What do your birds love?">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={foodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {foodData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}`, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Behavior Breakdown" subtitle="What are birds doing in your yard?">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={behaviorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {behaviorData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}`, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Locations" subtitle="Where do your birds hang out?">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={locData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {locData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}`, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Behavior list */}
      <ChartCard title="Behavior Summary" subtitle="Ranked by frequency">
        <div className="behavior-bars">
          {behaviorData.map((b, i) => (
            <div key={b.name} className="behavior-bar-row">
              <span className="behavior-bar-name">{b.name}</span>
              <div className="behavior-bar-track">
                <div
                  className="behavior-bar-fill"
                  style={{
                    width: `${(b.value / behaviorData[0].value) * 100}%`,
                    background: PIE_COLORS[i % PIE_COLORS.length],
                  }}
                />
              </div>
              <span className="behavior-bar-count">{b.value}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <p className="chart-subtitle">{subtitle}</p>
      {children}
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
