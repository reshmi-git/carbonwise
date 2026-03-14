import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const STATS = [
  { num: '2.1M', label: 'Indians die from air pollution every year', src: 'WHO 2023', img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=70' },
  { num: '14%', label: 'Of global CO₂ comes from transport', src: 'IEA 2023', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=70' },
  { num: '67%', label: "India's electricity still from coal", src: 'CEA 2023', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70' },
  { num: '3.2M', label: 'New cars sold in India in 2023. None showed lifecycle data', src: 'SIAM 2023', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70' },
];

const TACTICS = [
  { title: '"Zero Emissions"', reality: 'Hides 10–16 tonnes of manufacturing carbon. Every EV has a carbon debt before it moves 1 km.', severity: 'high' },
  { title: '"Carbon Neutral by 2030"', reality: 'No verified binding plan from any Indian automaker. Self-declared, third-party unverified.', severity: 'high' },
  { title: '"Eco Mode Saves 40%"', reality: 'Lab tested. Real-world saving: 8–13%. The gap is the lie.', severity: 'medium' },
  { title: '"Clean Energy Vehicle"', reality: 'An EV charged on Jharkhand\'s coal grid emits more than a Prius. "Clean" depends entirely on the grid.', severity: 'medium' },
  { title: '"Our EVs are Green"', reality: 'Manufacturing lithium batteries = 12–16t CO₂. This is never disclosed.', severity: 'high' },
];

const GRID_STATES = [
  { state: 'Himachal Pradesh', val: 0.12, bar: 11 },
  { state: 'Kerala', val: 0.18, bar: 16 },
  { state: 'Delhi', val: 0.78, bar: 71 },
  { state: 'Maharashtra', val: 0.82, bar: 75 },
  { state: 'Madhya Pradesh', val: 0.96, bar: 87 },
  { state: 'Jharkhand', val: 1.10, bar: 100 },
];

export default function TheReality() {
  return (
    <div style={{ paddingTop: 72 }}>
      {/* Hero */}
      <div style={{ background: 'var(--carbon)', color: 'var(--cream)', padding: '120px 0 80px', position: 'relative', backgroundImage: 'url(https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,10,0.82)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <div className="section-label" style={{ color: 'var(--olive-muted)' }}>The Uncomfortable Truth</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px,7vw,88px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.025em', maxWidth: 720, marginBottom: 24, color: 'var(--cream)' }}>
            The car industry<br /><em style={{ fontStyle: 'italic', color: 'var(--rust)' }}>is lying to you.</em>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(245,240,232,.6)', maxWidth: 520, lineHeight: 1.7 }}>
            Every car ad shows you fuel economy. None show you manufacturing emissions, battery disposal, or your state's coal grid. We do.
          </p>
        </div>
      </div>

      {/* Stats */}
      <section style={{ background: 'var(--cream-dark)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ height: 110, overflow: 'hidden', position: 'relative' }}>
                  <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.55))' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 16, fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{s.num}</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{s.src}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid reality */}
      <section style={{ background: 'var(--carbon)', color: 'var(--cream)', padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="section-label" style={{ color: 'var(--olive-muted)' }}>India Grid Reality</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 20, color: 'var(--cream)' }}>
              Same EV. Wildly different<br /><em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>carbon footprint.</em>
            </h2>
            <p style={{ color: 'rgba(245,240,232,.6)', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
              A Nexon EV charged in Himachal Pradesh uses hydro power. The same car in Jharkhand uses coal. The carbon difference is massive, and nobody tells you this.
            </p>
            <Link to="/compare" className="btn btn--primary">See This in Action →</Link>
          </div>
          <div>
            {GRID_STATES.map((g, i) => {
              const color = g.val < 0.3 ? 'var(--green-ok)' : g.val < 0.7 ? 'var(--amber)' : 'var(--rust)';
              return (
                <motion.div key={g.state} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <span style={{ fontSize: 13, width: 160, flexShrink: 0, color: 'rgba(245,240,232,.6)' }}>{g.state}</span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(245,240,232,.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${g.bar}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.08 }} style={{ height: '100%', background: color, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, width: 36, textAlign: 'right' }}>{g.val}</span>
                </motion.div>
              );
            })}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,240,232,.3)', marginTop: 16, letterSpacing: '.08em' }}>kg CO₂/kWh · Source: CEA India 2023</p>
          </div>
        </div>
      </section>

      {/* Photo banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 320, overflow: 'hidden' }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80" alt="Coal power plant" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(14,18,10,0.7) 0%, rgba(14,18,10,0.2) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 28, left: 32 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>67% coal.<br />Every EV charge.</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>CEA India 2023</div>
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80" alt="Car manufacturing" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(14,18,10,0.65) 0%, rgba(14,18,10,0.15) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 28, right: 32, textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>12–16t CO₂<br />before km 1.</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Manufacturing debt · IVL 2022</div>
          </div>
        </div>
      </div>

      {/* Greenwashing tactics */}
      <section style={{ background: 'var(--cream)', padding: '80px 0' }}>
        <div className="container">
          <div className="section-label">Greenwashing Tactics</div>
          <h2 className="section-title" style={{ marginBottom: 8 }}>The playbook<br /><em>they all use.</em></h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 48 }}>Five real tactics from Indian car marketing. Five ways you're being misled.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TACTICS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, padding: '24px 28px', background: 'var(--white)', border: `1.5px solid ${t.severity === 'high' ? 'rgba(196,75,43,0.25)' : 'var(--border)'}`, borderRadius: 14 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--rust)', marginBottom: 6 }}>{t.title}</div>
                  <span className={`badge ${t.severity === 'high' ? 'badge-red' : 'badge-amber'}`}>{t.severity === 'high' ? 'High severity' : 'Medium'}</span>
                </div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, borderLeft: '2px solid var(--border)', paddingLeft: 24 }}>{t.reality}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tactics photo interlude */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1400&q=80" alt="Car marketing" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,10,0.72)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,36px)', fontStyle: 'italic', color: '#fff', lineHeight: 1.4, maxWidth: 680, marginBottom: 16 }}>
            "3.2 million new cars sold in India in 2023. Not one showed lifecycle emissions data."
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>SIAM Annual Report 2023</div>
        </div>
      </div>

      {/* CTA */}
      <section style={{ background: 'var(--olive)', color: 'var(--cream)', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>Now you know the truth.<br /><em style={{ fontStyle: 'italic' }}>Use it.</em></h2>
          <p style={{ fontSize: 17, color: 'rgba(245,240,232,.6)', marginBottom: 36 }}>Compare any vehicle with real lifecycle data. No greenwashing, no spin.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/compare" className="btn btn--primary">Compare Cars</Link>
            <Link to="/calculator" className="btn btn--ghost">Personal Calculator</Link>
          </div>
        </div>
      </section>
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"],div[style*="grid-template-columns: repeat(4"]{grid-template-columns:1fr!important}div[style*="grid-template-columns: 200px"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
