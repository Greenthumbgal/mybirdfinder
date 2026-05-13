// ============================================================
// MyBirdFinder — Root App Component
// Multi-user auth via localStorage.
// Each user's sightings are stored under their own key.
// No backend required for MVP.
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import BirdLog from './pages/BirdLog/BirdLog';
import AddSighting from './pages/AddSighting/AddSighting';
import BirdProfiles from './pages/BirdProfiles/BirdProfiles';
import Stats from './pages/Stats/Stats';
import Settings from './pages/Settings/Settings';
import AuthPage from './pages/Auth/Auth';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SAMPLE_SIGHTINGS } from './data/sampleData';
import { Sighting, User } from './types';
import './App.css';

export default function App() {
  // ── User accounts (all users on this device) ────────────────
  const [users, setUsers] = useLocalStorage<User[]>('mybirdFinder-users', []);

  // ── Active session (stores the logged-in user's id) ─────────
  const [sessionId, setSessionId] = useLocalStorage<string | null>(
    'mybirdFinder-session', null
  );

  // Resolve current user from session id
  const currentUser = users.find(u => u.id === sessionId) ?? null;

  // ── Per-user sightings map  { userId: Sighting[] } ──────────
  // Stored as one object so adding users doesn't need new hooks
  const [allSightings, setAllSightings] = useLocalStorage<Record<string, Sighting[]>>(
    'mybirdFinder-all-sightings', {}
  );

  // Helper: get sightings for the current user
  const sightings: Sighting[] = currentUser
    ? (allSightings[currentUser.id] ?? [])
    : [];

  // Helper: update sightings for the current user only
  function setSightings(updater: (prev: Sighting[]) => Sighting[]) {
    if (!currentUser) return;
    setAllSightings(prev => ({
      ...prev,
      [currentUser.id]: updater(prev[currentUser.id] ?? []),
    }));
  }

  // ── Auth handlers ────────────────────────────────────────────
  function handleLogin(user: User) {
    setSessionId(user.id);
  }

  function handleRegister(user: User) {
    setUsers(prev => [...prev, user]);
    setSessionId(user.id);
    // New accounts start with an empty log
    setAllSightings(prev => ({
      ...prev,
      [user.id]: [],
    }));
  }

  function handleLogout() {
    setSessionId(null);
  }

  // ── Update user profile (display name / email / password) ───
  function handleUpdateUser(updated: User) {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  }

  // ── Sighting CRUD ────────────────────────────────────────────
  function handleSave(sighting: Sighting) {
    setSightings(prev => {
      const exists = prev.find(s => s.id === sighting.id);
      return exists
        ? prev.map(s => (s.id === sighting.id ? sighting : s))
        : [sighting, ...prev];
    });
  }

  function handleDelete(id: string) {
    setSightings(prev => prev.filter(s => s.id !== id));
  }

  function handleImport(imported: Sighting[]) {
    setSightings(() => imported);
  }

  function handleClear() {
    setSightings(() => []);
  }

  function handleRestore() {
    setSightings(() => SAMPLE_SIGHTINGS);
  }

  // ── Show auth screen if not logged in ───────────────────────
  if (!currentUser) {
    return (
      <AuthPage
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <BrowserRouter>
      <Layout currentUser={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route
            path="/"
            element={<Dashboard sightings={sightings} currentUser={currentUser} />}
          />
          <Route
            path="/log"
            element={
              <BirdLog
                sightings={sightings}
                onUpdate={handleSave}
                onDelete={handleDelete}
              />
            }
          />
          <Route
            path="/add"
            element={<AddSighting sightings={sightings} onSave={handleSave} />}
          />
          <Route path="/profiles" element={<BirdProfiles sightings={sightings} />} />
          <Route path="/stats" element={<Stats sightings={sightings} />} />
          <Route
            path="/settings"
            element={
              <Settings
                sightings={sightings}
                currentUser={currentUser}
                onImport={handleImport}
                onClear={handleClear}
                onRestore={handleRestore}
                onUpdateUser={handleUpdateUser}
                onLogout={handleLogout}
              />
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

