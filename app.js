// Valiant Adventures RPG - Character Creator Main Application Logic
// Powered by the Mutants & Masterminds 3E / Valiant Adventures System

let appSettings = {
  theme: "default",
  fontScale: "standard",
  charFolder: "C:\\Users\\admin\\Documents\\ValiantCharacters",
  defaultPL: 10,
  layoutMode: "auto"
};

let currentCharacter = null;
let savedSnapshot = "";
let selectedModifiers = new Set();
let pendingProceedAction = null;
let warningDismissed = false;

// =====================================================================
// BLANK CHARACTER FACTORY
// =====================================================================
function createBlankCharacter(pl) {
  const targetPL = pl || appSettings.defaultPL || 10;
  return {
    id: "char_" + Date.now(),
    name: "",
    fileName: "",
    realName: "",
    pl: targetPL,
    identity: "",
    concept: "",
    motivation: "",
    complications: "",
    abilities: {
      STR: 0,
      STA: 0,
      AGL: 0,
      DEX: 0,
      FGT: 0,
      INT: 0,
      AWE: 0,
      PRE: 0
    },
    defenses: {
      Dodge: 0,
      Parry: 0,
      Fortitude: 0,
      Toughness: 0,
      Will: 0
    },
    skills: {
      "Acrobatics": 0,
      "Athletics": 0,
      "Deception": 0,
      "Insight": 0,
      "Intimidation": 0,
      "Investigation": 0,
      "Perception": 0,
      "Persuasion": 0,
      "Sleight of Hand": 0,
      "Stealth": 0,
      "Technology": 0,
      "Treatment": 0,
      "Vehicles": 0
    },
    advantages: [],
    powers: [],
    gear: [],
    hpRemaining: 1,
    bruises: 0
  };
}

// Check if character has unsaved edits
function hasUnsavedChanges() {
  if (!savedSnapshot) return false;
  return JSON.stringify(currentCharacter) !== savedSnapshot;
}

// Helper to determine next "New character #" number
function getNextNewCharacterNumber() {
  let counter = parseInt(localStorage.getItem("valiant_new_char_counter") || "1", 10);
  localStorage.setItem("valiant_new_char_counter", (counter + 1).toString());
  return counter;
}

function peekNextNewCharacterNumber() {
  return parseInt(localStorage.getItem("valiant_new_char_counter") || "1", 10);
}

// Resolve filename on save with .valadv extension
function resolveFileNameOnSave(char) {
  const trimmed = (char.name || "").trim();
  const oldFileName = char.fileName;

  if (trimmed) {
    const clean = trimmed.replace(/[/\\?%*:|"<>]/g, '_');
    char.fileName = `${clean}.valadv`;
  } else {
    if (!char.fileName || !char.fileName.endsWith('.valadv')) {
      const num = getNextNewCharacterNumber();
      char.fileName = `New character ${num}.valadv`;
    }
  }

  // If previous saved slot was "New character X.valadv" and now renamed to character name:
  if (oldFileName && oldFileName !== char.fileName) {
    removeSavedSlot(oldFileName);
  }

  return char.fileName;
}

// =====================================================================
// INITIALIZATION
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  loadSavedCharactersList();

  // Requirement: The app should start up with a blank character
  currentCharacter = createBlankCharacter(appSettings.defaultPL);
  savedSnapshot = JSON.stringify(currentCharacter);

  setupEventListeners();
  updateLayoutMode();
  renderAll();
  populateDropdowns();
  renderTablesAndReference();
});

// Window BeforeUnload Guard
window.addEventListener("beforeunload", (e) => {
  if (hasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = "You have unsaved character changes. Please name and save your character before closing.";
    return e.returnValue;
  }
});

// Resize listener for layout mode & minimum width warning
window.addEventListener("resize", () => {
  updateLayoutMode();
});

// =====================================================================
// LAYOUT MODE: NORMAL VS NARROW & MINIMUM WIDTH WARNING
// =====================================================================
function updateLayoutMode() {
  const width = window.innerWidth;
  const modeSetting = appSettings.layoutMode || "auto";
  const pill = document.getElementById("active-layout-mode-pill");

  let isNarrow = false;
  if (modeSetting === "force-narrow") {
    isNarrow = true;
    if (pill) pill.textContent = "Narrow Mode (1080px)";
  } else if (modeSetting === "force-normal") {
    isNarrow = false;
    if (pill) pill.textContent = "Normal Mode";
  } else {
    // auto: switches based on width
    if (width < 1400) {
      isNarrow = true;
      if (pill) pill.textContent = "Narrow Mode (1080px Limit)";
    } else {
      isNarrow = false;
      if (pill) pill.textContent = "Normal Mode";
    }
  }

  if (isNarrow) {
    document.body.classList.add("narrow-mode");
  } else {
    document.body.classList.remove("narrow-mode");
  }

  // Minimum display width warning (< 1080px)
  const banner = document.getElementById("min-width-warning-banner");
  const widthDisplay = document.getElementById("current-screen-width");
  if (banner) {
    if (width < 1080 && !warningDismissed) {
      banner.classList.add("active");
      if (widthDisplay) widthDisplay.textContent = width;
    } else {
      banner.classList.remove("active");
    }
  }
}

// =====================================================================
// SETTINGS MANAGEMENT
// =====================================================================
function loadSettings() {
  const stored = localStorage.getItem("valiant_settings");
  if (stored) {
    try {
      appSettings = { ...appSettings, ...JSON.parse(stored) };
    } catch (e) {
      console.error(e);
    }
  }
  applySettings();
}

function applySettings() {
  document.body.setAttribute("data-theme", appSettings.theme || "default");
  document.body.setAttribute("data-font-scale", appSettings.fontScale || "standard");

  const themeSelect = document.getElementById("setting-theme");
  const fontSelect = document.getElementById("setting-font-scale");
  const folderInput = document.getElementById("setting-char-folder");
  const plSelect = document.getElementById("setting-default-pl");
  const layoutSelect = document.getElementById("setting-layout-mode");

  if (themeSelect) themeSelect.value = appSettings.theme;
  if (fontSelect) fontSelect.value = appSettings.fontScale;
  if (folderInput) folderInput.value = appSettings.charFolder;
  if (plSelect) plSelect.value = appSettings.defaultPL;
  if (layoutSelect) layoutSelect.value = appSettings.layoutMode || "auto";

  updateLayoutMode();
}

