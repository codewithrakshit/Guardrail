import { useState, useEffect, useRef } from "react";

// ─── CSS ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.gr-root {
  --bg: #09090b; --surface: #111113; --surface2: #18181b; --surface3: #1c1c1f;
  --border: rgba(255,255,255,0.07); --border-h: rgba(255,255,255,0.14);
  --text: #fafafa; --muted: #a1a1aa; --subtle: #52525b;
  --green: #4ade80; --green-d: rgba(74,222,128,0.10); --green-b: rgba(74,222,128,0.18);
  --red: #f87171; --red-d: rgba(248,113,113,0.10);
  --amber: #fbbf24; --amber-d: rgba(251,191,36,0.10);
  --blue: #60a5fa; --blue-d: rgba(96,165,250,0.10);
  background: var(--bg); color: var(--text);
  font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.7;
  -webkit-font-smoothing: antialiased; min-height: 100vh; overflow-x: hidden;
  position: relative;
}
.gr-root[data-theme="light"] {
  --bg: #ffffff; --surface: #fafafa; --surface2: #f4f4f5; --surface3: #ececee;
  --border: rgba(0,0,0,0.07); --border-h: rgba(0,0,0,0.14);
  --text: #09090b; --muted: #71717a; --subtle: #a1a1aa;
  --green: #16a34a; --green-d: rgba(22,163,74,0.08); --green-b: rgba(22,163,74,0.2);
  --red: #dc2626; --red-d: rgba(220,38,38,0.08);
  --amber: #d97706; --amber-d: rgba(217,119,6,0.08);
  --blue: #2563eb; --blue-d: rgba(37,99,235,0.08);
}
.gr-root::before {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
  opacity:.35;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E");
}

