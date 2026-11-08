// Valiant Adventures RPG - Character Creator Main Application Logic

// Initial Default State
const DEFAULT_CHARACTER = {
  id: "bloodshot_default",
  name: "Bloodshot",
  realName: "Ray Garrison",
  pl: 10,
  identity: "Classified / Secret",
  concept: "Nanite Super-Soldier",
  motivation: "Reclaiming Past & Justice",
  complications: "Nanite Dependency, Amnesia Flashbacks, Rising Spirit Protocol",
  abilities: {
    STR: 4,
    STA: 5,
    AGL: 3,
    DEX: 4,
    FGT: 7,
    INT: 1,
    AWE: 3,
    PRE: 1
  },
  defenses: {
    Dodge: 4,
    Parry: 3,
    Fortitude: 5,
    Toughness: 5,
    Will: 5
  },
  skills: {
    "Athletics": 4,
    "Close Combat (Unarmed)": 3,
    "Close Combat (Knives)": 3,
    "Deception": 2,
    "Insight": 3,
    "Intimidation": 7,
    "Investigation": 3,
    "Perception": 5,
    "Ranged Combat (Firearms)": 6,
    "Stealth": 4,
    "Technology": 3,
    "Treatment": 2,
    "Vehicles": 4
  },
  advantages: [
    { name: "All-out Attack", rank: 1 },
    { name: "Diehard", rank: 1 },
    { name: "Equipment", rank: 4 },
    { name: "Fearless", rank: 1 },
    { name: "Improved Critical", rank: 2 },
    { name: "Improved Initiative", rank: 1 },
    { name: "Power Attack", rank: 1 },
    { name: "Quick Draw", rank: 1 },
    { name: "Takedown", rank: 2 },
    { name: "Uncanny Dodge", rank: 1 }
  ],
  powers: [
    {
      id: "pow_1",
      name: "Nanite Cellular Regeneration",
      effect: "Regeneration",
      ranks: 10,
      details: "Nanite swarm repairs catastrophic tissue and organ trauma every round.",
      cost: 10,
      extras: [],
      flaws: []
    },
    {
      id: "pow_2",
      name: "Subcutaneous Armor Weave",
      effect: "Protection",
      ranks: 4,
      details: "Impervious 4. Hardened subdermal nanites stop small arms fire.",
      cost: 8,
      extras: ["Impervious"],
      flaws: []
    },
    {
      id: "pow_3",
      name: "Technopathic Pulse",
      effect: "Nanite Swarm / Control",
      ranks: 6,
      details: "Direct machine-interface hacking, disabling electronics and wireless nodes.",
      cost: 12,
      extras: [],
      flaws: []
    },
    {
      id: "pow_4",
      name: "Tactical Threat Sensors",
      effect: "Senses",
      ranks: 4,
      details: "Darkvision, Radio reception, Danger Sense.",
      cost: 4,
      extras: [],
      flaws: []
    }
  ],
  gear: [
    { id: "gear_1", name: "Assault Rifle", category: "Weapons", costEP: 15, description: "Damage 5 (Ranged, Ballistic, Multiattack)." },
    { id: "gear_2", name: "Heavy Pistol", category: "Weapons", costEP: 8, description: "Damage 4 (Ranged, Ballistic)." },
    { id: "gear_3", name: "Combat Knife / Katana", category: "Weapons", costEP: 4, description: "Damage 3 (Strength-based, Slashing, Critical 19-20)." }
  ],
  hpRemaining: 1,
  bruises: 0
};

let currentCharacter = JSON.parse(JSON.stringify(DEFAULT_CHARACTER));
let selectedModifiers = new Set();

let appSettings = {
  theme: "default",
  fontScale: "standard",
  charFolder: "C:\\Users\\admin\\Documents\\ValiantCharacters",
  defaultPL: 10
};

