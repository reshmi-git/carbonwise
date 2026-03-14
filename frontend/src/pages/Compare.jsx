import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BarChart2, Send, AlertTriangle, Trophy, Info, CheckCircle, XCircle, Bot, Share2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import D3BreakevenChart from '../components/D3BreakevenChart';
import { CARS, GRID_DATA, calcLifecycle, getGridIntensity } from '../data';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CAR_OPTIONS = Object.entries(CARS).map(([key, car]) => ({ value: key, label: `${car.name} (${car.type.toUpperCase()})` }));

const COUNTRY_OPTIONS = Object.entries(GRID_DATA)
  .filter(([k]) => k !== 'india')
  .map(([key, g]) => ({ value: key, label: `${g.label} (${g.intensity})`, intensity: g.intensity }));

function RatingBadge({ rating }) {
  const cls = rating === 'A+' ? 'rating-aplus' : rating === 'A' ? 'rating-a' : rating === 'B' ? 'rating-b' : 'rating-c';
  return <div className={`rating ${cls}`}>{rating}</div>;
}

export default function Compare() {
  const [carA, setCarA] = useState('nexon-ev');
  const [carB, setCarB] = useState('creta');
  const [carC, setCarC] = useState('');
  const [country, setCountry] = useState('india');
  const [state, setState]     = useState('MH');
  const [mileage, setMileage] = useState(40);
  const [years, setYears]     = useState(8);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  function shareResults() {
    const params = new URLSearchParams({ carA, carB, mileage, years, country, state });
    if (carC) params.set('carC', carC);
    const url = `${window.location.origin}/compare?${params.toString()}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        window.prompt('Copy this link:', url);
      });
    } else {
      window.prompt('Copy this link:', url);
    }
  }

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading]   = useState(false);

  const [gwInput, setGwInput]   = useState('');
  const [gwResult, setGwResult] = useState(null);

  const resultsRef = useRef(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('carA')) setCarA(p.get('carA'));
    if (p.get('carB')) setCarB(p.get('carB'));
    if (p.get('carC')) setCarC(p.get('carC'));
    if (p.get('mileage')) setMileage(+p.get('mileage'));
    if (p.get('years'))   setYears(+p.get('years'));
    if (p.get('country')) setCountry(p.get('country'));
    if (p.get('state'))   setState(p.get('state'));
  }, []);

  const gridIntensity = getGridIntensity(country, country === 'india' ? state : null);

  function runCompare() {
    const ra = calcLifecycle(carA, gridIntensity, mileage, years);
    const rb = calcLifecycle(carB, gridIntensity, mileage, years);
    const rc = carC ? calcLifecycle(carC, gridIntensity, mileage, years) : null;
    setResults({ ra, rb, rc });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  async function askAI() {
    if (!aiQuestion.trim() || !results) return;
    const q = aiQuestion.trim();
    setAiQuestion('');
    setAiMessages(prev => [...prev, { role: 'user', text: q }]);
    setAiLoading(true);
    const region = country === 'india'
      ? (GRID_DATA.india.states[state]?.label ?? state)
      : (GRID_DATA[country]?.label ?? country);
    const carSummary = [results.ra, results.rb, results.rc].filter(Boolean)
      .map(c => `${c.name} (${c.type.toUpperCase()}): mfg=${c.mfg}t, fuel=${c.fuel}t, battDisp=${c.battDisp}t, TOTAL=${c.total}t`)
      .join(' | ');
    const dynamicContext = `User scenario: ${region}, grid=${gridIntensity}kg CO₂/kWh, ${mileage}km/day, ${years} years ownership. Live lifecycle results: ${carSummary}. Battery disposal uses 0.14t CO₂/kWh formula (EEA 2021). Manufacturing from IVL/ARAI/GREET sources.`;
    try {
      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, context: dynamicContext, history: aiMessages }),
      });
      const data = await res.json();
      setAiMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Connection error.' }]);
    }
    setAiLoading(false);
  }

  function checkGW() {
    const lower = gwInput.toLowerCase();
    const FLAGS = [
      { term: 'zero emission', score: -18, msg: '"Zero emissions" ignores manufacturing & battery disposal' },
      { term: 'carbon neutral', score: -22, msg: '"Carbon neutral" rarely includes full supply chain' },
      { term: 'eco mode', score: -8, msg: '"Eco mode" savings are lab-tested, not real-world' },
      { term: 'green', score: -6, msg: 'Vague "green" language without lifecycle data' },
      { term: 'sustainable', score: -5, msg: 'Unverified "sustainable": no ISO 14040 LCA data.' },
      { term: 'co2 free', score: -20, msg: 'No car is CO₂-free including manufacturing' },
      { term: 'net zero', score: -15, msg: '"Net zero": by when, by whose accounting?' },
      { term: 'lifecycle', score: +12, msg: null },
      { term: 'verified', score: +8, msg: null },
    ];
    let score = 70; const flags = [];
    FLAGS.forEach(f => { if (lower.includes(f.term)) { score += f.score; if (f.msg) flags.push(f.msg); } });
    setGwResult({ score: Math.max(5, Math.min(95, score)), flags });
  }

  const cars = results ? [results.ra, results.rb, results.rc].filter(Boolean) : [];
  const winner = cars.length ? cars.reduce((a, b) => a.total < b.total ? a : b) : null;

  const barData = results ? {
    labels: cars.map(c => c.name),
    datasets: [{
      label: 'Total CO₂ (t)',
      data: cars.map(c => c.total),
      backgroundColor: cars.map(c => c.type === 'ev' ? '#4A7C59' : c.type === 'hybrid' ? '#D4860A' : '#C44B2B'),
      borderRadius: 4,
    }]
  } : null;

  const chartOpts = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v + 't' } } } };

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Page Hero */}
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(25,32,18,0.70)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <Link to="/go-green" className="page-hero__back"><ArrowLeft size={14} /> Back to Go Green</Link>
          <h1 className="page-hero__title">Compare Cars<br /><em style={{ fontStyle: 'italic', color: 'var(--olive-muted)' }}>by carbon,</em><br />not horsepower.</h1>
          <p className="page-hero__sub">Full lifecycle breakdown. Pick your cars. Set your scenario. See the truth.</p>
        </div>
      </div>

      {/* Form */}
      <section style={{ background: 'var(--cream)', padding: '60px 0' }}>
        <div className="container">
          <div className="section-label">Step 1: Choose Vehicles</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 32 }}>
            {[['Vehicle A', carA, setCarA], ['Vehicle B', carB, setCarB], ['Vehicle C (optional)', carC, setCarC]].map(([label, val, setter]) => (
              <div key={label} style={{ background: '#fff', border: `2px solid ${val ? 'var(--olive)' : 'var(--border)'}`, borderRadius: 14, padding: 24, transition: 'border-color 0.2s' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>{label}</div>
                <select className="form-select" value={val} onChange={e => setter(e.target.value)}>
                  {label.includes('optional') && <option value="">None</option>}
                  {CAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="section-label" style={{ marginTop: 32 }}>Step 2: Your Scenario</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, padding: 24, background: 'var(--cream-dark)', borderRadius: 14 }}>
            <div>
              <label className="form-label">Daily Mileage: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{mileage} km/day</span></label>
              <input type="range" className="form-range" min={10} max={150} value={mileage} onChange={e => setMileage(+e.target.value)} />
            </div>
            <div>
              <label className="form-label">Years of Ownership: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{years} years</span></label>
              <input type="range" className="form-range" min={1} max={15} value={years} onChange={e => setYears(+e.target.value)} />
            </div>
            <div>
              <label className="form-label">Country</label>
              <select className="form-select" value={country} onChange={e => setCountry(e.target.value)}>
                <option value="india">India (select state below)</option>
                {COUNTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {country === 'india' && (
              <div>
                <label className="form-label">State Grid: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{gridIntensity} kg CO₂/kWh</span></label>
                <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
                  {Object.entries(GRID_DATA.india.states).map(([k, s]) => (
                    <option key={k} value={k}>{s.label} ({s.intensity})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runCompare} className="btn btn--primary" style={{ padding: '16px 48px', fontSize: 14 }}>
              <BarChart2 size={16} /> Compare Now
            </motion.button>
          </div>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.section ref={resultsRef} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--cream-dark)', padding: '60px 0' }}>
            <div className="container">
              <div className="section-label">Results</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 8 }}>
                {cars.map(c => c.name).join(' vs ')}
              </h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.08em', marginBottom: 32 }}>
                {country === 'india' ? GRID_DATA.india.states[state]?.label : GRID_DATA[country]?.label} · {mileage}km/day · {years} years · {gridIntensity} kg CO₂/kWh
              </p>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 32 }}>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Total Lifecycle CO₂ (tonnes)</div>
                  <Bar data={barData} options={chartOpts} />
                </div>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Upfront Carbon Debt vs Long-Term Savings</div>
                    <div title="Manufacturing + battery disposal carbon is paid upfront. As km accumulates, the vehicle with lowest fuel emissions pulls ahead. Where lines diverge = your savings compound." style={{ cursor: 'help', color: 'var(--text-muted)' }}><Info size={13} /></div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '.06em' }}>
                    D3.js · Shaded band = manufacturing carbon debt zone · Hover for values
                  </div>
                  <D3BreakevenChart cars={cars} mileage={mileage} years={years} />
                </div>
              </div>

              {/* Scorecard */}
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <thead>
                  <tr>
                    <th style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '14px 20px', background: 'var(--cream-dark)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Category</th>
                    {cars.map(c => <th key={c.key} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '14px 20px', background: 'var(--cream-dark)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{c.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: '🏭 Manufacturing', key: 'mfg' },
                    { label: '⛽ Fuel / Energy', key: 'fuel' },
                    { label: '🔋 Battery Disposal', key: 'battDisp' },
                    { label: 'TOTAL LIFECYCLE', key: 'total', bold: true },
                  ].map(row => (
                    <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '18px 20px', fontSize: 14, fontWeight: row.bold ? 700 : 400, fontFamily: row.bold ? 'var(--font-mono)' : 'inherit', textTransform: row.bold ? 'uppercase' : 'none', letterSpacing: row.bold ? '.1em' : 0, fontSize: row.bold ? 12 : 14 }}>{row.label}</td>
                      {cars.map(c => {
                        const val = c[row.key];
                        const minVal = Math.min(...cars.map(x => x[row.key] || 0));
                        const color = row.bold ? (val === minVal ? 'var(--green-ok)' : 'var(--rust)') : 'inherit';
                        return (
                          <td key={c.key} style={{ padding: '18px 20px', fontSize: row.bold ? 18 : 14, fontWeight: row.bold ? 700 : 400, color }}>
                            {val ? `${val}t CO₂` : 'N/A'} {row.bold && val === minVal ? <CheckCircle size={14} style={{ color: 'var(--green-ok)', display: 'inline', marginLeft: 4 }} /> : row.bold ? <XCircle size={14} style={{ color: 'var(--rust)', display: 'inline', marginLeft: 4 }} /> : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* AI Panel */}
              <div style={{ background: 'var(--carbon)', color: 'var(--cream)', borderRadius: 14, padding: 36, marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <Bot size={20} style={{ color: 'var(--olive-muted)' }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>AI Recommendation</div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--olive-muted)', marginLeft: 'auto' }}>Powered by Groq</span>
                </div>
                <div style={{ fontSize: 15, color: 'rgba(245,240,232,.8)', lineHeight: 1.7, marginBottom: 20 }}>
                  {winner && `In ${country === 'india' ? GRID_DATA.india.states[state]?.label : GRID_DATA[country]?.label} at ${mileage}km/day over ${years} years, the `}
                  <strong>{winner?.name}</strong>
                  {winner && ` wins with ${winner.total}t total lifecycle CO₂, the lowest of your selected vehicles. ${winner.type === 'ev' ? `Despite higher manufacturing cost (${winner.mfg}t), its clean running emissions dominate over ${years} years.` : winner.type === 'hybrid' ? `Its efficient engine balances manufacturing and running costs well on your grid.` : `Lower manufacturing and moderate running costs give it the edge here.`}`}
                </div>

                {aiMessages.map((m, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 8, background: m.role === 'user' ? 'rgba(245,240,232,0.08)' : 'rgba(61,74,46,0.2)', fontSize: 14 }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', opacity: .6 }}>{m.role === 'user' ? 'YOU ASKED' : 'AI REPLY'}</strong>
                    <div style={{ marginTop: 6, lineHeight: 1.6 }}>{m.text}</div>
                  </div>
                ))}
                {aiLoading && <div style={{ padding: '10px 16px', opacity: .5, fontStyle: 'italic', fontSize: 14 }}>Thinking...</div>}

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <input
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askAI()}
                    placeholder="Ask a follow-up e.g. 'what if I move to Himachal Pradesh?'"
                    style={{ flex: 1, background: 'rgba(245,240,232,.06)', border: '1px solid rgba(245,240,232,.12)', borderRadius: 8, padding: '12px 16px', color: 'var(--cream)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }}
                  />
                  <button onClick={askAI} className="btn btn--rust" disabled={aiLoading}>
                    <Send size={14} /> Ask AI
                  </button>
                </div>
              </div>

              {/* Greenwash Detector */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 32, marginTop: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={20} style={{ color: 'var(--rust)' }} /> Greenwash Detector
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>Paste any marketing claim from these cars to check its honesty.</p>
                <textarea value={gwInput} onChange={e => setGwInput(e.target.value)} placeholder="e.g. 'This vehicle produces zero emissions and is carbon neutral...'" style={{ width: '100%', minHeight: 90, padding: '12px 14px', resize: 'vertical', background: 'var(--cream-dark)', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }} />
                <button onClick={checkGW} className="btn btn--rust" style={{ marginTop: 12 }}>Check Honesty Score</button>
                {gwResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, padding: 16, background: 'rgba(196,75,43,.06)', border: '1px solid rgba(196,75,43,.2)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${gwResult.score}%` }} transition={{ duration: 0.8 }} style={{ height: '100%', background: gwResult.score > 65 ? 'var(--green-ok)' : gwResult.score > 40 ? 'var(--amber)' : 'var(--rust)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: gwResult.score > 65 ? 'var(--green-ok)' : gwResult.score > 40 ? 'var(--amber)' : 'var(--rust)' }}>{gwResult.score}/100</span>
                    </div>
                    {gwResult.flags.map((f, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'flex-start', gap: 6 }}><AlertTriangle size={13} style={{ color: 'var(--rust)', flexShrink: 0, marginTop: 2 }} />{f}</div>)}
                  </motion.div>
                )}
              </div>

              {/* Winner Banner */}
              {winner && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, var(--olive) 0%, var(--olive-light) 100%)', color: 'var(--cream)', borderRadius: 14, padding: 36, marginTop: 32, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                  <Trophy size={56} style={{ flexShrink: 0, opacity: .8 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(245,240,232,.6)', marginBottom: 8 }}>Best for your inputs</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700 }}>{winner.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(245,240,232,.7)', marginTop: 4 }}>
                      {winner.total}t total · Rating {winner.rating} · {mileage}km/day · {years} years
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                    <button onClick={shareResults} className="btn btn--ghost">
                      <Share2 size={14} /> {copied ? 'Copied!' : 'Share Results'}
                    </button>
                    <Link to="/calculator" className="btn" style={{ background: '#fff', color: 'var(--olive)' }}>
                      Calculate Personally
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3,1fr)"],
          div[style*="grid-template-columns: 1fr 1fr"],
          div[style*="grid-template-columns: repeat(2,1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