/* NAV */
.gr-nav {
  position:sticky; top:0; z-index:100;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 2rem; height:60px;
  background:rgba(9,9,11,0.82); backdrop-filter:blur(14px);
  border-bottom:1px solid var(--border);
}
.gr-root[data-theme="light"] .gr-nav { background:rgba(255,255,255,0.88); }
.gr-logo {
  font-family:'Instrument Serif',serif; font-size:1.1rem; letter-spacing:-0.02em;
  color:var(--text); text-decoration:none; display:flex; align-items:center; gap:.5rem; cursor:pointer; border:none; background:none;
}
.gr-shield {
  width:22px; height:22px; border-radius:5px; background:var(--green);
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.gr-nav-links { display:flex; align-items:center; gap:1.5rem; list-style:none; }
.gr-nav-links a {
  color:var(--muted); text-decoration:none; font-size:.875rem; transition:color .15s; cursor:pointer;
}
.gr-nav-links a:hover { color:var(--text); }
.gr-nav-r { display:flex; align-items:center; gap:.625rem; }

/* BUTTONS */
.btn-p {
  background:var(--text); color:var(--bg); border:none;
  padding:.625rem 1.25rem; border-radius:7px; font-size:.875rem;
  font-family:inherit; font-weight:500; cursor:pointer; text-decoration:none;
  display:inline-flex; align-items:center; gap:.4rem; transition:opacity .15s;
}
.btn-p:hover { opacity:.88; }
.btn-p.sm { padding:.375rem .875rem; font-size:.8125rem; }
.btn-o {
  background:none; color:var(--muted); border:1px solid var(--border);
  padding:.625rem 1.25rem; border-radius:7px; font-size:.875rem;
  font-family:inherit; cursor:pointer; text-decoration:none;
  display:inline-flex; align-items:center; gap:.4rem; transition:all .15s;
}
.btn-o:hover { border-color:var(--border-h); color:var(--text); }
.btn-o.sm { padding:.375rem .875rem; font-size:.8125rem; }
.btn-ghost {
  background:none; border:1px solid var(--border); color:var(--muted);
  padding:.375rem .875rem; border-radius:6px; font-size:.8125rem;
  font-family:inherit; cursor:pointer; transition:all .15s;
  display:inline-flex; align-items:center; gap:.4rem;
}
.btn-ghost:hover { border-color:var(--border-h); color:var(--text); background:var(--surface2); }
.btn-icon {
  width:32px; height:32px; border-radius:6px; border:1px solid var(--border);
  background:none; color:var(--muted); cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:all .15s; font-size:13px;
}
.btn-icon:hover { background:var(--surface2); color:var(--text); }
.btn-full { width:100%; justify-content:center; }

/* LAYOUT */
.gr-main { position:relative; z-index:1; }
.container { max-width:920px; margin:0 auto; padding:0 2rem; }
.divider { max-width:920px; margin:0 auto; height:1px; background:var(--border); }
.sec-label {
  font-size:.75rem; text-transform:uppercase; letter-spacing:.1em;
  color:var(--subtle); font-weight:500; margin-bottom:1.25rem;
}
.serif { font-family:'Instrument Serif',serif; }
.mono { font-family:'JetBrains Mono',monospace; }

/* BADGES */
.badge {
  font-size:.6875rem; font-weight:500; padding:.2rem .65rem;
  border-radius:100px; display:inline-block; letter-spacing:.02em;
}
.badge-crit { background:var(--red-d); color:var(--red); border:1px solid rgba(248,113,113,.2); }
.badge-safe { background:var(--green-d); color:var(--green); border:1px solid var(--green-b); }
.badge-warn { background:var(--amber-d); color:var(--amber); border:1px solid rgba(251,191,36,.2); }
.badge-info { background:var(--blue-d); color:var(--blue); border:1px solid rgba(96,165,250,.2); }

/* HERO */
.hero { max-width:920px; margin:0 auto; padding:6rem 2rem 5rem; text-align:center; }
.hero-badge {
  display:inline-flex; align-items:center; gap:.5rem;
  background:var(--green-d); border:1px solid var(--green-b);
  color:var(--green); font-size:.75rem; font-weight:500;
  padding:.3rem .875rem; border-radius:100px; margin-bottom:2rem;
  letter-spacing:.02em; text-transform:uppercase;
}
.hero-badge::before {
  content:''; width:6px; height:6px; border-radius:50%;
  background:var(--green); animation:pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }
.hero h1 {
  font-family:'Instrument Serif',serif;
  font-size:clamp(2.6rem,6vw,4.5rem); font-weight:400;
  line-height:1.08; letter-spacing:-.03em; margin-bottom:1.5rem;
}
.hero h1 em { font-style:italic; color:var(--muted); }
.hero-sub { font-size:1.0625rem; color:var(--muted); max-width:540px; margin:0 auto 2.5rem; font-weight:300; }
.hero-ctas { display:flex; align-items:center; justify-content:center; gap:.75rem; flex-wrap:wrap; margin-bottom:3.5rem; }

/* CODE PREVIEW */
.code-box {
  background:var(--surface); border:1px solid var(--border);
  border-radius:12px; overflow:hidden; text-align:left;
  max-width:700px; margin:0 auto;
}
.code-box-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:.875rem 1.25rem; border-bottom:1px solid var(--border);
  background:var(--surface2);
}
.mac-dots { display:flex; gap:6px; }
.mac-dots span { width:10px; height:10px; border-radius:50%; }
.mac-r { background:#ff5f57; } .mac-y { background:#febc2e; } .mac-g { background:#28c840; }
.code-file { font-family:'JetBrains Mono',monospace; font-size:.75rem; color:var(--subtle); }
.code-body { padding:1.25rem; overflow-x:auto; }
.code-body pre {
  font-family:'JetBrains Mono',monospace; font-size:.8rem;
  line-height:1.65; color:var(--muted); white-space:pre;
}
.cv { color:var(--red); } .cs { color:var(--green); }
.cc { color:var(--subtle); } .ck { color:#c084fc; }
.cstr { color:var(--amber); } .cf { color:var(--blue); }

/* STATS BAR */
.stats-bar {
  display:grid; grid-template-columns:repeat(4,1fr);
  border:1px solid var(--border); border-radius:12px;
  background:var(--surface); margin:3rem auto; max-width:920px; padding:0 2rem;
}
.stat-item {
  padding:1.75rem 2rem; text-align:center;
  border-right:1px solid var(--border);
}
.stat-item:last-child { border-right:none; }
.stat-n {
  font-family:'Instrument Serif',serif; font-size:2.25rem;
  font-weight:400; letter-spacing:-.03em; display:block;
}
.stat-l { font-size:.8125rem; color:var(--muted); margin-top:.2rem; }

/* PROBLEM */
.problem-grid {
  display:grid; grid-template-columns:1fr 1fr;
  gap:1px; background:var(--border);
  border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-top:2.5rem;
}
.prob-card { background:var(--bg); padding:2rem; transition:background .15s; }
.prob-card:hover { background:var(--surface); }
.prob-icon {
  width:28px; height:28px; border-radius:6px; border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0;
}
.prob-card ul { list-style:none; display:flex; flex-direction:column; gap:.625rem; }
.prob-card ul li {
  font-size:.875rem; color:var(--muted);
  display:flex; align-items:flex-start; gap:.5rem; font-weight:300;
}
.li-x { color:var(--red); font-size:.8rem; margin-top:.15rem; flex-shrink:0; }
.gap-card {
  grid-column:1 / -1; background:var(--surface2); padding:1.75rem 2rem;
  display:flex; align-items:center; justify-content:space-between; gap:1rem;
}
.gap-pill {
  background:var(--amber-d); border:1px solid rgba(251,191,36,.2);
  color:var(--amber); font-size:.75rem; font-weight:500;
  padding:.3rem .75rem; border-radius:100px; white-space:nowrap;
  letter-spacing:.02em; text-transform:uppercase;
}

/* SOLUTION */
.sol-intro { display:grid; grid-template-columns:1fr 1fr; gap:3rem; margin-bottom:2rem; align-items:start; }
.sol-checks { display:flex; flex-direction:column; gap:.75rem; }
.sol-check {
  display:flex; align-items:flex-start; gap:.75rem;
  padding:.875rem 1rem; border-radius:8px;
  border:1px solid var(--border); transition:background .15s;
}
.sol-check:hover { background:var(--surface); }
.chk-ico {
  width:20px; height:20px; border-radius:50%;
  background:var(--green-d); border:1px solid var(--green-b);
  display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px;
}

/* COMPARE TABLE */
.cmp-table { width:100%; border-collapse:collapse; border:1px solid var(--border); border-radius:10px; overflow:hidden; margin-top:2.5rem; }
.cmp-table th,.cmp-table td { padding:.875rem 1.25rem; text-align:left; font-size:.875rem; border-bottom:1px solid var(--border); }
.cmp-table th { background:var(--surface2); color:var(--muted); font-weight:500; font-size:.8125rem; text-transform:uppercase; letter-spacing:.06em; }
.cmp-table td { color:var(--muted); font-weight:300; }
.cmp-table td:first-child { color:var(--subtle); }
.cmp-table tr:last-child td { border-bottom:none; }
.cmp-table tr:hover td { background:var(--surface); }
.td-o { color:var(--red) !important; }
.td-n { color:var(--green) !important; font-weight:400 !important; }

/* FEATURES GRID */
.feat-grid {
  display:grid; grid-template-columns:repeat(3,1fr);
  gap:1px; background:var(--border);
  border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-top:2.5rem;
}
.feat-card { background:var(--bg); padding:1.75rem; transition:background .15s; }
.feat-card:hover { background:var(--surface); }
.feat-ico {
  width:34px; height:34px; border-radius:8px;
  border:1px solid var(--border); background:var(--surface2);
  display:flex; align-items:center; justify-content:center; margin-bottom:1rem; font-size:14px;
}
.feat-card h3 { font-family:'Instrument Serif',serif; font-size:1.05rem; font-weight:400; letter-spacing:-.01em; margin-bottom:.5rem; }
.feat-card p { font-size:.875rem; color:var(--muted); line-height:1.6; font-weight:300; }
.ch-pills { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.875rem; }
.ch-pill {
  display:flex; align-items:center; gap:.35rem;
  background:var(--surface2); border:1px solid var(--border);
  padding:.25rem .65rem; border-radius:100px; font-size:.75rem; color:var(--muted);
}
.ch-dot { width:5px; height:5px; border-radius:50%; background:var(--green); }

/* HOW IT WORKS */
.how-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; margin-top:2.5rem; }
.how-step {
  background:var(--surface); border:1px solid var(--border);
  border-radius:12px; padding:1.75rem; transition:border-color .15s;
}
.how-step:hover { border-color:var(--border-h); }
.step-n {
  font-family:'Instrument Serif',serif; font-size:3rem;
  font-weight:400; line-height:1; color:var(--surface3);
  margin-bottom:1rem; letter-spacing:-.04em;
}
.how-step h3 { font-family:'Instrument Serif',serif; font-size:1.1rem; font-weight:400; margin-bottom:.5rem; letter-spacing:-.01em; }
.how-step p { font-size:.875rem; color:var(--muted); font-weight:300; }
.step-tags { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:1rem; }
.step-tag {
  font-size:.7rem; padding:.2rem .55rem; border-radius:4px;
  background:var(--surface2); color:var(--subtle);
  font-family:'JetBrains Mono',monospace;
}

/* DEMO */
.demo-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-top:2.5rem; }
.demo-panel { background:var(--surface); border:1px solid var(--border); border-radius:12px; overflow:hidden; }
.demo-hd {
  padding:.875rem 1.25rem; border-bottom:1px solid var(--border);
  background:var(--surface2); display:flex; align-items:center; justify-content:space-between;
}
.demo-hd span { font-size:.8125rem; color:var(--muted); font-weight:500; }
.demo-panel pre {
  font-family:'JetBrains Mono',monospace; font-size:.775rem;
  line-height:1.7; padding:1.25rem; color:var(--muted); white-space:pre; overflow-x:auto;
}