function saveSettingsFromUI() {
  const themeSelect = document.getElementById("setting-theme");
  const fontSelect = document.getElementById("setting-font-scale");
  const folderInput = document.getElementById("setting-char-folder");
  const plSelect = document.getElementById("setting-default-pl");
  const layoutSelect = document.getElementById("setting-layout-mode");

  if (themeSelect) appSettings.theme = themeSelect.value;
  if (fontSelect) appSettings.fontScale = fontSelect.value;
  if (folderInput) appSettings.charFolder = folderInput.value;
  if (plSelect) appSettings.defaultPL = parseInt(plSelect.value, 10);
  if (layoutSelect) appSettings.layoutMode = layoutSelect.value;

  localStorage.setItem("valiant_settings", JSON.stringify(appSettings));
  applySettings();
  closeModal("modal-settings");
}

// =====================================================================
// UNSAVED CHANGES GUARD & PROMPT
// =====================================================================
function checkUnsavedBeforeAction(onProceed) {
  if (hasUnsavedChanges()) {
    pendingProceedAction = onProceed;
    const nameInput = document.getElementById("unsaved-input-name");
    const autoLabel = document.getElementById("unsaved-auto-filename");

    const fallbackNum = peekNextNewCharacterNumber();
    if (nameInput) nameInput.value = currentCharacter.name || "";
    if (autoLabel) {
      autoLabel.textContent = currentCharacter.fileName || `New character ${fallbackNum}.valadv`;
    }

    openModal("modal-unsaved-prompt");
  } else {
    onProceed();
  }
}

// =====================================================================
// SETUP EVENT LISTENERS
// =====================================================================
function setupEventListeners() {
  // Dismiss Warning Banner
  document.getElementById("btn-dismiss-min-width-warning")?.addEventListener("click", () => {
    warningDismissed = true;
    document.getElementById("min-width-warning-banner")?.classList.remove("active");
  });

  // Tabs Navigation
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      const targetPane = document.getElementById(target);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // Collapsible Accordion Sections
  document.querySelectorAll(".section-header").forEach(header => {
    header.addEventListener("click", () => {
      const sectionId = header.getAttribute("data-toggle");
      const section = document.getElementById(sectionId);
      if (section) section.classList.toggle("open");
    });
  });

  // Top Row: Character Menu Dropdown
  const btnCharMenu = document.getElementById("btn-char-menu");
  const charDropdown = document.getElementById("char-dropdown-menu");
  if (btnCharMenu && charDropdown) {
    btnCharMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      charDropdown.classList.toggle("show");
    });
    document.addEventListener("click", (e) => {
      if (!btnCharMenu.contains(e.target)) {
        charDropdown.classList.remove("show");
      }
    });
  }

  // Top Row: Menu Action Handlers with Unsaved Check
  document.getElementById("menu-new-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("show");
    checkUnsavedBeforeAction(() => handleNewCharacter(true));
  });
  document.getElementById("menu-load-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("show");
    checkUnsavedBeforeAction(() => openModal("modal-load"));
  });
  document.getElementById("menu-save-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("show");
    handleSaveCharacter();
  });
  document.getElementById("menu-rename-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("show");
    handleOpenRename();
  });
  document.getElementById("menu-export-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("show");
    openModal("modal-export");
  });
  document.getElementById("menu-delete-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("show");
    handleOpenDelete();
  });

  // Settings Modal Handlers
  document.getElementById("btn-settings")?.addEventListener("click", () => openModal("modal-settings"));
  document.getElementById("btn-save-settings")?.addEventListener("click", saveSettingsFromUI);

  // Modal Close buttons
  document.querySelectorAll("[data-close]").forEach(el => {
    el.addEventListener("click", () => {
      const modalId = el.getAttribute("data-close");
      closeModal(modalId);
    });
  });

  // Close modals on clicking backdrop
  document.querySelectorAll(".modal-backdrop").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  });

  // Unsaved Prompt Modal Actions
  document.getElementById("btn-unsaved-save")?.addEventListener("click", () => {
    const input = document.getElementById("unsaved-input-name");
    const enteredName = input ? input.value.trim() : "";
    if (enteredName) {
      currentCharacter.name = enteredName;
    }
    handleSaveCharacter();
    closeModal("modal-unsaved-prompt");
    if (pendingProceedAction) {
      const action = pendingProceedAction;
      pendingProceedAction = null;
      action();
    }
  });

  document.getElementById("btn-unsaved-discard")?.addEventListener("click", () => {
    closeModal("modal-unsaved-prompt");
    savedSnapshot = JSON.stringify(currentCharacter); // Reset dirty flag
    if (pendingProceedAction) {
      const action = pendingProceedAction;
      pendingProceedAction = null;
      action();
    }
  });

  // Interactive Measurement Calculator Input
  document.getElementById("calc-rank-input")?.addEventListener("input", updateRankCalculator);

  // Character Name Quick Click in header
  document.getElementById("summary-char-name")?.addEventListener("click", handleOpenRename);

  // HP and Bruise Controls in Second Row
  document.getElementById("btn-hp-plus")?.addEventListener("click", () => {
    currentCharacter.hpRemaining = (currentCharacter.hpRemaining || 0) + 1;
    saveAndRender();
  });
  document.getElementById("btn-hp-minus")?.addEventListener("click", () => {
    if ((currentCharacter.hpRemaining || 0) > 0) {
      currentCharacter.hpRemaining--;
      saveAndRender();
    }
  });
  document.getElementById("btn-bruise-plus")?.addEventListener("click", () => {
    currentCharacter.bruises = (currentCharacter.bruises || 0) + 1;
    saveAndRender();
  });
  document.getElementById("btn-bruise-minus")?.addEventListener("click", () => {
    if ((currentCharacter.bruises || 0) > 0) {
      currentCharacter.bruises--;
      saveAndRender();
    }
  });

  // Identity Input Handlers
  const bindInput = (id, prop) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => {
        currentCharacter[prop] = input.value;
        saveAndRender(false);
      });
    }
  };
  bindInput("char-name-input", "name");
  bindInput("char-realname-input", "realName");
  bindInput("char-identity-input", "identity");
  bindInput("char-concept-input", "concept");
  bindInput("char-motivation-input", "motivation");

  const plSelect = document.getElementById("char-pl-input");
  if (plSelect) {
    plSelect.addEventListener("change", () => {
      currentCharacter.pl = parseInt(plSelect.value, 10);
      saveAndRender();
    });
  }

  // Rename confirmation
  document.getElementById("btn-confirm-rename")?.addEventListener("click", () => {
    const newName = document.getElementById("rename-input-name").value.trim();
    if (newName) {
      currentCharacter.name = newName;
      // Auto-update filename to reflect the name
      resolveFileNameOnSave(currentCharacter);
      saveAndRender();
      closeModal("modal-rename");
    }
  });

  // Delete confirmation
  document.getElementById("btn-confirm-delete")?.addEventListener("click", () => {
    if (currentCharacter.fileName) {
      removeSavedSlot(currentCharacter.fileName);
    }
    if (currentCharacter.name) {
      removeSavedSlot(currentCharacter.name);
    }
    handleNewCharacter(false);
    closeModal("modal-delete");
  });

  // File Upload Handlers (for Load Character)
  const fileInput = document.getElementById("input-load-file");
  document.getElementById("btn-browse-file")?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", handleFileLoad);

  // Export Modal Handlers
  document.getElementById("btn-export-odf")?.addEventListener("click", () => {
    ValiantExporter.exportODF(currentCharacter);
    closeModal("modal-export");
  });
  document.getElementById("btn-export-pdf")?.addEventListener("click", () => {
    ValiantExporter.exportPDF(currentCharacter);
    closeModal("modal-export");
  });
  document.getElementById("link-export-raw-json")?.addEventListener("click", (e) => {
    e.preventDefault();
    handleSaveCharacter();
    closeModal("modal-export");
  });

  // Add Specialty Skill Button
  document.getElementById("btn-add-specialty-skill")?.addEventListener("click", handleAddSpecialtySkill);

  // Advantage picker & '?' info button next to dropdown
  document.getElementById("btn-info-selected-adv")?.addEventListener("click", () => {
    const selectedAdv = document.getElementById("select-advantage")?.value;
    if (selectedAdv) showAdvantageModal(selectedAdv);
  });
  document.getElementById("btn-add-advantage")?.addEventListener("click", handleAddAdvantage);

  // Power Effect '?' info button next to dropdown
  document.getElementById("btn-info-selected-power-effect")?.addEventListener("click", () => {
    const selectedEffect = document.getElementById("power-input-effect")?.value;
    if (selectedEffect) showPowerEffectModal(selectedEffect);
  });
  document.getElementById("btn-save-power")?.addEventListener("click", handleSavePower);

  // Gear catalog '?' info button next to dropdown
  document.getElementById("btn-info-selected-gear")?.addEventListener("click", () => {
    const selectedIdx = document.getElementById("select-gear-catalog")?.value;
    const gear = VALIANT_DATA.gearCatalog[selectedIdx];
    if (gear) {
      showTraitModal(gear.name, `Gear (${gear.category})`, `${gear.costEP} EP`, gear.description);
    }
  });
  document.getElementById("btn-add-gear-item")?.addEventListener("click", handleAddGearFromCatalog);
  document.getElementById("btn-sync-equipment-adv")?.addEventListener("click", handleIncrementEquipmentAdv);

  // Dynamic cost preview for power builder
  document.getElementById("power-input-ranks")?.addEventListener("input", updatePowerCostPreview);
  document.getElementById("power-input-effect")?.addEventListener("change", updatePowerCostPreview);
}

