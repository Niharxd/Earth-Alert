import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export const THEMES = {
  // Earthy dark — deep soil, volcanic rock, warm amber
  dark: {
    bg:       '#0e0b08',   // deep volcanic soil
    surface:  '#141008',   // dark earth
    surface2: '#1c1510',   // rich soil
    border:   '#3d2e1e',   // dry earth crack
    border2:  '#2a1f12',   // darker crack
    text:     '#e8ddd0',   // warm parchment
    text2:    '#c4b49a',   // aged paper
    text3:    '#8a7560',   // dry clay
    text4:    '#5a4535',   // dark clay
    accent:   '#d46414',   // burnt orange / lava
    mapTile:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },
  // Earthy light — sandstone, warm cream, terracotta
  light: {
    bg:       '#f5ede0',   // warm sandstone
    surface:  '#fffaf4',   // cream
    surface2: '#f0e6d3',   // light terracotta
    border:   '#d4b896',   // sand
    border2:  '#c4a882',   // darker sand
    text:     '#2a1f12',   // dark soil
    text2:    '#4a3520',   // medium soil
    text3:    '#7a6040',   // clay
    text4:    '#a08060',   // light clay
    accent:   '#c85010',   // terracotta
    mapTile:  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  },
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('dark')
  const theme = THEMES[mode]
  const toggle = () => setMode(m => m === 'dark' ? 'light' : 'dark')
  return (
    <ThemeContext.Provider value={{ mode, theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
