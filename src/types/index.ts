// ============================================================
// MyBirdFinder — Data Types & Interfaces
// ============================================================

// A registered user account (stored locally)
export interface User {
  id: string;
  username: string;       // login handle, lowercase, unique
  displayName: string;    // shown in greetings: "Good morning, Sophie!"
  email: string;          // used for password recovery lookup
  password: string;       // plain-text for MVP localStorage (no backend yet)
  createdAt: string;
}

export type Behavior =
  | 'feeding'
  | 'bathing'
  | 'nesting'
  | 'singing'
  | 'fighting'
  | 'flying by'
  | 'perching'
  | 'unknown';

export type Location =
  | 'feeder'
  | 'bird bath'
  | 'tree'
  | 'fence'
  | 'ground'
  | 'garden'
  | 'other';

export type FoodType =
  | 'seed'
  | 'suet'
  | 'nectar'
  | 'fruit'
  | 'insects'
  | 'unknown';

export type Confidence = 'certain' | 'pretty sure' | 'maybe' | 'unknown';

export type Weather =
  | 'sunny'
  | 'cloudy'
  | 'partly cloudy'
  | 'rainy'
  | 'windy'
  | 'snowy'
  | 'foggy'
  | 'unknown';

// A single bird sighting entry
export interface Sighting {
  id: string;
  commonName: string;
  scientificName?: string;
  dateTime: string;          // ISO string
  count: number;
  image?: string;            // base64 or URL
  colors: string[];
  behavior: Behavior;
  location: Location;
  foodType: FoodType;
  weather: Weather;
  confidence: Confidence;
  notes?: string;
  idNotes?: string;          // "Mystery bird" clues — red head, black wings, etc.
  isMystery?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Badge types for bird profiles
export type Badge =
  | 'Regular Visitor'
  | 'New Visitor'
  | 'Frequent Flyer'
  | 'Feeder Favorite'
  | 'Mystery Bird'
  | 'First Visit';

// Auto-generated species summary
export interface BirdProfile {
  commonName: string;
  scientificName?: string;
  totalSightings: number;
  firstSeen: string;
  lastSeen: string;
  favoriteFood: FoodType;
  favoriteLocation: Location;
  commonBehaviors: Behavior[];
  badges: Badge[];
  recentImage?: string;
}
