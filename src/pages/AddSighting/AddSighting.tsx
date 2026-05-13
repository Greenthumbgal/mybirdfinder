// ============================================================
// FeatherLog — Add / Edit Sighting Form
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sighting, Behavior, Location, FoodType, Weather, Confidence,
} from '../../types';
import { genId, COLORS_LIST, COLOR_MAP } from '../../utils/helpers';
import './AddSighting.css';

interface AddSightingProps {
  sightings: Sighting[];
  onSave: (s: Sighting) => void;
  editingSighting?: Sighting | null;
  onDone?: () => void;
}

const BEHAVIORS: Behavior[] = [
  'feeding', 'bathing', 'nesting', 'singing', 'fighting', 'flying by', 'perching', 'unknown',
];
const LOCATIONS: Location[] = [
  'feeder', 'bird bath', 'tree', 'fence', 'ground', 'garden', 'other',
];
const FOOD_TYPES: FoodType[] = [
  'seed', 'suet', 'nectar', 'fruit', 'insects', 'unknown',
];
const WEATHERS: Weather[] = [
  'sunny', 'partly cloudy', 'cloudy', 'rainy', 'windy', 'snowy', 'foggy', 'unknown',
];
const CONFIDENCES: Confidence[] = ['certain', 'pretty sure', 'maybe', 'unknown'];

function nowLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY_FORM = {
  commonName: '',
  scientificName: '',
  dateTime: nowLocal(),
  count: 1,
  colors: [] as string[],
  behavior: 'feeding' as Behavior,
  location: 'feeder' as Location,
  foodType: 'seed' as FoodType,
  weather: 'sunny' as Weather,
  confidence: 'certain' as Confidence,
  notes: '',
  idNotes: '',
  isMystery: false,
  image: '',
};

