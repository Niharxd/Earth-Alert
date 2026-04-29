import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Github, Linkedin, Mail, ChevronDown,
  Globe, Zap, Map, Bell, BarChart2, Shield, Layers,
  Activity, Flame, Waves, Wind, Mountain, Biohazard,
  CloudLightning, Droplets, Sun, AlertTriangle,
  Radio, Satellite, CloudRain, Database, RefreshCw, Filter
} from 'lucide-react'

const FEATURES = [
  { icon: Globe,      color: '#4488ff', title: 'Global Coverage',   desc: 'Tracks earthquakes, floods, wildfires, hurricanes, volcanoes and disease outbreaks across every continent.' },
  { icon: Zap,        color: '#ffaa00', title: 'Real-time Data',    desc: 'Live feeds from USGS, NASA FIRMS, NOAA/NWS, GDACS and ReliefWeb — pushed instantly via WebSocket.' },
  { icon: Map,        color: '#00cc88', title: 'Interactive Map',   desc: 'Clustered markers with severity-based colors, pulsing animations for extreme events, and a heatmap overlay.' },
  { icon: Bell,       color: '#ff6600', title: 'Smart Alerts',      desc: 'Custom notification rules by type, severity or magnitude. Watchlist regions for places you care about.' },
  { icon: BarChart2,  color: '#aa44ff', title: 'Analytics',         desc: '7-day sparkline trends, disaster correlation detection, and affected population estimates for every event.' },
  { icon: Shield,     color: '#ff3366', title: 'Severity Scoring',  desc: 'Every event scored Low → Extreme using source-specific metrics — magnitude, wind speed, fire power and more.' },
]

const DISASTER_TYPES = [
  { icon: Activity,       color: '#ff6600', name: 'Earthquake',  cat: 'Geological' },
  { icon: Waves,          color: '#0088ff', name: 'Tsunami',     cat: 'Geological' },
  { icon: Mountain,       color: '#ff4400', name: 'Volcano',     cat: 'Geological' },
  { icon: Wind,           color: '#4488ff', name: 'Hurricane',   cat: 'Meteorological' },
  { icon: CloudLightning, color: '#8844ff', name: 'Tornado',     cat: 'Meteorological' },
  { icon: CloudRain,      color: '#44aaff', name: 'Storm',       cat: 'Meteorological' },
  { icon: Flame,          color: '#ff3300', name: 'Wildfire',    cat: 'Fire' },
  { icon: Droplets,       color: '#00aaff', name: 'Flood',       cat: 'Hydrological' },
  { icon: Sun,            color: '#ffaa00', name: 'Drought',     cat: 'Meteorological' },
  { icon: Biohazard,      color: '#00cc88', name: 'Disease',     cat: 'Biological' },
]

