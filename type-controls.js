(() => {
  const storageKey = 'devika-proposal-timeless-v1';
  const families = {
    serif: { name: 'Timeless Serif', font: "'Timeless Serif',serif", min: 200, max: 700, style: 0, serif: true },
    text: { name: 'Timeless Text', font: "'Timeless Serif',serif", min: 200, max: 700, style: 100, serif: true },
    sans: { name: 'Timeless Sans', font: "'Timeless Sans',sans-serif", min: 300, max: 800, style: 100, serif: false },
    grotesk: { name: 'Timeless Grotesk', font: "'Timeless Sans',sans-serif", min: 300, max: 800, style: 0, serif: false }
  };
  const defaults = {
    hero: { family: 'serif', weight: 300, spacing: -0.035, height: 0.9, style: 0, italic: 0 },
    section: { family: 'serif', weight: 350, spacing: -0.025, height: 1.17, style: 0, italic: 0 },
    body: { family: 'sans', weight: 420, spacing: 0, height: 1.65, style: 100, italic: 0 }
  };
  const limits = { weight: [200, 800], spacing: [-0.08, 0.12], height: [0.75, 2], style: [0, 100], italic: [0, 100] };
  const state = JSON.parse(JSON.stringify(defaults));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function normalize(group) {
    const value = state[group], family = families[value.family];
    if (family.serif) value.italic = value.italic >= 50 ? 100 : 0;
    value.weight = clamp(value.weight, family.serif && value.italic ? 300 : family.min, family.max);
  }
  let canSave = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    for (const group of Object.keys(state)) {
      if (saved?.[group]?.family in families) state[group].family = saved[group].family;
      for (const key of Object.keys(limits)) {
        const value = saved?.[group]?.[key];
        if (typeof value === 'number' && Number.isFinite(value)) state[group][key] = clamp(value, ...limits[key]);
      }
      normalize(group);
    }
  } catch { canSave = false; }
  function apply() {
    for (const [group, value] of Object.entries(state)) {
      const family = families[value.family];
      const variables = { font: family.font, weight: value.weight, spacing: `${value.spacing}em`, height: value.height, style: value.style, italic: family.serif ? 0 : value.italic, 'italic-style': family.serif && value.italic ? 'italic' : 'normal' };
      for (const [key, setting] of Object.entries(variables)) document.documentElement.style.setProperty(`--${group}-${key}`, setting);
    }
  }
  apply();
  const names = { hero: 'Hero', section: 'Section', body: 'Body' };
  const field = (group, key, label, unit) => `<div class="type-field"><div class="type-field-top"><label for="type-${group}-${key}">${label}</label><div class="type-number-wrap"><input id="type-${group}-${key}-number" type="number" min="${limits[key][0]}" max="${limits[key][1]}" step="${key === 'spacing' ? '0.001' : key === 'height' ? '0.01' : '1'}" data-type-group="${group}" data-type-key="${key}" aria-label="${names[group]} ${label.toLowerCase()} value"><span>${unit}</span></div></div><input id="type-${group}-${key}" type="range" min="${limits[key][0]}" max="${limits[key][1]}" step="${key === 'spacing' ? '0.001' : key === 'height' ? '0.01' : '1'}" data-type-group="${group}" data-type-key="${key}" aria-label="${names[group]} ${label.toLowerCase()}"></div>`;
  const groupMarkup = (group, title, subtitle) => `<fieldset class="type-group"><legend>${title}</legend><div class="type-group-sub"><span>${subtitle}</span><button type="button" data-type-preview="${group}">View ↗</button></div><div class="type-select-row"><label for="type-${group}-family">Typeface</label><select id="type-${group}-family" data-type-group="${group}" data-type-key="family">${Object.entries(families).map(([id,f])=>`<option value="${id}">${f.name}</option>`).join('')}</select></div>${field(group,'weight','Font weight','')}<span class="type-weight-label" data-weight-label="${group}"></span>${field(group,'spacing','Letter spacing','em')}${field(group,'height','Line height','×')}<details class="type-variations"><summary>Style & italic variations</summary><p class="type-axis-note" data-axis-note="${group}"></p>${field(group,'style','Style axis','%')}${field(group,'italic','Italic','%')}</details><button type="button" class="type-reset-group" data-type-reset="${group}">Reset ${names[group].toLowerCase()} settings</button></fieldset>`;
  const container = document.createElement('div');
  container.className = 'type-controls';
  container.innerHTML = `<button type="button" class="type-launcher" id="type-launcher" aria-expanded="false" aria-controls="type-panel"><span aria-hidden="true">Aa</span> Typography</button><aside class="type-panel" id="type-panel" aria-labelledby="type-panel-title" hidden><div class="type-panel-header"><div><span class="type-kicker">CONTROL CENTER</span><h2 id="type-panel-title">Timeless Type</h2></div><button type="button" class="type-close" aria-label="Close typography controls">×</button></div><p class="type-intro">Four cuts. Every variable weight. Tune your type live.</p><div class="type-panel-fields">${groupMarkup('hero','Hero heading','The opening wordmark')}${groupMarkup('section','Section headings','All eight section titles')}${groupMarkup('body','Body & labels','Your supporting typography')}</div><div class="type-panel-footer"><button type="button" class="type-reset-all">Reset all</button><span id="type-save-status" role="status">${canSave ? 'Saved in this browser' : 'Changes apply to this session'}</span></div></aside>`;
  document.body.appendChild(container);
  const panel = container.querySelector('#type-panel'), launcher = container.querySelector('#type-launcher'), status = container.querySelector('#type-save-status');
  let refreshTimer;
  function syncInputs(skipInput) {
    container.querySelectorAll('[data-type-group]').forEach(input => {
      const group = input.dataset.typeGroup, key = input.dataset.typeKey, value = state[group], family = families[value.family];
      if (key === 'weight') { input.min = family.serif && value.italic ? 300 : family.min; input.max = family.max; }
      if (key === 'italic') input.step = family.serif ? 100 : 1;
      input.disabled = key === 'style' && family.serif && value.italic > 0;
      if (input !== skipInput) input.value = value[key];
      if (input.type === 'range') input.style.setProperty('--range-fill', `${(Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100}%`);
    });
    for (const [group, value] of Object.entries(state)) {
      const family = families[value.family];
      const named = family.serif ? {200:'Thin',300:'Light',350:'Book',400:'Regular',500:'Medium',600:'Semibold',700:'Bold'} : {300:'Light',420:'Regular',500:'Medium',600:'Semibold',700:'Bold',800:'Black'};
      container.querySelector(`[data-weight-label="${group}"]`).textContent = `${named[value.weight] || 'Custom weight'} · ${family.serif && value.italic ? 300 : family.min}–${family.max}`;
      container.querySelector(`[data-axis-note="${group}"]`).textContent = family.serif ? (value.italic ? 'Dedicated true italic. Available from 300–700; this cut has no style axis.' : 'Style: 0 = Serif / Display, 100 = Text. Italic switches to the true italic cut.') : 'Style: 0 = Grotesk, 100 = Sans. Italic blends continuously from 0–100.';
    }
  }
  function update(skipInput) {
    apply(); syncInputs(skipInput);
    try { localStorage.setItem(storageKey, JSON.stringify(state)); status.textContent = 'Saved in this browser'; }
    catch { status.textContent = 'Changes apply to this session'; }
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => window.ScrollTrigger?.refresh(), 140);
  }
  function setOpen(open) {
    panel.hidden = !open; launcher.setAttribute('aria-expanded', String(open));
    (open ? container.querySelector('.type-close') : launcher).focus({preventScroll:true});
  }
  launcher.addEventListener('click', () => setOpen(panel.hidden));
  container.querySelector('.type-close').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) setOpen(false); });
  container.addEventListener('input', event => {
    const input = event.target;
    if (!input.matches('[data-type-group]')) return;
    const group = input.dataset.typeGroup, key = input.dataset.typeKey;
    if (key === 'family') {
      state[group].family = input.value; state[group].style = families[input.value].style;
      normalize(group); update(); return;
    }
    if (input.type === 'number' && (input.value.trim() === '' || !input.validity.valid || !Number.isFinite(Number(input.value)))) return;
    state[group][key] = Number(input.value); normalize(group);
    update(input.type === 'number' && Number(input.value) === state[group][key] ? input : undefined);
  });
  container.addEventListener('change', event => {
    const input = event.target;
    if (!input.matches('input[type="number"][data-type-group]')) return;
    if (input.value.trim() === '' || !Number.isFinite(Number(input.value))) { syncInputs(); return; }
    const group = input.dataset.typeGroup, key = input.dataset.typeKey;
    state[group][key] = clamp(Number(input.value), Number(input.min), Number(input.max));
    normalize(group); update();
  });
  container.addEventListener('click', event => {
    const reset = event.target.closest('[data-type-reset]');
    if (reset) { state[reset.dataset.typeReset] = {...defaults[reset.dataset.typeReset]}; update(); }
    if (event.target.closest('.type-reset-all')) { for (const group of Object.keys(state)) state[group] = {...defaults[group]}; update(); }
    const preview = event.target.closest('[data-type-preview]');
    if (preview) document.querySelector(preview.dataset.typePreview === 'hero' ? '#top' : '#objective').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
  });
  syncInputs();
})();