/* SEVERITY */
.sev-table { width:100%; border-collapse:collapse; border:1px solid var(--border); border-radius:10px; overflow:hidden; margin-top:2rem; }
.sev-table th { padding:.875rem 1.25rem; background:var(--surface2); color:var(--muted); font-size:.8125rem; font-weight:500; text-transform:uppercase; letter-spacing:.06em; text-align:left; border-bottom:1px solid var(--border); }
.sev-table td { padding:.875rem 1.25rem; font-size:.875rem; color:var(--muted); border-bottom:1px solid var(--border); font-weight:300; }
.sev-table tr:last-child td { border-bottom:none; }
.sev-table tr:hover td { background:var(--surface); }
.sev-c { background:var(--red-d); color:var(--red); border:1px solid rgba(248,113,113,.2); }
.sev-h { background:var(--amber-d); color:var(--amber); border:1px solid rgba(251,191,36,.2); }
.sev-m { background:var(--blue-d); color:var(--blue); border:1px solid rgba(96,165,250,.2); }
.sev-l { background:var(--surface2); color:var(--subtle); border:1px solid var(--border); }
.ic-ok { color:var(--green); } .ic-no { color:var(--red); } .ic-w { color:var(--amber); }

/* STACK */
.stack-grid {
  display:grid; grid-template-columns:repeat(4,1fr);
  gap:1px; background:var(--border); border:1px solid var(--border);
  border-radius:12px; overflow:hidden; margin-top:2.5rem;
}
.stack-card { background:var(--bg); padding:1.5rem; transition:background .15s; }
.stack-card:hover { background:var(--surface); }
.stack-card h4 { font-size:.8125rem; font-weight:500; margin-bottom:.875rem; text-transform:uppercase; letter-spacing:.06em; }
.stack-tags { display:flex; flex-direction:column; gap:.4rem; }
.stack-tag {
  font-size:.8rem; color:var(--muted); display:flex; align-items:center; gap:.5rem;
  font-family:'JetBrains Mono',monospace;
}
.stack-tag::before { content:'·'; color:var(--subtle); }

