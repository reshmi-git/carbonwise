import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, BarChart2, Calculator, Factory, Fuel, Battery, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { CARS, GRID_DATA, GREENWASH_DB, calcLifecycle } from '../data';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const LEADERBOARD_CARS = [
  { key: 'prius',         grid: 0.82, km: 40, yrs: 8 },
  { key: 'tiago-ev',     grid: 0.82, km: 40, yrs: 8 },
  { key: 'comet-ev',     grid: 0.82, km: 40, yrs: 8 },
  { key: 'nexon-ev',     grid: 0.82, km: 40, yrs: 8 },
  { key: 'city-hybrid',  grid: 0.82, km: 40, yrs: 8 },
  { key: 'vitara-hybrid',grid: 0.82, km: 40, yrs: 8 },
  { key: 'mg-zs-ev',     grid: 0.82, km: 40, yrs: 8 },
  { key: 'brezza',       grid: 0.82, km: 40, yrs: 8 },
  { key: 'swift',        grid: 0.82, km: 40, yrs: 8 },
  { key: 'creta',        grid: 0.82, km: 40, yrs: 8 },
  { key: 'scorpio-n',    grid: 0.82, km: 40, yrs: 8 },
  { key: 'innova',       grid: 0.82, km: 40, yrs: 8 },
  { key: 'fortuner',     grid: 0.82, km: 40, yrs: 8 },
];

const GW_ALERTS = GREENWASH_DB.slice(0, 3);

const NEWS_CARDS = [
  {
    source: 'Down To Earth',
    title: "India's EV boom masks a coal problem",
    desc: 'India added 1.2M EVs in 2023 but 67% of its grid still runs on coal, making lifecycle comparisons critical.',
    url: 'https://www.downtoearth.org',
    tag: 'India',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70',
  },
  {
    source: 'Carbon Brief',
    title: 'Lifecycle analysis: EVs vs hybrids in coal-heavy grids',
    desc: 'New data shows hybrid advantage in high-coal grids. The coal context changes everything about EV calculations.',
    url: 'https://www.carbonbrief.org',
    tag: 'Research',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&q=70',
  },
  {
    source: 'Electrek',
    title: 'Battery disposal: the ignored crisis in EV revolution',
    desc: 'As EV adoption accelerates, the industry faces a looming battery disposal challenge with real carbon implications.',
    url: 'https://electrek.co',
    tag: 'EV',
    img: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&q=70',
  },
];

function RatingBadge({ rating }) {
  const cls =
    rating === 'A+' ? 'rating-aplus' :
    rating === 'A'  ? 'rating-a' :
    rating === 'B'  ? 'rating-b' : 'rating-c';
  return <div className={`rating ${cls}`}>{rating}</div>;
}