// =====================================================================
// RENDERING FUNCTIONS
// =====================================================================
function renderAll() {
  renderHeaderSummary();
  renderIdentityInputs();
  renderAbilities();
  renderDefenses();
  renderSkills();
  renderAdvantages();
  renderPowers();
  renderGear();
  updatePowerCostPreview();
}

function saveAndRender(refreshInputs = true) {
  renderHeaderSummary();
  if (refreshInputs) {
    renderIdentityInputs();
    renderAbilities();
    renderDefenses();
    renderSkills();
    renderAdvantages();
    renderPowers();
    renderGear();
  }
}

function renderHeaderSummary() {
  const costs = calculateCosts(currentCharacter);

  // Character Name & Subtitle
  const nameEl = document.getElementById("summary-char-name");
  const metaEl = document.getElementById("summary-char-meta");
  const displayName = currentCharacter.name || (currentCharacter.fileName ? currentCharacter.fileName.replace(/\.valadv$/i, '') : "New Character (Unnamed)");

  if (nameEl) nameEl.textContent = displayName;
  if (metaEl) {
    metaEl.textContent = `PL ${currentCharacter.pl || 10} • ${currentCharacter.concept || "Custom Hero"}${hasUnsavedChanges() ? ' • (Unsaved Edits)' : ''}`;
  }

  // PP Stats
  const usedEl = document.getElementById("summary-pp-used");
  const totalEl = document.getElementById("summary-pp-total");
  const leftEl = document.getElementById("summary-pp-left");

  if (usedEl) usedEl.textContent = costs.totalUsed;
  if (totalEl) totalEl.textContent = costs.totalBudget;
  if (leftEl) {
    leftEl.textContent = costs.remaining;
    leftEl.className = costs.remaining < 0 ? "stat-capsule-val danger" : "stat-capsule-val success";
  }

  // HP & Bruises
  const hpEl = document.getElementById("summary-hp-count");
  if (hpEl) hpEl.textContent = currentCharacter.hpRemaining !== undefined ? currentCharacter.hpRemaining : 1;
  const bruiseEl = document.getElementById("summary-bruise-count");
  if (bruiseEl) bruiseEl.textContent = currentCharacter.bruises || 0;

  // Section Badges
  const badgeAbil = document.getElementById("badge-cost-abilities");
  if (badgeAbil) badgeAbil.textContent = `${costs.abilities} PP`;

  const badgeSkills = document.getElementById("badge-cost-skills");
  let totalSkillRanks = 0;
  Object.values(currentCharacter.skills || {}).forEach(r => totalSkillRanks += (Number(r) || 0));
  if (badgeSkills) badgeSkills.textContent = `${costs.skills} PP (${totalSkillRanks} ranks)`;

  const badgeAdv = document.getElementById("badge-cost-advantages");
  if (badgeAdv) badgeAdv.textContent = `${costs.advantages} PP`;

  const badgePow = document.getElementById("badge-cost-powers");
  if (badgePow) badgePow.textContent = `${costs.powers} PP`;

  renderGearEPStatus();
}

function renderIdentityInputs() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) el.value = val || "";
  };
  setVal("char-name-input", currentCharacter.name);
  setVal("char-realname-input", currentCharacter.realName);
  setVal("char-identity-input", currentCharacter.identity);
  setVal("char-concept-input", currentCharacter.concept);
  setVal("char-motivation-input", currentCharacter.motivation);

  const plEl = document.getElementById("char-pl-input");
  if (plEl && document.activeElement !== plEl) {
    plEl.value = currentCharacter.pl || 10;
  }
}

