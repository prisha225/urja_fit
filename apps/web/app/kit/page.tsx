"use client";

import { motion, useReducedMotion } from "framer-motion";

const components = ["Primary action", "Choice chip", "Session card", "Care notice", "Dial"];
export default function KitPage() {
  const reduced = useReducedMotion();
  return <main className="kit"><header><p className="eyebrow">URJA / foundation</p><h1>Design kit</h1><p>Tokens and component foundations for the golden path.</p></header>
    <section aria-labelledby="colors"><h2 id="colors">Named colours</h2><div className="swatches">{["aubergine","marigold","peacock","hibiscus","mist","white"].map((name) => <div className={`swatch ${name}`} key={name}><span>{name}</span></div>)}</div></section>
    <section aria-labelledby="components"><h2 id="components">Components</h2><div className="component-grid">
      <article className="sample"><h3>Primary action</h3><button>Start today</button></article>
      <article className="sample"><h3>Choice chip</h3><span className="chip">Quiet space</span></article>
      <article className="sample hero"><h3>Today&apos;s session</h3><p className="session-meta">18 min · quiet · no equipment</p><p>Two short pockets fit your morning.</p></article>
      <article className="sample notice"><h3>Care check</h3><p><span aria-hidden="true">!</span> Stop if something hurts.</p></article>
      <article className="sample dial-wrap"><h3>Day Dial</h3><motion.div className="dial" initial={{ scale: .96 }} animate={{ scale: 1 }} transition={{ duration: reduced ? 0 : .35 }}><span>06:10</span><strong>18 min</strong></motion.div></article>
    </div></section>
    <section aria-labelledby="type"><h2 id="type">Type and radius</h2><div className="type-sample"><p className="display">A considered day.</p><p>Hind is the intended body face; system fallback is used until font files are licensed and added.</p></div></section>
    <p className="demo-tag">Demo data</p><p className="disclaimer">Pending professional review. General wellness guidance only; not diagnosis or treatment.</p>
  </main>;
}