// =====================================================================
// INITIALIZATION
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  loadSavedCharactersList();
  
  // Try loading from localStorage if existing
  const cachedChar = localStorage.getItem("valiant_current_character");
  if (cachedChar) {
    try {
      currentCharacter = JSON.parse(cachedChar);
    } catch (e) {
      console.warn("Could not parse cached character, using default.", e);
    }
  }

  setupEventListeners();
  renderAll();
  populateDropdowns();
  renderTablesAndReference();
});

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

  if (themeSelect) themeSelect.value = appSettings.theme;
  if (fontSelect) fontSelect.value = appSettings.fontScale;
  if (folderInput) folderInput.value = appSettings.charFolder;
  if (plSelect) plSelect.value = appSettings.defaultPL;
}

function saveSettingsFromUI() {
  const themeSelect = document.getElementById("setting-theme");
  const fontSelect = document.getElementById("setting-font-scale");
  const folderInput = document.getElementById("setting-char-folder");
  const plSelect = document.getElementById("setting-default-pl");

  if (themeSelect) appSettings.theme = themeSelect.value;
  if (fontSelect) appSettings.fontScale = fontSelect.value;
  if (folderInput) appSettings.charFolder = folderInput.value;
  if (plSelect) appSettings.defaultPL = parseInt(plSelect.value, 10);

  localStorage.setItem("valiant_settings", JSON.stringify(appSettings));
  applySettings();
  closeModal("modal-settings");
}

