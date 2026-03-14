import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, Calculator, ArrowRight } from 'lucide-react';

const TOOLS = [
  {
    to: '/compare',
    icon: <BarChart2 size={28} />,
    tag: 'Most popular',
    tagColor: 'badge-green',
    title: 'Compare Cars',
    sub: 'Head-to-head lifecycle battle',
    desc: 'Pick up to 3 vehicles and compare their full carbon footprint: manufacturing, fuel/energy, and battery disposal, side by side. Adjust for your state grid and driving pattern.',
    cta: 'Start Comparing',
    color: 'var(--olive)',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&q=70',
  },
  {
    to: '/calculator',
    icon: <Calculator size={28} />,
    tag: 'Personalised',
    tagColor: 'badge-amber',
    title: 'Personal Calculator',
    sub: 'Find the best car for your life',
    desc: 'Tell us how you drive: daily km, years of ownership, state, and budget. We rank every car in our database and show you the lowest carbon option for your exact situation.',
    cta: 'Calculate My Score',
    color: 'var(--rust)',
    img: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=600&q=70',
  },
];

export default function GoGreen() {
  return (
    <div style={{ paddingTop: 72 }}>
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,30,16,0.65)' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
          <h1 className="page-hero__title">Go Green.<br /><em style={{ color: 'var(--olive-muted)', fontStyle: 'italic' }}>Make it count.</em></h1>
          <p className="page-hero__sub">Two tools. One goal: find the lowest carbon vehicle for your actual situation, not the marketing brochure version.</p>
        </div>
      </div>
      <section style={{ background: 'var(--cream)', padding: '80px 0 120px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, maxWidth: 880, margin: '0 auto' }}>
            {TOOLS.map((tool, i) => (
              <motion.div key={tool.to} initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.6 }} whileHover={{ y: -8 }} style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', padding: '40px 36px 32px', color: 'var(--cream)', overflow: 'hidden', minHeight: 200 }}>
                  <img src={tool.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: tool.color, opacity: 0.82 }} />
                  <div style={{ position: 'relative' }}>
                    <div style={{ marginBottom: 20, opacity: .9 }}>{tool.icon}</div>
                    <span className={`badge ${tool.tagColor}`} style={{ marginBottom: 12 }}>{tool.tag}</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>{tool.title}</h2>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6 }}>{tool.sub}</div>
                  </div>
                </div>
                <div style={{ padding: '28px 36px 36px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, flex: 1, marginBottom: 28 }}>{tool.desc}</p>
                  <Link to={tool.to} className="btn btn--primary" style={{ justifyContent: 'center' }}>
                    {tool.cta} <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <style>{`@media(max-width:640px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