const FLASHCARDS = [
  { icon: Activity,       color: '#ff6600', name: 'Earthquake',
    front: 'Sudden shaking caused by tectonic plate movement.',
    facts: ['Can reach magnitude 9.5 (Chile, 1960)', 'Occur 500,000 times per year globally', 'Most happen along the Pacific Ring of Fire', 'Last 10–30 seconds on average'],
    severity: 'Up to Extreme (M8.0+)' },
  { icon: Waves,          color: '#0088ff', name: 'Tsunami',
    front: 'Giant ocean waves triggered by underwater earthquakes or eruptions.',
    facts: ['Travel at 800 km/h in deep ocean', 'Can reach 30+ metres onshore', '2004 Indian Ocean tsunami killed 230,000+', 'Warning time can be minutes'],
    severity: 'Up to Extreme' },
  { icon: Mountain,       color: '#ff4400', name: 'Volcano',
    front: 'Rupture in Earth crust releasing lava, ash and gases.',
    facts: ['1,500 active volcanoes worldwide', 'Krakatoa eruption heard 4,800 km away', 'Ash clouds disrupt global air travel', 'Can trigger tsunamis and earthquakes'],
    severity: 'High to Severe' },
  { icon: Wind,           color: '#4488ff', name: 'Hurricane',
    front: 'Massive rotating tropical storm with winds exceeding 119 km/h.',
    facts: ['Category 5 winds exceed 252 km/h', 'Can be 800+ km in diameter', 'Season: June–November (Atlantic)', 'Storm surge is the deadliest component'],
    severity: 'Moderate to Extreme' },
  { icon: CloudLightning, color: '#8844ff', name: 'Tornado',
    front: 'Violently rotating column of air from a thunderstorm to the ground.',
    facts: ['Wind speeds up to 480 km/h recorded', 'USA averages 1,200 per year', 'Most last less than 10 minutes', 'EF5 tornadoes can level entire towns'],
    severity: 'Severe to Extreme' },
  { icon: CloudRain,      color: '#44aaff', name: 'Storm',
    front: 'Severe atmospheric disturbance with rain, lightning or strong winds.',
    facts: ['40,000 thunderstorms occur daily', 'Lightning strikes Earth 100x per second', 'Blizzards can dump metres of snow', 'Hailstones can reach grapefruit size'],
    severity: 'Low to Extreme' },
  { icon: Flame,          color: '#ff3300', name: 'Wildfire',
    front: 'Uncontrolled fire spreading rapidly through vegetation.',
    facts: ['Can spread faster than a person can run', '2019–20 Australian fires burned 18.6M ha', 'Creates its own weather (pyrocumulonimbus)', 'NASA FIRMS detects fires via satellite'],
    severity: 'Moderate to Extreme' },
  { icon: Droplets,       color: '#00aaff', name: 'Flood',
    front: 'Overflow of water onto normally dry land.',
    facts: ['Most common and costly natural disaster', 'Flash floods arrive within 6 hours', '6 inches of water can knock a person down', '2 feet can sweep away a vehicle'],
    severity: 'Moderate to Severe' },
  { icon: Sun,            color: '#ffaa00', name: 'Drought',
    front: 'Extended period of abnormally low rainfall causing water shortage.',
    facts: ['Can last months to years', 'Affects more people than any other disaster', 'Responsible for 55% of global food crises', 'Climate change is increasing frequency'],
    severity: 'Moderate to High' },
  { icon: Biohazard,      color: '#00cc88', name: 'Disease Outbreak',
    front: 'Sudden increase in disease cases beyond normal expected levels.',
    facts: ['COVID-19 infected 700M+ globally', '1918 flu killed 50–100 million', 'WHO monitors 200+ diseases worldwide', 'Early detection can prevent pandemics'],
    severity: 'Moderate to Extreme' },
]

function FlashCard({ card }) {
  const [flipped, setFlipped] = useState(false)
  const { icon: Icon, color, name, front, facts, severity } = card
  return (
    <div style={s.cardWrap} onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)} onClick={() => setFlipped(v => !v)}>
      <div style={{ ...s.cardInner, transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div style={{ ...s.cardFace, ...s.cardFront, borderColor: `${color}33` }}>
          <div style={{ ...s.cardIconWrap, background: `${color}18`, border: `1px solid ${color}33` }}>
            <Icon size={28} color={color} />
          </div>
          <h3 style={{ ...s.cardName, color }}>{name}</h3>
          <p style={s.cardFrontText}>{front}</p>
          <span style={s.cardHint}>Hover for facts</span>
        </div>
        <div style={{ ...s.cardFace, ...s.cardBack, borderColor: `${color}55`, background: `${color}12` }}>
          <h3 style={{ ...s.cardName, color, marginBottom: 12 }}>{name}</h3>
          <ul style={s.factList}>
            {facts.map((f, i) => (
              <li key={i} style={s.factItem}>
                <span style={{ ...s.factDot, background: color }} />{f}
              </li>
            ))}
          </ul>
          <div style={{ ...s.severityTag, color, borderColor: `${color}44`, background: `${color}18` }}>Severity: {severity}</div>
        </div>
      </div>
    </div>
  )
}

const SOURCES = [
  { icon: Activity,   color: '#ff6600', name: 'USGS',       desc: 'Real-time earthquake & tsunami data' },
  { icon: Satellite,  color: '#ff3300', name: 'NASA FIRMS', desc: 'Satellite wildfire detection (VIIRS)' },
  { icon: Radio,      color: '#4488ff', name: 'NOAA/NWS',  desc: 'US severe weather & tornado alerts' },
  { icon: Globe,      color: '#00aaff', name: 'GDACS',      desc: 'UN global disaster alert coordination' },
  { icon: Wind,       color: '#8844ff', name: 'NOAA NHC',  desc: 'Atlantic & Pacific hurricane tracking' },
  { icon: Database,   color: '#00cc88', name: 'ReliefWeb',  desc: 'Humanitarian disaster & disease reports' },
]

const STATS = [
  { value: '6',   label: 'Live Sources',   icon: Database },
  { value: '10+', label: 'Disaster Types', icon: AlertTriangle },
  { value: '5',   label: 'Categories',     icon: Filter },
  { value: '15m', label: 'Refresh Rate',   icon: RefreshCw },
]

function useInView(threshold = 0.15) {
  const [ref, setRef] = useState(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(ref)
    return () => obs.disconnect()
  }, [ref, threshold])
  return [setRef, inView]
}