export default function AddSighting({ sightings, onSave, editingSighting, onDone }: AddSightingProps) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load editing data if provided
  useEffect(() => {
    if (editingSighting) {
      setForm({
        commonName: editingSighting.commonName,
        scientificName: editingSighting.scientificName ?? '',
        dateTime: editingSighting.dateTime.slice(0, 16),
        count: editingSighting.count,
        colors: editingSighting.colors,
        behavior: editingSighting.behavior,
        location: editingSighting.location,
        foodType: editingSighting.foodType,
        weather: editingSighting.weather,
        confidence: editingSighting.confidence,
        notes: editingSighting.notes ?? '',
        idNotes: editingSighting.idNotes ?? '',
        isMystery: editingSighting.isMystery ?? false,
        image: editingSighting.image ?? '',
      });
    }
  }, [editingSighting]);

  function set<K extends keyof typeof EMPTY_FORM>(key: K, val: typeof EMPTY_FORM[K]) {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  function toggleColor(c: string) {
    set('colors', form.colors.includes(c)
      ? form.colors.filter(x => x !== c)
      : [...form.colors, c]
    );
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('image', ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.isMystery && !form.commonName.trim()) {
      errs.commonName = 'Please enter the bird name (or enable Mystery Bird mode)';
    }
    if (form.count < 1) errs.count = 'Count must be at least 1';
    if (!form.dateTime) errs.dateTime = 'Please pick a date and time';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const now = new Date().toISOString();
    const sighting: Sighting = {
      id: editingSighting?.id ?? genId(),
      commonName: form.isMystery ? 'Mystery Bird' : form.commonName.trim(),
      scientificName: form.scientificName.trim() || undefined,
      dateTime: new Date(form.dateTime).toISOString(),
      count: form.count,
      image: form.image || undefined,
      colors: form.colors,
      behavior: form.behavior,
      location: form.location,
      foodType: form.foodType,
      weather: form.weather,
      confidence: form.confidence,
      notes: form.notes.trim() || undefined,
      idNotes: form.idNotes.trim() || undefined,
      isMystery: form.isMystery,
      createdAt: editingSighting?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(sighting);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      if (onDone) onDone();
      else { setForm({ ...EMPTY_FORM, dateTime: nowLocal() }); navigate('/log'); }
    }, 1500);
  }

  function handleCancel() {
    if (onDone) onDone();
    else navigate(-1);
  }

  // Auto-complete: gather known species names
  const knownNames = [...new Set(sightings.map(s => s.commonName).filter(n => n !== 'Mystery Bird'))];

  return (
    <div className="add-sighting">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {editingSighting ? '✏️ Edit Sighting' : '➕ Log a Bird'}
          </h1>
          <p className="page-subtitle">
            {editingSighting
              ? 'Update the details for this sighting.'
              : 'Record a new backyard visitor. Fill in what you know!'}
          </p>
        </div>
      </div>

      {saved && (
        <div className="save-toast">
          🎉 Sighting {editingSighting ? 'updated' : 'saved'}! Nice spot!
        </div>
      )}

      <form className="sighting-form" onSubmit={handleSubmit} noValidate>

        {/* Mystery Bird toggle */}
        <div className="form-section">
          <label className="mystery-toggle">
            <input
              type="checkbox"
              checked={form.isMystery}
              onChange={e => set('isMystery', e.target.checked)}
            />
            <span className="mystery-label">
              ❓ Mystery Bird mode — I'm not sure what species this is
            </span>
          </label>
          <p className="field-hint">
            Enable this if you don't recognize the bird. You can still log it and identify later!
          </p>
        </div>

        {/* Bird identity */}
        {!form.isMystery && (
          <div className="form-section">
            <h3 className="form-section-title">🐦 Bird Identity</h3>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="commonName">
                  Common Name <span className="required">*</span>
                </label>
                <input
                  id="commonName"
                  list="known-birds"
                  className={`form-input ${errors.commonName ? 'form-input--error' : ''}`}
                  value={form.commonName}
                  onChange={e => set('commonName', e.target.value)}
                  placeholder="e.g. Northern Cardinal"
                />
                <datalist id="known-birds">
                  {knownNames.map(n => <option key={n} value={n} />)}
                </datalist>
                {errors.commonName && <p className="field-error">{errors.commonName}</p>}
                <p className="field-hint">The everyday name for the bird</p>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="scientificName">Scientific Name</label>
                <input
                  id="scientificName"
                  className="form-input"
                  value={form.scientificName}
                  onChange={e => set('scientificName', e.target.value)}
                  placeholder="e.g. Cardinalis cardinalis (optional)"
                />
                <p className="field-hint">Optional — for field guide fans</p>
              </div>
            </div>
          </div>
        )}

        {/* Mystery ID notes */}
        {form.isMystery && (
          <div className="form-section">
            <h3 className="form-section-title">🔍 ID Clues</h3>
            <div className="form-field">
              <label className="form-label" htmlFor="idNotes">
                What did it look like?
              </label>
              <textarea
                id="idNotes"
                className="form-input form-textarea"
                value={form.idNotes}
                onChange={e => set('idNotes', e.target.value)}
                placeholder="e.g. Red head, black wings, white belly, about robin-sized..."
                rows={3}
              />
              <p className="field-hint">
                Jot down colors, size, shape, or behavior clues to help with identification later.
              </p>
            </div>
          </div>
        )}

        {/* When & How many */}
        <div className="form-section">
          <h3 className="form-section-title">📅 When & How Many</h3>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="dateTime">
                Date & Time <span className="required">*</span>
              </label>
              <input
                id="dateTime"
                type="datetime-local"
                className={`form-input ${errors.dateTime ? 'form-input--error' : ''}`}
                value={form.dateTime}
                onChange={e => set('dateTime', e.target.value)}
              />
              {errors.dateTime && <p className="field-error">{errors.dateTime}</p>}
            </div>

            <div className="form-field form-field--sm">
              <label className="form-label" htmlFor="count">Number Seen</label>
              <input
                id="count"
                type="number"
                min={1}
                className={`form-input ${errors.count ? 'form-input--error' : ''}`}
                value={form.count}
                onChange={e => set('count', Math.max(1, parseInt(e.target.value) || 1))}
              />
              {errors.count && <p className="field-error">{errors.count}</p>}
              <p className="field-hint">How many birds at once?</p>
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="form-section">
          <h3 className="form-section-title">📷 Photo</h3>
          <div className="photo-upload-area" onClick={() => fileRef.current?.click()}>
            {form.image
              ? <img src={form.image} alt="Preview" className="photo-preview" />
              : (
                <>
                  <div className="photo-icon">📸</div>
                  <p>Click to upload a photo</p>
                  <p className="field-hint">JPG, PNG or GIF — stored locally on your device</p>
                </>
              )
            }
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden-input"
            onChange={handleImageUpload}
          />
          {form.image && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => set('image', '')}>
              Remove photo
            </button>
          )}

          {/* Coming soon: AI identification */}
          <button
            type="button"
            className="btn btn-ghost btn-sm ai-btn"
            disabled
            title="Coming soon — AI photo identification with Merlin-style integration"
          >
            🤖 Identify from Photo <span className="coming-soon-tag">Coming soon</span>
          </button>
        </div>

        {/* Colors */}
        <div className="form-section">
          <h3 className="form-section-title">🎨 Colors Observed</h3>
          <div className="color-picker">
            {COLORS_LIST.map(c => (
              <button
                key={c}
                type="button"
                className={`color-chip ${form.colors.includes(c) ? 'color-chip--selected' : ''}`}
                onClick={() => toggleColor(c)}
                title={c}
              >
                <span
                  className="color-swatch"
                  style={{
                    background: COLOR_MAP[c],
                    border: c === 'white' ? '1px solid #ccc' : 'none',
                  }}
                />
                <span>{c}</span>
              </button>
            ))}
          </div>
          <p className="field-hint">Select all colors you noticed on the bird</p>
        </div>

        {/* Behavior & Location */}
        <div className="form-section">
          <h3 className="form-section-title">🎭 Behavior & Location</h3>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="behavior">What was it doing?</label>
              <select
                id="behavior"
                className="form-input"
                value={form.behavior}
                onChange={e => set('behavior', e.target.value as Behavior)}
              >
                {BEHAVIORS.map(b => (
                  <option key={b} value={b}>
                    {b.charAt(0).toUpperCase() + b.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="location">Where was it?</label>
              <select
                id="location"
                className="form-input"
                value={form.location}
                onChange={e => set('location', e.target.value as Location)}
              >
                {LOCATIONS.map(l => (
                  <option key={l} value={l}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Food & Weather */}
        <div className="form-section">
          <h3 className="form-section-title">🌤️ Conditions</h3>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="foodType">Food Type</label>
              <select
                id="foodType"
                className="form-input"
                value={form.foodType}
                onChange={e => set('foodType', e.target.value as FoodType)}
              >
                {FOOD_TYPES.map(f => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
              <p className="field-hint">What food source attracted this bird?</p>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="weather">Weather</label>
              <select
                id="weather"
                className="form-input"
                value={form.weather}
                onChange={e => set('weather', e.target.value as Weather)}
              >
                {WEATHERS.map(w => (
                  <option key={w} value={w}>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="form-section">
          <h3 className="form-section-title">🎯 How Sure Are You?</h3>
          <div className="confidence-options">
            {CONFIDENCES.map(c => (
              <label key={c} className={`confidence-option ${form.confidence === c ? 'confidence-option--selected' : ''}`}>
                <input
                  type="radio"
                  name="confidence"
                  value={c}
                  checked={form.confidence === c}
                  onChange={() => set('confidence', c)}
                />
                <span>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
              </label>
            ))}
          </div>
          <p className="field-hint">No pressure — it's perfectly fine to say "maybe"!</p>
        </div>

        {/* Notes */}
        <div className="form-section">
          <h3 className="form-section-title">📝 Notes</h3>
          <div className="form-field">
            <label className="form-label" htmlFor="notes">Observations & Thoughts</label>
            <textarea
              id="notes"
              className="form-input form-textarea"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="What made this sighting special? Any interesting behaviors, sounds, or details..."
              rows={4}
            />
            <p className="field-hint">Your personal journal notes — write whatever you like!</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost btn-lg" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg">
            {editingSighting ? '💾 Save Changes' : '🐦 Save Sighting'}
          </button>
        </div>

      </form>
    </div>
  );
}