export default function Home() {
  const [lbFilter, setLbFilter] = useState('all');
  const [gwInput,  setGwInput]  = useState('');
  const [gwResult, setGwResult] = useState(null);

  const leaderboard = LEADERBOARD_CARS
    .map(({ key, grid, km, yrs }) => calcLifecycle(key, grid, km, yrs))
    .filter(Boolean)
    .sort((a, b) => a.total - b.total);

  const filtered = lbFilter === 'all'
    ? leaderboard
    : leaderboard.filter(c => c.type === lbFilter);

  const maxCO2 = Math.max(...leaderboard.map(c => c.total));

  function checkGreenwash() {
    const lower = gwInput.toLowerCase();
    const FLAGS = [
      { term: 'zero emission',  score: -18, msg: '"Zero emissions" ignores manufacturing & battery disposal' },
      { term: 'carbon neutral', score: -22, msg: '"Carbon neutral" rarely includes supply chain' },
      { term: 'eco mode',       score: -8,  msg: '"Eco mode" savings are lab-tested, not real-world' },
      { term: 'green',          score: -6,  msg: 'Vague "green" language without data' },
      { term: 'clean energy',   score: -8,  msg: '"Clean energy" depends entirely on your grid' },
      { term: 'sustainable',    score: -5,  msg: 'Unverified "sustainable" claim' },
      { term: 'co2 free',       score: -20, msg: 'No car is CO₂-free when manufacturing is included' },
      { term: 'net zero',       score: -15, msg: '"Net zero": by when? By whose accounting?' },
      { term: 'lifecycle',      score: +12, msg: null },
      { term: 'verified',       score: +8,  msg: null },
    ];
    let score = 70;
    const flags = [];
    FLAGS.forEach(f => {
      if (lower.includes(f.term)) {
        score += f.score;
        if (f.msg) flags.push(f.msg);
      }
    });
    score = Math.max(5, Math.min(95, score));
    setGwResult({ score, flags });
  }

  return (
    <div style={{ paddingTop: 72 }}>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', minHeight: '100vh', background: 'var(--carbon)',
        color: 'var(--cream)', display: 'flex', alignItems: 'center',
        overflow: 'hidden', padding: '120px 0 80px',
        backgroundImage: "url('https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1600&q=80')",
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(61,74,46,0.22) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 20% 80%, rgba(196,75,43,0.08) 0%, transparent 60%), rgba(14,18,10,0.78)',
        }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        <div style={{
          maxWidth: 1160, margin: '0 auto', padding: '0 40px',
          display: 'grid', gridTemplateColumns: '1fr 380px',
          gap: 60, alignItems: 'center', position: 'relative', zIndex: 2, width: '100%',
        }}>
          <div>
            <motion.div {...fadeUp(0.1)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em',
              textTransform: 'uppercase', color: 'var(--olive-muted)', marginBottom: 24,
            }}>
              <Activity size={14} /> Lifecycle Emissions Intelligence
            </motion.div>

            <motion.h1 {...fadeUp(0.2)} style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(52px,6vw,84px)',
              fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.025em',
              color: 'var(--cream)', marginBottom: 24,
            }}>
              Your car has a<br />
              <em style={{ fontStyle: 'italic', color: 'var(--olive-muted)' }}>secret carbon</em><br />
              past.
            </motion.h1>

            <motion.p {...fadeUp(0.3)} style={{
              fontSize: 17, color: 'rgba(245,240,232,0.65)',
              lineHeight: 1.7, maxWidth: 440, marginBottom: 36,
            }}>
              Manufacturing. Fuel. Battery disposal. We show the full lifecycle cost:
              adjusted for your grid, state, and how you actually drive.
            </motion.p>

            <motion.div {...fadeUp(0.4)} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
              <Link to="/compare"    className="btn btn--primary"><BarChart2 size={15} /> Compare Cars</Link>
              <Link to="/calculator" className="btn btn--ghost"><Calculator size={15} /> My Carbon Score</Link>
            </motion.div>

            <motion.div {...fadeUp(0.5)} style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24,
              paddingTop: 36, borderTop: '1px solid rgba(245,240,232,0.08)',
            }}>
              {[
                ['14',  'Vehicles tracked'],
                ['67%', "India's grid on coal"],
                ['3',   'Hidden cost factors'],
                ['50+', 'Countries & regions'],
              ].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--cream)' }}>{num}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,240,232,0.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero widget */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="hero-widget"
            style={{
              background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(245,240,232,0.1)',
              borderRadius: 20, padding: 28, backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: 20 }}>
              Live Leaderboard · Maharashtra · 40km/day · 8yr
            </div>
            {leaderboard.slice(0, 4).map((car, i) => (
              <div key={car.key} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i < 3 ? '1px solid rgba(245,240,232,0.06)' : 'none',
              }}>
                <span className={`type-badge type-${car.type}`}>{car.type.toUpperCase()}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)', flex: 1 }}>{car.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(245,240,232,0.5)' }}>{car.total}t</span>
                <RatingBadge rating={car.rating} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AHA MOMENT ─────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream)', padding: '100px 0' }}>
        <div className="container">
          <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            What car ads hide
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, lineHeight: 1.1, maxWidth: 580, marginBottom: 52 }}
          >
            What they show you <em style={{ fontStyle: 'italic', color: 'var(--olive)' }}>vs</em><br />
            what we show you.
          </motion.h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>

            {/* Them */}
            <motion.div
              initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              style={{ flex: 1, minWidth: 280, background: 'var(--cream-dark)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 36 }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 24, opacity: .6 }}>
                ⚠ What car ads show
              </div>
              {[
                { icon: <Fuel size={22} color="var(--olive)" />,    label: 'Fuel efficiency',       val: '18 km/L ✓',  hidden: false },
                { icon: <Factory size={22} color="#ccc" />,          label: 'Manufacturing carbon',  val: 'not shown',  hidden: true  },
                { icon: <Battery size={22} color="#ccc" />,          label: 'Battery disposal',      val: 'not shown',  hidden: true  },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  {m.icon}
                  <span style={{ flex: 1, fontSize: 14 }}>{m.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: m.hidden ? 'var(--text-muted)' : 'var(--olive)', opacity: m.hidden ? .5 : 1 }}>{m.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: 20, borderRadius: 10, background: 'rgba(196,75,43,0.08)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700 }}>??t</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 6, opacity: .7 }}>Real total: unknown</div>
              </div>
            </motion.div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontStyle: 'italic', color: 'var(--text-muted)', flexShrink: 0 }}>vs</div>

            {/* Us */}
            <motion.div
              initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              style={{ flex: 1, minWidth: 280, background: 'var(--carbon)', color: 'var(--cream)', border: '1.5px solid rgba(245,240,232,0.08)', borderRadius: 20, padding: 36 }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 24, opacity: .6 }}>
                ✓ What CarbonWise shows
              </div>
              {[
                { icon: <Factory size={22} color="var(--rust)" />,        label: '🏭 Manufacturing',   val: '12t CO₂', color: 'var(--rust)'        },
                { icon: <Fuel    size={22} color="var(--amber)" />,        label: '⛽ Fuel / Energy',   val: '28t CO₂', color: 'var(--amber)'       },
                { icon: <Battery size={22} color="var(--olive-muted)" />,  label: '🔋 Battery Disposal',val: '8t CO₂',  color: 'var(--olive-muted)' },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
                  {m.icon}
                  <span style={{ flex: 1, fontSize: 14 }}>{m.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: m.color }}>{m.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: 20, borderRadius: 10, background: 'rgba(74,124,89,0.12)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700 }}>48t</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 6, opacity: .7 }}>Total lifecycle: the honest number</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── IMAGE STRIP ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', height: 260, overflow: 'hidden' }}>
        {[
          { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80', label: "India's coal grid reality" },
          { img: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=700&q=80', label: 'EV manufacturing carbon' },
          { img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80', label: 'Clean energy future' },
        ].map((item, i) => (
          <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
            <img src={item.img} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,10,0.45)' }} />
            <span style={{ position: 'absolute', bottom: 16, left: 20, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.7)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── LEADERBOARD ────────────────────────────────────────── */}
      <section style={{ background: 'var(--carbon)', padding: '100px 0', color: 'var(--cream)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div className="section-label" style={{ color: 'var(--olive-muted)' }}>Car Rankings</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--cream)' }}>
                The honest<br />leaderboard.
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'ev', 'hybrid', 'ice'].map(f => (
                <button
                  key={f}
                  onClick={() => setLbFilter(f)}
                  className={`filter-pill ${lbFilter === f ? 'active' : ''}`}
                  style={{ borderColor: 'rgba(245,240,232,0.14)', color: lbFilter === f ? 'var(--cream)' : 'rgba(245,240,232,0.5)' }}
                >
                  {f === 'all' ? 'All' : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(245,240,232,0.08)' }}>
                {['#', 'Vehicle', 'Type', 'Lifecycle CO₂', 'Carbon Score', 'Rating'].map(h => (
                  <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.28)', padding: '12px 20px', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((car, i) => {
                const pct      = (car.total / maxCO2) * 100;
                const barColor = car.total < 30 ? 'var(--green-ok)' : car.total < 55 ? 'var(--amber)' : 'var(--rust)';
                const rankStyle =
                  i === 0 ? { color: '#D4A82A' } :
                  i === 1 ? { color: 'rgba(245,240,232,0.5)' } :
                  i === 2 ? { color: '#C47840' } :
                            { color: 'rgba(245,240,232,0.25)' };
                return (
                  <motion.tr
                    key={car.key}
                    initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    style={{ borderBottom: '1px solid rgba(245,240,232,0.05)' }}
                  >
                    <td style={{ padding: '20px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, ...rankStyle }}>
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--cream)' }}>{car.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,240,232,0.3)', marginTop: 3 }}>{car.brand} · 2024</div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span className={`type-badge type-${car.type}`}>{car.type.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '20px', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--cream)' }}>
                      {car.total}t CO₂
                    </td>
                    <td style={{ padding: '20px 20px', paddingLeft: 8 }}>
                      <div style={{ height: 5, background: 'rgba(245,240,232,0.07)', borderRadius: 3, overflow: 'hidden', width: 160 }}>
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.08 }}
                          style={{ height: '100%', background: barColor, borderRadius: 3 }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <RatingBadge rating={car.rating} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── GREENWASHING ───────────────────────────────────────── */}
      <section style={{ background: 'var(--cream-dark)', padding: '100px 0' }}>
        <div className="container">
          <div className="section-label">Greenwashing Exposed</div>
          <h2 className="section-title" style={{ marginBottom: 8 }}>They lie.<br /><em>We expose it.</em></h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 48 }}>Real marketing claims. Real data contradicting them.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'start' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {GW_ALERTS.map((gw, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', gap: 16, padding: '20px 24px', background: 'var(--white)', border: '1.5px solid rgba(196,75,43,0.15)', borderRadius: 14 }}
                >
                  <div style={{ width: 36, height: 36, flexShrink: 0, background: 'rgba(196,75,43,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rust)' }}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{gw.brand}: {gw.claim}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{gw.reality}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Detector */}
            <div style={{ background: 'var(--carbon)', color: 'var(--cream)', borderRadius: 20, padding: 32, position: 'sticky', top: 96 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>🔍 Greenwash Detector</h3>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', marginBottom: 20 }}>Paste any car ad claim. We score its honesty.</p>
              <textarea
                value={gwInput}
                onChange={e => setGwInput(e.target.value)}
                placeholder="e.g. 'This vehicle produces zero emissions and is carbon neutral...'"
                style={{ width: '100%', minHeight: 100, padding: '12px 14px', resize: 'vertical', background: 'rgba(245,240,232,0.06)', border: '1.5px solid rgba(245,240,232,0.1)', borderRadius: 8, color: 'var(--cream)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }}
              />
              <button onClick={checkGreenwash} className="btn btn--rust" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                Check Honesty Score
              </button>
              {gwResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 16, padding: 16, background: 'rgba(196,75,43,0.08)', border: '1px solid rgba(196,75,43,0.2)', borderRadius: 10 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,240,232,0.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Honesty</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(245,240,232,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${gwResult.score}%` }}
                        transition={{ duration: 0.8 }}
                        style={{ height: '100%', background: gwResult.score > 65 ? 'var(--green-ok)' : gwResult.score > 40 ? 'var(--amber)' : 'var(--rust)', borderRadius: 3 }}
                      />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: gwResult.score > 65 ? 'var(--green-ok)' : gwResult.score > 40 ? 'var(--amber)' : 'var(--rust)' }}>
                      {gwResult.score}/100
                    </span>
                  </div>
                  {gwResult.flags.length > 0 && (
                    <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.6)', lineHeight: 1.6 }}>
                      <strong style={{ display: 'block', marginBottom: 6 }}>🚩 Red flags:</strong>
                      {gwResult.flags.map((f, i) => <div key={i} style={{ marginBottom: 4 }}>• {f}</div>)}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── REALITY TEASER ─────────────────────────────────────── */}
      <section style={{ background: 'var(--olive)', padding: '100px 0', color: 'var(--cream)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.5vw,30px)', fontStyle: 'italic', lineHeight: 1.5, borderLeft: '3px solid rgba(245,240,232,0.3)', paddingLeft: 28, marginBottom: 16 }}>
              "India added 3.2 million new cars in 2023. Each one will emit carbon for the next 10–15 years. Nobody told the buyers the full story."
            </blockquote>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: 'rgba(245,240,232,0.45)' }}>
              CEA India · SIAM Annual Report 2023
            </p>
            <Link to="/the-reality" className="btn btn--ghost" style={{ marginTop: 28 }}>
              Read Why This Matters →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { num: '2.1M', label: 'Indians die from air pollution yearly', img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=70' },
              { num: '14%',  label: 'Global CO₂ from transport',             img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=70' },
              { num: '67%',  label: "India's electricity from coal",          img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70' },
              { num: '₹0',   label: 'Carbon cost shown in any car ad',       img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70' },
            ].map((s) => (
              <motion.div
                key={s.label}
                whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', height: 130 }}
              >
                <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,18,10,0.85) 40%, rgba(14,18,10,0.25) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16, right: 8 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--cream)', lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,240,232,0.6)', letterSpacing: '.08em', marginTop: 4 }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS ───────────────────────────────────────────────── */}
      <section style={{ background: 'var(--cream)', padding: '100px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div className="section-label">What's Happening</div>
              <h2 className="section-title">Latest from the<br /><em>EV world.</em></h2>
            </div>
            <Link to="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--olive)', letterSpacing: '.06em' }}>
              See all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {NEWS_CARDS.map((card, i) => (
              <motion.a
                key={i}
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: '0 12px 48px rgba(0,0,0,0.13)' }}
                style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}
              >
                {/* ── IMAGE FIX ── */}
                <div style={{ height: 180, overflow: 'hidden' }}>
                  <img
                    src={card.img}
                    alt={card.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(80%)', transition: 'transform 0.5s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>

                <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--olive)', marginBottom: 10, fontWeight: 700 }}>
                    {card.source}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, flex: 1 }}>
                    {card.desc}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--olive)', letterSpacing: '.06em' }}>
                    Read article <ArrowUpRight size={13} />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .hero-widget { display: none; }
        }
        @media (max-width: 768px) {
          section > .container > div[style*="grid-template-columns: 1fr 420px"],
          section > .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
          table { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}