// Render Core Abilities
function renderAbilities() {
  const container = document.getElementById("abilities-grid-container");
  if (!container) return;

  container.innerHTML = Object.entries(VALIANT_DATA.abilities).map(([key, item]) => {
    const rank = currentCharacter.abilities[key] || 0;
    return `
      <div class="ability-card">
        <div class="ability-info">
          <div class="ability-name-row">
            <a class="trait-link" onclick="showAbilityModal('${key}')">${item.short}</a>
            <button class="trait-info-btn" onclick="showAbilityModal('${key}')" title="Inspect ${item.name} description">?</button>
          </div>
          <span style="font-size: 11.5px; color: var(--text-muted);">${item.name.replace(/\(.*?\)/, '').trim()}</span>
          <span class="ability-pts">${rank * 2} Power Points</span>
        </div>
        <div class="rank-spinner">
          <button class="btn-spin" onclick="adjustAbility('${key}', -1)">-</button>
          <span class="spin-val">${rank >= 0 ? '+' + rank : rank}</span>
          <button class="btn-spin" onclick="adjustAbility('${key}', 1)">+</button>
        </div>
      </div>
    `;
  }).join("");
}

// Render Defenses
function renderDefenses() {
  const container = document.getElementById("defenses-grid-container");
  if (!container) return;

  container.innerHTML = Object.entries(VALIANT_DATA.defenses).map(([key, item]) => {
    const baseRank = currentCharacter.abilities[item.ability] || 0;
    const boughtRank = currentCharacter.defenses[key] || 0;
    const totalDefense = baseRank + boughtRank;

    return `
      <div class="defense-card">
        <div class="def-header">
          <div style="display: flex; align-items: center;">
            <a class="trait-link" onclick="showDefenseModal('${key}')">${item.name}</a>
            <button class="trait-info-btn" onclick="showDefenseModal('${key}')" title="Inspect ${item.name} defense">?</button>
          </div>
          <span class="def-total-tag">${totalDefense}</span>
        </div>
        <div class="def-formula-row">
          <span>Base (${item.ability}): <strong>${baseRank}</strong></span>
          <div class="rank-spinner" style="transform: scale(0.9); transform-origin: right center;">
            <button class="btn-spin" onclick="adjustDefense('${key}', -1)">-</button>
            <span class="spin-val">+${boughtRank}</span>
            <button class="btn-spin" onclick="adjustDefense('${key}', 1)">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Render Skills
function renderSkills() {
  const container = document.getElementById("skills-grid-container");
  if (!container) return;

  const entries = Object.entries(currentCharacter.skills || {});

  container.innerHTML = entries.map(([skillName, rank]) => {
    let baseAbilityKey = "AGL";
    let isSpecialty = false;

    if (VALIANT_DATA.skills[skillName]) {
      baseAbilityKey = VALIANT_DATA.skills[skillName].ability;
    } else {
      for (const [k, v] of Object.entries(VALIANT_DATA.skills)) {
        if (skillName.startsWith(k)) {
          baseAbilityKey = v.ability;
          isSpecialty = true;
          break;
        }
      }
    }

    const abilityVal = currentCharacter.abilities[baseAbilityKey] || 0;
    const totalBonus = abilityVal + rank;

    return `
      <div class="skill-row-card">
        <div class="skill-name-meta">
          <a class="trait-link" onclick="showSkillModal('${escapeAttr(skillName)}')">${skillName}</a>
          <button class="trait-info-btn" onclick="showSkillModal('${escapeAttr(skillName)}')">?</button>
          <span class="skill-ability-tag">${baseAbilityKey}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="rank-spinner">
            <button class="btn-spin" onclick="adjustSkill('${escapeAttr(skillName)}', -1)">-</button>
            <span class="spin-val">${rank}</span>
            <button class="btn-spin" onclick="adjustSkill('${escapeAttr(skillName)}', 1)">+</button>
          </div>
          <span class="skill-total-badge">+${totalBonus}</span>
          ${isSpecialty ? `<button class="btn-remove-sub" onclick="removeSkill('${escapeAttr(skillName)}')" title="Delete custom specialty">&times;</button>` : ''}
        </div>
      </div>
    `;
  }).join("");
}

// Render Advantages
function renderAdvantages() {
  const container = document.getElementById("advantages-grid-container");
  if (!container) return;

  const list = currentCharacter.advantages || [];
  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-dim); font-size: 13.5px; padding: 12px;">No advantages added yet. Use the dropdown above to add advantages.</div>`;
    return;
  }

  container.innerHTML = list.map((adv, idx) => {
    const dataAdv = VALIANT_DATA.advantages[adv.name] || {};
    const maxRanks = dataAdv.ranks || 1;

    return `
      <div class="advantage-card">
        <div class="adv-left">
          <div style="display: flex; align-items: center;">
            <a class="trait-link" onclick="showAdvantageModal('${escapeAttr(adv.name)}')">${adv.name}</a>
            <button class="trait-info-btn" onclick="showAdvantageModal('${escapeAttr(adv.name)}')">?</button>
          </div>
          <span class="adv-category-tag">${dataAdv.category || 'General'}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          ${maxRanks > 1 ? `
            <div class="rank-spinner">
              <button class="btn-spin" onclick="adjustAdvantageRank(${idx}, -1)">-</button>
              <span class="spin-val">${adv.rank || 1}</span>
              <button class="btn-spin" onclick="adjustAdvantageRank(${idx}, 1)">+</button>
            </div>
          ` : `<span style="font-size: 12px; font-weight: bold; color: var(--text-dim);">Rank 1</span>`}
          <button class="btn-remove-sub" onclick="removeAdvantage(${idx})" title="Remove advantage">&times;</button>
        </div>
      </div>
    `;
  }).join("");
}

// Render Powers List
function renderPowers() {
  const container = document.getElementById("powers-list-container");
  if (!container) return;

  const list = currentCharacter.powers || [];
  if (list.length === 0) {
    container.innerHTML = `<div style="color: var(--text-dim); font-size: 13.5px; padding: 10px;">No powers defined. Use the Power Studio above to build and add powers.</div>`;
    return;
  }

  container.innerHTML = list.map((pow, idx) => {
    return `
      <div class="power-entry-card">
        <div class="power-entry-header">
          <div class="power-entry-title">
            <a class="trait-link" onclick="showPowerEffectModal('${escapeAttr(pow.effect)}')">${pow.name}</a>
            <button class="trait-info-btn" onclick="showPowerEffectModal('${escapeAttr(pow.effect)}')">?</button>
            <span style="font-size: 12.5px; font-weight: 500; color: var(--text-muted);">
              (${pow.effect} ${pow.ranks || 1})
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="power-cost-tag">${pow.cost || 0} PP</span>
            <button class="btn-remove-sub" onclick="removePower(${idx})" title="Remove power">&times;</button>
          </div>
        </div>
        <div class="power-entry-details">
          ${pow.details || 'No descriptors or description provided.'}
        </div>
        ${(pow.extras?.length || pow.flaws?.length) ? `
          <div class="power-mods-badge-row">
            ${(pow.extras || []).map(e => `<span class="power-chip">+ ${e}</span>`).join('')}
            ${(pow.flaws || []).map(f => `<span class="power-chip">- ${f}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join("");
}

// Render Gear
function renderGear() {
  const container = document.getElementById("gear-list-container");
  if (!container) return;

  const list = currentCharacter.gear || [];
  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-dim); font-size: 13.5px; padding: 10px;">No gear equipped. Select an item from the Equipment Catalog above.</div>`;
    return;
  }

  container.innerHTML = list.map((g, idx) => {
    return `
      <div class="gear-item-card">
        <div class="gear-item-top">
          <div style="display: flex; align-items: center;">
            <strong style="font-size: 14px; color: var(--text-main);">${g.name}</strong>
            <button class="trait-info-btn" onclick="showTraitModal('${escapeAttr(g.name)}', '${g.category || 'Equipment'}', '${g.costEP} EP', '${escapeAttr(g.description || '')}')">?</button>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--accent-secondary);">${g.costEP || 0} EP</span>
            <button class="btn-remove-sub" onclick="removeGearItem(${idx})" title="Unequip item">&times;</button>
          </div>
        </div>
        <div class="gear-desc">${g.description || ''}</div>
      </div>
    `;
  }).join("");
}

function renderGearEPStatus() {
  const eqAdv = (currentCharacter.advantages || []).find(a => a.name === "Equipment");
  const eqRanks = eqAdv ? (eqAdv.rank || 1) : 0;
  const availableEP = eqRanks * 5;

  let spentEP = 0;
  (currentCharacter.gear || []).forEach(g => spentEP += (Number(g.costEP) || 0));

  const spentEl = document.getElementById("gear-ep-spent");
  const totalEl = document.getElementById("gear-ep-total");
  const badgeGear = document.getElementById("badge-cost-gear");

  if (spentEl) spentEl.textContent = spentEP;
  if (totalEl) totalEl.textContent = availableEP;
  if (badgeGear) badgeGear.textContent = `${spentEP} / ${availableEP} EP (${eqRanks} PP in Adv)`;
}

// =====================================================================
// INTERACTIVE ADJUSTMENTS
// =====================================================================
function adjustAbility(key, delta) {
  const current = currentCharacter.abilities[key] || 0;
  const newVal = current + delta;
  if (newVal >= -5 && newVal <= 25) {
    currentCharacter.abilities[key] = newVal;
    saveAndRender();
  }
}

function adjustDefense(key, delta) {
  const current = currentCharacter.defenses[key] || 0;
  const newVal = current + delta;
  if (newVal >= 0 && newVal <= 20) {
    currentCharacter.defenses[key] = newVal;
    saveAndRender();
  }
}

function adjustSkill(name, delta) {
  const current = currentCharacter.skills[name] || 0;
  const newVal = current + delta;
  if (newVal >= 0 && newVal <= 25) {
    currentCharacter.skills[name] = newVal;
    saveAndRender();
  }
}

function removeSkill(name) {
  delete currentCharacter.skills[name];
  saveAndRender();
}

function handleAddSpecialtySkill() {
  const specialtyType = prompt("Choose base skill (Close Combat, Ranged Combat, or Expertise):", "Close Combat");
  if (!specialtyType) return;
  const subName = prompt(`Enter specific specialty name for ${specialtyType} (e.g. Swords, Rifles, Psionics, Streetwise):`, "Swords");
  if (!subName) return;

  const fullName = `${specialtyType.trim()} (${subName.trim()})`;
  if (!currentCharacter.skills[fullName]) {
    currentCharacter.skills[fullName] = 1;
    saveAndRender();
  }
}

function adjustAdvantageRank(index, delta) {
  const adv = currentCharacter.advantages[index];
  if (!adv) return;
  const maxRanks = VALIANT_DATA.advantages[adv.name]?.ranks || 1;
  const newVal = (adv.rank || 1) + delta;
  if (newVal >= 1 && newVal <= maxRanks) {
    adv.rank = newVal;
    saveAndRender();
  }
}

function removeAdvantage(index) {
  currentCharacter.advantages.splice(index, 1);
  saveAndRender();
}

function handleAddAdvantage() {
  const select = document.getElementById("select-advantage");
  if (!select) return;
  const name = select.value;
  if (!name) return;

  const existing = currentCharacter.advantages.find(a => a.name === name);
  if (existing) {
    const maxRanks = VALIANT_DATA.advantages[name]?.ranks || 1;
    if ((existing.rank || 1) < maxRanks) {
      existing.rank = (existing.rank || 1) + 1;
    } else {
      alert(`${name} is already at maximum ranks (${maxRanks}).`);
      return;
    }
  } else {
    currentCharacter.advantages.push({ name, rank: 1 });
  }
  saveAndRender();
}

function handleIncrementEquipmentAdv() {
  const existing = currentCharacter.advantages.find(a => a.name === "Equipment");
  if (existing) {
    existing.rank = (existing.rank || 1) + 1;
  } else {
    currentCharacter.advantages.push({ name: "Equipment", rank: 1 });
  }
  saveAndRender();
}

function updatePowerCostPreview() {
  const effectSelect = document.getElementById("power-input-effect");
  const ranksInput = document.getElementById("power-input-ranks");
  const preview = document.getElementById("power-calculated-cost-preview");
  if (!effectSelect || !ranksInput || !preview) return;

  const effectKey = effectSelect.value;
  const effectData = VALIANT_DATA.powerEffects[effectKey] || { baseCost: 1 };
  const ranks = parseInt(ranksInput.value, 10) || 1;

  let costPerRank = effectData.baseCost;
  let flatExtra = 0;

  selectedModifiers.forEach(modName => {
    const ex = VALIANT_DATA.modifiers.extras.find(m => m.name === modName);
    const fl = VALIANT_DATA.modifiers.flaws.find(m => m.name === modName);
    if (ex) {
      if (ex.isFlat) flatExtra += ex.costPerRank;
      else costPerRank += ex.costPerRank;
    }
    if (fl) {
      if (fl.isFlat) flatExtra += fl.costPerRank;
      else costPerRank += fl.costPerRank;
    }
  });

  if (costPerRank < 1) costPerRank = 1;

  const totalCost = Math.max(1, (costPerRank * ranks) + flatExtra);
  preview.textContent = `Estimated Cost: ${totalCost} PP (${costPerRank} PP/rank × ${ranks} ranks${flatExtra ? ` + ${flatExtra} flat` : ''})`;
  return totalCost;
}

function handleSavePower() {
  const nameInput = document.getElementById("power-input-name");
  const effectSelect = document.getElementById("power-input-effect");
  const ranksInput = document.getElementById("power-input-ranks");
  const descInput = document.getElementById("power-input-desc");

  const name = nameInput.value.trim() || `${effectSelect.value} Power`;
  const effect = effectSelect.value;
  const ranks = parseInt(ranksInput.value, 10) || 1;
  const details = descInput.value.trim();
  const cost = updatePowerCostPreview();

  const extras = [];
  const flaws = [];
  selectedModifiers.forEach(m => {
    if (VALIANT_DATA.modifiers.extras.some(ex => ex.name === m)) extras.push(m);
    else flaws.push(m);
  });

  currentCharacter.powers.push({
    id: "pow_" + Date.now(),
    name,
    effect,
    ranks,
    details,
    cost,
    extras,
    flaws
  });

  nameInput.value = "";
  descInput.value = "";
  selectedModifiers.clear();
  document.querySelectorAll(".mod-pill").forEach(p => p.classList.remove("selected"));
  saveAndRender();
}

function removePower(index) {
  currentCharacter.powers.splice(index, 1);
  saveAndRender();
}

function handleAddGearFromCatalog() {
  const select = document.getElementById("select-gear-catalog");
  if (!select) return;
  const item = VALIANT_DATA.gearCatalog[select.value];
  if (!item) return;

  currentCharacter.gear.push({
    id: "gear_" + Date.now(),
    name: item.name,
    category: item.category,
    costEP: item.costEP,
    description: item.description
  });
  saveAndRender();
}

function removeGearItem(index) {
  currentCharacter.gear.splice(index, 1);
  saveAndRender();
}

// =====================================================================
// FILE ACTIONS & STORAGE MANAGEMENT
// =====================================================================
function handleNewCharacter(confirmPrompt = true) {
  if (!confirmPrompt || confirm("Create a new blank character? All fields will be cleared.")) {
    currentCharacter = createBlankCharacter(appSettings.defaultPL);
    savedSnapshot = JSON.stringify(currentCharacter);
    saveAndRender();
  }
}

function handleSaveCharacter() {
  const savedFileName = resolveFileNameOnSave(currentCharacter);
  autoSaveToSlot(savedFileName);
  ValiantExporter.exportVALADV(currentCharacter, savedFileName);
  savedSnapshot = JSON.stringify(currentCharacter);
  renderHeaderSummary();
  alert(`Character saved successfully as "${savedFileName}"!`);
}

function handleOpenRename() {
  const input = document.getElementById("rename-input-name");
  if (input) input.value = currentCharacter.name || "";
  openModal("modal-rename");
}

function handleOpenDelete() {
  const label = document.getElementById("delete-char-name");
  if (label) label.textContent = currentCharacter.name || currentCharacter.fileName || "active character";
  openModal("modal-delete");
}

function handleFileLoad(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && parsed.abilities) {
        currentCharacter = parsed;
        if (!currentCharacter.fileName) {
          currentCharacter.fileName = file.name;
        }
        savedSnapshot = JSON.stringify(currentCharacter);
        saveAndRender();
        closeModal("modal-load");
        alert(`Successfully loaded character: ${currentCharacter.name || currentCharacter.fileName}!`);
      } else {
        alert("Invalid Valiant character file format.");
      }
    } catch (err) {
      alert("Error parsing character file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// Local storage slots
function autoSaveToSlot(slotKey) {
  const key = slotKey || currentCharacter.fileName || (currentCharacter.name ? `${currentCharacter.name}.valadv` : "New character.valadv");
  const slotsKey = "valiant_saved_slots";
  let slots = {};
  try {
    slots = JSON.parse(localStorage.getItem(slotsKey) || "{}");
  } catch (e) {}

  slots[key] = {
    name: currentCharacter.name || key,
    fileName: key,
    pl: currentCharacter.pl || 10,
    concept: currentCharacter.concept || "Hero",
    savedAt: new Date().toISOString(),
    data: currentCharacter
  };

  localStorage.setItem(slotsKey, JSON.stringify(slots));
  loadSavedCharactersList();
}

function removeSavedSlot(key) {
  const slotsKey = "valiant_saved_slots";
  let slots = {};
  try {
    slots = JSON.parse(localStorage.getItem(slotsKey) || "{}");
    delete slots[key];
    localStorage.setItem(slotsKey, JSON.stringify(slots));
    loadSavedCharactersList();
  } catch (e) {}
}

function loadSavedCharactersList() {
  const container = document.getElementById("saved-slots-list");
  if (!container) return;

  const slotsKey = "valiant_saved_slots";
  let slots = {};
  try {
    slots = JSON.parse(localStorage.getItem(slotsKey) || "{}");
  } catch (e) {}

  const keys = Object.keys(slots);
  if (keys.length === 0) {
    container.innerHTML = `<span style="font-size: 12px; color: var(--text-dim);">No characters saved in browser yet.</span>`;
    return;
  }

  container.innerHTML = keys.map(k => {
    const item = slots[k];
    return `
      <div style="background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <strong>${item.name}</strong> <span style="font-size: 11px; color: var(--text-muted);">(PL ${item.pl} • ${item.concept})</span>
          <div style="font-size: 10px; color: var(--text-dim);">${item.fileName || k}</div>
        </div>
        <button class="btn-header" style="font-size: 12px; padding: 4px 8px;" onclick="loadSlot('${escapeAttr(k)}')">Load</button>
      </div>
    `;
  }).join("");
}

window.loadSlot = function(name) {
  checkUnsavedBeforeAction(() => {
    const slotsKey = "valiant_saved_slots";
    try {
      const slots = JSON.parse(localStorage.getItem(slotsKey) || "{}");
      if (slots[name]?.data) {
        currentCharacter = JSON.parse(JSON.stringify(slots[name].data));
        savedSnapshot = JSON.stringify(currentCharacter);
        saveAndRender();
        closeModal("modal-load");
      }
    } catch (e) {
      console.error(e);
    }
  });
};

window.loadArchetype = function(index) {
  const arch = VALIANT_DATA.archetypes[index];
  if (!arch) return;

  checkUnsavedBeforeAction(() => {
    currentCharacter = {
      id: "arch_" + Date.now(),
      name: arch.name.split(" ")[0],
      fileName: `${arch.name.split(" ")[0]}.valadv`,
      realName: "Unknown Operative",
      pl: arch.pl || 10,
      identity: "Secret",
      concept: arch.concept,
      motivation: "Justice & Survival",
      complications: "Adversaries, Heroic Responsibility",
      abilities: JSON.parse(JSON.stringify(arch.abilities)),
      defenses: JSON.parse(JSON.stringify(arch.defenses)),
      skills: JSON.parse(JSON.stringify(arch.skills)),
      advantages: JSON.parse(JSON.stringify(arch.advantages)),
      powers: JSON.parse(JSON.stringify(arch.powers)),
      gear: JSON.parse(JSON.stringify(arch.gear)),
      hpRemaining: 1,
      bruises: 0
    };
    savedSnapshot = JSON.stringify(currentCharacter);
    saveAndRender();
    closeModal("modal-load");
    alert(`Loaded archetype: ${arch.name}`);
  });
};

// =====================================================================
// TRAIT MODAL DISPLAY FUNCTIONS
// =====================================================================
window.showTraitModal = function(title, category, costOrType, description, extraDetails = "") {
  const modal = document.getElementById("modal-trait-desc");
  if (!modal) return;

  document.getElementById("trait-modal-title").textContent = title;

  const metaContainer = document.getElementById("trait-modal-meta");
  metaContainer.innerHTML = `
    ${category ? `<span class="trait-tag">${category}</span>` : ''}
    ${costOrType ? `<span class="trait-tag">${costOrType}</span>` : ''}
  `;

  document.getElementById("trait-modal-body").innerHTML = `
    <p style="margin-bottom: 8px;">${description}</p>
    ${extraDetails ? `<div style="font-size: 12.5px; color: var(--text-dim); margin-top: 8px;">${extraDetails}</div>` : ''}
  `;

  openModal("modal-trait-desc");
};

window.showAbilityModal = function(code) {
  const data = VALIANT_DATA.abilities[code];
  if (data) {
    showTraitModal(data.name, "Core Ability", `${data.costPerRank} PP / rank`, data.description);
  }
};

window.showDefenseModal = function(name) {
  const data = VALIANT_DATA.defenses[name];
  if (data) {
    showTraitModal(`${data.name} Defense`, `Governed by ${data.ability}`, `${data.costPerRank} PP / rank`, data.description);
  }
};

window.showSkillModal = function(skillName) {
  let baseKey = skillName;
  if (skillName.includes("(")) {
    baseKey = skillName.split("(")[0].trim();
  }
  const data = VALIANT_DATA.skills[baseKey] || VALIANT_DATA.skills[skillName];
  if (data) {
    showTraitModal(skillName, `Skill (Ability: ${data.ability})`, `0.5 PP / rank (1 PP per 2 ranks)`, data.description);
  } else {
    showTraitModal(skillName, "Skill", "0.5 PP / rank", "Specialized field of training.");
  }
};

window.showAdvantageModal = function(advName) {
  const data = VALIANT_DATA.advantages[advName];
  if (data) {
    showTraitModal(advName, `Advantage (${data.category})`, `Max Ranks: ${data.ranks} (1 PP / rank)`, data.description);
  }
};

window.showPowerEffectModal = function(effectName) {
  const data = VALIANT_DATA.powerEffects[effectName];
  if (data) {
    showTraitModal(
      `Power Effect: ${effectName}`,
      `${data.type} Effect | Action: ${data.action} | Range: ${data.range} | Duration: ${data.duration}`,
      `Base Cost: ${data.baseCost} PP / rank`,
      data.description
    );
  }
};

// =====================================================================
// POPULATE DROPDOWNS & MODIFIERS
// =====================================================================
function populateDropdowns() {
  const advSelect = document.getElementById("select-advantage");
  if (advSelect) {
    advSelect.innerHTML = Object.keys(VALIANT_DATA.advantages).sort().map(advName => {
      const adv = VALIANT_DATA.advantages[advName];
      return `<option value="${advName}">${advName} (${adv.category})</option>`;
    }).join("");
  }

  const effectSelect = document.getElementById("power-input-effect");
  if (effectSelect) {
    effectSelect.innerHTML = Object.keys(VALIANT_DATA.powerEffects).sort().map(name => {
      const eff = VALIANT_DATA.powerEffects[name];
      return `<option value="${name}">${name} (${eff.baseCost} PP/rank)</option>`;
    }).join("");
  }

  const gearSelect = document.getElementById("select-gear-catalog");
  if (gearSelect) {
    gearSelect.innerHTML = VALIANT_DATA.gearCatalog.map((item, idx) => {
      return `<option value="${idx}">${item.name} (${item.category} - ${item.costEP} EP)</option>`;
    }).join("");
  }

  const modsContainer = document.getElementById("power-modifiers-checkboxes");
  if (modsContainer) {
    const extrasMarkup = VALIANT_DATA.modifiers.extras.map(e => `
      <span class="mod-pill" onclick="toggleModifier('${e.name}', this)">
        <span>+ ${e.name}</span>
        <span class="mod-pill-info">(+${e.costPerRank}${e.isFlat ? ' flat' : '/r'})</span>
      </span>
    `).join("");

    const flawsMarkup = VALIANT_DATA.modifiers.flaws.map(f => `
      <span class="mod-pill" onclick="toggleModifier('${f.name}', this)">
        <span>- ${f.name}</span>
        <span class="mod-pill-info">(${f.costPerRank}${f.isFlat ? ' flat' : '/r'})</span>
      </span>
    `).join("");

    modsContainer.innerHTML = extrasMarkup + flawsMarkup;
  }
}

window.toggleModifier = function(name, pillEl) {
  if (selectedModifiers.has(name)) {
    selectedModifiers.delete(name);
    pillEl.classList.remove("selected");
  } else {
    selectedModifiers.add(name);
    pillEl.classList.add("selected");
  }
  updatePowerCostPreview();
};

// =====================================================================
// TABLES & REFERENCE TAB RENDERING
// =====================================================================
function renderTablesAndReference() {
  // 1. Measurements Table
  const measBody = document.getElementById("measurements-table-body");
  if (measBody) {
    measBody.innerHTML = VALIANT_DATA.tables.measurements.map(m => `
      <tr>
        <td><strong>Rank ${m.rank}</strong></td>
        <td>${m.mass}</td>
        <td>${m.distance}</td>
        <td>${m.time}</td>
        <td>${m.volume}</td>
      </tr>
    `).join("");
  }

  // 2. Interactive Calculator initial calculation
  updateRankCalculator();

  // 3. PL Limits Matrix
  const plBody = document.getElementById("pl-limits-table-body");
  if (plBody && VALIANT_DATA.tables.plLimits) {
    plBody.innerHTML = VALIANT_DATA.tables.plLimits.map(p => `
      <tr>
        <td><strong style="color: var(--accent-secondary);">PL ${p.pl}</strong></td>
        <td><strong>${p.pp} PP</strong></td>
        <td>${p.atkEffect}</td>
        <td>${p.defTough}</td>
        <td>${p.fortWill}</td>
        <td>+${p.maxSkill}</td>
        <td style="font-size: 12px; color: var(--text-muted);">${p.archetype}</td>
      </tr>
    `).join("");
  }

  // 4. Combat Maneuvers
  const manBody = document.getElementById("combat-maneuvers-table-body");
  if (manBody && VALIANT_DATA.tables.combatManeuvers) {
    manBody.innerHTML = VALIANT_DATA.tables.combatManeuvers.map(cm => `
      <tr>
        <td><strong>${cm.maneuver}</strong></td>
        <td><span style="font-size: 11px; padding: 2px 6px; border-radius: 3px; background: var(--bg-tertiary);">${cm.action}</span></td>
        <td>${cm.modifier}</td>
      </tr>
    `).join("");
  }

  // 5. Circumstances & Conditions
  const circBody = document.getElementById("circumstances-table-body");
  if (circBody && VALIANT_DATA.tables.circumstances) {
    circBody.innerHTML = VALIANT_DATA.tables.circumstances.map(c => `
      <tr>
        <td><strong>${c.circumstance}</strong></td>
        <td>${c.effect}</td>
      </tr>
    `).join("");
  }

  // 6. Damage Conditions Track
  const dmgBody = document.getElementById("damage-track-table-body");
  if (dmgBody) {
    dmgBody.innerHTML = VALIANT_DATA.tables.damageTrack.map(d => `
      <tr>
        <td><strong>${d.condition}</strong></td>
        <td>${d.trigger}</td>
        <td>${d.effect}</td>
      </tr>
    `).join("");
  }

  // 7. DC Benchmarks
  const benchBody = document.getElementById("benchmarks-table-body");
  if (benchBody) {
    benchBody.innerHTML = VALIANT_DATA.tables.benchmarks.map(b => `
      <tr>
        <td><strong>DC ${b.dc}</strong></td>
        <td><span style="font-weight: 600; color: var(--accent-secondary);">${b.difficulty}</span></td>
        <td>${b.example}</td>
      </tr>
    `).join("");
  }

  // 8. Material Toughness
  const matBody = document.getElementById("materials-table-body");
  if (matBody && VALIANT_DATA.tables.materialToughness) {
    matBody.innerHTML = VALIANT_DATA.tables.materialToughness.map(mt => `
      <tr>
        <td><strong>${mt.material}</strong></td>
        <td><span style="font-weight: 700; color: var(--accent-secondary);">Toughness ${mt.toughness}</span></td>
        <td style="font-size: 12px; color: var(--text-muted);">${mt.examples}</td>
      </tr>
    `).join("");
  }

  // 9. Interaction Attitudes
  const attBody = document.getElementById("attitudes-table-body");
  if (attBody && VALIANT_DATA.tables.interactionAttitudes) {
    attBody.innerHTML = VALIANT_DATA.tables.interactionAttitudes.map(a => `
      <tr>
        <td><strong>${a.attitude}</strong></td>
        <td><span style="font-weight: 700; color: var(--accent-secondary);">${a.dcAdjustment}</span></td>
        <td style="font-size: 12px; color: var(--text-muted);">${a.description}</td>
      </tr>
    `).join("");
  }

  // 10. Archetypes List
  const archHelp = document.getElementById("archetypes-quick-load-list");
  const archModal = document.getElementById("archetype-modal-list");

  const archMarkup = VALIANT_DATA.archetypes.map((arch, idx) => `
    <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <strong style="color: var(--text-main); font-size: 14px;">${arch.name}</strong>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${arch.concept}</p>
      </div>
      <button class="btn-header primary" style="font-size: 12px; padding: 4px 8px; margin-top: 10px;" onclick="loadArchetype(${idx})">
        Load Archetype
      </button>
    </div>
  `).join("");

  if (archHelp) archHelp.innerHTML = archMarkup;
  if (archModal) archModal.innerHTML = archMarkup;
}

function updateRankCalculator() {
  const input = document.getElementById("calc-rank-input");
  if (!input) return;
  const rank = parseInt(input.value, 10);
  if (isNaN(rank)) return;

  const found = VALIANT_DATA.tables.measurements.find(m => m.rank === rank);
  if (found) {
    document.getElementById("calc-mass-val").textContent = found.mass;
    document.getElementById("calc-dist-val").textContent = found.distance;
    document.getElementById("calc-time-val").textContent = found.time;
    document.getElementById("calc-vol-val").textContent = found.volume;
  } else if (rank > 20) {
    const diff = rank - 20;
    const factor = Math.pow(2, diff);
    const massK = 25000 * factor;
    const distM = 4000 * factor;
    document.getElementById("calc-mass-val").textContent = `${massK.toLocaleString()} tons`;
    document.getElementById("calc-dist-val").textContent = `${distM.toLocaleString()} miles`;
    document.getElementById("calc-time-val").textContent = `${Math.round(2 * factor)} months`;
    document.getElementById("calc-vol-val").textContent = `${(4000000 * factor).toLocaleString()} c. ft.`;
  } else if (rank < -5) {
    document.getElementById("calc-mass-val").textContent = `< 1 lb`;
    document.getElementById("calc-dist-val").textContent = `< 3 inches`;
    document.getElementById("calc-time-val").textContent = `< 1/16 second`;
    document.getElementById("calc-vol-val").textContent = `< 1/16 c. ft.`;
  }
}

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("open");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("open");
}

function escapeAttr(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
