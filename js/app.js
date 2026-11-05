// BGR NEO Vision Selector - Production Enterprise Controller
// High-performance light theme router, expanded requirements engine, catalog filter, and project tracker.

(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const V = '<em class="note-unverified">Verify with supplier</em>';
  const val = v => (v === null || v === '') ? V : esc(v);

  const sup = id => SUPPLIERS.find(s => s.id === id);

  // Builds the pre-filled WhatsApp enquiry message. Application parameters are
  // pulled from the saved requirement form; a specific camera model can be appended.
  function waMessage(model = '') {
    let r = {};
    try { r = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch {}
    const na = 'Not specified';
    const app = r.app || na;
    const criteria = r.readability || r.visibility || na;
    const len = r.workLength || r.length || na;
    const wid = r.workWidth || r.width || na;
    const dims = (len !== na || wid !== na) ? `Length ${len}mm, Width ${wid}mm` : na;
    return [
      'Hi, I have an enquiry regarding an industrial vision application.',
      '',
      `- Application Type: ${app}`,
      `- Criteria / Inspection: ${criteria}`,
      `- Product Dimensions: ${dims}`,
      `- Camera/Product Model: ${model || na}`
    ].join('\n');
  }

  // Formatted direct WhatsApp link with a detailed, pre-filled enquiry message.
  // When opened from a camera details modal, `model` supplies the camera identity.
  function wa(s, model = '') {
    if (!s || !s.phone) return '';
    let d = s.phone.replace(/\D/g, '');
    if (d.startsWith('0')) d = '91' + d.slice(1);
    else if (d.length === 10) d = '91' + d;
    const label = model ? 'Enquire about this camera' : 'Chat on WhatsApp';
    return `<a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="https://wa.me/${d}?text=${encodeURIComponent(waMessage(model))}" title="Direct WhatsApp Enquiry">
      <svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.238-.245-.588-.494-.509-.678-.518-.175-.009-.376-.009-.577-.009s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.511 0 1.481 1.079 2.911 1.23 3.112.15.2 2.124 3.243 5.146 4.55.719.311 1.28.497 1.718.636.722.23 1.378.197 1.898.12.58-.088 1.78-.727 2.031-1.43.251-.703.251-1.306.176-1.43-.076-.124-.277-.2-.578-.35zM12.04 2C6.54 2 2.08 6.46 2.08 11.96c0 1.96.57 3.79 1.56 5.34L2 22l4.83-1.58c1.49.88 3.23 1.38 5.21 1.38 5.5 0 9.96-4.46 9.96-9.96 0-5.5-4.46-9.84-9.96-9.84zm0 18.15c-1.74 0-3.36-.5-4.73-1.37l-.34-.21-2.87.94.96-2.8-.23-.37a8.136 8.136 0 01-1.25-4.38c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2s-3.68 8.19-8.17 8.19z"/>
      </svg>
      <span>${label}</span>
    </a>`;
  }

  // Vendor status badge — driven strictly by whether an email address is on file.
  // Contacts that provide an email address are flagged as New Suppliers (orange);
  // phone / WhatsApp-only contacts are flagged as Registered Vendors (blue).
  function vendorBadge(s) {
    return s.email
      ? '<span class="vendor-badge vendor-new">New Supplier</span>'
      : '<span class="vendor-badge vendor-auth">Registered Vendor</span>';
  }

  // Supplier info block with prominent typography and structured contact items
  function supBlock(s, model = '') {
    if (!s) return `<div class="sup-block empty"><span>No authorized distributor in list for this brand.</span> <a href="#suppliers" class="link-subtle">See all suppliers &rarr;</a></div>`;
    const nv = '<span class="note-unverified">Not provided</span>';
    return `<div class="sup-block">
      <div class="sup-hdr">
        <strong class="sup-name">${esc(s.company)}</strong>
        <span class="sup-city"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg> ${esc(s.city)}</span>
        ${vendorBadge(s)}
      </div>
      <div class="sup-contact-grid">
        <div class="sup-item"><span class="sup-lbl">Key Contact:</span><span class="sup-val">${s.person ? esc(s.person) : nv}</span></div>
        ${s.role ? `<div class="sup-item"><span class="sup-lbl">Specialisation:</span><span class="sup-val">${esc(s.role)}</span></div>` : ''}
        <div class="sup-item"><span class="sup-lbl">Direct Phone:</span><span class="sup-val">${s.phone ? `<a href="tel:${esc(s.phone.replace(/[^\d+]/g,''))}">${esc(s.phone)}</a>` : nv}</span></div>
        <div class="sup-item"><span class="sup-lbl">Official Email:</span><span class="sup-val">${s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : nv}</span></div>
        ${s.note ? `<div class="sup-item full"><span class="sup-lbl">Notes:</span><span class="sup-val note">${esc(s.note)}</span></div>` : ''}
      </div>
      <div class="sup-actions">
        ${wa(s, model)}
      </div>
    </div>`;
  }

  // Concise camera card renderer — top-level specs only.
  // Supplier contact details are intentionally withheld from the card and live
  // behind a protected reveal action inside the Full Specifications modal.
  function camCard(c, extra = '') {
    const imgSrc = `assets/cameras/${c.image || BRAND_IMAGES[c.brand] || 'basler.svg'}`;
    return `<article class="card">
      <div class="card-media">
        <img src="${imgSrc}" alt="${esc(c.brand)} ${esc(c.model)}" class="camera-img" loading="lazy">
        <div class="media-overlay">
          <span class="media-badge ${c.dim === '3D' ? 'pill-3d' : 'pill-2d'}">${esc(c.dim)} Sensor</span>
        </div>
      </div>
      
      <div class="card-content">
        <div class="card-top">
          <span class="brandtag">${esc(c.brand)} &middot; ${esc(c.origin)}</span>
          <span class="type-pill pill-subtle">${esc(c.cameraType || c.kind)}</span>
        </div>
        
        <h3 class="card-title">${esc(c.model)}</h3>
        
        ${extra ? `<div class="badge-cluster">${extra}</div>` : ''}
        
        <dl class="spec-grid">
          <dt>Resolution</dt><dd>${val(c.resolution || (c.mp === null ? null : `${c.mp} MP`))}</dd>
          <dt>Megapixels</dt><dd>${c.mp === null ? V : `<strong class="spec-highlight">${esc(c.mp)} MP</strong>`}</dd>
          <dt>Frame rate</dt><dd>${c.fps === null ? V : `<strong class="spec-highlight">${esc(c.fps)} FPS</strong>`}</dd>
          <dt>Sensor Model</dt><dd>${val(c.sensor)}</dd>
          <dt>Interface</dt><dd>${val(c.iface)}</dd>
        </dl>
        
        <div class="card-actions">
          <button class="btn btn-secondary" data-cam="${esc(c.id)}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Full Specifications</span>
          </button>
        </div>
      </div>
    </article>`;
  }

  // Smooth number display for metrics
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseInt(el.dataset.val || el.textContent) || 0;
    el.textContent = target;
  }

  // Staggered reveal and progress animation
  function reveal() {
    document.querySelectorAll('.bar i').forEach(b => {
      b.style.width = (b.dataset.w || 0) + '%';
    });
    document.querySelectorAll('.stat b').forEach(countUp);
  }

  /* ==========================================================================
     Tab 1: Dynamic Match (Expanded Requirements Form Engine)
     ========================================================================== */
  const KEY = 'bgrneoReq_v2';
  const OPT = (a, sel) => a.map(o => `<option${o === sel ? ' selected' : ''}>${esc(o)}</option>`).join('');

  function matchView() {
    let r = {};
    try { r = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch {}

    const fmt = l => l.replace('*', '<span class="req-star">*</span>');

    const f = (n, l, u) => `
      <label class="f-group" data-field="${n}">
        <span class="f-label">${fmt(l)}</span>
        <input class="f-input" name="${n}" type="number" min="0" step="any" value="${esc(r[n] ?? '')}" ${u ? `placeholder="${u}"` : ''}>
      </label>
    `;

    const sl = (n, l, o) => `
      <label class="f-group" data-field="${n}">
        <span class="f-label">${fmt(l)}</span>
        <div class="select-wrap">
          <select class="f-select" name="${n}">
            <option value="">Any / Standard</option>
            ${OPT(o, r[n])}
          </select>
        </div>
      </label>
    `;

    const t = (n, l, u) => `
      <label class="f-group" data-field="${n}">
        <span class="f-label">${fmt(l)}</span>
        <input class="f-input" name="${n}" type="text" value="${esc(r[n] ?? '')}" ${u ? `placeholder="${u}"` : ''}>
      </label>
    `;

    // Hybrid select-and-type control: a styled, self-positioned option panel that
    // still lets the user type any custom value.
    const combo = (n, l, o, u) => `
      <label class="f-group" data-field="${n}">
        <span class="f-label">${fmt(l)}</span>
        <div class="combo" data-combo="${n}">
          <input class="f-input combo-input" name="${n}" type="text" autocomplete="off" spellcheck="false"
                 role="combobox" aria-expanded="false" value="${esc(r[n] ?? '')}" ${u ? `placeholder="${u}"` : ''}>
          <button type="button" class="combo-clear" tabindex="-1" aria-label="Clear ${esc(l)}" hidden>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <button type="button" class="combo-toggle" tabindex="-1" aria-label="Show options">
            <svg width="10" height="6" viewBox="0 0 10 6"><path fill="currentColor" d="M5 6L0 0h10z"/></svg>
          </button>
          <div class="combo-panel" role="listbox" hidden>
            ${o.map(x => `<button type="button" class="combo-opt" data-val="${esc(x)}">${esc(x)}</button>`).join('')}
            <div class="combo-empty" hidden>No match &mdash; your custom text is kept.</div>
          </div>
        </div>
      </label>
    `;

    $('#view').innerHTML = `
      <div class="view-header">
        <div class="header-content">
          <div class="badge-eyebrow">INTELLIGENT OPTICAL SELECTION ENGINE</div>
          <h1>Find Your Industrial Camera</h1>
          <p class="lead">Specify vision application parameters, working geometry, surface criteria, and lighting conditions. Cameras are dynamically filtered, scored, and ranked in real time.</p>
        </div>
      </div>

      <form class="f" id="rf">
        <section class="form-card">
        <div class="form-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17"/></svg>
          <span>1. Application &amp; Working Field Geometry</span>
        </div>
        <div class="form-grid">
          ${sl('app', 'Application Type *', [
            'Discrete Components (Singulated / Fixtured)',
            'Continuous Web / Sheet / Roll Material',
            'Multi-Part Assembly / Component Tray',
            'Micro-Electronic / PCB / SMT Inspection',
            'Packaging / Bottling / Blister Pack Line',
            'Bulk / Irregular / Random Orientation',
            '3D Camera / Profiling Application'
          ])}
          ${sl('company', 'Company / Brand', [...new Set(CAMERAS.map(camera => camera.brand))])}
          ${f('length', 'Field of View (FOV) Length (mm) *', 'e.g. 200')}
          ${f('width', 'Field of View (FOV) Width (mm) *', 'e.g. 150')}
          ${f('resolution', 'Minimum Resolution (MP)', 'e.g. 5')}
          ${f('frameRate', 'Minimum Frame Rate (FPS)', 'e.g. 60')}
          ${combo('interface', 'Interface Type', [...new Set(CAMERAS.map(camera => camera.iface).filter(Boolean))], 'e.g. GigE or USB 3.0')}
          ${f('height', 'Working Height / Stand-off (mm)', 'e.g. 300')}
          ${f('workLength', 'Component Length (mm)', 'e.g. 180')}
          ${f('workWidth', 'Component Width (mm)', 'e.g. 120')}
          ${f('zCoord', 'Z-Coordinate in FOV (Height Offset mm)', 'e.g. 25')}
          ${f('clearance', 'Clearance (mm)', 'e.g. 150')}
          ${sl('acc', 'Target Accuracy Tolerance *', ['0.05', '0.1', '0.5', '1', '2', '5', '10'].map(x => '±' + x + ' mm').concat('Other'))}
          ${f('accOther', 'Custom Accuracy (mm)', 'e.g. 0.02')}
        </div>
        </section>

        <section class="form-card">
        <div class="form-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span>2. Component Division, Surface &amp; Optical Conditions</span>
        </div>
        <div class="form-grid">
          ${sl('compDiv', 'Component Material', [
            'Plastic', 'Steel', 'Aluminum', 'Glass', 'Wood / Paper', 'Other'
          ])}
          ${t('compDivOther', 'Custom Material', 'e.g. Carbon Fiber')}
          ${combo('readability', 'Readability Criteria *', [
            'Presence / Absence Verification',
            'Object Detection & Counting',
            '1D/2D Barcode (DataMatrix / QR / Code128)',
            'Direct Part Marking (DPM / Dot Peen)',
            'Laser Etched / Engraved Text',
            'High Contrast Printed Text / OCR',
            'Low Contrast / Embossed Typography',
            'Surface Micro-Texture / Grain Inspection'
          ], 'Select or type criteria...')}
          ${sl('visibility', 'Visibility Criteria', [
            'High Opacity / Opaque Matte',
            'Semi-Translucent / Diffuse Substrate',
            'Transparent / Glass / Clear Film',
            'High Specular Reflectivity / Polished Mirror',
            'Low Reflectance / Deep Matte Black',
            'Other'
          ])}
          ${t('visOther', 'Custom Visibility', 'e.g. Polarizing Substrate')}
          ${sl('closedLight', 'Closed Surface Lighting Conditions', [
            'Darkfield Ring Lighting (Scratch & Edge Emphasis)',
            'Brightfield Coaxial (On-Axis Specular Inspection)',
            'Diffuse Dome (Cloudy Day Omnidirectional)',
            'Backlighting (Silhouette & Edge Gauging)',
            'Polarized Multi-Angle Strobe (Glare Suppression)',
            'Structured Laser Line Projection (3D Profile)'
          ])}
          ${sl('color', 'Color Spectrum', ['Color', 'Monochrome', 'Either'])}
          ${sl('type', 'Camera Dimension', ['2D Camera', '3D Camera'])}
        </div>

        <div class="form-submit-bar">
          <div class="fsb-info">
            <span class="fsb-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <div class="fsb-text">
              <strong>Ready to match your camera?</strong>
              <span>Every camera in the index is scored against your optical criteria.</span>
            </div>
          </div>
          <div class="fsb-actions">
            <button type="button" class="btn btn-ghost" id="rs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              <span>Reset</span>
            </button>
            <button type="submit" class="btn btn-apply" id="applyBtn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18l-7 9v7l-4 2v-9z"></path></svg>
              <span>Search Industrial Cameras</span>
            </button>
          </div>
        </div>
        </section>
      </form>

      <div id="out" class="match-results">
        <div class="results-placeholder">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3>Recommended matches are hidden until you apply filters</h3>
          <p>Configure your application, working field geometry, and optical conditions above, then click <strong>Search Industrial Cameras</strong> to reveal ranked camera matches.</p>
        </div>
      </div>
    `;

    const form = $('#rf');
    const out = $('#out');
    const placeholder = out.innerHTML;

    const collect = () => Object.fromEntries(new FormData(form));
    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(collect())); } catch {} };

    // Wires up every hybrid select-and-type control: opens on focus, filters while
    // typing, commits on click, and never overflows the card edges.
    const initCombos = () => {
      form.querySelectorAll('.combo').forEach(box => {
        const input = box.querySelector('.combo-input');
        const panel = box.querySelector('.combo-panel');
        const opts = [...panel.querySelectorAll('.combo-opt')];
        const empty = panel.querySelector('.combo-empty');
        const clearButton = box.querySelector('.combo-clear');

        const close = () => {
          panel.hidden = true;
          box.classList.remove('open');
          box.closest('.form-grid')?.classList.remove('combo-layer-open');
          input.setAttribute('aria-expanded', 'false');
        };
        const filter = () => {
          const q = input.value.trim().toLowerCase();
          clearButton.hidden = !input.value;
          let shown = 0;
          opts.forEach(o => {
            const hit = !q || o.dataset.val.toLowerCase().includes(q);
            o.hidden = !hit;
            if (hit) shown++;
          });
          empty.hidden = shown > 0;
        };
        const open = () => {
          filter();
          panel.hidden = false;
          box.classList.add('open');
          box.closest('.form-grid')?.classList.add('combo-layer-open');
          input.setAttribute('aria-expanded', 'true');
        };

        clearButton.hidden = !input.value;

        input.addEventListener('focus', open);
        input.addEventListener('input', () => { open(); });
        input.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        input.addEventListener('blur', () => setTimeout(close, 140));

        box.querySelector('.combo-toggle').addEventListener('mousedown', e => {
          e.preventDefault();
          if (panel.hidden) { input.focus(); open(); } else { close(); }
        });

        clearButton.addEventListener('mousedown', e => {
          e.preventDefault();
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
          close();
        });

        opts.forEach(o => o.addEventListener('mousedown', e => {
          e.preventDefault();
          input.value = o.dataset.val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          close();
        }));
      });
    };
    initCombos();

    const toggle = (n, show) => {
      const el = form.querySelector(`[data-field="${n}"]`);
      if (el) {
        el.style.display = show ? 'flex' : 'none';
        // Add a small delay for opacity to allow display:flex to take effect
        if (show) {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, 10);
        } else {
          el.style.opacity = '0';
          el.style.transform = 'translateY(10px)';
        }
      }
    };

    const updateFields = () => {
      const d = collect();
      toggle('zCoord', d.app === '3D Camera / Profiling Application' || d.type === '3D Camera');
      toggle('accOther', d.acc === 'Other');
      toggle('compDivOther', d.compDiv === 'Other');
      toggle('visOther', d.visibility === 'Other');
    };

    // Values persist as the user types, but results stay hidden until applied.
    form.addEventListener('input', () => { persist(); updateFields(); });
    form.addEventListener('change', () => { persist(); updateFields(); });
    updateFields();

    form.addEventListener('submit', e => {
      e.preventDefault();
      persist();
      render(collect());
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('#rs').onclick = () => {
      form.reset();
      persist();
      out.innerHTML = placeholder;
      out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
  }

  function render(d) {
    const acc = d.acc === 'Other' ? +d.accOther : d.acc ? parseFloat(d.acc.replace('±', '')) : 0;
    const L = +d.length || +d.workLength || 0;
    const W = +d.width || +d.workWidth || 0;
    const zOffset = +d.zCoord || 0;
    const clearance = +d.clearance || 0;

    // Industrial vision rule: ~3-4 pixels per accuracy tolerance unit across FOV.
    const need = (acc > 0 && L > 0 && W > 0) ? ((L * 3.2 / acc) * (W * 3.2 / acc)) / 1e6 : 0;

    const app = (d.app || '').toLowerCase();
    const read = (d.readability || '').toLowerCase();
    const normalizeColor = v => {
      const text = String(v || '').trim().toLowerCase();
      if (text === 'mono' || text === 'monochrome') return 'mono';
      if (text === 'color' || text === 'colour') return 'color';
      return text;
    };

    // Hard requirement gates — cameras that fail these are excluded, not just penalised.
    const want3D = app.includes('3d') || d.type === '3D Camera';
    const wantDim = want3D ? '3D' : (d.type ? (d.type.startsWith('3D') ? '3D' : '2D') : null);

    let minMp = need > 0 ? need * 0.9 : 0;
    if (app.includes('micro-electronic') || app.includes('pcb') || app.includes('smt')) minMp = Math.max(minMp, 5);

    const strictFilter = window.filterLogic && typeof window.filterLogic.filterMatchingCameras === 'function'
      ? window.filterLogic.filterMatchingCameras
      : (selection, list) => list.filter(camera => {
          const wantType = selection.type && selection.type !== 'Either' ? (selection.type.startsWith('3D') ? '3D' : '2D') : null;
          if (wantType && camera.dim !== wantType) return false;
          if (selection.company && selection.company !== 'Any / Standard' && camera.brand !== selection.company) return false;
          if (selection.color && selection.color !== 'Either' && camera.color && camera.color !== selection.color) return false;
          const needMp = selection.acc && selection.length && selection.width
            ? ((Number(selection.length || selection.workLength || 0) * 3.2 / parseFloat(String(selection.acc).replace('±', '')))
              * (Number(selection.width || selection.workWidth || 0) * 3.2 / parseFloat(String(selection.acc).replace('±', '')))) / 1e6
            : 0;
          if (needMp > 0 && (camera.mp === null || camera.mp < needMp * 0.9)) return false;
          return true;
        });

    const baseMatches = strictFilter(d, CAMERAS);
    const res = baseMatches.map(c => {
      let sc = 50, tags = [];

      // STRICT: camera dimension must match the requested 2D / 3D class.
      if (wantDim && c.dim !== wantDim) return null;

      // STRICT: colour spectrum must match when a specific one is chosen.
      if (d.color && d.color !== 'Either') {
        const selectedColor = normalizeColor(d.color);
        const cameraColor = normalizeColor(c.color);
        if (cameraColor !== selectedColor) return null;
      }

      // STRICT: sensor resolution must satisfy the computed optical requirement.
      if (minMp > 0 && (c.mp === null || c.mp < minMp)) return null;

      // Height offset Z-Coord hints towards 3D line profiles
      if (zOffset > 10 && c.dim === '3D') {
        sc += 25;
        tags.push('3D Z-Profile Verified');
      }

      if (d.color && d.color !== 'Either') {
        const selectedColor = normalizeColor(d.color);
        const cameraColor = normalizeColor(c.color);
        if (cameraColor === selectedColor) {
          sc += 15;
          tags.push('Color Match');
        }
      }

      // Resolution scoring
      if (need > 0 && c.mp !== null) {
        sc += Math.min(30, 15 + Math.round((c.mp / need) * 8));
        tags.push(`Meets ~${need.toFixed(1)} MP`);
      }

      // Application weighting
      if (d.app) {
        const a = app;
        if (a.includes('defect') || a.includes('surface') || a.includes('micro-electronic') || a.includes('pcb')) {
          if (c.mp >= 5) sc += 12;
        }
        if (a.includes('web') || a.includes('continuous') || a.includes('packaging')) {
          if (c.fps && c.fps >= 60) sc += 15;
        }
        if (a.includes('pick') || a.includes('alignment') || a.includes('discrete') || a.includes('irregular')) {
          if (c.dim === '3D') sc += 15;
          if (c.iface.includes('GigE')) sc += 8;
        }
      }

      // Readability criteria weighting (and minimum-resolution gate)
      if (d.readability) {
        if (read.includes('micro-texture') || read.includes('low contrast') || read.includes('embossed')) {
          if (c.mp < 5) return null;
          sc += 10;
          if (c.color === 'Mono') sc += 8;
        } else if (read.includes('dpm') || read.includes('dot peen')) {
          if (c.mp < 3) return null;
          sc += 10;
          if (c.color === 'Mono') sc += 8;
        } else if (read.includes('barcode') || read.includes('ocr') || read.includes('etched') || read.includes('printed text')) {
          if (c.mp < 2) return null;
          sc += 10;
          if (c.color === 'Mono') sc += 8;
        }
      }

      // Visibility & Surface conditions
      if (d.visibility && d.visibility.includes('Specular')) {
        if (c.sensor.toLowerCase().includes('sony')) sc += 6;
      }

      return { c, sc: Math.max(0, Math.min(100, sc)), tags };
    }).filter(Boolean);

    res.sort((a, b) => b.sc - a.sc);

    const out = $('#out');
    if (!out) return;

    if (!res.length) {
      out.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          <h3>No matching camera profiles found</h3>
          <p>Try broadening your field of view, adjusting accuracy tolerance, or clearing dimension filters.</p>
        </div>
      `;
      return;
    }

    out.innerHTML = `
      <div class="results-header">
        <div class="results-title-group">
          <h2>Recommended Cameras (${res.length})</h2>
          ${need > 0 ? `<span class="res-badge">Estimated Optical Resolution: <strong>~${need.toFixed(1)} MP</strong></span>` : ''}
          ${zOffset > 0 ? `<span class="res-badge">Z-Offset: <strong>${zOffset} mm</strong></span>` : ''}
        </div>
        <div class="results-meta">Ranked by optical criteria compatibility score</div>
      </div>
      <div class="grid">
        ${res.map(({ c, sc, tags }) => {
          const tHtml = tags.map(t => `<span class="badge ${t.includes('Verify') ? 'badge-amb' : 'badge-ok'}">${esc(t)}</span>`).join('');
          return camCard(c, `<span class="badge badge-score">${sc}% Match</span>${tHtml}`);
        }).join('')}
      </div>
    `;

    reveal();
  }

  /* ==========================================================================
     Tab 2: Camera Index (Live Catalog Search & Multi-Filter)
     ========================================================================== */
  function catalogView() {
    $('#view').innerHTML = `
      <div class="view-header">
        <div class="header-content">
          <div class="badge-eyebrow">ENTERPRISE VISION PORTFOLIO</div>
          <h1>Industrial Camera Index</h1>
          <p class="lead">Complete reference database of standard industrial area scan, line scan, smart cameras, and 3D sensors. Instant search by brand, interface standard, resolution, or part number.</p>
        </div>
      </div>

      <div class="filter-card">
        <div class="filter-top">
          <div class="search-wrap">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input id="q" class="search-input" type="search" placeholder="Search by model, sensor, brand, interface, or resolution (e.g. Basler, IMX, GigE)...">
          </div>
          <div class="filter-stat-summary">
            Showing <strong id="resCount">${CAMERAS.length}</strong> of <strong>${CAMERAS.length}</strong> cameras
          </div>
        </div>

        <div class="filter-pills-row">
          <div class="pill-group" id="bf">
            <span class="pill-group-lbl">Brand:</span>
            <button class="pill on" data-brand="">All Brands</button>
            ${[...new Set(CAMERAS.map(c => c.brand))].map(b => `<button class="pill" data-brand="${esc(b)}">${esc(b)}</button>`).join('')}
          </div>

          <div class="pill-group" id="df">
            <span class="pill-group-lbl">Dimension:</span>
            <button class="pill on" data-dim="">All (2D &amp; 3D)</button>
            <button class="pill" data-dim="2D">2D Only</button>
            <button class="pill" data-dim="3D">3D Only</button>
          </div>
        </div>
      </div>

      <div id="cg" class="grid"></div>
    `;

    let activeBrand = '';
    let activeDim = '';

    const upd = () => {
      const q = ($('#q').value || '').trim().toLowerCase();
      const list = CAMERAS.filter(c => {
        if (activeBrand && c.brand !== activeBrand) return false;
        if (activeDim && c.dim !== activeDim) return false;
        if (!q) return true;
        const hay = [c.brand, c.origin, c.model, c.dim, c.kind, c.cameraType, c.sensor, c.sensorSize, c.iface, c.color, c.resolution, c.shutter, c.mount, c.note, c.mp ? c.mp + 'mp' : ''].join(' ').toLowerCase();
        return hay.includes(q);
      });

      const countEl = $('#resCount');
      if (countEl) countEl.textContent = list.length;

      const cg = $('#cg');
      if (!list.length) {
        cg.innerHTML = `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3>No cameras match your search query</h3>
            <p>Try resetting the brand or dimension filter pills, or checking for typographical errors.</p>
          </div>
        `;
        return;
      }
      cg.innerHTML = list.map(c => camCard(c)).join('');
      reveal();
    };

    $('#q').addEventListener('input', upd);

    $('#bf').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      $('#bf').querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
      b.classList.add('on');
      activeBrand = b.dataset.brand;
      upd();
    });

    $('#df').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      $('#df').querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
      b.classList.add('on');
      activeDim = b.dataset.dim;
      upd();
    });

    upd();
  }

  /* ==========================================================================
     Tab 3: Authorized Suppliers Directory & WhatsApp Integration
     ========================================================================== */
  function suppliersView() {
    // Group the directory by company while preserving insertion order
    const order = [];
    const byGroup = new Map();
    SUPPLIERS.forEach(s => {
      const key = s.group || s.company;
      if (!byGroup.has(key)) { byGroup.set(key, []); order.push(key); }
      byGroup.get(key).push(s);
    });

    const contactCard = s => `
      <article class="card card-supplier">
        <div class="card-supplier-header">
          ${vendorBadge(s)}
          <h3 class="card-title">${esc(s.person || s.company)}</h3>
          <span class="badge-city"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg> ${esc(s.city)}</span>
        </div>

        <div class="sup-contact-grid" style="margin-top: 14px;">
          <div class="sup-item"><span class="sup-lbl">Company:</span><span class="sup-val">${esc(s.company)}</span></div>
          ${s.role ? `<div class="sup-item"><span class="sup-lbl">Specialisation:</span><span class="sup-val">${esc(s.role)}</span></div>` : ''}
          <div class="sup-item"><span class="sup-lbl">Phone Number:</span><span class="sup-val"><a href="tel:${esc((s.phone || '').replace(/[^\d+]/g,''))}">${esc(s.phone || '—')}</a></span></div>
          <div class="sup-item"><span class="sup-lbl">Email Address:</span><span class="sup-val">${s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : '<span class="note-unverified">Not provided</span>'}</span></div>
          ${s.note ? `<div class="sup-item full"><span class="sup-lbl">Partner Credentials:</span><span class="sup-val note">${esc(s.note)}</span></div>` : ''}
        </div>

        <div class="card-actions" style="margin-top:auto; padding-top:16px; border-top: 1px solid var(--bd-subtle);">
          ${wa(s)}
        </div>
      </article>`;

    $('#view').innerHTML = `
      <div class="view-header">
        <div class="header-content">
          <div class="badge-eyebrow">DISTRIBUTOR &amp; INTEGRATOR NETWORK</div>
          <h1>Registered Vision Partners</h1>
          <p class="lead">Connect directly with certified regional distributors, technical integrators, and product managers across India. Every listed partner is a Registered Vendor. Direct WhatsApp consultation is available on all listings.</p>
        </div>
      </div>

      <div class="sup-filter-bar">
        <label class="sup-filter-field">
          <span class="sup-filter-lbl">Filter by Company</span>
          <span class="select-wrap">
            <select class="f-select" id="supCompany">
              <option value="all">All Companies</option>
              ${order.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('')}
            </select>
          </span>
        </label>

        <label class="sup-filter-field sup-filter-search">
          <span class="sup-filter-lbl">Search Directory</span>
          <span class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="f-input sup-search-input" id="supSearch" type="search" placeholder="Search company, contact or city&hellip;" autocomplete="off">
          </span>
        </label>

        <div class="sup-filter-count" id="supCount"></div>
      </div>

      <div class="supplier-groups" id="supGroups"></div>
    `;

    const groupsEl = $('#supGroups');
    const companySel = $('#supCompany');
    const searchEl = $('#supSearch');
    const countEl = $('#supCount');

    function renderGroups() {
      const company = companySel.value;
      const q = searchEl.value.trim().toLowerCase();
      let html = '';
      let shown = 0;

      order.forEach(g => {
        if (company !== 'all' && g !== company) return;
        let list = byGroup.get(g);
        if (q) {
          list = list.filter(s => [s.person, s.company, s.role, s.city, g]
            .filter(Boolean).join(' ').toLowerCase().includes(q));
        }
        if (!list.length) return;
        shown += list.length;
        const plural = list.length > 1 ? 's' : '';
        const newCount = list.filter(s => s.email).length;
        const authCount = list.length - newCount;
        html += `
          <section class="supplier-group">
            <div class="supplier-group-head">
              <h2 class="supplier-group-name">${esc(g)}</h2>
              <div class="supplier-group-meta">
                <span>${list.length} contact${plural}</span>
                ${newCount ? `<span class="vendor-badge vendor-new">New Supplier${newCount > 1 ? 's' : ''}</span>` : ''}
                ${authCount ? `<span class="vendor-badge vendor-auth">Registered Vendor${authCount > 1 ? 's' : ''}</span>` : ''}
              </div>
            </div>
            <div class="grid grid-suppliers">
              ${list.map(contactCard).join('')}
            </div>
          </section>`;
      });

      groupsEl.innerHTML = html || `
        <div class="sup-empty">
          <strong>No suppliers match your selection.</strong>
          <span>Choose &ldquo;All Companies&rdquo; or clear the search field to see the full directory.</span>
        </div>`;

      countEl.textContent = shown
        ? `${shown} registered contact${shown > 1 ? 's' : ''}`
        : 'No matches';
    }

    companySel.addEventListener('change', renderGroups);
    searchEl.addEventListener('input', renderGroups);
    renderGroups();

    reveal();
  }

  /* ==========================================================================
     Tab 4: Current Project Status Dashboard (Interactive Filter Tabs,
     Public Project Creation, Password-Protected Workflow Edits)
     ========================================================================== */
  const PROJECTS_KEY = 'bgrneoProjects_v6';
  const ACTIVE_PROJECT_PHASE = '2026-2027';
  let projectFilter = 'all'; // 'all', 'at-risk', 'completed'
  let projectCategory = 'all';

  // Admin authentication state: driven strictly by Firebase Authentication
  let isAdminAuthenticated = false;
  let pendingAdminAction = null;

  async function updateAdminAuthState(user) {
    let hasAdminClaim = false;

    if (user) {
        try {
            const tokenResult = await user.getIdTokenResult(true);
            hasAdminClaim = tokenResult.claims.admin === true;
        } catch (error) {
            console.error("Admin claim verification failed:", error);
        }
    }

    // Match the administrator condition enforced by Firestore rules.
    isAdminAuthenticated = !!(
        user &&
        (
            hasAdminClaim ||
            (
                user.email === 'admin@bgrneo.com' &&
                user.emailVerified === true
            )
        )
    );

    try {
        if (isAdminAuthenticated) {
            sessionStorage.setItem('bgrneoAdmin', '1');
        } else {
            sessionStorage.removeItem('bgrneoAdmin');
        }
    } catch {}
}

  // Subscribe to authoritative Firebase Authentication state
  if (window.VisionFirebaseStore?.onAuthStateChanged) {
    window.VisionFirebaseStore.onAuthStateChanged(async user => {
      const prevAdmin = isAdminAuthenticated;
      await updateAdminAuthState(user);
      if (activeWorkflowProjectId && $('#modal') && !$('#modal').hidden && prevAdmin !== isAdminAuthenticated) {
        openWorkflowModal(activeWorkflowProjectId, activeWorkflowStageIndex);
      }
    });
  }

  function loadProjects() {
    try {
      const raw = localStorage.getItem(PROJECTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        PROJECTS.splice(0, PROJECTS.length, ...parsed);
      }
    } catch {}
  }

  function cacheProjectsLocally() {
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(PROJECTS));
    } catch (error) {
      console.error('[VisionSelector] Could not cache projects locally:', error);
    }
  }

  async function saveProject(project) {
    if (!window.VisionFirebaseStore?.configured) {
      throw new Error('Cloud sync is unavailable. Project changes were not saved.');
    }
    await window.VisionFirebaseStore.saveProject(project);
    cacheProjectsLocally();
  }

  function replaceProjects(projects) {
    if (!Array.isArray(projects)) return;
    // Snapshot data is authoritative. Do not normalize and write it back automatically.
    PROJECTS.splice(0, PROJECTS.length, ...projects.map(normalizeCompletedProject));
    cacheProjectsLocally();
  }

  function isProjectCompleted(p) {
    if (!p) return false;
    const phase = projectPhase(p);
    if (phase === '2024-2025' || phase === '2023-2024') {
      return true;
    }
    const stages = Array.isArray(p.stages) ? p.stages : [];
    // A project with any pending stage cannot be classified as completed
    if (stages.length > 0 && stages.some(s => !s.completed)) {
      return false;
    }
    const allStagesDone = stages.length >= WORKFLOW_STAGES.length && stages.every(s => s.completed);
    const progressDone = Number(p.progress) >= 100;
    const workflowDone = stages.length > 0 && workflowProgressFor(p) >= 100;
    return !!(allStagesDone || progressDone || workflowDone);
  }

  function cleanProjectCompany(project) {
    if (!project) return 'BGR NEO';
    let comp = String(project.company || '').trim();
    comp = comp.replace(/^[-–—_\s]+/, '').replace(/[-–—_\s]+$/, '');
    if (!comp || comp === 'Order Received' || comp === 'AUTOMATION' || comp === 'CSAC' || comp.startsWith('-') || comp.endsWith('-') || comp === 'Filling' || comp === 'Moulding' || comp === 'Welding' || comp === 'FAT' || comp === 'Coil' || comp === 'AF3') {
      if (typeof extractClientFromProject === 'function') {
        comp = extractClientFromProject(project.code || project.id, project.name) || comp || 'BGR NEO';
      }
    }
    return comp || 'BGR NEO';
  }

  function normalizeCompletedProject(project) {
    if (!project) return project;
    const phase = projectPhase(project);
    const isTargetSection = phase === '2024-2025' || phase === '2023-2024';
    const comp = cleanProjectCompany(project);
    if (isTargetSection) {
      const existingStages = Array.isArray(project.stages) ? project.stages : [];
      return {
        ...project,
        company: comp,
        progress: 100,
        stages: WORKFLOW_STAGES.map((name, index) => ({
          ...(existingStages[index] || {}),
          name,
          completed: true
        }))
      };
    }

    const stages = Array.isArray(project.stages) ? project.stages : [];
    if (stages.length > 0 && stages.some(s => !s.completed)) {
      return { ...project, company: comp };
    }
    if (!isProjectCompleted(project)) {
      return { ...project, company: comp };
    }

    const existingStages = Array.isArray(project.stages) ? project.stages : [];
    return {
      ...project,
      company: comp,
      progress: 100,
      stages: WORKFLOW_STAGES.map((name, index) => ({
        ...(existingStages[index] || {}),
        name,
        completed: true
      }))
    };
  }

  function workflowProgressFor(project) {
    const stages = Array.isArray(project.stages) ? project.stages : [];
    if (!stages.length) return Number(project.progress) || 0;
    return Math.round((stages.filter(stage => stage.completed).length / WORKFLOW_STAGES.length) * 100);
  }

  function displayedWorkflowProgress(project) {
    if (isProjectCompleted(project)) {
      return 100;
    }
    return workflowProgressFor(project);
  }

  function replaceCameras(cameras) {
    if (!Array.isArray(cameras) || !cameras.length) return;
    CAMERAS.splice(0, CAMERAS.length, ...cameras);
  }

  async function initializeFirebaseSync() {
    if (!window.VisionFirebaseStore?.configured) {
      console.warn('[VisionSelector] Firestore is not configured; cloud project sync is unavailable.');
      return;
    }
    window.VisionFirebaseStore.subscribe(state => {
      // Do not bulk-upload local seed data. Only projects explicitly created in
      // Firestore or changed by an authorized administrator are shared.
      if (state.projects.length) replaceProjects(state.projects);

      if (location.hash === '#projects') {
        if ($('#modal')?.hidden !== false) {
          projectsView();
        } else if (activeWorkflowProjectId) {
          // If modal is currently open, DO NOT rebuild the entire modal via openWorkflowModal().
          // Rebuilding destroys the DOM, resets the scroll position, and interrupts continuous stage updates.
          const activeProj = PROJECTS.find(p => p.id === activeWorkflowProjectId);
          if (activeProj) {
            updateWorkflowModalInPlace(activeProj, activeWorkflowStageIndex);
          }
          refreshProjectsViewStable(activeWorkflowProjectId);
          updateDashboardSummary();
        }
      }
    }, error => {
      showErrorNotification('Cloud project sync failed. Check your Firebase connection and Firestore rules.');
    });
  }

  loadProjects();
  PROJECTS.splice(0, PROJECTS.length, ...PROJECTS.map(normalizeCompletedProject));
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(PROJECTS)); } catch {}
  void initializeFirebaseSync();

  function projectPhase(p) {
    const category = String((p && p.category) || '')
      .replace(/[–—]/g, '-')
      .replace(/\s+/g, '');
    const categoryPhase = category.match(/\d{4}-\d{4}/);
    if (categoryPhase) return categoryPhase[0];

    const year = Number(p && p.year);
    return Number.isFinite(year) ? `${year - 1}-${year}` : '';
  }

  function status(p) {
    const days = Math.ceil((new Date(p.deadline + 'T23:59:59') - new Date()) / 864e5);
    // A project with 11/11 stages completed and 100% progress must be classified as Completed, not Delayed
    if (isProjectCompleted(p)) {
      return { k: 'Completed', a: 0, days };
    }
    if (p.hold) return { k: 'On hold', a: 1, days };
    if (days < 0) return { k: 'Delayed', a: 1, days };
    return { k: 'At risk', a: 1, days };
  }

  function matchesFilter(s) {
    if (projectFilter === 'at-risk') return s.a === 1;
    if (projectFilter === 'completed') return s.k === 'Completed';
    return true;
  }

  function projectCategoryOf(project) {
    if (project && project.category) return project.category;
    const year = Number(project && project.year);
    if (Number.isFinite(year)) {
      return `${year - 1} - ${year} Projects`;
    }
    return '2026 - 2027 Projects';
  }

  function daysCopy(s) {
    if (s.k === 'Completed') {
      return `<div class="status-complete-tag">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        <span>Fully completed &amp; handed over</span>
      </div>`;
    }
    if (s.days < 0) {
      return `<div class="status-overdue-tag">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        <span>${Math.abs(s.days)} day${Math.abs(s.days) === 1 ? '' : 's'} overdue &mdash; Immediate escalation required</span>
      </div>`;
    }
    if (s.k === 'On hold') {
      return `<div class="status-overdue-tag status-onhold-tag">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        <span>On hold &middot; ${s.days} day${s.days === 1 ? '' : 's'} remaining until scheduled target</span>
      </div>`;
    }
    return `<div class="status-days-left">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
      <span>${s.days} day${s.days === 1 ? '' : 's'} remaining (On Track)</span>
    </div>`;
  }

  function milestonePreview(p) {
    const stages = p.stages || [];
    const done = stages.filter(st => st.completed).length;
    const total = stages.length || 11;
    const next = stages.find(st => !st.completed);
    const pct = Math.round((done / total) * 100);

    return `
      <div class="ms-box">
        <div class="ms-hdr">
          <span class="ms-title">11-Stage Workflow Breakdown</span>
          <span class="ms-count"><strong>${done}</strong> / ${total} Stages (${pct}%)</span>
        </div>
        <div class="ms-stepper" title="11-Stage Visual Progress: ${done} completed, ${total - done} pending">
          ${stages.map((st, i) => `
            <span class="ms-step ${st.completed ? 'ms-step-done' : (st === next ? 'ms-step-active' : 'ms-step-pending')}" data-stage-index="${i}" title="Stage ${i + 1}: ${esc(st.name)} (${st.completed ? 'Done' : 'Pending'})"></span>
          `).join('')}
        </div>
        ${next 
          ? `<div class="ms-next-stage"><strong>Next Milestone:</strong> ${esc(next.name)}</div>` 
          : `<div class="ms-next-stage ms-all-done"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> All 11 Milestones Successfully Achieved</div>`}
      </div>
    `;
  }

  // Map a stored calendar year to its academic / financial year range (e.g. 2026 -> "2025–2026")
  function yearRangeLabel(year) {
    const y = parseInt(year, 10);
    if (isNaN(y)) return String(year);
    return `${y - 1}\u2013${y}`;
  }

  function projectCardHTML(p, s) {
    const isDelayed = s.k === 'Delayed';
    const isOnHold = s.k === 'On hold';
    const isAtRisk = s.a === 1;
    const isComplete = s.k === 'Completed';

    let cardAlertClass = '';
    let badgeClass = '';
    let statusIcon = '';
    let barFillClass = '';

    if (isDelayed) {
      cardAlertClass = 'card-alert card-delayed';
      badgeClass = 'badge-red badge-pulsing';
      statusIcon = `<svg class="badge-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;
      barFillClass = 'bar-fill-delayed';
    } else if (isOnHold) {
      cardAlertClass = 'card-alert card-onhold';
      badgeClass = 'badge-red';
      statusIcon = `<svg class="badge-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
      barFillClass = 'bar-fill-onhold';
    } else if (isAtRisk) {
      cardAlertClass = 'card-alert card-atrisk';
      badgeClass = 'badge-red';
      statusIcon = `<svg class="badge-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;
      barFillClass = 'bar-fill-atrisk';
    } else if (isComplete) {
      cardAlertClass = 'card-complete status-completed';
      badgeClass = 'badge-ok';
      statusIcon = `<svg class="badge-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`;
      barFillClass = 'bar-fill-complete';
    } else {
      cardAlertClass = 'card-standard';
      badgeClass = 'badge-blue';
      statusIcon = `<svg class="badge-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>`;
      barFillClass = 'bar-fill-ontrack';
    }

    const clientName = cleanProjectCompany(p);

    return `
      <article class="card project-card ${cardAlertClass}" data-id="${esc(p.id)}" data-category="${esc(projectCategoryOf(p))}" tabindex="0" role="button" aria-label="Project ${esc(p.name)}, Client ${esc(clientName)}, Status ${esc(s.k)}">
        <div class="project-card-top">
          <div class="project-client" title="${esc(clientName)}">${esc(clientName)}</div>
          <div class="project-status-badge">
            <span class="badge ${badgeClass}">
              ${statusIcon}
              <span>${esc(s.k)}</span>
            </span>
          </div>
        </div>

        <div class="project-header-block">
          <h3 class="card-title" title="${esc(p.name)}">${isAtRisk ? '<span class="alert-icon-title" title="Attention Required">⚠️</span> ' : ''}${esc(p.name)}</h3>
          <div class="project-code-row">
            <span class="project-code-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> ${esc(p.code)}</span>
            <span class="project-year-tag">${esc(p.orderDate || yearRangeLabel(p.year))}</span>
          </div>
        </div>

        <div class="bar-container">
          <div class="bar-labels">
            <span class="bar-progress-num"><strong>${esc(p.progress)}%</strong> completed</span>
            <span class="bar-deadline"><svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" style="display:inline-block;vertical-align:-1px;margin-right:4px;"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>Deadline: <strong>${esc(p.deadline)}</strong></span>
          </div>
          <div class="bar" role="progressbar" aria-valuenow="${p.progress}" aria-valuemin="0" aria-valuemax="100">
            <i class="${barFillClass}" data-w="${p.progress}" style="width: ${p.progress}%"></i>
          </div>
        </div>

        <div class="project-timeline-status">
          ${daysCopy(s)}
        </div>

        ${milestonePreview(p)}

        <div class="project-card-footer">
          <span class="project-card-action-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <span>Click card to review &amp; update 11-stage workflow &rarr;</span>
          </span>
          <button type="button" class="btn btn-sm btn-secondary project-edit-btn" data-edit-project="${esc(p.id)}" title="Edit project details">
            Edit details
          </button>
        </div>
      </article>
    `;
  }

  function applyProjectFilter() {
    // 1. Update summary card active tabs
    document.querySelectorAll('.stat-interactive').forEach(s => {
      const isActive = s.dataset.filter === projectFilter;
      s.classList.toggle('stat-active', isActive);
      s.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // 2. Filter project cards
    let visibleCount = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      const project = PROJECTS.find(p => p.id === card.dataset.id);
      if (!project) return;
      const isVisible = matchesFilter(status(project))
        && (projectCategory === 'all' || projectCategoryOf(project) === projectCategory);
      card.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        visibleCount++;
      }
    });

    // 3. Update year sections visibility
    document.querySelectorAll('.year-section').forEach(section => {
      const visible = [...section.querySelectorAll('.project-card')].some(c => c.style.display !== 'none');
      section.hidden = !visible;
    });

    // 4. Update Filter Status Bar Text
    const bar = $('#filterStatusBar');
    const textEl = $('#filterStatusText');
    const resetBtn = $('#filterResetBtn');
    if (bar && textEl) {
      if (projectFilter === 'all') {
        textEl.innerHTML = `Showing all <strong>${PROJECTS.length}</strong> industrial vision integration projects across all years`;
        if (resetBtn) resetBtn.hidden = true;
      } else if (projectFilter === 'at-risk') {
        textEl.innerHTML = `Filtered View: Showing <strong>${visibleCount}</strong> project${visibleCount === 1 ? '' : 's'} needing immediate attention (Delayed, On Hold, or &lt; 14 Days)`;
        if (resetBtn) resetBtn.hidden = false;
      } else if (projectFilter === 'completed') {
        textEl.innerHTML = `Filtered View: Showing <strong>${visibleCount}</strong> fully completed &amp; handed-over project${visibleCount === 1 ? '' : 's'}`;
        if (resetBtn) resetBtn.hidden = false;
      }
    }

    // 5. Empty filter state fallback
    const emptyState = $('#emptyFilterState');
    if (emptyState) {
      emptyState.hidden = (visibleCount > 0);
    }
  }

  function updateAlertBadge() {
    const alertProjectsCount = PROJECTS.filter(p => status(p).a).length;
    const alertBadge = $('#alertCount');
    if (alertBadge) {
      if (alertProjectsCount > 0) {
        alertBadge.textContent = alertProjectsCount;
        alertBadge.hidden = false;
      } else {
        alertBadge.hidden = true;
      }
    }
  }

  function updateDashboardSummary() {
    const totalProjects = PROJECTS.length;
    const atRiskProjects = PROJECTS.filter(p => status(p).a === 1).length;
    const completedProjects = PROJECTS.filter(p => status(p).k === 'Completed').length;

    const totalValEl = document.querySelector('.stat[data-filter="all"] .stat-value');
    if (totalValEl) {
      totalValEl.textContent = totalProjects;
      totalValEl.setAttribute('data-val', totalProjects);
    }

    const atRiskValEl = document.querySelector('.stat[data-filter="at-risk"] .stat-value');
    if (atRiskValEl) {
      atRiskValEl.textContent = atRiskProjects;
      atRiskValEl.setAttribute('data-val', atRiskProjects);
    }

    const completedValEl = document.querySelector('.stat[data-filter="completed"] .stat-value');
    if (completedValEl) {
      completedValEl.textContent = completedProjects;
      completedValEl.setAttribute('data-val', completedProjects);
    }

    updateAlertBadge();
    applyProjectFilter();
  }

  function projectsView() {
    const st = PROJECTS.map(p => ({ p, s: status(p) }))
      .sort((a, b) => {
        if (a.s.a !== b.s.a) return b.s.a - a.s.a;
        if (b.p.year !== a.p.year) return b.p.year - a.p.year;
        return new Date(a.p.deadline) - new Date(b.p.deadline);
      });

    const bad = st.filter(x => x.s.a).length;
    const completed = st.filter(x => x.s.k === 'Completed').length;

    const groupedByCategory = {};
    st.forEach(({ p, s }) => {
      const category = projectCategoryOf(p);
      if (!groupedByCategory[category]) groupedByCategory[category] = [];
      groupedByCategory[category].push({ p, s });
    });

    let projectsHTML = '';
    const sortedCategories = ORDER_PROJECT_CATEGORIES.filter(category => groupedByCategory[category]);

    sortedCategories.forEach(category => {
      const categoryProjects = groupedByCategory[category];
      projectsHTML += `
        <div class="year-section" data-category="${esc(category)}">
          <div class="year-header">
            <h2 class="year-title">${esc(category)}</h2>
            <span class="year-count">${categoryProjects.length} project${categoryProjects.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="grid">
            ${categoryProjects.map(({ p, s }) => projectCardHTML(p, s)).join('')}
          </div>
        </div>
      `;
    });

    $('#view').innerHTML = `
      <div class="view-header">
        <div class="header-content">
          <h1>Project Status</h1>
          <p class="lead">Real-time status monitoring, milestone roadmaps, and 11-stage delivery verification for all client machine vision installations.</p>
        </div>
        <div class="header-actions">
          <button id="addProjectBtn" class="btn btn-primary" title="Create a new client project (Public)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      <!-- 3 Summary Stat Cards (Side-by-Side Responsive 3-Column Grid) -->
      <div class="stats-row" role="tablist" aria-label="Project filter summary cards">
        <!-- Card 1: Total Projects -->
        <button type="button" class="stat stat-interactive ${projectFilter === 'all' ? 'stat-active' : ''}" data-filter="all" role="tab" aria-selected="${projectFilter === 'all'}" title="Filter: Show all projects">
          <div class="stat-hdr">
            <div class="stat-hdr-left">
              <svg class="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <span class="stat-pill-tag">PORTFOLIO OVERVIEW</span>
            </div>
            <span class="stat-active-indicator">ACTIVE FILTER</span>
          </div>
          <div class="stat-main">
            <b class="stat-value" data-val="${PROJECTS.length}">${PROJECTS.length}</b>
            <div class="stat-label">Total Projects</div>
          </div>
          <div class="stat-sub">
            <span>All active &amp; archived client integration systems</span>
          </div>
        </button>

        <!-- Card 2: Needs Immediate Attention / At Risk -->
        <button type="button" class="stat stat-interactive stat-alert stat-red ${projectFilter === 'at-risk' ? 'stat-active' : ''}" data-filter="at-risk" role="tab" aria-selected="${projectFilter === 'at-risk'}" title="Filter: Show only At Risk / Delayed / On Hold projects">
          <div class="stat-hdr">
            <div class="stat-hdr-left">
              <span class="stat-pulse-dot"></span>
              <span class="stat-pill-tag tag-alert">NEEDS IMMEDIATE ATTENTION</span>
            </div>
            <span class="stat-active-indicator">ACTIVE FILTER</span>
          </div>
          <div class="stat-main">
            <b class="stat-value text-red" data-val="${bad}">${bad}</b>
            <div class="stat-label">Needs Immediate Attention / At Risk</div>
          </div>
          <div class="stat-sub text-red-sub">
            <span>Delayed, on-hold or high-risk timeline alerts</span>
          </div>
        </button>

        <!-- Card 3: Fully Completed -->
        <button type="button" class="stat stat-interactive stat-success stat-green ${projectFilter === 'completed' ? 'stat-active' : ''}" data-filter="completed" role="tab" aria-selected="${projectFilter === 'completed'}" title="Filter: Show only fully completed projects">
          <div class="stat-hdr">
            <div class="stat-hdr-left">
              <svg class="stat-icon icon-success" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span class="stat-pill-tag tag-success">CLOSED LOOP</span>
            </div>
            <span class="stat-active-indicator">ACTIVE FILTER</span>
          </div>
          <div class="stat-main">
            <b class="stat-value text-green" data-val="${completed}">${completed}</b>
            <div class="stat-label">Fully Completed</div>
          </div>
          <div class="stat-sub text-green-sub">
            <span>100% FAT/SAT verified &amp; handed over to client</span>
          </div>
        </button>
      </div>

      <!-- Filter Status Feedback Bar -->
      <div class="filter-status-bar" id="filterStatusBar">
        <div class="filter-status-left">
          <span class="filter-status-beacon"></span>
          <span id="filterStatusText">Showing all <strong>${PROJECTS.length}</strong> industrial vision integration projects</span>
        </div>

        <div class="project-category-filter">
          <label class="sup-filter-field" for="projectCategory">
            <span class="sup-filter-lbl">Order Received Project Category</span>
            <span class="select-wrap">
              <select class="f-select" id="projectCategory">
                <option value="all">All Project Categories</option>
                ${ORDER_PROJECT_CATEGORIES.map(category => `<option value="${esc(category)}">${esc(category)}</option>`).join('')}
              </select>
            </span>
          </label>
        </div>
        <button type="button" class="btn btn-sm btn-secondary" id="filterResetBtn" hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span>Reset Filter</span>
        </button>
      </div>

      <!-- Empty State Container when filter yields 0 matches -->
      <div class="empty-state empty-filter-state" id="emptyFilterState" hidden>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3>No projects match the selected filter</h3>
        <p>There are currently no projects matching this status criteria. Click below to view all projects.</p>
        <div style="margin-top: 16px;">
          <button type="button" class="btn btn-primary" id="emptyStateResetBtn">Show All Projects</button>
        </div>
      </div>

      <!-- Year Sections with Project Cards -->
      <div id="projectsListContainer">
        ${projectsHTML}
      </div>
    `;

    // Click handlers are attached once per newly rendered card.
    document.querySelectorAll('.project-card').forEach(bindProjectCard);
    const categorySelect = $('#projectCategory');
    if (categorySelect) {
      categorySelect.value = projectCategory;
      categorySelect.addEventListener('change', e => {
        projectCategory = e.target.value;
        applyProjectFilter();
      });
    }

    // Public Project Creation (No password prompt!)
    $('#addProjectBtn')?.addEventListener('click', () => openAddProjectModal());

    // Interactive summary stat card filter buttons
    document.querySelectorAll('.stat-interactive').forEach(stat => {
      stat.addEventListener('click', () => {
        projectFilter = stat.dataset.filter;
        applyProjectFilter();
      });
    });

    $('#filterResetBtn')?.addEventListener('click', () => {
      projectFilter = 'all';
      projectCategory = 'all';
      if ($('#projectCategory')) $('#projectCategory').value = 'all';
      applyProjectFilter();
    });

    $('#emptyStateResetBtn')?.addEventListener('click', () => {
      projectFilter = 'all';
      projectCategory = 'all';
      if ($('#projectCategory')) $('#projectCategory').value = 'all';
      applyProjectFilter();
    });

    applyProjectFilter();
    updateAlertBadge();
    reveal();
  }

  function bindProjectCard(card) {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-edit-project]')) return;
      const stepEl = e.target.closest('[data-stage-index]');
      const initialStage = stepEl ? parseInt(stepEl.dataset.stageIndex, 10) : 0;
      openWorkflowModal(card.dataset.id, initialStage);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (e.target.closest('[data-edit-project]')) return;
        const stepEl = e.target.closest('[data-stage-index]');
        const initialStage = stepEl ? parseInt(stepEl.dataset.stageIndex, 10) : 0;
        openWorkflowModal(card.dataset.id, initialStage);
      }
    });
    card.querySelector('[data-edit-project]')?.addEventListener('click', e => {
      e.stopPropagation();
      openEditProjectModal(e.currentTarget.dataset.editProject || card.dataset.id);
    });
  }

  function refreshProjectsViewStable(projectId) {
    const scrollTop = window.scrollY;
    document.body.classList.add('suppress-card-motion');
    const currentCard = projectId && document.querySelector(`.project-card[data-id="${CSS.escape(projectId)}"]`);
    const project = projectId && PROJECTS.find(item => item.id === projectId);
    if (currentCard && project && currentCard.dataset.category === projectCategoryOf(project)) {
      const replacement = document.createElement('div');
      replacement.innerHTML = projectCardHTML(project, status(project));
      const nextCard = replacement.firstElementChild;
      currentCard.replaceWith(nextCard);
      bindProjectCard(nextCard);
      applyProjectFilter();
      updateAlertBadge();
    } else {
      projectsView();
    }
    window.scrollTo(0, scrollTop);
    requestAnimationFrame(() => document.body.classList.remove('suppress-card-motion'));
  }

  /* ==========================================================================
     Admin Password Authorization Controller
     ========================================================================== */
  function updateBodyModalOverflow() {
    const hasOpenModal = ($('#authModal') && !$('#authModal').hidden) ||
                         ($('#welcomeModal') && !$('#welcomeModal').hidden) ||
                         ($('#modal') && !$('#modal').hidden);
    document.body.style.overflow = hasOpenModal ? 'hidden' : '';
  }

  function closeAuthModal() {
    const m = $('#authModal');
    if (m) m.hidden = true;
    $('#authError') && ($('#authError').hidden = true);
    $('#authPassword') && ($('#authPassword').value = '');
    updateBodyModalOverflow();
  }

  function authenticateAdmin(callback) {
    if (isAdminAuthenticated) {
      if (typeof callback === 'function') callback();
      return;
    }
    pendingAdminAction = callback;
    const err = $('#authError');
    if (err) err.hidden = true;
    const modal = $('#authModal');
    if (modal) {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      setTimeout(() => $('#authPassword')?.focus(), 50);
    }
  }

  /* ==========================================================================
     11-Stage Workflow Modal (View Mode & Password-Protected Edit Mode)
     ========================================================================== */
  let activeWorkflowProjectId = null;
  let activeWorkflowStageIndex = 0;

  function stageDetailHTML(stage, stageIndex, totalStages) {
    return `
      <div class="workflow-detail-header">
        <span class="badge badge-subtle">Stage ${stageIndex + 1} of ${totalStages}</span>
        <span class="badge ${stage.completed ? 'badge-ok' : 'badge-amb'}">${stage.completed ? 'Completed' : 'Pending'}</span>
      </div>
      <h3>${esc(stage.name)}</h3>
      ${stage.description ? `<p>${esc(stage.description)}</p>` : '<p class="edit-status-note">No additional stage description has been recorded.</p>'}
      ${stage.date ? `<div><strong>Relevant date:</strong> ${esc(stage.date)}</div>` : ''}
      ${stage.notes ? `<div><strong>Notes:</strong> ${esc(stage.notes)}</div>` : ''}
      ${Array.isArray(stage.attachments) && stage.attachments.length
        ? `<div><strong>Attachments:</strong> ${stage.attachments.map(file => esc(file.name || file)).join(', ')}</div>` : ''}
    `;
  }

  function updateStageDetail(project, stageIndex) {
    const detailSec = document.querySelector('.workflow-stage-detail');
    if (!detailSec || !project) return;
    const stage = (project.stages && project.stages[stageIndex]) || { name: WORKFLOW_STAGES[stageIndex], completed: false };
    detailSec.innerHTML = stageDetailHTML(stage, stageIndex, WORKFLOW_STAGES.length);
  }

  function selectStageInModal(projectId, stageIndex) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) return;
    const parsed = parseInt(stageIndex, 10);
    const validIdx = Math.max(0, Math.min(WORKFLOW_STAGES.length - 1, Number.isInteger(parsed) ? parsed : 0));
    activeWorkflowProjectId = projectId;
    activeWorkflowStageIndex = validIdx;

    document.querySelectorAll('.workflow-stage').forEach(el => {
      const idx = parseInt(el.dataset.stageIndex, 10);
      el.classList.toggle('stage-selected', idx === validIdx);
    });

    updateStageDetail(project, validIdx);
  }

  function updateWorkflowModalInPlace(project, stageIndex) {
    if (!project) return;
    const stages = project.stages || [];
    const stage = stages[stageIndex];
    const completedStages = stages.filter(s => s.completed).length;
    const totalStages = WORKFLOW_STAGES.length;
    const progress = Math.round((completedStages / totalStages) * 100);
    project.progress = progress;
    const projStatus = status(project);
    const isComplete = projStatus.k === 'Completed';

    // 1. Update the specific toggled stage row
    const stageEl = document.querySelector(`.workflow-stage[data-stage-index="${stageIndex}"]`);
    if (stageEl && stage) {
      stageEl.classList.toggle('stage-complete', !!stage.completed);
      stageEl.classList.toggle('stage-pending', !stage.completed);

      const statusTextEl = stageEl.querySelector('.stage-status');
      if (statusTextEl) {
        statusTextEl.textContent = stage.completed ? '✓ Completed' : 'Pending';
      }

      const toggleBtn = stageEl.querySelector('.stage-toggle');
      if (toggleBtn) {
        toggleBtn.classList.toggle('stage-toggle-active', !!stage.completed);
        toggleBtn.textContent = stage.completed ? '✓' : (isAdminAuthenticated ? '○' : '🔒');
        toggleBtn.title = isAdminAuthenticated
          ? (stage.completed ? 'Click to mark pending' : 'Click to mark completed')
          : 'Admin Authorization required to toggle';
      }
    }

    // 2. Update stats count
    const countEl = document.getElementById('completedStagesCount');
    if (countEl) countEl.textContent = completedStages;

    // 3. Update progress value and progress bar
    const progressValEl = document.getElementById('modalProgressVal');
    if (progressValEl) progressValEl.textContent = progress + '%';

    const bar = document.getElementById('modalProgressBar');
    if (bar) {
      bar.style.width = progress + '%';
      bar.setAttribute('data-w', progress);
      let barClass = 'bar-fill-ontrack';
      if (isComplete) barClass = 'bar-fill-complete';
      else if (projStatus.k === 'Delayed') barClass = 'bar-fill-delayed';
      else if (projStatus.k === 'On hold') barClass = 'bar-fill-onhold';
      else if (projStatus.a) barClass = 'bar-fill-atrisk';
      bar.className = barClass;

      const barContainer = bar.closest('.bar');
      if (barContainer) {
        barContainer.setAttribute('aria-valuenow', progress);
      }
    }

    // 4. Update modal header badge
    const modalBadge = document.querySelector('#mbody .modal-hdr-top .badge-cluster .badge:first-child');
    if (modalBadge) {
      modalBadge.className = 'badge ' + (isComplete ? 'badge-ok' : (projStatus.a ? 'badge-red' : 'badge-amb'));
      modalBadge.textContent = projStatus.k;
    }

    // 5. Update timeline status copy
    const timelineEl = document.querySelector('#mbody .project-timeline-status');
    if (timelineEl) {
      timelineEl.innerHTML = daysCopy(projStatus);
    }

    // 6. Update stage detail if viewing this stage
    if (activeWorkflowStageIndex === stageIndex) {
      updateStageDetail(project, stageIndex);
    }

    // 7. Update manual progress slider if visible
    const slider = document.getElementById('adminProgressSlider');
    if (slider) slider.value = progress;
    const sliderDisplay = document.getElementById('sliderValDisplay');
    if (sliderDisplay) sliderDisplay.innerHTML = `<strong>${progress}%</strong>`;
  }

  function openWorkflowModal(projectId, selectedStageIndex) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    // Capture existing scroll positions before updating DOM
    const sheet = $('#modal .sheet');
    const savedSheetScroll = sheet ? sheet.scrollTop : 0;
    const stagesContainer = $('#mbody .workflow-stages');
    const savedStagesScroll = stagesContainer ? stagesContainer.scrollTop : null;

    const existingStages = Array.isArray(project.stages) ? project.stages : [];
    project.stages = WORKFLOW_STAGES.map((name, index) => ({
      ...(existingStages[index] || {}),
      name,
      completed: !!existingStages[index]?.completed
    }));
    const parsedIndex = (selectedStageIndex !== undefined && selectedStageIndex !== null)
      ? (Number.isInteger(selectedStageIndex) ? selectedStageIndex : parseInt(selectedStageIndex, 10))
      : (activeWorkflowProjectId === projectId ? activeWorkflowStageIndex : 0);
    const stageIndex = Math.max(0, Math.min(10, Number.isInteger(parsedIndex) ? parsedIndex : 0));
    activeWorkflowProjectId = projectId;
    activeWorkflowStageIndex = stageIndex;
    const selectedStage = project.stages[stageIndex];

    const projectStatus = status(project);
    const completedStages = project.stages.filter(s => s.completed).length;
    const totalStages = WORKFLOW_STAGES.length;
    const workflowProgress = displayedWorkflowProgress(project);

    let modalBarFillClass = 'bar-fill-ontrack';
    if (projectStatus.k === 'Completed') modalBarFillClass = 'bar-fill-complete';
    else if (projectStatus.k === 'Delayed') modalBarFillClass = 'bar-fill-delayed';
    else if (projectStatus.k === 'On hold') modalBarFillClass = 'bar-fill-onhold';
    else if (projectStatus.a) modalBarFillClass = 'bar-fill-atrisk';

    const modalClient = cleanProjectCompany(project);

    $('#mbody').innerHTML = `
      <div class="modal-hdr">
        <div class="modal-hdr-top">
          <span class="brandtag">${esc(modalClient)}</span>
          <div class="badge-cluster">
            <span class="badge ${projectStatus.a ? 'badge-red' : (projectStatus.k === 'Completed' ? 'badge-ok' : 'badge-amb')}">
              ${esc(projectStatus.k)}
            </span>
            <span class="badge badge-subtle">${esc(project.year)}</span>
          </div>
        </div>
        <h2 style="margin: 8px 0 4px;">${esc(project.name)}</h2>
        <div class="project-code">${esc(project.code)}</div>
      </div>

      <!-- Admin Status Banner -->
      <div class="admin-auth-banner ${isAdminAuthenticated ? 'unlocked' : 'locked'}">
        <div class="admin-auth-text">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            ${isAdminAuthenticated 
              ? '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>' 
              : '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'}
          </svg>
          <div>
            ${isAdminAuthenticated 
              ? `<strong>Admin Authorization Active:</strong> You can toggle 11-stage workflow statuses, modify progress percentage, or adjust project deadline.`
              : `<strong>Public Viewing Mode:</strong> Workflow viewing is open. Updating progress percentages or toggling 11-stage workflow statuses requires Admin Authorization.`}
          </div>
        </div>
        <div>
          ${isAdminAuthenticated 
            ? `<button type="button" class="btn btn-sm btn-secondary" id="lockAdminSessionBtn" title="Lock admin session">Lock Session</button>`
            : `<button type="button" class="btn btn-sm btn-primary" id="unlockAdminBtn">Unlock Edits</button>`}
        </div>
      </div>

      <div class="workflow-progress">
        <div class="bar-container">
          <div class="bar-labels">
            <span class="bar-progress-num"><strong id="modalProgressVal">${workflowProgress}%</strong> completed</span>
            <span class="bar-deadline">Deadline: <strong>${esc(project.deadline)}</strong></span>
          </div>
          <div class="bar" role="progressbar" aria-valuenow="${workflowProgress}" aria-valuemin="0" aria-valuemax="100">
            <i id="modalProgressBar" class="${modalBarFillClass}" style="width: ${workflowProgress}%" data-w="${workflowProgress}"></i>
          </div>
        </div>
        <div class="project-timeline-status" style="margin-top: 10px;">
          ${daysCopy(projectStatus)}
        </div>
      </div>

      ${isAdminAuthenticated ? `
        <!-- Admin Edit Controls Toolbar -->
        <div class="admin-edit-toolbar">
          <div class="admin-toolbar-row">
            <label class="admin-slider-label">
              <span>Manual Progress Override:</span>
              <input type="range" id="adminProgressSlider" min="0" max="100" value="${project.progress}" class="admin-slider">
              <span id="sliderValDisplay" class="slider-display"><strong>${project.progress}%</strong></span>
            </label>
            <button type="button" class="btn btn-sm btn-secondary" id="syncProgressBtn" title="Auto-calculate progress from completed stages">
              Sync from Stages
            </button>
          </div>
          <div class="admin-toolbar-row" style="margin-top: 10px;">
            <label class="admin-date-label">
              <span>Edit Deadline:</span>
              <input type="date" id="adminDeadlineInput" value="${esc(project.deadline)}" class="f-input" style="padding: 4px 10px; height: 36px;">
            </label>
            <label class="admin-hold-label">
              <input type="checkbox" id="adminHoldCheckbox" ${project.hold ? 'checked' : ''}>
              <span>Put Project On Hold</span>
            </label>
          </div>
        </div>
      ` : ''}

      <div class="workflow-stages">
        <div class="workflow-title-row">
          <div class="workflow-title">11-Stage Industrial Workflow</div>
          <div class="workflow-stats-tag">Completed: <strong id="completedStagesCount">${completedStages}</strong> of ${totalStages}</div>
        </div>
        <div class="workflow-list">
          ${project.stages.map((stage, index) => `
            <div class="workflow-stage ${stage.completed ? 'stage-complete' : 'stage-pending'} ${index === stageIndex ? 'stage-selected' : ''}" data-stage-index="${index}" data-project-id="${esc(project.id)}" role="button" tabindex="0">
              <div class="stage-number">${index + 1}</div>
              <div class="stage-content">
                <div class="stage-name">${esc(stage.name)}</div>
                <div class="stage-status">${stage.completed ? '✓ Completed' : 'Pending'}</div>
              </div>
              <button type="button" class="stage-toggle ${stage.completed ? 'stage-toggle-active' : ''} ${!isAdminAuthenticated ? 'stage-toggle-locked' : ''}" title="${isAdminAuthenticated ? (stage.completed ? 'Click to mark pending' : 'Click to mark completed') : 'Admin Authorization required to toggle'}">
                ${stage.completed ? '✓' : (isAdminAuthenticated ? '○' : '🔒')}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <section class="workflow-stage-detail" aria-live="polite">
        ${stageDetailHTML(selectedStage, stageIndex, totalStages)}
      </section>

      <div class="modal-actions">
        <div class="modal-actions-left">
          <button type="button" class="btn btn-danger" id="deleteProjectBtn" title="Delete this project">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            <span>Delete Project</span>
          </button>
          <button type="button" class="btn btn-secondary" id="closeWorkflowModalBtn">Close</button>
        </div>
        <div class="modal-actions-right">
          ${!isAdminAuthenticated ? `
            <button type="button" class="btn btn-primary" id="promptAuthBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>Admin Authorize to Save</span>
            </button>
          ` : `
            <button type="button" class="btn btn-primary" id="saveWorkflowBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>Save Changes</span>
            </button>
          `}
        </div>
      </div>
    `;

    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';

    // Restore scroll positions if re-rendering an open modal
    if (sheet && savedSheetScroll > 0) {
      sheet.scrollTop = savedSheetScroll;
    }
    const nextStagesContainer = $('#mbody .workflow-stages');
    if (nextStagesContainer) {
      if (savedStagesScroll !== null && savedStagesScroll > 0) {
        nextStagesContainer.scrollTop = savedStagesScroll;
      } else if (stageIndex > 0) {
        const activeStageEl = nextStagesContainer.querySelector(`.workflow-stage[data-stage-index="${stageIndex}"]`);
        if (activeStageEl) {
          nextStagesContainer.scrollTop = Math.max(0, activeStageEl.offsetTop - nextStagesContainer.offsetTop - 12);
        }
      }
    }

    // Stage selection and status toggles use the same zero-based data-stage-index.
    document.querySelectorAll('.workflow-stage').forEach(el => {
      el.addEventListener('click', (e) => {
        const stageIdx = parseInt(el.dataset.stageIndex, 10);
        if (e.target.closest('.stage-toggle')) {
          e.preventDefault();
          e.stopPropagation();
          if (!isAdminAuthenticated) {
            authenticateAdmin(() => toggleStage(projectId, stageIdx));
          } else {
            toggleStage(projectId, stageIdx);
          }
          return;
        }
        e.preventDefault();
        selectStageInModal(projectId, stageIdx);
      });
      el.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        selectStageInModal(projectId, parseInt(el.dataset.stageIndex, 10));
      });
    });

    // Unlock Admin Button
    $('#unlockAdminBtn')?.addEventListener('click', () => {
      authenticateAdmin(() => openWorkflowModal(projectId, stageIndex));
    });

    $('#promptAuthBtn')?.addEventListener('click', () => {
      authenticateAdmin(() => openWorkflowModal(projectId, stageIndex));
    });

    // Lock Session Button
    $('#lockAdminSessionBtn')?.addEventListener('click', () => {
      isAdminAuthenticated = false;
      try { sessionStorage.removeItem('bgrneoAdmin'); } catch {}
      if (window.VisionFirebaseStore?.signOutAdmin) {
        window.VisionFirebaseStore.signOutAdmin().catch(() => {});
      }
      openWorkflowModal(projectId, stageIndex);
    });

    // Slider listener
    const slider = $('#adminProgressSlider');
    if (slider) {
      slider.addEventListener('input', e => {
        const val = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
        project.progress = val;
        $('#modalProgressVal') && ($('#modalProgressVal').textContent = val + '%');
        $('#sliderValDisplay') && ($('#sliderValDisplay').innerHTML = `<strong>${val}%</strong>`);
        const bar = $('#modalProgressBar');
        if (bar) {
          bar.style.width = val + '%';
          bar.setAttribute('data-w', val);
          const curStatus = status(project);
          bar.className = curStatus.k === 'Completed' ? 'bar-fill-complete' : (curStatus.k === 'Delayed' ? 'bar-fill-delayed' : (curStatus.k === 'On hold' ? 'bar-fill-onhold' : (curStatus.a ? 'bar-fill-atrisk' : 'bar-fill-ontrack')));
        }
      });
    }

    // Sync from stages button
    $('#syncProgressBtn')?.addEventListener('click', () => {
      const calc = workflowProgressFor(project);
      project.progress = calc;
      if (slider) slider.value = calc;
      $('#modalProgressVal') && ($('#modalProgressVal').textContent = calc + '%');
      $('#sliderValDisplay') && ($('#sliderValDisplay').innerHTML = `<strong>${calc}%</strong>`);
      const bar = $('#modalProgressBar');
      if (bar) {
        bar.style.width = calc + '%';
        bar.setAttribute('data-w', calc);
        const curStatus = status(project);
        bar.className = curStatus.k === 'Completed' ? 'bar-fill-complete' : (curStatus.k === 'Delayed' ? 'bar-fill-delayed' : (curStatus.k === 'On hold' ? 'bar-fill-onhold' : (curStatus.a ? 'bar-fill-atrisk' : 'bar-fill-ontrack')));
      }
    });

    // Deadline and Hold inputs
    $('#adminDeadlineInput')?.addEventListener('change', e => {
      if (e.target.value) {
        project.deadline = e.target.value;
        const curStatus = status(project);
        const timelineEl = document.querySelector('#mbody .project-timeline-status');
        if (timelineEl) timelineEl.innerHTML = daysCopy(curStatus);
        const modalBadge = document.querySelector('#mbody .modal-hdr-top .badge-cluster .badge:first-child');
        if (modalBadge) {
          modalBadge.className = 'badge ' + (curStatus.k === 'Completed' ? 'badge-ok' : (curStatus.a ? 'badge-red' : 'badge-amb'));
          modalBadge.textContent = curStatus.k;
        }
      }
    });

    $('#adminHoldCheckbox')?.addEventListener('change', e => {
      project.hold = !!e.target.checked;
      const curStatus = status(project);
      const timelineEl = document.querySelector('#mbody .project-timeline-status');
      if (timelineEl) timelineEl.innerHTML = daysCopy(curStatus);
      const modalBadge = document.querySelector('#mbody .modal-hdr-top .badge-cluster .badge:first-child');
      if (modalBadge) {
        modalBadge.className = 'badge ' + (curStatus.k === 'Completed' ? 'badge-ok' : (curStatus.a ? 'badge-red' : 'badge-amb'));
        modalBadge.textContent = curStatus.k;
      }
    });

    // Save Changes button
    $('#saveWorkflowBtn')?.addEventListener('click', () => {
      void saveWorkflowChanges(projectId);
    });

    $('#deleteProjectBtn')?.addEventListener('click', () => {
      deleteProject(projectId);
    });

    $('#closeWorkflowModalBtn')?.addEventListener('click', () => {
      close();
    });
  }

  async function toggleStage(projectId, stageIndex) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project || !isAdminAuthenticated) return;
    const prevCompleted = !!project.stages[stageIndex].completed;
    const prevProgress = project.progress;

    project.stages[stageIndex].completed = !prevCompleted;
    project.progress = workflowProgressFor(project);

    // Update modal DOM immediately in-place (scroll position remains completely frozen)
    updateWorkflowModalInPlace(project, stageIndex);

    // Update background dashboard card & summary counts
    refreshProjectsViewStable(projectId);
    updateDashboardSummary();

    try {
      await saveProject(project);
    } catch (error) {
      project.stages[stageIndex].completed = prevCompleted;
      project.progress = prevProgress;
      updateWorkflowModalInPlace(project, stageIndex);
      refreshProjectsViewStable(projectId);
      updateDashboardSummary();
      showErrorNotification('Workflow changes could not be saved. Please try again.');
    }
  }

  async function saveWorkflowChanges(projectId) {
    const project = PROJECTS.find(p => p.id === projectId);
    const saveButton = $('#saveWorkflowBtn');
    if (!project || !saveButton || saveButton.disabled) return;

    saveButton.disabled = true;
    saveButton.setAttribute('aria-busy', 'true');
    saveButton.textContent = 'Saving...';
    try {
      project.progress = workflowProgressFor(project);
      await saveProject(project);
      close();
      refreshProjectsViewStable(projectId);
      updateDashboardSummary();
      showSuccessNotification('Workflow changes saved successfully.');
    } catch (error) {
      saveButton.disabled = false;
      saveButton.removeAttribute('aria-busy');
      saveButton.textContent = 'Save Changes';
      showErrorNotification('Workflow changes could not be saved. Please try again.');
    }
  }

  function showSuccessNotification(message) {
    let toast = $('#successToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'successToast';
      document.body.appendChild(toast);
    }

    toast.className = 'success-toast';
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showSuccessNotification.timer);
    clearTimeout(showErrorNotification.timer);
    showSuccessNotification.timer = setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function showErrorNotification(message) {
    let toast = $('#successToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'successToast';
      document.body.appendChild(toast);
    }
    toast.className = 'success-toast error-toast';
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showSuccessNotification.timer);
    clearTimeout(showErrorNotification.timer);
    showErrorNotification.timer = setTimeout(() => { toast.hidden = true; }, 5000);
  }

  function openEditProjectModal(projectId) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    const currentStatus = status(project);
    $('#mbody').innerHTML = `
      <div class="modal-hdr">
        <div class="modal-hdr-top">
          <span class="badge badge-blue">EDIT PROJECT DETAILS</span>
          <span class="badge ${currentStatus.a ? 'badge-red' : (currentStatus.k === 'Completed' ? 'badge-ok' : 'badge-amb')}">${esc(currentStatus.k)}</span>
        </div>
        <h2>Update ${esc(project.name)}</h2>
        <div class="project-code">${esc(project.code)}</div>
      </div>
      <form id="editProjectForm" class="project-form">
        <div class="form-grid">
          <label class="f-group">
            <span class="f-label">Project Name *</span>
            <input class="f-input" name="name" required value="${esc(project.name)}">
          </label>
          <label class="f-group">
            <span class="f-label">Project Year *</span>
            <input class="f-input" name="year" type="number" min="2000" max="2200" required value="${esc(project.year)}">
          </label>
          <label class="f-group">
            <span class="f-label">Year / Phase</span>
            <select class="f-select" name="category">
              ${ORDER_PROJECT_CATEGORIES.map(category => `<option value="${esc(category)}" ${projectCategoryOf(project) === category ? 'selected' : ''}>${esc(category)}</option>`).join('')}
            </select>
          </label>
          <label class="f-group">
            <span class="f-label">Camera Model / System</span>
            <input class="f-input" name="cameraModel" value="${esc(project.cameraModel || '')}" placeholder="e.g. Basler ace 2">
          </label>
          <label class="f-group" style="grid-column: 1 / -1;">
            <span class="f-label">Camera Specifications</span>
            <textarea class="f-input" name="cameraSpecs" rows="3" placeholder="Resolution, interface, lens, lighting, or other project specifications">${esc(project.cameraSpecs || '')}</textarea>
          </label>
          <label class="f-group">
            <span class="f-label">Progress (%)</span>
            <input class="f-input" name="progress" type="number" min="0" max="100" required value="${esc(project.progress)}">
          </label>
          <label class="f-group">
            <span class="f-label">Completion Deadline</span>
            <input class="f-input" name="deadline" type="date" required value="${esc(project.deadline)}">
          </label>
          <label class="f-group edit-project-hold">
            <span class="f-label">Workflow Status</span>
            <span class="edit-status-note">${esc(currentStatus.k)} is calculated from phase, progress, deadline, and hold.</span>
            <label><input type="checkbox" name="hold" ${project.hold ? 'checked' : ''}> Put project on hold</label>
          </label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelEditProject">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Project Details</button>
        </div>
      </form>
    `;

    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
    $('#editProjectForm').addEventListener('submit', async e => {
      e.preventDefault();
      const saveButton = e.target.querySelector('button[type="submit"]');
      if (saveButton.disabled) return;
      const originalProject = JSON.parse(JSON.stringify(project));
      saveButton.disabled = true;
      saveButton.setAttribute('aria-busy', 'true');
      saveButton.textContent = 'Saving...';
      const data = new FormData(e.target);
      project.name = String(data.get('name') || '').trim();
      project.year = parseInt(data.get('year'), 10);
      project.category = String(data.get('category') || '').trim();
      project.cameraModel = String(data.get('cameraModel') || '').trim();
      project.cameraSpecs = String(data.get('cameraSpecs') || '').trim();
      project.progress = Math.min(100, Math.max(0, parseInt(data.get('progress'), 10) || 0));
      project.deadline = String(data.get('deadline') || project.deadline);
      project.hold = data.get('hold') === 'on';
      const phase = projectPhase(project);
      if (phase === '2024-2025' || phase === '2023-2024') {
        project.progress = 100;
      }
      try {
        await saveProject(project);
        $('#modal').hidden = true;
        document.body.style.overflow = '';
        refreshProjectsViewStable(project.id);
        showSuccessNotification('Project details saved successfully.');
      } catch (error) {
        Object.assign(project, originalProject);
        try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(PROJECTS)); } catch {}
        saveButton.disabled = false;
        saveButton.removeAttribute('aria-busy');
        saveButton.textContent = 'Save Project Details';
        showErrorNotification('Project details could not be saved. Please try again.');
      }
    });
    $('#cancelEditProject').addEventListener('click', () => {
      $('#modal').hidden = true;
      document.body.style.overflow = '';
    });
  }

  async function deleteProject(projectId) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project || !isAdminAuthenticated) return;
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    const button = $('#deleteProjectBtn');
    if (button) {
      button.disabled = true;
      button.textContent = 'Deleting...';
    }
    try {
      if (!window.VisionFirebaseStore?.configured) {
        throw new Error('Cloud sync is unavailable. Project was not deleted.');
      }
      await window.VisionFirebaseStore.deleteProject(projectId);
      const index = PROJECTS.findIndex(p => p.id === projectId);
      if (index >= 0) PROJECTS.splice(index, 1);
      cacheProjectsLocally();
      $('#modal').hidden = true;
      document.body.style.overflow = '';
      projectsView();
      showSuccessNotification('Project deleted successfully.');
    } catch (error) {
      if (button) {
        button.disabled = false;
        button.textContent = 'Delete Project';
      }
      showErrorNotification('Project could not be deleted. Check administrator authorization and try again.');
    }
  }

  /* ==========================================================================
     Public Add New Project Modal (Unrestricted, No Password Needed)
     ========================================================================== */
  function openAddProjectModal() {
    $('#mbody').innerHTML = `
      <div class="modal-hdr">
        <div class="modal-hdr-top">
          <span class="badge badge-ok">PUBLIC PROJECT CREATION</span>
          <span class="badge badge-subtle">Unrestricted</span>
        </div>
        <h2 style="margin: 8px 0 4px;">Add New Vision Integration Project</h2>
        <p class="lead">Register a new client integration initiative with automated 11-stage workflow tracking. Anyone can create projects.</p>
      </div>

      <form id="newProjectForm" class="project-form">
        <div class="form-grid">
          <div class="f-group">
            <span class="f-label">Company / Client Name *</span>
            <input type="text" class="f-input" name="company" required placeholder="e.g. TetraPak, Krones, Bosch" autofocus>
          </div>
          <div class="f-group">
            <span class="f-label">Project Name *</span>
            <input type="text" class="f-input" name="name" required placeholder="e.g. Blister Pack Inspection System">
          </div>
          <div class="f-group">
            <span class="f-label">Project Tracking Code *</span>
            <input type="text" class="f-input" name="code" required placeholder="e.g. TP-VIS-008" value="BGR-VIS-${String(PROJECTS.length + 1).padStart(3, '0')}">
          </div>
          <div class="f-group">
            <span class="f-label">Academic / Financial Year *</span>
            <div class="select-wrap">
              <select class="f-select" name="year" required>
                <option value="2026">2025&ndash;2026</option>
                <option value="2027" selected>2026&ndash;2027</option>
                <option value="2028">2027&ndash;2028</option>
                <option value="2029">2028&ndash;2029</option>
              </select>
            </div>
          </div>
          <div class="f-group">
            <span class="f-label">Completion Target Deadline *</span>
            <input type="date" class="f-input" name="deadline" required value="${new Date(Date.now() + 60 * 864e5).toISOString().split('T')[0]}">
          </div>
          <div class="f-group">
            <span class="f-label">Initial Progress (%)</span>
            <input type="number" class="f-input" name="progress" min="0" max="100" value="0" placeholder="0 - 100">
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancelNewProject">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Create Project Now</span>
          </button>
        </div>
      </form>
    `;

    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';

    $('#newProjectForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.currentTarget;
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton.disabled) return;

      const formData = new FormData(form);
      const year = parseInt(formData.get('year'), 10) || 2026;
      const newProject = {
        id: 'p' + Date.now() + Math.random().toString(36).slice(2, 7),
        company: String(formData.get('company') || 'Client').trim(),
        name: String(formData.get('name') || 'Vision Inspection').trim(),
        code: String(formData.get('code') || 'BGR-000').trim().toUpperCase(),
        year,
        category: `${year - 1} - ${year} Projects`,
        progress: 0,
        deadline: String(formData.get('deadline') || ''),
        hold: false,
        stages: WORKFLOW_STAGES.map(name => ({ name, completed: false }))
      };

      submitButton.disabled = true;
      submitButton.textContent = 'Creating...';
      try {
        if (!window.VisionFirebaseStore?.configured) {
          throw new Error('Cloud sync is unavailable. Project was not created.');
        }
        await window.VisionFirebaseStore.createProject(newProject);
        PROJECTS.unshift(newProject);
        cacheProjectsLocally();
        close();
        projectsView();
        showSuccessNotification('Project created successfully.');
      } catch (error) {
        submitButton.disabled = false;
        submitButton.textContent = 'Create Project Now';
        showErrorNotification('Project could not be created in the cloud. Please check the connection and try again.');
      }
    });

    $('#cancelNewProject')?.addEventListener('click', () => {
      close();
    });
  }

  /* ==========================================================================
     Modal Spec Sheet Dialog (Camera Full Specs)
     ========================================================================== */
  // Derive an honest sensor vendor label from the sensor string (no fabrication).
  function sensorVendor(s) {
    if (!s) return null;
    if (/^sony/i.test(s)) return 'Sony';
    if (/^(on[\s-]?semi|onsemi)/i.test(s)) return 'onsemi';
    if (/cmos|ccd|imager|depthsense/i.test(s)) return null;
    return s.split(' ')[0];
  }

  // Derive sensor technology family from the sensor part number where known.
  function sensorTech(s) {
    if (!s) return null;
    if (/pregius/i.test(s)) return 'Sony Pregius (Global Shutter CMOS)';
    if (/depthsense/i.test(s)) return 'Sony DepthSense (Time-of-Flight)';
    if (/imx/i.test(s)) return 'Sony IMX CMOS';
    if (/cmos/i.test(s)) return 'CMOS';
    return null;
  }

  function modal(id) {
    const c = CAMERAS.find(x => x.id === id);
    if (!c) return;
    const imgSrc = `assets/cameras/${c.image || BRAND_IMAGES[c.brand] || 'basler.svg'}`;
    const note = c.note || '';
    const shutter = c.shutter || (/global shutter/i.test(note) ? 'Global shutter'
      : /rolling shutter/i.test(note) ? 'Rolling shutter' : null);
    const mount = c.mount || (/c-mount/i.test(note) ? 'C-mount' : null);

    // Prefer the camera-level supplier routing, otherwise fall back to brand routing
    const supplierId = c.supplier || BRAND_SUPPLIER[c.brand];
    const model = `${c.brand} ${c.model} — ${c.mp} MP, ${c.fps} FPS, ${c.sensor}, ${c.iface}, ${c.color}, ${c.dim}`;

    $('#mbody').innerHTML = `
      <div class="modal-media-banner">
        <img src="${imgSrc}" alt="${esc(c.brand)} ${esc(c.model)}" class="modal-camera-img">
      </div>

      <div class="modal-hdr">
        <span class="brandtag">${esc(c.brand)} &middot; ${esc(c.origin)}</span>
        <h2>${esc(c.model)}</h2>
        <div class="badge-cluster" style="margin-top: 8px;">
          <span class="badge badge-subtle">${esc(c.dim)} Sensor</span>
          <span class="badge badge-subtle">${esc(c.cameraType || c.kind)}</span>
          ${c.color ? `<span class="badge badge-subtle">${esc(c.color)}</span>` : ''}
        </div>
      </div>

      <div class="modal-specs">
        <div class="modal-section-title">Optical &amp; Imaging Specifications</div>
        <dl class="spec-grid spec-grid-modal">
          <dt>Resolution</dt><dd>${val(c.resolution || (c.mp === null ? null : `${c.mp} Megapixels`))}</dd>
          <dt>Megapixels</dt><dd>${c.mp === null ? V : `<strong>${esc(c.mp)} MP</strong>`}</dd>
          <dt>Frame Rate</dt><dd>${c.fps === null ? V : `<strong>${esc(c.fps)} FPS</strong>`}</dd>
          <dt>Sensor Model</dt><dd>${val(c.sensor)}</dd>
          <dt>Sensor Size</dt><dd>${val(c.sensorSize)}</dd>
          <dt>Sensor Vendor</dt><dd>${val(sensorVendor(c.sensor))}</dd>
          <dt>Sensor Technology</dt><dd>${val(sensorTech(c.sensor))}</dd>
          <dt>Shutter Type</dt><dd>${val(shutter)}</dd>
          <dt>Color Spectrum</dt><dd>${val(c.color)}</dd>
        </dl>

        <div class="modal-section-title">Hardware &amp; Interface</div>
        <dl class="spec-grid spec-grid-modal">
          <dt>Camera Category</dt><dd>${esc(c.dim)} Sensor</dd>
          <dt>Camera Type</dt><dd>${val(c.cameraType || c.kind)}</dd>
          <dt>Interface Standard</dt><dd>${val(c.iface)}</dd>
          <dt>Lens Mount</dt><dd>${val(mount)}</dd>
          <dt>Manufacturer Origin</dt><dd>${val(c.origin)}</dd>
        </dl>

        <div class="modal-section-title">Commercial Reference</div>
        <dl class="spec-grid spec-grid-modal">
          <dt>Brand</dt><dd>${esc(c.brand)}</dd>
          <dt>Model / Part Number</dt><dd>${esc(c.model)}</dd>
        </dl>
      </div>

      ${c.note ? `<div class="modal-note"><span class="modal-note-lbl">Engineering Note:</span> ${esc(c.note)}</div>` : ''}

      <div class="modal-supplier-section">
        <div class="modal-section-title">Authorized Supplier Contact</div>
        <div class="sup-guard">
          <span class="sup-guard-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </span>
          <p class="sup-guard-note">Supplier contact details are protected. Reveal the authorized distributor, key contact, direct phone, email, and WhatsApp enquiry only when you are ready to reach out.</p>
          <button type="button" class="btn btn-apply" id="revealSup">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>View Supplier Contact</span>
          </button>
        </div>
        <div id="supReveal" hidden>
          ${supBlock(sup(supplierId), model)}
        </div>
      </div>
    `;

    $('#revealSup')?.addEventListener('click', () => {
      const box = $('#supReveal');
      if (!box) return;
      box.hidden = false;
      $('#revealSup')?.closest('.sup-guard')?.remove();
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  const close = () => {
    $('#modal').hidden = true;
    activeWorkflowProjectId = null;
    activeWorkflowStageIndex = 0;
    updateBodyModalOverflow();
  };

  /* ==========================================================================
     Shell Navigation, Indicator Pill & Routing
     ========================================================================== */
  const routes = {
    match: matchView,
    catalog: catalogView,
    suppliers: suppliersView,
    projects: projectsView
  };

  const navToggle = $('#navToggle');
  const mainNav = $('#nav');

  function openMobileNav() {
    if (!mainNav || !navToggle) return;
    mainNav.classList.add('is-open');
    navToggle.classList.add('is-active');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    if (!mainNav || !navToggle) return;
    mainNav.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileNav() {
    if (mainNav?.classList.contains('is-open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  navToggle?.addEventListener('click', e => {
    e.stopPropagation();
    toggleMobileNav();
  });

  document.querySelectorAll('#nav a').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  document.addEventListener('click', e => {
    if (mainNav?.classList.contains('is-open') && !e.target.closest('#nav') && !e.target.closest('#navToggle')) {
      closeMobileNav();
    }
  });

  function moveInd() {
    if (window.innerWidth < 768) return;
    const active = document.querySelector('#nav a.on');
    const ind = $('#ind');
    if (!active || !ind) return;
    ind.style.width = active.offsetWidth + 'px';
    ind.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mainNav?.classList.contains('is-open')) {
      closeMobileNav();
    }
    moveInd();
  });
  window.addEventListener('load', moveInd);

  function route() {
    closeMobileNav();
    const h = (location.hash || '#match').slice(1);
    const target = routes[h] ? h : 'match';
    (routes[target] || matchView)();

    document.querySelectorAll('#nav a').forEach(a => {
      a.classList.toggle('on', a.getAttribute('href') === '#' + target);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const v = $('#view');
    if (v) {
      v.classList.remove('enter');
      void v.offsetWidth;
      v.classList.add('enter');
    }

    setTimeout(moveInd, 40);
  }

  // Global Click Handlers
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cam]');
    if (b) modal(b.dataset.cam);
  });

  $('#mx').onclick = close;
  $('#modal').onclick = e => { if (e.target.id === 'modal') close(); };

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (mainNav?.classList.contains('is-open')) {
      closeMobileNav();
      return;
    }
    if ($('#authModal') && !$('#authModal').hidden) {
      pendingAdminAction = null;
      closeAuthModal();
      return;
    }
    if ($('#welcomeModal') && !$('#welcomeModal').hidden) {
      closeWelcomeModal();
      return;
    }
    if ($('#modal') && !$('#modal').hidden) {
      close();
      return;
    }
  });

  window.addEventListener('hashchange', route);

  // Admin Auth Form Handling (Unified Firebase Authentication)
  $('#authForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = ($('#authEmail')?.value || 'admin@bgrneo.com').trim();
    const password = ($('#authPassword')?.value || '').trim();
    const submitBtn = $('#authSubmitBtn');
    const err = $('#authError');
    if (err) err.hidden = true;

    if (!password) {
      if (err) {
        err.textContent = 'Administrator password is required.';
        err.hidden = false;
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying with Firebase...';
    }

    try {
      if (!window.VisionFirebaseStore?.hasAuth) {
        throw new Error('Firebase Authentication is not available or not loaded.');
      }
      // Direct Firebase Authentication sign-in creates an authentic database session
      const user = await window.VisionFirebaseStore.signInAdmin(email, password);
      updateAdminAuthState(user);
      if (!isAdminAuthenticated) {
        await window.VisionFirebaseStore.signOutAdmin();
        throw new Error('This Firebase account is not the verified BGR NEO administrator account (admin@bgrneo.com).');
      }
      closeAuthModal();
      const fn = pendingAdminAction;
      pendingAdminAction = null;
      if (typeof fn === 'function') fn();
      showSuccessNotification('Administrator authenticated via Firebase.');
    } catch (authErr) {
      console.warn('[VisionSelector] Firebase Authentication failed:', authErr.code, authErr.message);
      let userMsg = 'Authentication failed. Please verify credentials.';
      if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
        userMsg = 'Incorrect administrator password. Access denied.';
      } else if (authErr.code === 'auth/user-not-found') {
        userMsg = 'Administrator account not found in Firebase. Please verify email.';
      } else if (authErr.code === 'auth/too-many-requests') {
        userMsg = 'Too many failed attempts. Please try again later.';
      } else if (authErr.message && authErr.message.includes('not the verified BGR NEO administrator')) {
        userMsg = 'This account is not authorized. Sign in with the verified admin@bgrneo.com administrator account.';
      } else if (authErr.message && authErr.message.includes('CONFIGURATION_NOT_FOUND')) {
        userMsg = 'Firebase Authentication is not enabled in Firebase Console for this project.';
      }
      if (err) {
        err.textContent = userMsg;
        err.hidden = false;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Authorize & Continue';
      }
    }
  });

  $('#authClose')?.addEventListener('click', () => {
    pendingAdminAction = null;
    closeAuthModal();
  });

  $('#authModal')?.addEventListener('click', e => {
    if (e.target.id === 'authModal') {
      pendingAdminAction = null;
      closeAuthModal();
    }
  });

  // Welcome Modal Logic
  const WELCOME_KEY = 'bgrneoWelcomeShown';
  function showWelcomeModal() {
    const hasShown = localStorage.getItem(WELCOME_KEY);
    if (!hasShown) {
      const welcomeModal = $('#welcomeModal');
      if (welcomeModal) {
        welcomeModal.hidden = false;
        document.body.style.overflow = 'hidden';
      }
    }
  }

  function closeWelcomeModal() {
    const welcomeModal = $('#welcomeModal');
    if (welcomeModal) {
      welcomeModal.hidden = true;
      updateBodyModalOverflow();
      localStorage.setItem(WELCOME_KEY, 'true');
    }
  }

  $('#welcomeClose')?.addEventListener('click', closeWelcomeModal);
  $('#welcomeBtn')?.addEventListener('click', closeWelcomeModal);
  $('#welcomeModal')?.addEventListener('click', e => {
    if (e.target.id === 'welcomeModal') closeWelcomeModal();
  });

  // Initial boot
  route();
  updateAlertBadge();
  showWelcomeModal();
})();
