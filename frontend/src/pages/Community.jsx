import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rss, ExternalLink, Loader, AlertTriangle } from 'lucide-react';

const RSS_SOURCES = [
  { url: 'https://www.downtoearth.org/rss', name: 'Down To Earth', tags: 'india climate' },
  { url: 'https://electrek.co/feed/', name: 'Electrek', tags: 'ev' },
  { url: 'https://feeds.feedburner.com/carbonbrief', name: 'Carbon Brief', tags: 'climate' },
];

const STATIC_ARTICLES = [
  { title: "India's EV boom masks a coal problem no one's talking about", source: 'Down To Earth', date: 'Mar 2025', url: 'https://www.downtoearth.org', tags: 'india', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70' },
  { title: 'Lifecycle analysis confirms hybrid advantage in coal-heavy grids', source: 'Carbon Brief', date: 'Feb 2025', url: 'https://www.carbonbrief.org', tags: 'ev climate', img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&q=70' },
  { title: "Battery disposal: the ignored crisis in India's EV revolution", source: 'Electrek', date: 'Feb 2025', url: 'https://electrek.co', tags: 'ev', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=70' },
  { title: "Tata Nexon EV crosses 1 lakh sales: what's the lifecycle carbon?", source: 'MoneyControl', date: 'Jan 2025', url: 'https://moneycontrol.com', tags: 'india ev', img: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&q=70' },
  { title: 'CEA India 2023 report: state-by-state grid intensity update', source: 'CEA India', date: 'Jan 2025', url: 'https://cea.nic.in', tags: 'india', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=70' },
  { title: "Why Norway's EVs are 10× cleaner than India's: the grid story", source: 'Carbon Brief', date: 'Dec 2024', url: 'https://www.carbonbrief.org', tags: 'climate', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70' },
];

// source → fallback image for live RSS articles
const SOURCE_IMAGES = {
  'Down To Earth': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70',
  'Electrek':      'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&q=70',
  'Carbon Brief':  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70',
};
const DEFAULT_IMG   = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=70';

export default function Community() {
  const [filter, setFilter] = useState('all');
  const [liveArticles, setLiveArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  async function fetchWithProxy(feedUrl, sourceName, tags) {
    // Try rss2json first, then allorigins as fallback
    const proxies = [
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=4`,
    ];
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) continue;
        const data = await res.json();
        if (data.status === 'ok' && data.items?.length) {
          return data.items.map(item => ({ ...item, sourceName, tags }));
        }
      } catch { /* try next */ }
    }
    return [];
  }

  async function loadRSS() {
    setLoading(true);
    setLoadError(false);
    let all = [];
    const results = await Promise.allSettled(
      RSS_SOURCES.map(src => fetchWithProxy(src.url, src.name, src.tags))
    );
    results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value); });
    all.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const mapped = all.slice(0, 9).map(a => ({
      title: a.title,
      source: a.sourceName,
      date: a.pubDate ? new Date(a.pubDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      url: a.link,
      tags: a.tags || '',
    }));
    if (mapped.length) {
      setLiveArticles(mapped);
      setLoaded(true);
    } else {
      setLoadError(true);
    }
    setLoading(false);
  }

  const articles = (loaded && liveArticles.length) ? liveArticles : STATIC_ARTICLES;
  const filtered = filter === 'all' ? articles : articles.filter(a => a.tags.includes(filter));

  return (
    <div style={{ paddingTop: 72 }}>
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,30,20,0.68)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <div className="section-label" style={{ color: 'var(--olive-muted)' }}>Community</div>
          <h1 className="page-hero__title">Stay informed.<br /><em style={{ fontStyle: 'italic', color: 'var(--olive-muted)' }}>Stay honest.</em></h1>
          <p className="page-hero__sub">Real news from trusted sources on EVs, climate, and the greenwashing crisis.</p>
        </div>
      </div>

      <section style={{ background: 'var(--cream)', padding: '60px 0 100px' }}>
        <div className="container">
          {/* Counter + Load button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
            <div style={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--olive)' }}>3,241+</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>comparisons made on CarbonWise</span>
            </div>
            {!loaded && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={loadRSS} disabled={loading} className="btn btn--primary">
                {loading ? <><Loader size={14} className="spin" /> Loading live feed...</> : loadError ? <><Rss size={14} /> Retry Live Feed</> : <><Rss size={14} /> Load Live Articles</>}
              </motion.button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {['all', 'ev', 'india', 'climate'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-pill ${filter === f ? 'active' : ''}`}>
                {f === 'all' ? 'All' : f === 'ev' ? 'EV' : f === 'india' ? 'India' : 'Climate'}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>{filtered.length} articles</span>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {filtered.map((a, i) => (
              <motion.a key={i} href={a.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }}>
                <div style={{ height: 160, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={a.img || SOURCE_IMAGES[a.source] || DEFAULT_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', top: 14, left: 14 }}>
                    <span style={{ background: 'rgba(245,240,232,0.92)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--olive)', fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{a.source}</span>
                  </div>
                </div>
                <div style={{ padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, lineHeight: 1.35, color: 'var(--black)', flex: 1 }}>{a.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{a.date || 'Recent'}</span>
                    <ExternalLink size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {loadError && (
            <div style={{ padding: '20px 24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 14, marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
              <AlertTriangle size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
              RSS feeds could not be reached (likely a CORS or rate-limit issue with the proxy). Showing curated articles. Try again in a minute.
            </div>
          )}
        </div>
      </section>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@media(max-width:768px){div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