// =====================================================================
// SETUP EVENT LISTENERS
// =====================================================================
function setupEventListeners() {
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
      if (section) {
        section.classList.toggle("open");
      }
    });
  });

  // Top Row: Character Menu Dropdown Toggle
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

  // Top Row: Menu Action Handlers
  document.getElementById("menu-new-char")?.addEventListener("click", handleNewCharacter);
  document.getElementById("menu-load-char")?.addEventListener("click", () => openModal("modal-load"));
  document.getElementById("menu-save-char")?.addEventListener("click", handleSaveCharacter);
  document.getElementById("menu-rename-char")?.addEventListener("click", handleOpenRename);
  document.getElementById("menu-export-char")?.addEventListener("click", () => openModal("modal-export"));
  document.getElementById("menu-delete-char")?.addEventListener("click", handleOpenDelete);

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
      if (e.target === modal) {
        modal.classList.remove("open");
      }
    });
  });

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
      saveAndRender();
      closeModal("modal-rename");
    }
  });

  // Delete confirmation
  document.getElementById("btn-confirm-delete")?.addEventListener("click", () => {
    // Remove from local storage
    removeSavedCharacter(currentCharacter.name);
    // Reset to blank character
    handleNewCharacter();
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
    ValiantExporter.exportJSON(currentCharacter);
    closeModal("modal-export");
  });

  // Add Specialty Skill Button
  document.getElementById("btn-add-specialty-skill")?.addEventListener("click", handleAddSpecialtySkill);

  // Advantage picker & '?' info button next to dropdown
  document.getElementById("btn-info-selected-adv")?.addEventListener("click", () => {
    const selectedAdv = document.getElementById("select-advantage")?.value;
    if (selectedAdv) {
      showAdvantageModal(selectedAdv);
    }
  });
  document.getElementById("btn-add-advantage")?.addEventListener("click", handleAddAdvantage);

  // Power Effect '?' info button next to dropdown
  document.getElementById("btn-info-selected-power-effect")?.addEventListener("click", () => {
    const selectedEffect = document.getElementById("power-input-effect")?.value;
    if (selectedEffect) {
      showPowerEffectModal(selectedEffect);
    }
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
// RENDERING
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
  localStorage.setItem("valiant_current_character", JSON.stringify(currentCharacter));
  autoSaveToSlot();
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

// Render Top Row & Second Row Persistent Character Information
function renderHeaderSummary() {
  const costs = calculateCosts(currentCharacter);

  // Character Name & PL
  const nameEl = document.getElementById("summary-char-name");
  const metaEl = document.getElementById("summary-char-meta");
  if (nameEl) nameEl.textContent = currentCharacter.name || "Unnamed Character";
  if (metaEl) metaEl.textContent = `PL ${currentCharacter.pl || 10} • ${currentCharacter.concept || "Custom Hero"}`;

  // PP Stats
  const usedEl = document.getElementById("summary-pp-used");
  const totalEl = document.getElementById("summary-pp-total");
  const leftEl = document.getElementById("summary-pp-left");

  if (usedEl) usedEl.textContent = costs.totalUsed;
  if (totalEl) totalEl.textContent = costs.totalBudget;
  if (leftEl) {
    leftEl.textContent = costs.remaining;
    if (costs.remaining < 0) {
      leftEl.className = "stat-capsule-val danger";
    } else {
      leftEl.className = "stat-capsule-val success";
    }
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

  // Gear & Equipment EP points
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
            <!-- Trait Link and '?' Button -->
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
    // Determine base ability from definition or default
    let baseAbilityKey = "AGL";
    let isSpecialty = false;

    // Check exact match first
    if (VALIANT_DATA.skills[skillName]) {
      baseAbilityKey = VALIANT_DATA.skills[skillName].ability;
    } else {
      // Check prefix (e.g. "Close Combat: Swords")
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
// INTERACTIVE ADJUSTMENT FUNCTIONS
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

  if (costPerRank < 1) costPerRank = 1; // M&M minimum cost per rank rule

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

  // Clear inputs
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
// CHARACTER FILE MENU ACTIONS
// =====================================================================
function handleNewCharacter() {
  if (confirm("Create a new character? Unsaved changes will be replaced with a blank template.")) {
    const pl = appSettings.defaultPL || 10;
    currentCharacter = {
      id: "char_" + Date.now(),
      name: "New Operative",
      realName: "Unknown",
      pl: pl,
      identity: "Secret",
      concept: "Rising Vigilante",
      motivation: "Justice",
      complications: "None listed",
      abilities: { STR: 0, STA: 0, AGL: 0, DEX: 0, FGT: 0, INT: 0, AWE: 0, PRE: 0 },
      defenses: { Dodge: 0, Parry: 0, Fortitude: 0, Toughness: 0, Will: 0 },
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
    saveAndRender();
  }
}

function handleSaveCharacter() {
  autoSaveToSlot();
  ValiantExporter.exportJSON(currentCharacter);
  alert(`Character "${currentCharacter.name}" saved! A .valiant character file has been downloaded.`);
}

function handleOpenRename() {
  const input = document.getElementById("rename-input-name");
  if (input) input.value = currentCharacter.name || "";
  openModal("modal-rename");
}

function handleOpenDelete() {
  const label = document.getElementById("delete-char-name");
  if (label) label.textContent = currentCharacter.name || "active character";
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
        saveAndRender();
        closeModal("modal-load");
        alert(`Successfully loaded character: ${currentCharacter.name}!`);
      } else {
        alert("Invalid Valiant character file format.");
      }
    } catch (err) {
      alert("Error parsing character file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// Local storage slot auto-save
function autoSaveToSlot() {
  if (!currentCharacter.name) return;
  const slotsKey = "valiant_saved_slots";
  let slots = {};
  try {
    slots = JSON.parse(localStorage.getItem(slotsKey) || "{}");
  } catch (e) {}

  slots[currentCharacter.name] = {
    name: currentCharacter.name,
    pl: currentCharacter.pl || 10,
    concept: currentCharacter.concept || "Hero",
    savedAt: new Date().toISOString(),
    data: currentCharacter
  };

  localStorage.setItem(slotsKey, JSON.stringify(slots));
  loadSavedCharactersList();
}

function removeSavedCharacter(name) {
  const slotsKey = "valiant_saved_slots";
  let slots = {};
  try {
    slots = JSON.parse(localStorage.getItem(slotsKey) || "{}");
    delete slots[name];
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
          <strong>${item.name}</strong> <span style="font-size: 11px; color: var(--text-muted);">(PL ${item.pl} - ${item.concept})</span>
        </div>
        <button class="btn-header" style="font-size: 12px; padding: 4px 8px;" onclick="loadSlot('${escapeAttr(k)}')">Load</button>
      </div>
    `;
  }).join("");
}

window.loadSlot = function(name) {
  const slotsKey = "valiant_saved_slots";
  try {
    const slots = JSON.parse(localStorage.getItem(slotsKey) || "{}");
    if (slots[name]?.data) {
      currentCharacter = slots[name].data;
      saveAndRender();
      closeModal("modal-load");
    }
  } catch (e) {
    console.error(e);
  }
};

window.loadArchetype = function(index) {
  const arch = VALIANT_DATA.archetypes[index];
  if (!arch) return;
  if (confirm(`Load the pre-made "${arch.name}" archetype? This will populate the builder with this character build.`)) {
    currentCharacter = {
      id: "arch_" + Date.now(),
      name: arch.name.split(" ")[0],
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
    saveAndRender();
    closeModal("modal-load");
  }
};

// =====================================================================
// TRAIT MODAL DISPLAY FUNCTIONS (MANDATORY REQUIREMENT)
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
    showTraitModal(
      data.name,
      "Core Ability",
      `${data.costPerRank} PP / rank`,
      data.description
    );
  }
};

window.showDefenseModal = function(name) {
  const data = VALIANT_DATA.defenses[name];
  if (data) {
    showTraitModal(
      `${data.name} Defense`,
      `Governed by ${data.ability}`,
      `${data.costPerRank} PP / rank`,
      data.description
    );
  }
};

window.showSkillModal = function(skillName) {
  let baseKey = skillName;
  if (skillName.includes("(")) {
    baseKey = skillName.split("(")[0].trim();
  }
  const data = VALIANT_DATA.skills[baseKey] || VALIANT_DATA.skills[skillName];
  if (data) {
    showTraitModal(
      skillName,
      `Skill (Ability: ${data.ability})`,
      `0.5 PP / rank (1 PP per 2 ranks)`,
      data.description
    );
  } else {
    showTraitModal(skillName, "Skill", "0.5 PP / rank", "Specialized field of training.");
  }
};

window.showAdvantageModal = function(advName) {
  const data = VALIANT_DATA.advantages[advName];
  if (data) {
    showTraitModal(
      advName,
      `Advantage (${data.category})`,
      `Max Ranks: ${data.ranks} (1 PP / rank)`,
      data.description
    );
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
  // Advantages Dropdown
  const advSelect = document.getElementById("select-advantage");
  if (advSelect) {
    advSelect.innerHTML = Object.keys(VALIANT_DATA.advantages).sort().map(advName => {
      const adv = VALIANT_DATA.advantages[advName];
      return `<option value="${advName}">${advName} (${adv.category})</option>`;
    }).join("");
  }

  // Power Effects Dropdown
  const effectSelect = document.getElementById("power-input-effect");
  if (effectSelect) {
    effectSelect.innerHTML = Object.keys(VALIANT_DATA.powerEffects).sort().map(name => {
      const eff = VALIANT_DATA.powerEffects[name];
      return `<option value="${name}">${name} (${eff.baseCost} PP/rank)</option>`;
    }).join("");
  }

  // Gear Catalog Dropdown
  const gearSelect = document.getElementById("select-gear-catalog");
  if (gearSelect) {
    gearSelect.innerHTML = VALIANT_DATA.gearCatalog.map((item, idx) => {
      return `<option value="${idx}">${item.name} (${item.category} - ${item.costEP} EP)</option>`;
    }).join("");
  }

  // Power Modifiers Pills (Extras & Flaws)
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
// TABLES AND REFERENCE TAB DATA
// =====================================================================
function renderTablesAndReference() {
  // Measurements Table
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

  // DC Benchmarks
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

  // Damage Track
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

  // Archetypes in Help Tab & Load Modal
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
