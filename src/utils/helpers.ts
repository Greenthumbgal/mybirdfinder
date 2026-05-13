// ============================================================
// FeatherLog — Utility Helpers
// ============================================================

import { Sighting, BirdProfile, Badge, Behavior, FoodType, Location } from '../types';

/** Generate a random ID */
export function genId(): string {
  return `fl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Format a date string for display */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Format a date + time string */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/** Returns items seen today */
export function todaySightings(sightings: Sighting[]): Sighting[] {
  const today = new Date().toDateString();
  return sightings.filter(s => new Date(s.dateTime).toDateString() === today);
}

/** Count sightings per species and return sorted list */
export function speciesFrequency(sightings: Sighting[]): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const s of sightings) {
    map[s.commonName] = (map[s.commonName] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** Most common value in an array */
function mostCommon<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  const map: Record<string, number> = {};
  for (const v of arr) {
    const k = String(v);
    map[k] = (map[k] || 0) + 1;
  }
  return arr.reduce((a, b) => (map[String(a)] >= map[String(b)] ? a : b));
}

/** Build auto-generated bird profiles from sightings */
export function buildProfiles(sightings: Sighting[]): BirdProfile[] {
  const map: Record<string, Sighting[]> = {};
  for (const s of sightings) {
    if (!map[s.commonName]) map[s.commonName] = [];
    map[s.commonName].push(s);
  }

  return Object.entries(map).map(([name, entries]) => {
    const sorted = [...entries].sort((a, b) =>
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
    const firstSeen = sorted[0].dateTime;
    const lastSeen = sorted[sorted.length - 1].dateTime;
    const favoriteFood = mostCommon(entries.map(e => e.foodType)) as FoodType ?? 'unknown';
    const favoriteLocation = mostCommon(entries.map(e => e.location)) as Location ?? 'feeder';
    const behaviorCounts: Record<string, number> = {};
    for (const e of entries) behaviorCounts[e.behavior] = (behaviorCounts[e.behavior] || 0) + 1;
    const commonBehaviors = (Object.entries(behaviorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([b]) => b)) as Behavior[];

    const badges: Badge[] = [];
    const daysSinceFirst = (Date.now() - new Date(firstSeen).getTime()) / 86400000;
    if (entries.length >= 5) badges.push('Regular Visitor');
    if (entries.length >= 10) badges.push('Frequent Flyer');
    if (favoriteLocation === 'feeder' && entries.length >= 3) badges.push('Feeder Favorite');
    if (daysSinceFirst <= 7) badges.push('New Visitor');
    if (entries.some(e => e.isMystery)) badges.push('Mystery Bird');

    const recentWithImage = [...entries].reverse().find(e => e.image);

    return {
      commonName: name,
      scientificName: entries.find(e => e.scientificName)?.scientificName,
      totalSightings: entries.length,
      firstSeen,
      lastSeen,
      favoriteFood,
      favoriteLocation,
      commonBehaviors,
      badges,
      recentImage: recentWithImage?.image,
    };
  }).sort((a, b) => b.totalSightings - a.totalSightings);
}

/** Sightings by month for chart */
export function sightingsByMonth(sightings: Sighting[]): { month: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const s of sightings) {
    const key = new Date(s.dateTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map).map(([month, count]) => ({ month, count }));
}

/** Sightings by hour of day */
export function sightingsByHour(sightings: Sighting[]): { hour: string; count: number }[] {
  const map: Record<number, number> = {};
  for (const s of sightings) {
    const h = new Date(s.dateTime).getHours();
    map[h] = (map[h] || 0) + 1;
  }
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i < 12 ? 'am' : 'pm'}`,
    count: map[i] || 0,
  })).filter(h => h.count > 0);
}

/** Export sightings as JSON string */
export function exportJSON(sightings: Sighting[]): void {
  const data = JSON.stringify(sightings, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `featherlog-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export sightings as CSV */
export function exportCSV(sightings: Sighting[]): void {
  const headers = ['id','commonName','scientificName','dateTime','count','behavior',
    'location','foodType','weather','confidence','colors','notes','idNotes','isMystery'];
  const rows = sightings.map(s => headers.map(h => {
    const val = (s as unknown as Record<string, unknown>)[h];
    if (Array.isArray(val)) return `"${val.join(', ')}"`;
    if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
    return val ?? '';
  }).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `featherlog-export-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Color label to hex */
export const COLOR_MAP: Record<string, string> = {
  red: '#e74c3c',
  orange: '#e67e22',
  yellow: '#f1c40f',
  green: '#27ae60',
  blue: '#2980b9',
  purple: '#8e44ad',
  pink: '#e91e8c',
  brown: '#795548',
  black: '#222',
  white: '#f5f5f5',
  gray: '#9e9e9e',
  'blue-gray': '#607d8b',
};

export const COLORS_LIST = Object.keys(COLOR_MAP);

export const CONFIDENCE_COLORS: Record<string, string> = {
  certain: '#4caf50',
  'pretty sure': '#8bc34a',
  maybe: '#ff9800',
  unknown: '#9e9e9e',
};
