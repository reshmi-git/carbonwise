import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, BookOpen } from 'lucide-react';
import { CARS, calcLifecycle } from '../data';

const INSIGHTS = [
  { stat: '5×', desc: 'A Nexon EV in Himachal is 5× cleaner than a Nexon EV in Jharkhand', src: 'CarbonWise data', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70' },
  { stat: '31t', desc: 'CO₂ saved over 10 years by choosing a Prius over a Creta in Maharashtra', src: 'CarbonWise model', img: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=400&q=70' },
  { stat: '12t', desc: 'Manufacturing carbon hidden in every EV before it moves 1 km', src: 'EPA lifecycle study', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=70' },
  { stat: '67%', desc: "India's electricity from coal. The context every EV buyer needs.", src: 'CEA 2023', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70' },
];

function RatingBadge({ rating }) {
  const cls = rating === 'A+' ? 'rating-aplus' : rating === 'A' ? 'rating-a' : rating === 'B' ? 'rating-b' : 'rating-c';
  return <div className={`rating ${cls}`}>{rating}</div>;
}

export default function Insights() {
  const [filter, setFilter] = useState('all');

  const allCars = Object.keys(CARS).map(k => calcLifecycle(k, 0.82, 40, 8)).filter(Boolean).sort((a,b) => a.total - b.total);
  const filtered = filter === 'all' ? allCars : allCars.filter(c => c.type === filter);
  const maxCO2 = Math.max(...allCars.map(c => c.total));

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,35,20,0.72)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <div className="section-label" style={{ color: 'var(--olive-muted)' }}>Data Insights</div>
          <h1 className="page-hero__title">What the data<br /><em style={{ fontStyle: 'italic', color: 'var(--olive-muted)' }}>actually says.</em></h1>
          <p className="page-hero__sub">Original findings from our lifecycle model. Maharashtra grid · 40km/day · 8 years.</p>
        </div>
      </div>

      {/* Key stats */}
      <section style={{ background: 'var(--cream-dark)', padding: '72px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {INSIGHTS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ height: 120, overflow: 'hidden', position: 'relative' }}>
                  <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.45))' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 16, fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{s.stat}</div>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 10 }}>{s.desc}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{s.src}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full leaderboard */}
      <section style={{ background: 'var(--cream)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div className="section-label">Full Leaderboard</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700 }}>Every car.<br />Ranked honestly.</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all','ev','hybrid','ice'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? 'active' : ''}`}>
                  {f === 'all' ? 'All' : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cream-dark)', borderBottom: '1px solid var(--border)' }}>
                  {['#','Vehicle','Type','Mfg','Fuel CO₂','Total CO₂','Bar','Rating'].map(h => (
                    <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '14px 20px', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((car, i) => {
                  const pct = (car.total / maxCO2) * 100;
                  const barColor = car.total < 30 ? 'var(--green-ok)' : car.total < 55 ? 'var(--amber)' : 'var(--rust)';
                  return (
                    <motion.tr key={car.key} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '18px 20px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: i === 0 ? '#D4A82A' : i === 1 ? '#A0A8A0' : i === 2 ? '#C47840' : 'var(--text-muted)' }}>{String(i+1).padStart(2,'0')}</td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{car.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{car.brand}</div>
                      </td>
                      <td style={{ padding: '18px 20px' }}><span className={`type-badge type-${car.type}`}>{car.type.toUpperCase()}</span></td>
                      <td style={{ padding: '18px 20px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>{car.mfg}t</td>
                      <td style={{ padding: '18px 20px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>{car.fuel}t</td>
                      <td style={{ padding: '18px 20px', fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: barColor }}>{car.total}t</td>
                      <td style={{ padding: '18px 20px', paddingRight: 8 }}>
                        <div style={{ height: 5, width: 120, background: 'var(--cream-mid)', borderRadius: 3, overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ height: '100%', background: barColor, borderRadius: 3 }} />
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}><RatingBadge rating={car.rating} /></td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 28, padding: 20, background: 'var(--cream-dark)', borderRadius: 12 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={12} /> Maharashtra grid (0.82 kg CO₂/kWh, CEA 2023) · 40 km/day · 8 years ownership
            </p>
          </div>

          {/* Data Sources */}
          <div style={{ marginTop: 20, padding: 24, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={12} /> Data Sources &amp; Methodology
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              {[
                { label: 'Manufacturing CO₂', src: 'IVL Swedish Environmental Research Institute (2019 & 2022 update); ARAI India; ANL GREET 2023' },
                { label: 'Battery Disposal', src: 'EEA Report No 14/2021: 0.14 t CO₂/kWh net (after recycling credit). Battery kWh from manufacturer spec sheets.' },
                { label: 'Fuel Consumption (ICE)', src: 'ARAI certified figures (Automotive Research Association of India). Petrol emission factor: 2.31 kg CO₂/litre (IPCC AR6, MoEFCC India).' },
                { label: 'EV Energy Consumption', src: 'MIDC/WLTP certified figures from manufacturer Type Approval certificates and ARAI test data.' },
                { label: 'Grid Intensity: India', src: 'Central Electricity Authority (CEA), CO₂ Baseline Database v18, 2023. State-wise emission factors.' },
                { label: 'Grid Intensity: Global', src: 'IEA Electricity 2023 report; EPA eGRID 2023 (USA). Values in kg CO₂/kWh.' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 14px', background: 'var(--cream-dark)', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--olive)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.src}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Photo mosaic */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginTop: 48, borderRadius: 20, overflow: 'hidden', height: 280 }}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80" alt="Solar panels" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,18,10,0.65) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Renewable grid = cleaner EVs</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 6, letterSpacing: '.1em', textTransform: 'uppercase' }}>Grid intensity shapes everything</div>
              </div>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80" alt="EV manufacturing" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,10,0.45)' }} />
              <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '.1em', textTransform: 'uppercase' }}>12t hidden cost</div>
              </div>
            </div>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" alt="Coal plant" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,10,0.45)' }} />
              <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '.1em', textTransform: 'uppercase' }}>67% coal grid</div>
              </div>
            </div>
          </div>

        </div>
      </section>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: repeat(4"]{grid-template-columns:repeat(2,1fr)!important}table{font-size:12px}}`}</style>
    </div>
  );
}
