(() => {
  const storageKey = "devika-proposal-timeless-v1";
  const families = {
    serif: {
      name: "Timeless Serif",
      font: "'Timeless Serif',serif",
      min: 200,
      max: 700,
      style: 0,
      serif: true,
    },
    text: {
      name: "Timeless Text",
      font: "'Timeless Serif',serif",
      min: 200,
      max: 700,
      style: 100,
      serif: true,
    },
    sans: {
      name: "Timeless Sans",
      font: "'Timeless Sans',sans-serif",
      min: 300,
      max: 800,
      style: 100,
      serif: false,
    },
    grotesk: {
      name: "Timeless Grotesk",
      font: "'Timeless Sans',sans-serif",
      min: 300,
      max: 800,
      style: 0,
      serif: false,
    },
  };
  const defaults = {
    hero: {
      family: "serif",
      weight: 300,
      spacing: -0.035,
      height: 0.9,
      style: 0,
      italic: 0,
    },
    section: {
      family: "serif",
      weight: 350,
      spacing: -0.025,
      height: 1.17,
      style: 0,
      italic: 0,
    },
    statement: {
      family: "sans",
      weight: 420,
      size: 22,
      spacing: 0,
      height: 1.6,
      style: 100,
      italic: 0,
    },
    cardHeading: {
      family: "sans",
      weight: 500,
      size: 26,
      spacing: -0.015,
      height: 1.2,
      style: 100,
      italic: 0,
    },
    cardCopy: {
      family: "sans",
      weight: 420,
      size: 18,
      spacing: 0,
      height: 1.65,
      style: 100,
      italic: 0,
    },
    body: {
      family: "sans",
      weight: 420,
      spacing: 0,
      height: 1.65,
      style: 100,
      italic: 0,
    },
  };
  const limits = {
    size: [16, 64],
    weight: [200, 800],
    spacing: [-0.08, 0.12],
    height: [0.75, 2],
    style: [0, 100],
    italic: [0, 100],
  };
  const state = JSON.parse(JSON.stringify(defaults));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function normalize(group) {
    const value = state[group],
      family = families[value.family];
    if (group === "cardCopy") value.size = clamp(value.size, 16, 18);
    if (family.serif) value.italic = value.italic >= 50 ? 100 : 0;
    value.weight = clamp(
      value.weight,
      family.serif && value.italic ? 300 : family.min,
      family.max,
    );
  }
  let canSave = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    for (const group of Object.keys(state)) {
      if (saved?.[group]?.family in families)
        state[group].family = saved[group].family;
      for (const key of Object.keys(limits)) {
        const value = saved?.[group]?.[key];
        if (typeof value === "number" && Number.isFinite(value))
          state[group][key] = clamp(value, ...limits[key]);
      }
      normalize(group);
    }
  } catch {
    canSave = false;
  }
  const defaultCardColors = ["#ececea", "#ececea", "#ececea", "#ececea"];
  let cardColors = [...defaultCardColors];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey + "-gray-cards"));
    if (Array.isArray(saved))
      cardColors = defaultCardColors.map((fallback, i) =>
        /^#[0-9a-f]{6}$/i.test(saved[i]) ? saved[i] : fallback,
      );
  } catch {
    /* Retain the default card palette. */
  }
  function applyCardColors() {
    document.querySelectorAll(".objective-card").forEach((card, i) => {
      const color = cardColors[i];
      card.style.backgroundColor = color;
      card.style.setProperty("--card-color", color);
      const rgb = [1, 3, 5]
        .map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      const light = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.179;
      card.style.setProperty("--card-ink", light ? "#352e33" : "#fffdf4");
      card.style.setProperty("--card-copy-ink", light ? "#514a4e" : "#fffdf4");
      card.style.setProperty("--card-label-ink", light ? "#695e61" : "#fffdf4");
    });
  }
  function apply() {
    for (const [group, value] of Object.entries(state)) {
      const family = families[value.family];
      const variables = {
        ...(value.size ? { size: `${value.size}px` } : {}),
        font: family.font,
        weight: value.weight,
        spacing: `${value.spacing}em`,
        height: value.height,
        style: value.style,
        italic: family.serif ? 0 : value.italic,
        "italic-style": family.serif && value.italic ? "italic" : "normal",
      };
      for (const [key, setting] of Object.entries(variables))
        document.documentElement.style.setProperty(
          `--${group}-${key}`,
          setting,
        );
    }
  }
  apply();
  applyCardColors();
  const names = {
    hero: "Hero",
    section: "Section",
    body: "Body",
    statement: "Understanding introduction",
    cardHeading: "Card heading",
    cardCopy: "Card copy",
  };
  const field = (group, key, label, unit) =>
    `<div class="type-field"><div class="type-field-top"><label for="type-${group}-${key}">${label}</label><div class="type-number-wrap"><input id="type-${group}-${key}-number" type="number" min="${limits[key][0]}" max="${limits[key][1]}" step="${key === "spacing" ? "0.001" : key === "height" ? "0.01" : "1"}" data-type-group="${group}" data-type-key="${key}" aria-label="${names[group]} ${label.toLowerCase()} value"><span>${unit}</span></div></div><input id="type-${group}-${key}" type="range" min="${limits[key][0]}" max="${limits[key][1]}" step="${key === "spacing" ? "0.001" : key === "height" ? "0.01" : "1"}" data-type-group="${group}" data-type-key="${key}" aria-label="${names[group]} ${label.toLowerCase()}"></div>`;
  const groupMarkup = (group, title, subtitle) =>
    `<fieldset class="type-group" data-type-fieldset="${group}"><legend>${title}</legend><div class="type-group-sub"><span>${subtitle}</span><button type="button" data-type-preview="${group}">View ↗</button></div><div class="type-select-row"><label for="type-${group}-family">Typeface</label><select id="type-${group}-family" data-type-group="${group}" data-type-key="family">${Object.entries(
      families,
    )
      .map(([id, f]) => `<option value="${id}">${f.name}</option>`)
      .join(
        "",
      )}</select></div>${"size" in state[group] ? field(group, "size", "Font size", "px") : ""}${field(group, "weight", "Font weight", "")}<span class="type-weight-label" data-weight-label="${group}"></span>${field(group, "spacing", "Letter spacing", "em")}${field(group, "height", "Line height", "×")}<details class="type-variations"><summary>Style & italic variations</summary><p class="type-axis-note" data-axis-note="${group}"></p>${field(group, "style", "Style axis", "%")}${field(group, "italic", "Italic", "%")}</details><button type="button" class="type-reset-group" data-type-reset="${group}">Reset ${names[group].toLowerCase()} settings</button></fieldset>`;
  const container = document.createElement("div");
  container.className = "type-controls";
  container.innerHTML = `<button type="button" class="type-launcher" id="type-launcher" aria-expanded="false" aria-controls="type-panel"><span aria-hidden="true">Aa</span> Edit page</button><aside class="type-panel" id="type-panel" aria-labelledby="type-panel-title" hidden><div class="type-panel-header"><div><span class="type-kicker">CONTROL CENTER</span><h2 id="type-panel-title">Page controls</h2></div><button type="button" class="type-close" aria-label="Close typography controls">×</button></div><div class="version-control"><span class="version-label">PAGE VERSION</span><div class="version-switch" role="group" aria-label="Page version"><button type="button" data-page-version="original" aria-pressed="true"><span class="version-swatch version-swatch-original" aria-hidden="true"></span>Original</button><button type="button" data-page-version="mesh" aria-pressed="false"><span class="version-swatch version-swatch-mesh" aria-hidden="true"></span>Moving mesh</button></div><p class="version-note">Switch styles. Your content and type settings stay in place.</p></div><div class="type-select-row type-target-row"><label for="type-target">Editing</label><select id="type-target"><option value="statement">Understanding introduction</option><option value="cardHeading">Card headings</option><option value="cardCopy">Card copy</option><option value="cards">Card colours</option><option value="hero">Hero heading</option><option value="section">Section headings</option><option value="body">Body &amp; labels</option></select></div><div class="type-panel-fields">${groupMarkup("hero", "Hero heading", "The opening wordmark")}${groupMarkup("section", "Section headings", "All section titles")}${groupMarkup("statement", "Understanding introduction", "The introductory sentence")}${groupMarkup("cardHeading", "Card headings", "Sans headings across all four cards")}${groupMarkup("cardCopy", "Card copy", "Descriptions across all four cards")}${groupMarkup("body", "Body & labels", "Your supporting typography")}<fieldset class="type-group" data-type-fieldset="cards"><legend>Card colours</legend><p class="type-intro">Choose a background for each card.</p>${["Brand Positioning", "Portfolio Presentation", "Audience & Enquiries", "Digital Discoverability"].map((name, i) => `<div class="card-color-control"><label for="card-color-${i}">${name}</label><div class="card-color-inputs"><input id="card-color-${i}" type="color" data-card-color="${i}" aria-label="${name} card background"><input type="text" data-card-hex="${i}" aria-label="${name} card hex color" maxlength="7" spellcheck="false"></div></div>`).join("")}<button type="button" class="type-reset-group" data-reset-card-colors>Reset card colours</button></fieldset></div><div class="type-panel-footer"><button type="button" class="type-reset-all">Reset all</button><span id="type-save-status" role="status">${canSave ? "Saved in this browser" : "Changes apply to this session"}</span></div></aside>`;
  document.body.appendChild(container);
  const panel = container.querySelector("#type-panel"),
    launcher = container.querySelector("#type-launcher"),
    status = container.querySelector("#type-save-status");
  let refreshTimer;
  function syncInputs(skipInput) {
    container.querySelectorAll("[data-type-group]").forEach((input) => {
      const group = input.dataset.typeGroup,
        key = input.dataset.typeKey,
        value = state[group],
        family = families[value.family];
      if (key === "size" && group === "cardCopy") {
        input.min = 16;
        input.max = 18;
      }
      if (key === "weight") {
        input.min = family.serif && value.italic ? 300 : family.min;
        input.max = family.max;
      }
      if (key === "italic") input.step = family.serif ? 100 : 1;
      input.disabled = key === "style" && family.serif && value.italic > 0;
      if (input !== skipInput) input.value = value[key];
      if (input.type === "range")
        input.style.setProperty(
          "--range-fill",
          `${((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100}%`,
        );
    });
    for (const [group, value] of Object.entries(state)) {
      const family = families[value.family];
      const named = family.serif
        ? {
            200: "Thin",
            300: "Light",
            350: "Book",
            400: "Regular",
            500: "Medium",
            600: "Semibold",
            700: "Bold",
          }
        : {
            300: "Light",
            420: "Regular",
            500: "Medium",
            600: "Semibold",
            700: "Bold",
            800: "Black",
          };
      container.querySelector(`[data-weight-label="${group}"]`).textContent =
        `${named[value.weight] || "Custom weight"} · ${family.serif && value.italic ? 300 : family.min}–${family.max}`;
      container.querySelector(`[data-axis-note="${group}"]`).textContent =
        family.serif
          ? value.italic
            ? "Dedicated true italic. Available from 300–700; this cut has no style axis."
            : "Style: 0 = Serif / Display, 100 = Text. Italic switches to the true italic cut."
          : "Style: 0 = Grotesk, 100 = Sans. Italic blends continuously from 0–100.";
    }
  }
  function update(skipInput) {
    apply();
    syncInputs(skipInput);
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      status.textContent = "Saved in this browser";
    } catch {
      status.textContent = "Changes apply to this session";
    }
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => window.ScrollTrigger?.refresh(), 140);
  }
  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    (open ? container.querySelector(".type-close") : launcher).focus({
      preventScroll: true,
    });
  }
  launcher.addEventListener("click", () => setOpen(panel.hidden));
  container
    .querySelector(".type-close")
    .addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
  container.addEventListener("input", (event) => {
    const input = event.target;
    if (!input.matches("[data-type-group]")) return;
    const group = input.dataset.typeGroup,
      key = input.dataset.typeKey;
    if (key === "family") {
      state[group].family = input.value;
      state[group].style = families[input.value].style;
      normalize(group);
      update();
      return;
    }
    if (
      input.type === "number" &&
      (input.value.trim() === "" ||
        !input.validity.valid ||
        !Number.isFinite(Number(input.value)))
    )
      return;
    state[group][key] = Number(input.value);
    normalize(group);
    update(
      input.type === "number" && Number(input.value) === state[group][key]
        ? input
        : undefined,
    );
  });
  container.addEventListener("change", (event) => {
    const input = event.target;
    if (!input.matches('input[type="number"][data-type-group]')) return;
    if (input.value.trim() === "" || !Number.isFinite(Number(input.value))) {
      syncInputs();
      return;
    }
    const group = input.dataset.typeGroup,
      key = input.dataset.typeKey;
    state[group][key] = clamp(
      Number(input.value),
      Number(input.min),
      Number(input.max),
    );
    normalize(group);
    update();
  });
  container.addEventListener("click", (event) => {
    const reset = event.target.closest("[data-type-reset]");
    if (reset) {
      state[reset.dataset.typeReset] = { ...defaults[reset.dataset.typeReset] };
      update();
    }
    if (event.target.closest(".type-reset-all")) {
      for (const group of Object.keys(state))
        state[group] = { ...defaults[group] };
      update();
    }
    const preview = event.target.closest("[data-type-preview]");
    if (preview)
      document
        .querySelector(
          preview.dataset.typePreview === "hero" ? "#top" : "#objective",
        )
        .scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "start",
        });
  });
  function syncColors() {
    container
      .querySelectorAll("[data-card-color]")
      .forEach(
        (input) => (input.value = cardColors[Number(input.dataset.cardColor)]),
      );
    container
      .querySelectorAll("[data-card-hex]")
      .forEach(
        (input) => (input.value = cardColors[Number(input.dataset.cardHex)]),
      );
  }
  function saveColors() {
    applyCardColors();
    syncColors();
    try {
      localStorage.setItem(
        storageKey + "-gray-cards",
        JSON.stringify(cardColors),
      );
      status.textContent = "Saved in this browser";
    } catch {
      status.textContent = "Changes apply to this session";
    }
  }
  container.addEventListener("input", (event) => {
    const input = event.target;
    if (input.matches("[data-card-color]")) {
      cardColors[Number(input.dataset.cardColor)] = input.value;
      saveColors();
    }
    if (
      input.matches("[data-card-hex]") &&
      /^#[0-9a-f]{6}$/i.test(input.value)
    ) {
      cardColors[Number(input.dataset.cardHex)] = input.value;
      saveColors();
    }
  });
  container.addEventListener("change", (event) => {
    if (event.target.matches("[data-card-hex]")) syncColors();
  });
  container.addEventListener("click", (event) => {
    if (
      event.target.closest("[data-reset-card-colors]") ||
      event.target.closest(".type-reset-all")
    ) {
      cardColors = [...defaultCardColors];
      saveColors();
    }
  });
  function syncVersionButtons() {
    const version =
      document.documentElement.dataset.pageVersion === "mesh"
        ? "mesh"
        : "original";
    container
      .querySelectorAll("[data-page-version]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.pageVersion === version),
        ),
      );
  }
  container.querySelectorAll("[data-page-version]").forEach((button) =>
    button.addEventListener("click", () => {
      document.documentElement.dataset.pageVersion = button.dataset.pageVersion;
      syncVersionButtons();
      try {
        localStorage.setItem(
          "devika-proposal-page-version",
          button.dataset.pageVersion,
        );
        status.textContent = "Saved in this browser";
      } catch {
        status.textContent = "Changes apply to this session";
      }
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => window.ScrollTrigger?.refresh(), 140);
    }),
  );
  syncVersionButtons();
  const targetSelect = container.querySelector("#type-target");
  function showTarget() {
    container
      .querySelectorAll("[data-type-fieldset]")
      .forEach(
        (group) =>
          (group.hidden = group.dataset.typeFieldset !== targetSelect.value),
      );
  }
  targetSelect.addEventListener("change", showTarget);
  syncInputs();
  syncColors();
  showTarget();
})();