/* PRICING */
.price-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-top:2.5rem; }
.price-card {
  background:var(--surface); border:1px solid var(--border); border-radius:12px;
  padding:1.75rem; display:flex; flex-direction:column; gap:1.25rem; transition:border-color .15s;
}
.price-card:hover { border-color:var(--border-h); }
.price-card.featured { border-color:var(--green-b); }
.price-lbl { font-size:.75rem; font-weight:500; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
.price-card.featured .price-lbl { color:var(--green); }
.price-amt {
  font-family:'Instrument Serif',serif; font-size:2.5rem;
  font-weight:400; letter-spacing:-.03em;
}
.price-amt sup { font-size:1.25rem; vertical-align:super; letter-spacing:0; }
.price-amt .per { font-family:'DM Sans',sans-serif; font-size:.9rem; color:var(--muted); font-weight:300; }
.price-desc { font-size:.875rem; color:var(--muted); font-weight:300; }
.price-feats { list-style:none; display:flex; flex-direction:column; gap:.625rem; }
.price-feats li { font-size:.875rem; color:var(--muted); display:flex; align-items:center; gap:.5rem; font-weight:300; }
.pf-y { color:var(--green); font-size:.8rem; }
.pf-g { color:var(--green); font-size:.8rem; }
.pf-d { color:var(--subtle); font-size:.8rem; }
.price-cta { margin-top:auto; }

/* OSS */
.oss-inner {
  background:var(--surface); border:1px solid var(--border);
  border-radius:16px; padding:3.5rem; text-align:center; position:relative; overflow:hidden;
}
.oss-inner::before {
  content:''; position:absolute; top:-80px; left:50%; transform:translateX(-50%);
  width:400px; height:400px;
  background:radial-gradient(circle,rgba(74,222,128,.06) 0%,transparent 70%);
  pointer-events:none;
}
.oss-inner h2 { font-family:'Instrument Serif',serif; font-size:2.5rem; font-weight:400; letter-spacing:-.03em; margin-bottom:1rem; }
.oss-inner h2 em { font-style:italic; color:var(--muted); }
.oss-inner > p { color:var(--muted); font-size:.9375rem; max-width:480px; margin:0 auto 2rem; font-weight:300; }
.oss-ctas { display:flex; justify-content:center; gap:.75rem; flex-wrap:wrap; }
.oss-tags { display:flex; justify-content:center; flex-wrap:wrap; gap:.5rem; margin-top:2rem; }
.oss-tag { background:var(--surface2); border:1px solid var(--border); color:var(--muted); font-size:.75rem; padding:.3rem .75rem; border-radius:100px; }

/* FOOTER */
.gr-footer { border-top:1px solid var(--border); padding:2.5rem 2rem; position:relative; z-index:1; }
.footer-inner { max-width:920px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
.footer-links { display:flex; gap:1.5rem; }
.footer-links a { font-size:.8125rem; color:var(--subtle); text-decoration:none; transition:color .15s; cursor:pointer; }
.footer-links a:hover { color:var(--text); }
.footer-meta { font-size:.8125rem; color:var(--subtle); }

/* RESPONSIVE */
@media(max-width:720px){
  .gr-nav-links{display:none}
  .stats-bar{grid-template-columns:repeat(2,1fr)}
  .stat-item:nth-child(2){border-right:none}
  .stat-item:nth-child(3){border-top:1px solid var(--border)}
  .problem-grid{grid-template-columns:1fr}
  .gap-card{flex-direction:column; align-items:flex-start}
  .sol-intro{grid-template-columns:1fr; gap:1.5rem}
  .feat-grid{grid-template-columns:1fr 1fr}
  .how-steps{grid-template-columns:1fr}
  .demo-grid{grid-template-columns:1fr}
  .stack-grid{grid-template-columns:repeat(2,1fr)}
  .price-grid{grid-template-columns:1fr}
  .oss-inner{padding:2rem 1.5rem}
  .footer-inner{flex-direction:column; align-items:flex-start}
}
@media(max-width:520px){
  .feat-grid{grid-template-columns:1fr}
  .stack-grid{grid-template-columns:1fr}
}
`;

// ─── REVEAL ────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {}, className = "" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(18px)",
      transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  );
}

// ─── SVG ICONS ─────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg width="13" height="15" viewBox="0 0 14 16" fill="none">
    <path d="M7 1L1.5 3.5V8C1.5 11.5 4 14 7 15C10 14 12.5 11.5 12.5 8V3.5L7 1Z" fill="#09090b"/>
    <path d="M5 8L6.5 9.5L9.5 6.5" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6h7m0 0L6 2.5M9.5 6L6 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const GithubIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .3a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm3.1 4.8a5 5 0 0 1 3.1 1.6c-.7 0-1.5.3-2.1.7l-2.7 1.5c-.6.4-1 1-1 1.6v3L11 13v-3c0-.6-.4-1.2-1-1.5L7.2 7c-.6-.4-1.3-.6-2-.6A5 5 0 0 1 15.1 5zm-9.2 3.4c.5 0 1 .2 1.4.4l2.7 1.5c.2.1.3.3.3.5v3c0 .2-.1.4-.3.5l-2.7 1.5c-.4.3-1 .4-1.4.4-.5 0-1-.1-1.4-.4A5 5 0 0 1 3 12a5 5 0 0 1 2.9-4.6zm4.7 5.5 1.5-.8v3c0 .6.4 1.2 1 1.5l2.8 1.6c.6.3 1.3.5 2 .5a5 5 0 0 1-7.3-5.8z"/>
  </svg>
);
const CheckSvg = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2 2 4-4" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── SECTION HEADING ───────────────────────────────────────────────────────
function SectionH({ label, h2, sub, maxW = 520 }) {
  return (
    <>
      <Reveal><p className="sec-label">{label}</p></Reveal>
      <Reveal delay={60}><h2 className="serif" style={{ fontSize: "2.25rem", fontWeight: 400, letterSpacing: "-.03em", lineHeight: 1.1, maxWidth: maxW, marginBottom: ".5rem" }} dangerouslySetInnerHTML={{ __html: h2 }} /></Reveal>
      {sub && <Reveal delay={120}><p style={{ color: "var(--muted)", fontSize: ".9375rem", fontWeight: 300, maxWidth: maxW }}>{sub}</p></Reveal>}
    </>
  );
}

// ─── NAV ───────────────────────────────────────────────────────────────────
function Nav({ theme, onToggle }) {
  const links = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "GitHub", href: "https://github.com/rakshitbharat/guardrail-ai" }
  ];
  return (
    <nav className="gr-nav">
      <a href="/" className="gr-logo" style={{ textDecoration: 'none' }}>
        <div className="gr-shield"><ShieldIcon /></div>
        GuardRail AI
      </a>
      <ul className="gr-nav-links">
        {links.map(l => <li key={l.name}><a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{l.name}</a></li>)}
      </ul>
      <div className="gr-nav-r">
        <a href="/guardrail-ai.vsix" download className="btn-p sm" style={{ textDecoration: 'none' }}>Download Extension</a>
        <button className="btn-icon" onClick={onToggle} aria-label="Toggle theme">
          {theme === "dark" ? "☀" : "☽"}
        </button>
      </div>
    </nav>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero">
      <Reveal><span className="hero-badge">Developer-First SOAR Platform · Now in Beta</span></Reveal>
      <Reveal delay={80}>
        <h1>Detect. Remediate.<br /><em>Before code ships.</em></h1>
      </Reveal>
      <Reveal delay={160}>
        <p className="hero-sub">GuardRail AI is the first SOAR platform built for developers — not SOC teams. Detect 50+ vulnerability types with AI, auto-generate production patches, and provision AWS secrets. All before your PR merges.</p>
      </Reveal>
      <Reveal delay={240}>
        <div className="hero-ctas">
          <a href="/guardrail-ai.vsix" download className="btn-p" style={{ textDecoration: 'none' }}>Download Extension <ArrowIcon /></a>
          <button className="btn-o" onClick={() => window.open('https://github.com/rakshitbharat/guardrail-ai', '_blank')}><GithubIcon /> View on GitHub</button>
        </div>
      </Reveal>
      <Reveal delay={320}>
        <div className="code-box">
          <div className="code-box-hd">
            <div className="mac-dots"><span className="mac-r"/><span className="mac-y"/><span className="mac-g"/></div>
            <span className="code-file">app.js — GuardRail AI scan</span>
            <span className="badge badge-crit">● CRITICAL DETECTED</span>
          </div>
          <div className="code-body">
            <pre>
{`<span class="cc">// ⚠  CWE-798: Hardcoded credentials — line 2, 5</span>
<span class="ck">const</span> stripe = <span class="ck">require</span>(<span class="cstr">'stripe'</span>)(<span class="cv">'sk-live-1234567890abcdef'</span>);
<span class="ck">const</span> db = <span class="ck">new</span> Client({
  connectionString: <span class="cv">'postgresql://admin:password123@localhost/mydb'</span>
});

<span class="cc">// ✓  GuardRail patch applied — secrets moved to AWS Secrets Manager</span>
<span class="ck">const</span> stripeKey = <span class="ck">await</span> <span class="cs">getSecret</span>(<span class="cstr">'stripe-api-key-abc123'</span>);
<span class="ck">const</span> stripe = <span class="ck">require</span>(<span class="cstr">'stripe'</span>)(stripeKey.value);`}
            </pre>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── STATS ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { n: "12+", l: "Vulnerability types detected" },
    { n: "<10s", l: "Average scan time" },
    { n: "100%", l: "Automated remediation" },
    { n: "24h", l: "Secret TTL cleanup" },
  ];
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 2rem" }}>
      <div className="stats-bar">
        {stats.map((s, i) => (
          <Reveal key={s.n} delay={i * 60} className="stat-item">
            <span className="stat-n">{s.n}</span>
            <span className="stat-l">{s.l}</span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─── PROBLEM ───────────────────────────────────────────────────────────────
function Problem() {
  const cards = [
    {
      icon: "🔍", title: "Traditional SAST", sub: "Snyk, SonarQube, Checkmarx",
      items: ["Only detect vulnerabilities — developers still manually fix", "High false positive rates → alert fatigue", "Run late in the pipeline — expensive to fix", "No automated remediation → security bottleneck"]
    },
    {
      icon: "🛡", title: "Traditional SOAR", sub: "Splunk, Palo Alto XSOAR",
      items: ["Designed for SOC teams, not developers", "Respond to production incidents, not code vulns", "Require security expertise to configure", "Expensive enterprise tools ($50K–$500K/year)"]
    }
  ];
  return (
    <section style={{ maxWidth: 920, margin: "0 auto", padding: "5rem 2rem" }}>
      <Reveal><p className="sec-label">The Problem</p></Reveal>
      <Reveal delay={60}><h2 className="serif" style={{ fontSize: "2.5rem", fontWeight: 400, letterSpacing: "-.03em", lineHeight: 1.1, maxWidth: 580, marginBottom: ".75rem" }}>Every current tool<br /><em style={{ fontStyle: "italic", color: "var(--muted)" }}>only detects. Nobody fixes.</em></h2></Reveal>
      <Reveal delay={120}><p style={{ color: "var(--muted)", fontWeight: 300, maxWidth: 500, fontSize: ".9375rem" }}>Traditional SAST tools scan and alert. Traditional SOAR tools respond to production incidents. There's no tool that remediates code vulnerabilities automatically — in the developer workflow.</p></Reveal>
      <div className="problem-grid">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 80} className="prob-card">
            <div style={{ display: "flex", alignItems: "center", gap: ".625rem", marginBottom: "1.25rem" }}>
              <div className="prob-icon">{c.icon}</div>
              <div>
                <div className="serif" style={{ fontSize: "1rem", color: "var(--text)" }}>{c.title}</div>
                <div style={{ fontSize: ".8rem", color: "var(--subtle)", fontWeight: 300 }}>{c.sub}</div>
              </div>
            </div>
            <ul>{c.items.map(it => <li key={it}><span className="li-x">✗</span>{it}</li>)}</ul>
          </Reveal>
        ))}
        <Reveal className="gap-card">
          <p className="serif" style={{ fontSize: "1.15rem", fontStyle: "italic", color: "var(--muted)", maxWidth: 600 }}>
            "No tool exists that <strong style={{ color: "var(--text)", fontStyle: "normal" }}>automatically remediates code vulnerabilities</strong> in the developer workflow with zero human intervention."
          </p>
          <span className="gap-pill">The Gap</span>
        </Reveal>
      </div>
    </section>
  );
}

// ─── SOLUTION ──────────────────────────────────────────────────────────────
function Solution() {
  const checks = [
    { bold: "Detects", rest: " 12+ vulnerability types using AI (Groq Llama 3.3 70B) — hardcoded secrets, SQL injection, XSS, command injection, and more" },
    { bold: "Remediates", rest: " by generating production-ready patches automatically — context-aware, not just regex" },
    { bold: "Provisions", rest: " AWS Secrets Manager entries with least-privilege IAM policies automatically" },
    { bold: "Logs", rest: " everything to CloudWatch and DynamoDB for complete audit trail and compliance" },
    { bold: "Integrates", rest: " into VS Code (Kiro, Cursor, Windsurf), GitHub Actions, and Web UI — no workflow changes required" },
  ];
  const rows = [
    ["Response type", "Firewall rules, IP blocking", "Code patches, secret rotation"],
    ["Primary user", "SOC analyst", "Developer"],
    ["When it acts", "Production incidents", "Pre-production prevention"],
    ["Remediation", "Manual playbooks", "Autonomous AI"],
    ["Cost", "$50K–$500K / year", "$15 / developer / month"],
  ];
  return (
    <section style={{ maxWidth: 920, margin: "0 auto", padding: "5rem 2rem" }}>
      <div className="sol-intro">
        <div>
          <Reveal><p className="sec-label">Our Solution</p></Reveal>
          <Reveal delay={60}><h2 className="serif" style={{ fontSize: "2.5rem", fontWeight: 400, letterSpacing: "-.03em", lineHeight: 1.1 }}>SOAR for the <em style={{ fontStyle: "italic", color: "var(--muted)" }}>SDLC.</em></h2></Reveal>
        </div>
        <div>
          <Reveal delay={80}><p style={{ color: "var(--muted)", fontWeight: 300, fontSize: ".9375rem", marginBottom: ".75rem" }}>GuardRail brings SOAR to developers — not SOC analysts. Respond to vulnerabilities in the IDE and CI/CD pipeline, before they ever reach production.</p></Reveal>
          <Reveal delay={120}><p className="mono" style={{ fontSize: ".8rem", color: "var(--subtle)", marginTop: ".75rem" }}>"Detect in the IDE, respond in the pipeline, notify the team."</p></Reveal>
        </div>
      </div>
      <div className="sol-checks">
        {checks.map((c, i) => (
          <Reveal key={c.bold} delay={i * 50}>
            <div className="sol-check">
              <div className="chk-ico"><CheckSvg /></div>
              <p style={{ fontSize: ".875rem", color: "var(--muted)", fontWeight: 300 }}>
                <strong style={{ color: "var(--text)", fontWeight: 500 }}>{c.bold}</strong>{c.rest}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={100}>
        <table className="cmp-table">
          <thead><tr><th>Capability</th><th>Traditional SOAR</th><th>GuardRail AI</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r[0]}><td>{r[0]}</td><td className="td-o">{r[1]}</td><td className="td-n">{r[2]}</td></tr>)}</tbody>
        </table>
      </Reveal>
    </section>
  );
}

// ─── FEATURES ──────────────────────────────────────────────────────────────
function Features() {
  const feats = [
    { ico: "⚡", title: "Multi-Channel Ingest", desc: "Trigger scans from any entry point in your workflow with zero friction.", extra: <div className="ch-pills">{["VS Code","Kiro","Cursor","Windsurf","Web UI"].map(p => <span key={p} className="ch-pill"><span className="ch-dot"/>{p}</span>)}</div> },
    { ico: "🧠", title: "AI-Powered Detection", desc: "Groq Llama 3.3 70B analyzes code for 12+ vulnerability types — SQL injection, XSS, command injection, hardcoded secrets, weak cryptography, and more. CWE-mapped for compliance." },
    { ico: "🔧", title: "Two-Phase Workflow", desc: "Fast scan-only mode detects vulnerabilities in seconds. Generate fixes on-demand when you need them. No wasted compute." },
    { ico: "☁", title: "AWS Secret Provisioning", desc: "Auto-creates secrets in AWS Secrets Manager, generates least-privilege IAM policies, and provides retrieval snippets. 24h TTL with auto-cleanup." },
    { ico: "🔔", title: "Real-Time Logs Panel", desc: "VS Code extension includes live logs panel showing backend operations in real-time. See exactly what's happening during scans." },
    { ico: "📋", title: "Audit Trail", desc: "CloudWatch structured logs, DynamoDB scan history, and CWE-mapped reports. In-memory cache for instant log retrieval." },
  ];
  return (
    <section id="features" style={{ maxWidth: 920, margin: "0 auto", padding: "5rem 2rem" }}>
      <SectionH label="Features" h2='Everything security.<br/><em style="color:var(--muted)">Nothing in your way.</em>' sub="Five integrated layers that take a vulnerability from detection to remediation in under 10 seconds." />
      <div className="feat-grid">
        {feats.map((f, i) => (
          <Reveal key={f.title} delay={i * 60} className="feat-card">
            <div className="feat-ico">{f.ico}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            {f.extra}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ──────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Detect", desc: "Code enters via VS Code extension or Web UI. Groq AI scans for 12+ vulnerability types and assigns severity with CWE mapping. Fast scan-only mode.", tags: ["Llama 3.3 70B","CWE mapped","<5s"] },
    { n: "02", title: "Remediate", desc: "On-demand patch generation creates context-aware code fixes and provisions AWS secrets with least-privilege IAM policies. Session-isolated with 24h TTL.", tags: ["Patch gen","AWS Secrets","2–3s"] },
    { n: "03", title: "Monitor", desc: "Real-time logs panel in VS Code shows all backend operations. CloudWatch and DynamoDB store complete audit trail for compliance.", tags: ["CloudWatch","DynamoDB","Real-time"] },
  ];
  return (
    <section id="how-it-works" style={{ maxWidth: 920, margin: "0 auto", padding: "5rem 2rem" }}>
      <SectionH label="How It Works" h2='Three layers.<br/><em style="color:var(--muted)">One pipeline.</em>' sub="From a GitHub PR to a patched, production-safe codebase in under 15 seconds." />
      <div className="how-steps">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 80} className="how-step">
            <div className="step-n">{s.n}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <div className="step-tags">{s.tags.map(t => <span key={t} className="step-tag">{t}</span>)}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── DEMO ──────────────────────────────────────────────────────────────────
function RemediationDemo() {
  const before = `<span class="ck">const</span> stripe = <span class="ck">require</span>(<span class="cstr">'stripe'</span>)(
  <span class="cv">'sk-live-1234567890abcdef'</span>   <span class="cc">// ← hardcoded</span>
);

<span class="ck">const</span> db = <span class="ck">new</span> Client({
  connectionString:
    <span class="cv">'postgresql://admin:password123'</span> <span class="cc">// ← exposed</span>
    + <span class="cstr">'@localhost/mydb'</span>
});`;

  const after = `<span class="ck">const</span> { SecretsManagerClient,
  GetSecretValueCommand }
  = <span class="ck">require</span>(<span class="cstr">'@aws-sdk/client-secrets-manager'</span>);

<span class="ck">async function</span> <span class="cf">getSecret</span>(name) {
  <span class="ck">const</span> client = <span class="ck">new</span> <span class="cf">SecretsManagerClient</span>({
    region: <span class="cstr">'us-east-1'</span>
  });
  <span class="ck">const</span> r = <span class="ck">await</span> client.<span class="cf">send</span>(
    <span class="ck">new</span> <span class="cf">GetSecretValueCommand</span>({ SecretId: name })
  );
  <span class="ck">return</span> JSON.<span class="cf">parse</span>(r.SecretString);
}

<span class="cc">// Auto-provisioned with IAM policy</span>
<span class="ck">const</span> key = <span class="ck">await</span> <span class="cf">getSecret</span>(<span class="cs">'stripe-api-key'</span>);
<span class="ck">const</span> creds = <span class="ck">await</span> <span class="cf">getSecret</span>(<span class="cs">'db-connection'</span>);`;

  return (
    <section style={{ maxWidth: 920, margin: "0 auto", padding: "5rem 2rem" }}>
      <SectionH label="Live Remediation" h2='From vulnerable to <em style="color:var(--green)">production-safe.</em>' sub="GuardRail doesn't just tell you there's a problem. It writes the fix — with AWS Secrets Manager integration — in under 3 seconds." />
      <div className="demo-grid">
        <Reveal delay={60} className="demo-panel">
          <div className="demo-hd">
            <span>Before — Vulnerable</span>
            <span className="badge badge-crit">CWE-798</span>
          </div>
          <pre dangerouslySetInnerHTML={{ __html: before }} />
        </Reveal>
        <Reveal delay={120} className="demo-panel">
          <div className="demo-hd">
            <span>After — Remediated</span>
            <span className="badge badge-safe">PATCHED</span>
          </div>
          <pre dangerouslySetInnerHTML={{ __html: after }} />
        </Reveal>
      </div>
    </section>
  );
}

// ─── SEVERITY ──────────────────────────────────────────────────────────────
function SeverityTable() {
  const rows = [
    { sev: "Critical", cls: "sev-c", gh: { cls: "ic-no", t: "✗ Block" }, email: { cls: "ic-ok", t: "✓" }, slack: { cls: "ic-ok", t: "✓" }, ci: "Fail CI, require fix" },
    { sev: "High",     cls: "sev-h", gh: { cls: "ic-no", t: "✗ Block" }, email: { cls: "ic-ok", t: "✓" }, slack: { cls: "ic-no", t: "✗" }, ci: "Fail CI, require fix" },
    { sev: "Medium",   cls: "sev-m", gh: { cls: "ic-w",  t: "⚠ Comment" }, email: { cls: "ic-no", t: "✗" }, slack: { cls: "ic-no", t: "✗" }, ci: "Warn, allow merge" },
    { sev: "Low",      cls: "sev-l", gh: { cls: "", t: "📝 Log" }, email: { cls: "ic-no", t: "✗" }, slack: { cls: "ic-no", t: "✗" }, ci: "Dashboard only" },
  ];
  return (
    <section style={{ maxWidth: 920, margin: "0 auto", padding: "5rem 2rem" }}>
      <SectionH label="Response Routing" h2='Severity-based <em style="color:var(--muted)">orchestration.</em>' sub="Every finding is routed automatically — no manual triage required." />
      <Reveal delay={80}>
        <table className="sev-table">
          <thead><tr>{["Severity","GitHub PR","Email","Slack","CI/CD Action"].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.sev}>
                <td><span className={`badge ${r.cls}`}>{r.sev}</span></td>
                <td><span className={r.gh.cls}>{r.gh.t}</span></td>
                <td><span className={r.email.cls}>{r.email.t}</span></td>
                <td><span className={r.slack.cls}>{r.slack.t}</span></td>
                <td>{r.ci}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}

// ─── TECH STACK ────────────────────────────────────────────────────────────
function TechStack() {
  const cols = [
    { title: "Backend",     tags: ["Node.js + Express","Groq API","Llama 3.3 70B","Helmet","rate-limit","PM2"] },
    { title: "AWS Services",tags: ["Secrets Manager","DynamoDB","S3","CloudWatch","EC2 (us-west-2)"] },
    { title: "Frontend",    tags: ["React 18","Vite","CSS-in-JS","Intersection Observer"] },
    { title: "IDE Extension", tags: ["VS Code API","Kiro","Cursor","Windsurf","TreeView Logs"] },
  ];
  return (
    <section style={{ maxWidth: 920, margin: "0 auto", padding: "5rem 2rem" }}>
      <SectionH label="Tech Stack" h2='Built on <em style="color:var(--muted)">modern infrastructure.</em>' />
      <div className="stack-grid">
        {cols.map((c, i) => (
          <Reveal key={c.title} delay={i * 60} className="stack-card">
            <h4>{c.title}</h4>
            <div className="stack-tags">{c.tags.map(t => <span key={t} className="stack-tag">{t}</span>)}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── PRICING ───────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      label: "Open Source", price: "0", per: null,
      desc: "Self-hosted. Full feature access. Community support.",
      feats: [
        { y: true,  t: "All detection features" },
        { y: true,  t: "Autonomous remediation" },
        { y: true,  t: "VS Code + CLI" },
        { y: true,  t: "GitHub Actions" },
        { y: false, t: "Managed hosting" },
        { y: false, t: "Priority support" },
      ],
      cta: "Download Extension", primary: false, featured: false, link: "/guardrail-ai.vsix"
    },
    {
      label: "Pro", price: "15", per: "/ dev / month",
      desc: "Cloud-hosted. 50 devs = $750 MRR. 78% gross margin.",
      feats: [
        { y: true, t: "Everything in Open Source" },
        { y: true, t: "Managed AWS infra" },
        { y: true, t: "Dashboard & analytics" },
        { y: true, t: "Priority support" },
        { y: true, t: "Audit log export" },
        { y: true, t: "Slack + email alerts" },
      ],
      cta: "Download Extension", primary: true, featured: true, link: "/guardrail-ai.vsix"
    },
    {
      label: "Enterprise", price: null, per: null,
      desc: "For large teams. Land-and-expand model. NRR 120%.",
      feats: [
        { y: true, t: "Everything in Pro" },
        { y: true, t: "SSO / SAML" },
        { y: true, t: "VPC deployment" },
        { y: true, t: "Custom integrations" },
        { y: true, t: "SLA & dedicated support" },
        { y: true, t: "Compliance reports" },
      ],
      cta: "Contact Us", primary: false, featured: false, link: "mailto:rakshit@guardrail.ai"
    }
  ];
  return (
    <section id="pricing" style={{ maxWidth: 920, margin: "0 auto", padding: "5rem 2rem" }}>
      <SectionH label="Pricing" h2='Start free.<br/><em style="color:var(--muted)">Scale as you grow.</em>' sub="Open source core, cloud-hosted plans for teams. $74/month infrastructure at 100 scans/day." />
      <div className="price-grid">
        {plans.map((p, i) => (
          <Reveal key={p.label} delay={i * 80}>
            <div className={`price-card${p.featured ? " featured" : ""}`} style={{ height: "100%" }}>
              <div className="price-lbl">{p.label}</div>
              <div className="price-amt">
                {p.price !== null ? <><sup>$</sup>{p.price}{p.per && <span className="per"> {p.per}</span>}</> : <span style={{ fontSize: "1.75rem" }}>Custom</span>}
              </div>
              <div className="price-desc">{p.desc}</div>
              <ul className="price-feats">
                {p.feats.map(f => (
                  <li key={f.t}>
                    <span className={f.y ? (p.featured ? "pf-g" : "pf-y") : "pf-d"}>{f.y ? "✓" : "—"}</span>
                    {f.t}
                  </li>
                ))}
              </ul>
              <div className="price-cta">
                {p.primary
                  ? <a href={p.link} download={p.link.endsWith('.vsix') ? 'guardrail-ai.vsix' : undefined} className="btn-p btn-full" style={{ textDecoration: 'none' }}>{p.cta}</a>
                  : <a href={p.link} download={p.link.endsWith('.vsix') ? 'guardrail-ai.vsix' : undefined} className="btn-o btn-full" style={{ textDecoration: 'none' }}>{p.cta}</a>}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── OSS CTA ───────────────────────────────────────────────────────────────
function OssCta() {
  const tags = ["Built by Rakshit & Karan", "Powered by Groq", "Hosted on AWS", "MIT License", "Hackathon 2026"];
  return (
    <section style={{ maxWidth: 920, margin: "0 auto", padding: "5rem 2rem" }}>
      <Reveal>
        <div className="oss-inner">
          <h2>Proudly <em>Open Source</em></h2>
          <p>GuardRail is open source and built on open source infrastructure. The full code is available on GitHub — deploy it yourself or use our managed cloud.</p>
          <div className="oss-ctas">
            <a href="/guardrail-ai.vsix" download className="btn-p" style={{ textDecoration: 'none' }}>Download Extension</a>
            <button className="btn-o" onClick={() => window.open('https://github.com/rakshitbharat/guardrail-ai', '_blank')}><GithubIcon /> Star on GitHub</button>
          </div>
          <div className="oss-tags">{tags.map(t => <span key={t} className="oss-tag">{t}</span>)}</div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────────────────
function Footer() {
  const links = ["Features", "Pricing", "Docs", "GitHub", "Team"];
  return (
    <footer className="gr-footer">
      <div className="footer-inner">
        <button className="gr-logo" style={{ fontSize: ".95rem" }}>
          <div className="gr-shield" style={{ width: 18, height: 18 }}>
            <svg width="10" height="11" viewBox="0 0 14 16" fill="none">
              <path d="M7 1L1.5 3.5V8C1.5 11.5 4 14 7 15C10 14 12.5 11.5 12.5 8V3.5L7 1Z" fill="#09090b"/>
              <path d="M5 8L6.5 9.5L9.5 6.5" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          GuardRail AI
        </button>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="https://github.com/rakshitbharat/guardrail-ai" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="http://98.93.184.65:3001" target="_blank" rel="noopener noreferrer">Demo</a>
        </div>
        <p className="footer-meta">© 2025 GuardRail AI · Built by Rakshit & Karan</p>
      </div>
    </footer>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState("dark");
  const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <div className="gr-root" data-theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Nav theme={theme} onToggle={toggle} />
      <main className="gr-main">
        <Hero />
        <div className="divider" />
        <StatsBar />
        <div className="divider" />
        <Problem />
        <div className="divider" />
        <Solution />
        <div className="divider" />
        <Features />
        <div className="divider" />
        <HowItWorks />
        <div className="divider" />
        <RemediationDemo />
        <div className="divider" />
        <SeverityTable />
        <div className="divider" />
        <TechStack />
        <div className="divider" />
        <Pricing />
        <div className="divider" />
        <OssCta />
      </main>
      <Footer />
    </div>
  );
}
