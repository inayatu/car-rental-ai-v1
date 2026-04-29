let injected = false;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --slate:      #0d1b2a;
    --slate2:     #14253a;
    --slate3:     #1c3350;
    --slate4:     #243d5c;
    --teal:       #0891b2;
    --teal2:      #06b6d4;
    --teal-pale:  rgba(8,145,178,0.1);
    --teal-border:rgba(8,145,178,0.25);
    --gold:       #d97706;
    --gold2:      #f59e0b;
    --gold-pale:  rgba(217,119,6,0.1);
    --gold-border:rgba(217,119,6,0.3);
    --stone:      #f8f5f0;
    --stone2:     #efe9e0;
    --stone3:     #e4ddd2;
    --white:      #ffffff;
    --ink:        #0d1117;
    --ink2:       #1e2d3d;
    --ink3:       #4a5e72;
    --ink4:       #8299ad;
    --border:     rgba(13,27,42,0.1);
    --shadow-sm:  0 1px 4px rgba(13,27,42,0.08);
    --shadow-md:  0 4px 20px rgba(13,27,42,0.12);
    --shadow-lg:  0 12px 48px rgba(13,27,42,0.16);
    --r:          8px;
    --r-lg:       16px;
    --r-xl:       24px;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body:    'Plus Jakarta Sans', sans-serif;
    --font-mono:    'DM Mono', monospace;
  }

  html { font-size: 15px; scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body { font-family: var(--font-body); background: var(--stone); color: var(--ink); line-height: 1.7; overflow-x: hidden; }
  #root { width: 100%; max-width: 100vw; overflow-x: hidden; }
  img, video, canvas { max-width: 100%; height: auto; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--stone); }
  ::-webkit-scrollbar-thumb { background: var(--teal); border-radius: 4px; }

  /* ANIMATIONS */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:none; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
  @keyframes ticker   { from { transform:translateX(0); } to { transform:translateX(-50%); } }
  @keyframes spin     { to { transform:rotate(360deg); } }

  .fade-up    { animation: fadeUp 0.6s ease both; }
  .slide-in   { animation: slideIn 0.5s ease both; }
  .d-1 { animation-delay: 0.1s; }
  .d-2 { animation-delay: 0.2s; }
  .d-3 { animation-delay: 0.3s; }
  .d-4 { animation-delay: 0.4s; }

  /* FORMS */
  input, select, textarea {
    width: 100%; padding: 11px 14px;
    background: var(--white); border: 1.5px solid var(--border);
    border-radius: var(--r); font-family: var(--font-body); font-size: 14px;
    color: var(--ink); outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    appearance: auto;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-pale);
  }
  input::placeholder { color: var(--ink4); }
  textarea { resize: vertical; min-height: 90px; }

  /* RANGE */
  input[type=range] { padding: 0; border: none; box-shadow: none; accent-color: var(--teal); }
  input[type=checkbox], input[type=radio] { width: auto; accent-color: var(--teal); cursor: pointer; }

  /* TABLE */
  table { width: 100%; border-collapse: collapse; }
  th { background: var(--slate); color: rgba(255,255,255,0.75); padding: 10px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-align: left; }
  td { padding: 12px 14px; font-size: 13px; color: var(--ink2); border-bottom: 1px solid var(--border); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--stone); }

  /* RESPONSIVE HELPERS */
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .show-mobile { display: flex !important; }
  }
  @media (min-width: 769px) {
    .show-mobile { display: none !important; }
  }

  /* —— Layout: listings (filter + grid) —— */
  .gb-listings-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    min-width: 0;
  }
  @media (min-width: 900px) {
    .gb-listings-layout { grid-template-columns: 280px minmax(0, 1fr); gap: 2rem; }
  }

  /* —— Car detail: gallery + booking column —— */
  .gb-detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    align-items: start;
    min-width: 0;
  }
  @media (min-width: 900px) {
    .gb-detail-grid { grid-template-columns: minmax(0, 1fr) min(100%, 370px); gap: 2.5rem; }
  }
  .gb-detail-hero { height: min(52vh, 320px); min-height: 200px; }
  .gb-detail-sticky { position: static; width: 100%; min-width: 0; }
  @media (min-width: 900px) {
    .gb-detail-sticky { position: sticky; top: 80px; }
  }

  /* —— Auth: side-by-side only on large screens —— */
  .gb-auth-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr;
    padding-top: 64px;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
  }
  @media (min-width: 900px) {
    .gb-auth-page { grid-template-columns: 1fr 1fr; }
  }

  /* —— Add listing: two-column form rows —— */
  .gb-form-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  @media (min-width: 640px) {
    .gb-form-2 { grid-template-columns: 1fr 1fr; }
  }
  .gb-form-2 > * {
    min-width: 0;
  }

  /* —— Home hero: stack on narrow —— */
  .gb-hero-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: center;
  }
  @media (min-width: 720px) {
    .gb-hero-2 {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: 3rem;
    }
  }

  /* —— Home: CTA 2-up —— */
  .gb-home-cta-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  @media (min-width: 640px) {
    .gb-home-cta-2 { grid-template-columns: 1fr 1fr; }
  }

  .gb-wrap-1200 {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    box-sizing: border-box;
    padding-left: max(1rem, env(safe-area-inset-left, 0px));
    padding-right: max(1rem, env(safe-area-inset-right, 0px));
  }

  /* Owner: add vehicle — stack on small screens, sidebar checklist only sticky on large */
  .gb-add-listing-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.25rem;
    align-items: start;
    width: 100%;
    min-width: 0;
  }
  @media (min-width: 960px) {
    .gb-add-listing-grid {
      grid-template-columns: minmax(0, 1fr) min(100%, 300px);
      gap: 1.5rem 2rem;
    }
  }
  .gb-add-listing-aside {
    position: static;
    width: 100%;
    min-width: 0;
  }
  @media (min-width: 960px) {
    .gb-add-listing-aside {
      position: sticky;
      top: 80px;
    }
  }
  .gb-add-listing-form input[type="file"] {
    max-width: 100%;
    width: 100%;
    min-width: 0;
  }
  @media (max-width: 640px) {
    .gb-add-listing-actions {
      flex-direction: column;
      align-items: stretch;
    }
    .gb-add-listing-actions > button { width: 100%; }
  }
`;

export function injectGlobalStyles() {
  if (injected) return;
  injected = true;
  const el = document.createElement("style");
  el.setAttribute("data-gbtrip-pk", "1");
  el.textContent = CSS;
  document.head.appendChild(el);
}
