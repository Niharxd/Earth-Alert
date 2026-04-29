export const CATEGORIES = {
  geological:    { label: 'Geological',    emoji: '🌍' },
  meteorological:{ label: 'Meteorological',emoji: '🌪️' },
  fire:          { label: 'Fire',          emoji: '🔥' },
  hydrological:  { label: 'Hydrological',  emoji: '🌊' },
  biological:    { label: 'Biological',    emoji: '🦠' },
}

export const DISASTER_TYPES = {
  earthquake: { label: 'Earthquake', emoji: '🌍', category: 'geological' },
  tsunami:    { label: 'Tsunami',    emoji: '🌊', category: 'geological' },
  volcano:    { label: 'Volcano',    emoji: '🌋', category: 'geological' },
  hurricane:  { label: 'Hurricane', emoji: '🌀', category: 'meteorological' },
  tornado:    { label: 'Tornado',   emoji: '🌪️', category: 'meteorological' },
  storm:      { label: 'Storm',     emoji: '⛈️', category: 'meteorological' },
  wildfire:   { label: 'Wildfire',  emoji: '🔥', category: 'fire' },
  flood:      { label: 'Flood',     emoji: '💧', category: 'hydrological' },
  drought:    { label: 'Drought',   emoji: '🏜️', category: 'meteorological' },
  disease:    { label: 'Disease',   emoji: '🦠', category: 'biological' },
}

export const SEVERITY_COLORS = {
  extreme:  '#ff0000',
  severe:   '#ff6600',
  high:     '#ffaa00',
  moderate: '#ffdd00',
  low:      '#00cc44',
}

export const SEVERITY_ORDER = ['extreme', 'severe', 'high', 'moderate', 'low']

export const API_BASE = '/api'