function FadeSection({ id, children, style }) {
  const [ref, inView] = useInView()
  return (
    <section
      id={id}
      ref={ref}
      style={{
        ...s.section,
        opacity:    inView ? 1 : 0,
        transform:  inView ? 'translateY(0)' : 'translateY(36px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        ...style,
      }}
    >
      {children}
    </section>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={s.page}>

      {/* ── NAV ── */}
      <nav style={{ ...s.nav, background: scrolled ? '#0c0c18ee' : 'transparent', borderBottomColor: scrolled ? '#1e1e2e' : 'transparent' }}>
        <div style={s.navBrand}>
          <Globe size={20} color="#ff6600" />
          <span style={s.navEarth}>Earth</span><span style={s.navAlert}>Alert</span>
        </div>
        <div style={s.navLinks}>
          {['#features','#disasters','#sources','#about'].map(href => (
            <a key={href} href={href} style={s.navLink}>{href.slice(1).charAt(0).toUpperCase() + href.slice(2)}</a>
          ))}
          <button style={s.launchBtn} onClick={() => navigate('/app')}>Launch Dashboard →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={s.hero}>
        <div style={s.heroGlow} />
        <div style={s.heroGlow2} />

        <div style={s.heroInner}>
          <div style={s.heroBadge}>
            <span style={s.liveDot} />
            Live Disaster Intelligence
          </div>

          <h1 style={s.heroTitle}>
            Track Every Disaster<br />
            <span style={s.heroAccent}>On Earth. In Real Time.</span>
          </h1>

          <p style={s.heroSub}>
            Earth Alert aggregates live data from NASA, USGS, NOAA and the UN —
            giving you a real-time view of every major natural disaster on the planet.
          </p>

          <div style={s.heroCtas}>
            <button style={s.ctaPrimary} onClick={() => navigate('/app')}>
              Launch Dashboard
            </button>
            <a href="#features" style={s.ctaSecondary}>
              Explore features <ChevronDown size={14} style={{ verticalAlign: 'middle' }} />
            </a>
          </div>

          <div style={s.statsRow}>
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} style={s.statItem}>
                <Icon size={14} color="#ff6600" style={{ marginBottom: 4 }} />
                <span style={s.statValue}>{value}</span>
                <span style={s.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Icon grid on the right */}
        <div style={s.heroIcons}>
          {DISASTER_TYPES.map(({ icon: Icon, color, name }, i) => (
            <div key={name} style={{ ...s.heroIconBox, animationDelay: `${i * 0.15}s`, borderColor: `${color}33` }}>
              <Icon size={22} color={color} />
              <span style={{ ...s.heroIconLabel, color }}>{name}</span>
            </div>
          ))}
        </div>

        <a href="#features" style={s.scrollIndicator}>
          <span style={s.scrollText}>Scroll to explore</span>
          <ChevronDown size={18} color="#333" style={{ animation: 'bounce 1.5s ease-in-out infinite' }} />
        </a>
      </div>

      {/* ── FEATURES ── */}
      <FadeSection id="features" style={s.darkSection}>
        <div style={s.inner}>
          <p style={s.eyebrow}>What it does</p>
          <h2 style={s.sectionTitle}>Everything you need to stay informed</h2>
          <p style={s.sectionSub}>Built for situational awareness, research, and emergency preparedness.</p>
          <div style={s.featuresGrid}>
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} style={s.featureCard}>
                <div style={{ ...s.featureIconWrap, background: `${color}18`, border: `1px solid ${color}33` }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 style={s.featureTitle}>{title}</h3>
                <p style={s.featureDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ── DISASTER TYPES ── */}
      <FadeSection id="disasters">
        <div style={s.inner}>
          <p style={s.eyebrow}>Coverage</p>
          <h2 style={s.sectionTitle}>10 disaster types tracked</h2>
          <p style={s.sectionSub}>Across 5 categories — geological, meteorological, fire, hydrological and biological.</p>
          <div style={s.disasterGrid}>
            {DISASTER_TYPES.map(({ icon: Icon, color, name, cat }) => (
              <div key={name} style={{ ...s.disasterCard, borderColor: `${color}33` }}>
                <div style={{ ...s.disasterIconWrap, background: `${color}15` }}>
                  <Icon size={24} color={color} />
                </div>
                <span style={{ ...s.disasterName, color }}>{name}</span>
                <span style={s.disasterCat}>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ── FLASHCARDS ── */}
      <FadeSection id="flashcards" style={s.darkSection}>
        <div style={s.inner}>
          <p style={s.eyebrow}>Know Your Disasters</p>
          <h2 style={s.sectionTitle}>What are these events?</h2>
          <p style={s.sectionSub}>Hover over each card to learn key facts about every disaster type we track.</p>
          <div style={s.flashGrid}>
            {FLASHCARDS.map(card => <FlashCard key={card.name} card={card} />)}
          </div>
        </div>
      </FadeSection>

      {/* ── SOURCES ── */}
      <FadeSection id="sources" style={s.darkSection}>
        <div style={s.inner}>
          <p style={s.eyebrow}>Data</p>
          <h2 style={s.sectionTitle}>Powered by 6 trusted sources</h2>
          <p style={s.sectionSub}>All free, all open, all authoritative.</p>
          <div style={s.sourcesGrid}>
            {SOURCES.map(({ icon: Icon, color, name, desc }) => (
              <div key={name} style={s.sourceCard}>
                <div style={{ ...s.sourceIconWrap, background: `${color}18`, border: `1px solid ${color}33` }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <div style={s.sourceName}>{name}</div>
                  <div style={s.sourceDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ── FINAL CTA ── */}
      <FadeSection>
        <div style={{ ...s.inner, textAlign: 'center', position: 'relative' }}>
          <div style={s.ctaGlow} />
          <p style={s.eyebrow}>Ready?</p>
          <h2 style={{ ...s.sectionTitle, fontSize: 44 }}>Monitor the planet now</h2>
          <p style={{ ...s.sectionSub, marginBottom: 36 }}>Free. No account. No API key. Just open it.</p>
          <button style={{ ...s.ctaPrimary, fontSize: 16, padding: '16px 44px' }} onClick={() => navigate('/app')}>
            Launch Earth Alert
          </button>
        </div>
      </FadeSection>

      {/* ── FOOTER ── */}
      <footer id="about" style={s.footer}>
        <div style={s.footerTop}>
          <div>
            <div style={s.navBrand}>
              <Globe size={18} color="#ff6600" />
              <span style={s.navEarth}>Earth</span><span style={s.navAlert}>Alert</span>
            </div>
            <p style={s.footerDesc}>Real-time global disaster tracking dashboard.<br />Built with FastAPI, React, Leaflet and open data.</p>
          </div>
          <div>
            <p style={s.footerBuiltBy}>Built by</p>
            <p style={s.footerName}>Nihar Ranjan Patra</p>
            <div style={s.footerLinks}>
              <a href="mailto:niharpatra2277@gmail.com" style={s.footerLink}>
                <Mail size={14} /> niharpatra2277@gmail.com
              </a>
              <a href="https://github.com/Niharxd" target="_blank" rel="noreferrer" style={s.footerLink}>
                <Github size={14} /> github.com/Niharxd
              </a>
              <a href="https://www.linkedin.com/in/nihar-patra-98841336a/" target="_blank" rel="noreferrer" style={s.footerLink}>
                <Linkedin size={14} /> linkedin.com/in/nihar-patra
              </a>
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>
          <span style={s.footerCopy}>© 2026 Nihar Ranjan Patra · Earth Alert · All rights reserved</span>
        </div>
      </footer>
    </div>
  )
}

const s = {
  page:       { background: '#0e0b08', color: '#e8ddd0', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' },

  nav:        { position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 48px', borderBottom: '1px solid transparent', backdropFilter: 'blur(12px)', zIndex: 1000, transition: 'background 0.3s, border-color 0.3s' },
  navBrand:   { display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', textDecoration: 'none' },
  navEarth:   { color: '#fff' },
  navAlert:   { color: '#ff6600' },
  navLinks:   { display: 'flex', alignItems: 'center', gap: 28 },
  navLink:    { color: '#555', fontSize: 13, textDecoration: 'none' },
  launchBtn:  { background: '#ff6600', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },

  hero:       { position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '120px 48px 80px', overflow: 'hidden', gap: 40 },
  heroGlow:   { position: 'absolute', top: -200, left: '20%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(255,102,0,0.07) 0%, transparent 65%)', pointerEvents: 'none' },
  heroGlow2:  { position: 'absolute', bottom: -100, right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(68,136,255,0.05) 0%, transparent 65%)', pointerEvents: 'none' },
  heroInner:  { maxWidth: 600, position: 'relative', zIndex: 1, flexShrink: 0 },
  heroBadge:  { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ff660018', border: '1px solid #ff660033', color: '#ff6600', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 20, marginBottom: 28 },
  liveDot:    { width: 7, height: 7, borderRadius: '50%', background: '#ff3333', animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' },
  heroTitle:  { fontSize: 58, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2.5px', marginBottom: 22 },
  heroAccent: { color: '#ff6600' },
  heroSub:    { color: '#555', fontSize: 17, lineHeight: 1.75, marginBottom: 40, maxWidth: 520 },
  heroCtas:   { display: 'flex', gap: 20, alignItems: 'center', marginBottom: 52 },
  ctaPrimary: { background: 'linear-gradient(135deg, #ff6600, #ff3300)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 40px rgba(255,102,0,0.25)' },
  ctaSecondary:{ color: '#444', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 },
  statsRow:   { display: 'flex', gap: 36 },
  statItem:   { display: 'flex', flexDirection: 'column', gap: 2 },
  statValue:  { color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-1px' },
  statLabel:  { color: '#333', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2 },

  heroIcons:     { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, flexShrink: 0, animation: 'fadeIn 1s ease-out' },
  heroIconBox:   { background: '#0c0c18', border: '1px solid', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'float 4s ease-in-out infinite' },
  heroIconLabel: { fontSize: 11, fontWeight: 600 },

  scrollIndicator: { position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' },
  scrollText:      { color: '#2a2a3a', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' },

  section:      { padding: '100px 48px' },
  darkSection:  { background: '#141008' },
  inner:        { maxWidth: 1100, margin: '0 auto' },
  eyebrow:      { color: '#ff6600', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' },
  sectionTitle: { fontSize: 38, fontWeight: 900, letterSpacing: '-1px', marginBottom: 14, textAlign: 'center' },
  sectionSub:   { color: '#555', fontSize: 15, textAlign: 'center', marginBottom: 52, maxWidth: 520, margin: '0 auto 52px' },

  featuresGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 },
  featureCard:    { background: '#1c1510', border: '1px solid #3d2e1e', borderRadius: 16, padding: '28px' },
  featureIconWrap:{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  featureTitle:   { color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 10 },
  featureDesc:    { color: '#555', fontSize: 13, lineHeight: 1.75 },

  disasterGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 },
  disasterCard:    { background: '#141008', border: '1px solid', borderRadius: 14, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  disasterIconWrap:{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  disasterName:    { fontSize: 13, fontWeight: 700 },
  disasterCat:     { color: '#333', fontSize: 11 },

  sourcesGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  sourceCard:     { background: '#1c1510', border: '1px solid #3d2e1e', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 16 },
  sourceIconWrap: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sourceName:     { color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 },
  sourceDesc:     { color: '#555', fontSize: 12 },

  ctaGlow:      { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 300, background: 'radial-gradient(circle, rgba(255,102,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' },

  flashGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  cardWrap:     { height: 240, perspective: '1000px', cursor: 'pointer' },
  cardInner:    { position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.55s ease' },
  cardFace:     { position: 'absolute', inset: 0, borderRadius: 16, border: '1px solid', padding: '20px 16px', backfaceVisibility: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center' },
  cardFront:    { background: '#1c1510' },
  cardBack:     { transform: 'rotateY(180deg)', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left' },
  cardIconWrap: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardName:     { fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px' },
  cardFrontText:{ color: '#8a7560', fontSize: 12, lineHeight: 1.6 },
  cardHint:     { color: '#3d2e1e', fontSize: 10, letterSpacing: 0.5, marginTop: 4 },
  factList:     { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 10, width: '100%' },
  factItem:     { display: 'flex', alignItems: 'flex-start', gap: 7, color: '#c4b49a', fontSize: 11, lineHeight: 1.5 },
  factDot:      { width: 5, height: 5, borderRadius: '50%', flexShrink: 0, marginTop: 5 },
  severityTag:  { fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid', marginTop: 'auto' },

  footer:       { background: '#141008', borderTop: '1px solid #3d2e1e', padding: '60px 48px 28px' },
  footerTop:    { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, marginBottom: 40 },
  footerDesc:   { color: '#5a4535', fontSize: 13, lineHeight: 1.8, marginTop: 12, maxWidth: 320 },
  footerBuiltBy:{ color: '#5a4535', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  footerName:   { color: '#e8ddd0', fontWeight: 800, fontSize: 18, marginBottom: 16 },
  footerLinks:  { display: 'flex', flexDirection: 'column', gap: 12 },
  footerLink:   { display: 'flex', alignItems: 'center', gap: 8, color: '#8a7560', fontSize: 13, textDecoration: 'none' },
  footerBottom: { borderTop: '1px solid #2a1f12', paddingTop: 20 },
  footerCopy:   { color: '#3d2e1e', fontSize: 12 },
}
