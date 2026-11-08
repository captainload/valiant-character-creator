// Valiant Adventures RPG - Character Creator Core Application Logic
// Built for Valiant Adventures Hero's Handbook (Mutants & Masterminds 3E Engine)

// Global State
let currentCharacter = null;
let savedSnapshot = "";
let pendingProceedAction = null;
let selectedPowerModifiers = []; // [{ name, type, costPerRank, isFlat, description }]

// User Application Settings (Theme, Font Scale, Default PL, Layout Mode)
let appSettings = {
  theme: "default",
  fontScale: "standard",
  charFolder: "Characters",
  defaultPL: 10,
  layoutMode: "auto" // 'auto', 'normal', 'narrow'
};

// =====================================================================
// INITIALIZATION
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  applySettings();
  setupEventListeners();

  // Initialize with blank character
  currentCharacter = createBlankCharacter(appSettings.defaultPL);
  savedSnapshot = JSON.stringify(currentCharacter);

  populateDropdowns();
  renderAll();
  renderTablesAndReference();

  // Layout mode monitoring
  updateLayoutMode();
  window.addEventListener("resize", updateLayoutMode);

  // Setup prompt before unload if unsaved changes exist
  window.addEventListener("beforeunload", (e) => {
    if (hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue = "You have unsaved character changes. Please name and save your character.";
      return e.returnValue;
    }
  });
});

// =====================================================================
// CHARACTER FACTORY & MODEL MANAGEMENT
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
    motivation: "Justice",
    motivationDesc: "",
    complicationsList: [
      { id: "comp_1", category: "Relationship", title: "Close allies and personal ties" },
      { id: "comp_2", category: "Enemy", title: "Nemesis and opposing organization" }
    ],
    bio: {
      gender: "",
      age: "",
      height: "",
      weight: "",
      eyes: "",
      hair: "",
      origin: ""
    },
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
      "Close Combat (Unarmed)": 0,
      "Computers": 0,
      "Deception": 0,
      "Driving": 0,
      "Electronics": 0,
      "Escape Artist": 0,
      "Expertise (Valiant Lore)": 0,
      "Insight": 0,
      "Intimidation": 0,
      "Investigation": 0,
      "Mechanics": 0,
      "Occult": 0,
      "Perception": 0,
      "Persuasion": 0,
      "Piloting": 0,
      "Ranged Combat (Firearms)": 0,
      "Sleight of Hand": 0,
      "Stealth": 0,
      "Thievery": 0,
      "Treatment": 0
    },
    advantages: [],
    powers: [],
    gear: [],
    hpRemaining: 1,
    bruises: 0
  };
}

function hasUnsavedChanges() {
  if (!currentCharacter) return false;
  return JSON.stringify(currentCharacter) !== savedSnapshot;
}

function getNextNewCharacterNumber() {
  const currentNum = parseInt(localStorage.getItem("valiant_new_char_counter") || "0", 10) + 1;
  localStorage.setItem("valiant_new_char_counter", currentNum.toString());
  return currentNum;
}

function peekNextNewCharacterNumber() {
  const currentNum = parseInt(localStorage.getItem("valiant_new_char_counter") || "0", 10) + 1;
  return currentNum;
}

function resolveFileNameOnSave(char) {
  const trimmed = (char.name || "").trim();
  const oldFileName = char.fileName;

  if (trimmed.length > 0) {
    const clean = trimmed.replace(/[/\\?%*:|"<>]/g, '_');
    const newName = `${clean}.valadv`;
    char.fileName = newName;
    return newName;
  } else {
    if (oldFileName && oldFileName.toLowerCase().startsWith("new character") && oldFileName.toLowerCase().endsWith(".valadv")) {
      return oldFileName;
    }
    const num = getNextNewCharacterNumber();
    const generated = `New character ${num}.valadv`;
    char.fileName = generated;
    return generated;
  }
}

// =====================================================================
// NARROW & NORMAL LAYOUT MANAGEMENT
// =====================================================================
function updateLayoutMode() {
  const width = window.innerWidth;
  const modeSetting = appSettings.layoutMode || "auto";
  const pill = document.getElementById("active-layout-mode-pill");
  const banner = document.getElementById("min-width-warning-banner");
  const widthDisplay = document.getElementById("current-screen-width");

  if (widthDisplay) widthDisplay.textContent = width;

  if (width < 1080) {
    if (banner && !banner.classList.contains("dismissed")) {
      banner.classList.add("visible");
    }
  } else {
    if (banner) banner.classList.remove("visible");
  }

  let applyNarrow = false;
  if (modeSetting === "narrow") {
    applyNarrow = true;
  } else if (modeSetting === "normal") {
    applyNarrow = false;
  } else {
    // auto mode
    applyNarrow = (width < 1280);
  }

  if (applyNarrow) {
    document.body.classList.add("narrow-mode");
    if (pill) {
      pill.textContent = "Narrow Mode (1080px)";
      pill.title = "Narrow mode active for display widths 1080px-1280px";
    }
  } else {
    document.body.classList.remove("narrow-mode");
    if (pill) {
      pill.textContent = "Normal Mode";
      pill.title = "Normal PC widescreen layout active";
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
      console.warn("Failed to parse settings:", e);
    }
  }
}

function applySettings() {
  document.body.setAttribute("data-theme", appSettings.theme || "default");
  document.body.setAttribute("data-font-scale", appSettings.fontScale || "standard");

  const themeSelect = document.getElementById("setting-theme");
  const fontSelect = document.getElementById("setting-font-scale");
  const folderInput = document.getElementById("setting-char-folder");
  const plSelect = document.getElementById("setting-default-pl");
  const layoutSelect = document.getElementById("setting-layout-mode");

  if (themeSelect) themeSelect.value = appSettings.theme || "default";
  if (fontSelect) fontSelect.value = appSettings.fontScale || "standard";
  if (folderInput) folderInput.value = appSettings.charFolder || "Characters";
  if (plSelect) plSelect.value = appSettings.defaultPL || 10;
  if (layoutSelect) layoutSelect.value = appSettings.layoutMode || "auto";

  updateLayoutMode();
}

function saveSettingsFromUI() {
  const themeSelect = document.getElementById("setting-theme");
  const fontSelect = document.getElementById("setting-font-scale");
  const folderInput = document.getElementById("setting-char-folder");
  const plSelect = document.getElementById("setting-default-pl");
  const layoutSelect = document.getElementById("setting-layout-mode");

  appSettings.theme = themeSelect ? themeSelect.value : "default";
  appSettings.fontScale = fontSelect ? fontSelect.value : "standard";
  appSettings.charFolder = folderInput ? folderInput.value.trim() : "Characters";
  appSettings.defaultPL = plSelect ? parseInt(plSelect.value, 10) : 10;
  appSettings.layoutMode = layoutSelect ? layoutSelect.value : "auto";

  localStorage.setItem("valiant_settings", JSON.stringify(appSettings));
  applySettings();
  closeModal("modal-settings");
}

// =====================================================================
// UNSAVED CHANGES CHECK
// =====================================================================
function checkUnsavedBeforeAction(onProceed) {
  if (!hasUnsavedChanges()) {
    onProceed();
    return;
  }

  pendingProceedAction = onProceed;
  const modal = document.getElementById("modal-unsaved-prompt");
  if (modal) {
    const nameInput = document.getElementById("unsaved-input-name");
    const autoLabel = document.getElementById("unsaved-auto-filename");
    const fallbackNum = peekNextNewCharacterNumber();

    if (nameInput) nameInput.value = currentCharacter.name || "";
    if (autoLabel) {
      if (currentCharacter.fileName) {
        autoLabel.textContent = currentCharacter.fileName;
      } else {
        autoLabel.textContent = `New character ${fallbackNum}.valadv`;
      }
    }
    openModal("modal-unsaved-prompt");
  } else {
    if (confirm("You have unsaved changes. Discard them and proceed?")) {
      onProceed();
    }
  }
}

// =====================================================================
// EVENT LISTENERS & SETUP
// =====================================================================
function setupEventListeners() {
  // Navigation Tabs
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

  // Collapsible Sections
  document.querySelectorAll(".section-header").forEach(header => {
    header.addEventListener("click", () => {
      const sectionId = header.getAttribute("data-toggle");
      const section = document.getElementById(sectionId);
      if (section) section.classList.toggle("open");
    });
  });

  // Character Menu: STRICTLY ON CLICK, NEVER MOUSEOVER
  const btnCharMenu = document.getElementById("btn-char-menu");
  const charDropdown = document.getElementById("char-dropdown-menu");
  if (btnCharMenu && charDropdown) {
    btnCharMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      charDropdown.classList.toggle("open");
      btnCharMenu.setAttribute("aria-expanded", charDropdown.classList.contains("open"));
    });

    document.addEventListener("click", (e) => {
      if (!btnCharMenu.contains(e.target) && !charDropdown.contains(e.target)) {
        charDropdown.classList.remove("open");
        btnCharMenu.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Dismiss minimum display width warning
  document.getElementById("btn-dismiss-min-width-warning")?.addEventListener("click", () => {
    const banner = document.getElementById("min-width-warning-banner");
    if (banner) banner.classList.add("dismissed");
  });

  // Character Menu Actions
  document.getElementById("menu-new-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open");
    checkUnsavedBeforeAction(() => handleNewCharacter(false));
  });

  document.getElementById("menu-archetypes")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open");
    openArchetypesModal();
  });

  document.getElementById("menu-load-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open");
    openModal("modal-load");
    renderSavedSlots();
  });

  document.getElementById("menu-save-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open");
    handleSaveCharacter();
  });

  document.getElementById("menu-rename-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open");
    handleOpenRename();
  });

  document.getElementById("menu-export-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open");
    openModal("modal-export");
  });

  document.getElementById("menu-delete-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open");
    handleOpenDelete();
  });

  // Settings
  document.getElementById("btn-settings")?.addEventListener("click", () => {
    openModal("modal-settings");
  });
  document.getElementById("btn-save-settings")?.addEventListener("click", saveSettingsFromUI);

  // Generic Modal Close Buttons
  document.querySelectorAll("[data-close]").forEach(el => {
    el.addEventListener("click", () => {
      const modalId = el.getAttribute("data-close");
      closeModal(modalId);
    });
  });

  // Unsaved Prompt Modal Actions
  document.getElementById("btn-unsaved-save")?.addEventListener("click", () => {
    const input = document.getElementById("unsaved-input-name");
    const enteredName = input ? input.value.trim() : "";
    if (enteredName) currentCharacter.name = enteredName;

    const savedFileName = resolveFileNameOnSave(currentCharacter);
    autoSaveToSlot(savedFileName);
    ValiantExporter.exportVALADV(currentCharacter, savedFileName);
    savedSnapshot = JSON.stringify(currentCharacter);

    closeModal("modal-unsaved-prompt");
    if (pendingProceedAction) {
      const action = pendingProceedAction;
      pendingProceedAction = null;
      action();
    }
  });

  document.getElementById("btn-unsaved-discard")?.addEventListener("click", () => {
    closeModal("modal-unsaved-prompt");
    if (pendingProceedAction) {
      const action = pendingProceedAction;
      pendingProceedAction = null;
      action();
    }
  });

  // Hero Point (HP) & Bruise counters
  document.getElementById("btn-hp-plus")?.addEventListener("click", () => {
    currentCharacter.hpRemaining = (currentCharacter.hpRemaining || 0) + 1;
    saveAndRender();
  });
  document.getElementById("btn-hp-minus")?.addEventListener("click", () => {
    if ((currentCharacter.hpRemaining || 0) > 0) {
      currentCharacter.hpRemaining -= 1;
      saveAndRender();
    }
  });
  document.getElementById("btn-bruise-plus")?.addEventListener("click", () => {
    currentCharacter.bruises = (currentCharacter.bruises || 0) + 1;
    saveAndRender();
  });
  document.getElementById("btn-bruise-minus")?.addEventListener("click", () => {
    if ((currentCharacter.bruises || 0) > 0) {
      currentCharacter.bruises -= 1;
      saveAndRender();
    }
  });

  // Bind Identity Fields
  const bindInput = (id, prop) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", (e) => {
        currentCharacter[prop] = e.target.value;
        renderHeaderSummary();
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
    plSelect.addEventListener("change", (e) => {
      currentCharacter.pl = parseInt(e.target.value, 10);
      saveAndRender();
    });
  }

  // Background Section Event Listeners
  document.getElementById("char-motivation-select")?.addEventListener("change", (e) => {
    currentCharacter.motivation = e.target.value;
    const descPreset = VALIANT_DATA.backgroundPresets.motivations[e.target.value] || "";
    const descEl = document.getElementById("char-motivation-desc");
    if (descEl && !descEl.value) {
      descEl.value = descPreset;
      currentCharacter.motivationDesc = descPreset;
    }
    renderHeaderSummary();
  });

  document.getElementById("char-motivation-desc")?.addEventListener("input", (e) => {
    currentCharacter.motivationDesc = e.target.value;
  });

  document.getElementById("btn-add-complication")?.addEventListener("click", handleAddComplication);
  document.getElementById("btn-info-motivation")?.addEventListener("click", () => {
    showTraitModal("Heroic Motivations", "Valiant Adventures Core Rules", "Background", 
      "Every hero in Valiant Adventures has a Motivation that drives them to action. When your Motivation guides you into dangerous or disadvantageous situations, or causes genuine hardship, the GM awards you a Hero Point (HP). Common motivations include Justice, Responsibility, Doing Good, Thrills, Acceptance, and Survival.");
  });

  document.getElementById("btn-info-complications")?.addEventListener("click", () => {
    showTraitModal("Complications & Hero Points", "Valiant Adventures Core Rules", "Background Mechanics",
      "Complications are challenges, personal weaknesses, enemies, and liabilities that make a hero's life interesting. Unlike powers and traits, complications do not cost Power Points; instead, whenever a complication comes into play to cause you trouble, setback, or disability, you earn a Hero Point! A character should typically start with at least two complications: their Motivation plus one other.");
  });

  // Bio inputs
  const bindBio = (id, key) => {
    document.getElementById(id)?.addEventListener("input", (e) => {
      if (!currentCharacter.bio) currentCharacter.bio = {};
      currentCharacter.bio[key] = e.target.value;
    });
  };
  bindBio("char-bio-gender", "gender");
  bindBio("char-bio-age", "age");
  bindBio("char-bio-height", "height");
  bindBio("char-bio-weight", "weight");
  bindBio("char-bio-eyes", "eyes");
  bindBio("char-bio-hair", "hair");
  bindBio("char-origin-desc", "origin");

  // Specialty Skill Inline Panel
  document.getElementById("btn-toggle-specialty-panel")?.addEventListener("click", () => {
    const panel = document.getElementById("specialty-skill-panel");
    if (panel) {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    }
  });

  document.getElementById("btn-cancel-specialty")?.addEventListener("click", () => {
    const panel = document.getElementById("specialty-skill-panel");
    if (panel) panel.style.display = "none";
  });

  document.getElementById("btn-confirm-add-specialty")?.addEventListener("click", handleConfirmAddSpecialtySkill);

  // Advantages: Option and info triggers
  document.getElementById("select-advantage")?.addEventListener("change", handleAdvantageSelectChange);
  document.getElementById("btn-add-advantage")?.addEventListener("click", handleAddAdvantage);
  document.getElementById("btn-info-selected-adv")?.addEventListener("click", () => {
    const selectedAdv = document.getElementById("select-advantage")?.value;
    if (selectedAdv) showAdvantageModal(selectedAdv);
  });

  // Power Studio: Effect change, modifiers add, dynamic options
  document.getElementById("power-input-effect")?.addEventListener("change", handlePowerEffectChange);
  document.getElementById("power-input-ranks")?.addEventListener("input", updatePowerCostPreview);
  document.getElementById("btn-info-selected-power-effect")?.addEventListener("click", () => {
    const selectedEffect = document.getElementById("power-input-effect")?.value;
    if (selectedEffect) showPowerEffectModal(selectedEffect);
  });

  // Modifiers Extra & Flaw buttons
  document.getElementById("btn-add-extra")?.addEventListener("click", () => handleAddModifier("extra"));
  document.getElementById("btn-add-flaw")?.addEventListener("click", () => handleAddModifier("flaw"));
  document.getElementById("btn-info-selected-extra")?.addEventListener("click", () => {
    const exName = document.getElementById("power-select-extra")?.value;
    if (exName) showModifierModal(exName, "extra");
  });
  document.getElementById("btn-info-selected-flaw")?.addEventListener("click", () => {
    const flName = document.getElementById("power-select-flaw")?.value;
    if (flName) showModifierModal(flName, "flaw");
  });

  document.getElementById("btn-save-power")?.addEventListener("click", handleSavePower);

  // Gear & Equipment
  document.getElementById("btn-info-selected-gear")?.addEventListener("click", () => {
    const selectedIdx = document.getElementById("select-gear-catalog")?.value;
    const gear = VALIANT_DATA.gearCatalog[selectedIdx];
    if (gear) {
      showTraitModal(gear.name, `Gear (${gear.category})`, `${gear.costEP} EP`, gear.description);
    }
  });
  document.getElementById("btn-add-gear-item")?.addEventListener("click", handleAddGearFromCatalog);
  document.getElementById("btn-sync-equipment-adv")?.addEventListener("click", handleIncrementEquipmentAdv);

  // Export Modal Triggers
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

  // Rename Confirmation
  document.getElementById("btn-confirm-rename")?.addEventListener("click", () => {
    const newName = document.getElementById("rename-input-name").value.trim();
    if (newName) {
      currentCharacter.name = newName;
      currentCharacter.fileName = `${newName.replace(/[/\\?%*:|"<>]/g, '_')}.valadv`;
      saveAndRender();
      closeModal("modal-rename");
      alert(`Character renamed to "${newName}". File set to "${currentCharacter.fileName}".`);
    }
  });

  // Delete Confirmation
  document.getElementById("btn-confirm-delete")?.addEventListener("click", () => {
    const key = `valiant_char_${currentCharacter.fileName || currentCharacter.name || 'unnamed'}`;
    localStorage.removeItem(key);
    currentCharacter = createBlankCharacter(appSettings.defaultPL);
    savedSnapshot = JSON.stringify(currentCharacter);
    saveAndRender();
    closeModal("modal-delete");
    alert("Character deleted. Started new blank character.");
  });

  // File Upload
  const fileInput = document.getElementById("input-load-file");
  document.getElementById("btn-browse-file")?.addEventListener("click", () => {
    fileInput?.click();
  });
  if (fileInput) {
    fileInput.addEventListener("change", handleFileUpload);
  }

  // Calculator rank change
  document.getElementById("calc-rank-input")?.addEventListener("input", updateRankCalculator);
}

// =====================================================================
// RENDERING FUNCTIONS
// =====================================================================
function renderAll() {
  renderHeaderSummary();
  renderIdentityInputs();
  renderBackground();
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
    renderBackground();
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

  const nameEl = document.getElementById("summary-char-name");
  const metaEl = document.getElementById("summary-char-meta");
  const displayName = currentCharacter.name || (currentCharacter.fileName ? currentCharacter.fileName.replace(/\.valadv$/i, '') : "New Character (Unnamed)");

  if (nameEl) nameEl.textContent = displayName;
  if (metaEl) {
    metaEl.textContent = `PL ${currentCharacter.pl || 10} • ${currentCharacter.concept || "Custom Hero"}${hasUnsavedChanges() ? ' • (Unsaved Edits)' : ''}`;
  }

  const usedEl = document.getElementById("summary-pp-used");
  const totalEl = document.getElementById("summary-pp-total");
  const leftEl = document.getElementById("summary-pp-left");

  if (usedEl) usedEl.textContent = costs.totalUsed;
  if (totalEl) totalEl.textContent = costs.totalBudget;
  if (leftEl) {
    leftEl.textContent = costs.remaining;
    leftEl.className = costs.remaining < 0 ? "stat-capsule-val danger" : "stat-capsule-val success";
  }

  const hpEl = document.getElementById("summary-hp-count");
  if (hpEl) hpEl.textContent = currentCharacter.hpRemaining !== undefined ? currentCharacter.hpRemaining : 1;
  const bruiseEl = document.getElementById("summary-bruise-count");
  if (bruiseEl) bruiseEl.textContent = currentCharacter.bruises || 0;

  const badgeAbil = document.getElementById("badge-cost-abilities");
  if (badgeAbil) badgeAbil.textContent = `${costs.abilities} PP`;

  const badgeSkills = document.getElementById("badge-cost-skills");
  let totalSkillRanks = 0;
  Object.values(currentCharacter.skills || {}).forEach(r => totalSkillRanks += (Number(r) || 0));
  if (badgeSkills) badgeSkills.textContent = `${costs.skills} PP (${totalSkillRanks} ranks / 2 per PP)`;

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

// Render Background & Complications Section
function renderBackground() {
  const motSelect = document.getElementById("char-motivation-select");
  if (motSelect) {
    motSelect.value = currentCharacter.motivation || "Justice";
  }
  const motDesc = document.getElementById("char-motivation-desc");
  if (motDesc && document.activeElement !== motDesc) {
    motDesc.value = currentCharacter.motivationDesc || "";
  }

  // Render Complications list
  const compContainer = document.getElementById("complications-list-container");
  if (compContainer) {
    const list = currentCharacter.complicationsList || [];
    if (list.length === 0) {
      compContainer.innerHTML = `<div style="font-size: 12px; color: var(--text-dim); padding: 4px 0;">No complications added. Add at least two to earn Hero Points in play!</div>`;
    } else {
      compContainer.innerHTML = list.map((c, idx) => `
        <div class="complication-card">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="comp-tag">${escapeAttr(c.category)}</span>
            <span style="font-size: 13px; font-weight: 600; color: var(--text-main);">${escapeAttr(c.title)}</span>
          </div>
          <button class="btn-remove-sub" onclick="removeComplication(${idx})" title="Remove complication">&times;</button>
        </div>
      `).join("");
    }
  }

  // Bio fields
  const bio = currentCharacter.bio || {};
  const setBio = (id, val) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) el.value = val || "";
  };
  setBio("char-bio-gender", bio.gender);
  setBio("char-bio-age", bio.age);
  setBio("char-bio-height", bio.height);
  setBio("char-bio-weight", bio.weight);
  setBio("char-bio-eyes", bio.eyes);
  setBio("char-bio-hair", bio.hair);
  setBio("char-origin-desc", bio.origin);
}

function handleAddComplication() {
  const catSelect = document.getElementById("select-complication-category");
  const titleInput = document.getElementById("input-complication-title");
  if (!catSelect || !titleInput) return;

  const category = catSelect.value || "Other";
  const title = titleInput.value.trim();
  if (!title) {
    alert("Please enter a complication title or description.");
    return;
  }

  if (!currentCharacter.complicationsList) currentCharacter.complicationsList = [];
  currentCharacter.complicationsList.push({
    id: "comp_" + Date.now(),
    category,
    title
  });

  titleInput.value = "";
  saveAndRender();
}

window.removeComplication = function(index) {
  if (currentCharacter.complicationsList) {
    currentCharacter.complicationsList.splice(index, 1);
    saveAndRender();
  }
};

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

// Render Skills (Supports Repeatable Specialties: Close Combat, Ranged Combat, Expertise)
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

function handleConfirmAddSpecialtySkill() {
  const baseSelect = document.getElementById("specialty-base-select");
  const nameInput = document.getElementById("specialty-name-input");
  const rankInput = document.getElementById("specialty-rank-input");
  if (!baseSelect || !nameInput || !rankInput) return;

  const base = baseSelect.value.trim();
  const spec = nameInput.value.trim();
  const rank = parseInt(rankInput.value, 10) || 1;

  if (!spec) {
    alert("Please enter a specialty name (e.g. Swords, Pistols, Nanotech, Streetwise).");
    return;
  }

  const fullName = `${base} (${spec})`;
  currentCharacter.skills[fullName] = rank;
  nameInput.value = "";
  
  const panel = document.getElementById("specialty-skill-panel");
  if (panel) panel.style.display = "none";

  saveAndRender();
}

// Render Advantages (Supports Configurations & Ranks: Benefit, Favored Environment, Favored Foe, Second Chance, Languages)
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
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
            <a class="trait-link" onclick="showAdvantageModal('${escapeAttr(adv.name)}')">${adv.name}</a>
            <button class="trait-info-btn" onclick="showAdvantageModal('${escapeAttr(adv.name)}')">?</button>
            ${adv.option ? `<span style="font-size: 12px; font-weight: 700; color: var(--accent-secondary); background: var(--bg-tertiary); padding: 1px 6px; border-radius: 3px;">${escapeAttr(adv.option)}</span>` : ''}
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

function handleAdvantageSelectChange() {
  const select = document.getElementById("select-advantage");
  const container = document.getElementById("advantage-option-container");
  if (!select || !container) return;

  const advName = select.value;
  const advData = VALIANT_DATA.advantages[advName];

  if (advName === "Benefit") {
    container.style.display = "block";
    container.innerHTML = `
      <select id="adv-option-benefit" class="select-input" style="width: 100%;">
        <optgroup label="Wealth Ranks">
          <option value="Wealth: Well-off">Wealth: Well-off (Rank 1)</option>
          <option value="Wealth: Wealthy">Wealth: Wealthy (Rank 2)</option>
          <option value="Wealth: Rich">Wealth: Rich (Rank 3)</option>
          <option value="Wealth: Very Wealthy">Wealth: Very Wealthy (Rank 4)</option>
          <option value="Wealth: Millionaire" selected>Wealth: Millionaire (Rank 5)</option>
          <option value="Wealth: Multimillionaire">Wealth: Multimillionaire (Rank 6)</option>
          <option value="Wealth: Billionaire">Wealth: Billionaire (Rank 7)</option>
        </optgroup>
        <optgroup label="Government & Legal">
          <option value="Diplomatic Immunity">Diplomatic Immunity</option>
          <option value="Security Clearance: Confidential">Security Clearance (Confidential - Rank 1)</option>
          <option value="Security Clearance: Secret">Security Clearance (Secret - Rank 2)</option>
          <option value="Security Clearance: Top Secret / Classified">Security Clearance (Top Secret - Rank 3)</option>
          <option value="Alternate Identity">Alternate Identity</option>
          <option value="Cipher">Cipher (No Public Record)</option>
        </optgroup>
        <optgroup label="Status">
          <option value="Status: Prominent Hero">Status: Prominent Hero</option>
          <option value="Status: Corporate Executive">Status: Corporate Executive</option>
          <option value="Status: Military Officer">Status: Military Officer</option>
          <option value="Status: Government Official">Status: Government Official</option>
        </optgroup>
      </select>
    `;
  } else if (advName === "Favored Environment") {
    container.style.display = "block";
    container.innerHTML = `
      <select id="adv-option-env" class="select-input" style="width: 100%;">
        <option value="Urban / Rooftops">Urban / Rooftops</option>
        <option value="Airborne / Aerial">Airborne / Aerial</option>
        <option value="Aquatic / Underwater">Aquatic / Underwater</option>
        <option value="Zero-Gravity / Space">Zero-Gravity / Space</option>
        <option value="Underground / Tunnels">Underground / Tunnels</option>
        <option value="Arctic / Cold">Arctic / Cold</option>
        <option value="Desert / Wasteland">Desert / Wasteland</option>
      </select>
    `;
  } else if (advName === "Favored Foe") {
    container.style.display = "block";
    container.innerHTML = `
      <input type="text" id="adv-option-foe" class="input-text" placeholder="Enemy (e.g. Psiots, Spider Aliens, H.A.R.D. Corps)" style="width: 100%;">
    `;
  } else if (advName === "Second Chance") {
    container.style.display = "block";
    container.innerHTML = `
      <input type="text" id="adv-option-chance" class="input-text" placeholder="Hazard (e.g. Mind Control, Falling, Radiation)" style="width: 100%;">
    `;
  } else if (advName === "Languages") {
    container.style.display = "block";
    container.innerHTML = `
      <input type="text" id="adv-option-lang" class="input-text" placeholder="Language (e.g. Japanese, Russian, Spanish)" style="width: 100%;">
    `;
  } else {
    container.style.display = "none";
    container.innerHTML = "";
  }
}

function handleAddAdvantage() {
  const select = document.getElementById("select-advantage");
  if (!select) return;
  const name = select.value;
  if (!name) return;

  let option = "";
  if (name === "Benefit") {
    const el = document.getElementById("adv-option-benefit");
    option = el ? el.value : "Wealth: Millionaire";
  } else if (name === "Favored Environment") {
    const el = document.getElementById("adv-option-env");
    option = el ? el.value : "Urban";
  } else if (name === "Favored Foe") {
    const el = document.getElementById("adv-option-foe");
    option = el ? el.value.trim() : "Adversaries";
  } else if (name === "Second Chance") {
    const el = document.getElementById("adv-option-chance");
    option = el ? el.value.trim() : "Mind Control";
  } else if (name === "Languages") {
    const el = document.getElementById("adv-option-lang");
    option = el ? el.value.trim() : "Secondary Language";
  }

  // Check existing matching advantage (same name AND same option)
  const existing = currentCharacter.advantages.find(a => a.name === name && (a.option || "") === option);
  const maxRanks = VALIANT_DATA.advantages[name]?.ranks || 1;

  if (existing) {
    if ((existing.rank || 1) < maxRanks) {
      existing.rank = (existing.rank || 1) + 1;
    } else {
      alert(`${name}${option ? ' (' + option + ')' : ''} is already at maximum ranks (${maxRanks}).`);
      return;
    }
  } else {
    currentCharacter.advantages.push({ name, rank: 1, option });
  }

  saveAndRender();
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
// POWER STUDIO & MODIFIERS LOGIC (LEGAL FILTERING & NEUTRALIZING PAIRS)
// =====================================================================
function handlePowerEffectChange() {
  const effectSelect = document.getElementById("power-input-effect");
  if (!effectSelect) return;
  const effectKey = effectSelect.value;

  // Clear existing modifiers on effect change
  selectedPowerModifiers = [];
  renderActivePowerModifiers();
  populateLegalModifiers(effectKey);
  renderEffectOptions(effectKey);
  updatePowerCostPreview();
}

function populateLegalModifiers(effectKey) {
  const effect = VALIANT_DATA.powerEffects[effectKey] || {};
  const extraSelect = document.getElementById("power-select-extra");
  const flawSelect = document.getElementById("power-select-flaw");
  if (!extraSelect || !flawSelect) return;

  const appliedNames = new Set(selectedPowerModifiers.map(m => m.name));

  // Determine neutralizing opposites:
  const prohibitedByNeutralizing = new Set();
  (VALIANT_DATA.modifiers.neutralizingPairs || []).forEach(([a, b]) => {
    if (appliedNames.has(a)) prohibitedByNeutralizing.add(b);
    if (appliedNames.has(b)) prohibitedByNeutralizing.add(a);
  });

  // Filter Extras:
  const legalExtras = (VALIANT_DATA.modifiers.extras || []).filter(ex => {
    if (appliedNames.has(ex.name)) return false;
    if (prohibitedByNeutralizing.has(ex.name)) return false;

    // Range / Action constraints:
    if (effect.range === "Personal") {
      if (ex.name === "Increased Range" || ex.name === "Area" || ex.name === "Selective") return false;
    }
    if (effect.range === "Perception" && ex.name === "Increased Range") return false;

    // Legal according to effect specifications or universal:
    if (effect.legalExtras && effect.legalExtras.length > 0) {
      if (effect.legalExtras.includes(ex.name)) return true;
    }
    return ex.isUniversal !== false;
  });

  // Filter Flaws:
  const legalFlaws = (VALIANT_DATA.modifiers.flaws || []).filter(fl => {
    if (appliedNames.has(fl.name)) return false;
    if (prohibitedByNeutralizing.has(fl.name)) return false;

    // Range / Action constraints:
    if (effect.range === "Close" && (fl.name === "Reduced Range" || fl.name === "Diminished Range")) return false;
    if (effect.range === "Personal" && (fl.name === "Reduced Range" || fl.name === "Diminished Range")) return false;

    if (effect.legalFlaws && effect.legalFlaws.length > 0) {
      if (effect.legalFlaws.includes(fl.name)) return true;
    }
    return fl.isUniversal !== false;
  });

  extraSelect.innerHTML = legalExtras.map(ex => 
    `<option value="${ex.name}">${ex.name} (+${ex.costPerRank}${ex.isFlat ? ' flat' : '/r'})</option>`
  ).join("");

  flawSelect.innerHTML = legalFlaws.map(fl => 
    `<option value="${fl.name}">${fl.name} (${fl.costPerRank}${fl.isFlat ? ' flat' : '/r'})</option>`
  ).join("");
}

function handleAddModifier(type) {
  const effectSelect = document.getElementById("power-input-effect");
  const effectKey = effectSelect?.value;
  const selectId = type === "extra" ? "power-select-extra" : "power-select-flaw";
  const select = document.getElementById(selectId);
  if (!select) return;

  const modName = select.value;
  if (!modName) return;

  const list = type === "extra" ? VALIANT_DATA.modifiers.extras : VALIANT_DATA.modifiers.flaws;
  const modData = list.find(m => m.name === modName);
  if (!modData) return;

  selectedPowerModifiers.push({
    name: modData.name,
    type: type,
    costPerRank: modData.costPerRank,
    isFlat: modData.isFlat,
    description: modData.description
  });

  renderActivePowerModifiers();
  populateLegalModifiers(effectKey);
  updatePowerCostPreview();
}

function renderActivePowerModifiers() {
  const container = document.getElementById("power-active-modifiers-list");
  if (!container) return;

  if (selectedPowerModifiers.length === 0) {
    container.innerHTML = `<span style="font-size: 12px; color: var(--text-dim); padding: 4px 0;">No modifiers applied. Select an Extra or Flaw above and click "+ Add".</span>`;
    return;
  }

  container.innerHTML = selectedPowerModifiers.map((mod, idx) => `
    <span class="active-mod-pill ${mod.type}">
      <span>${mod.type === 'extra' ? '+' : '-'} ${escapeAttr(mod.name)} (${mod.costPerRank > 0 ? '+' : ''}${mod.costPerRank}${mod.isFlat ? ' flat' : '/r'})</span>
      <button type="button" class="btn-remove-mod" onclick="removePowerModifier(${idx})" title="Remove modifier">&times;</button>
    </span>
  `).join("");
}

window.removePowerModifier = function(index) {
  const effectSelect = document.getElementById("power-input-effect");
  const effectKey = effectSelect?.value;

  selectedPowerModifiers.splice(index, 1);
  renderActivePowerModifiers();
  populateLegalModifiers(effectKey);
  updatePowerCostPreview();
};

// Power Effect Options Container (Enhanced Trait, Immortality, Immunity, Senses, Morph, Movement, etc.)
function renderEffectOptions(effectKey) {
  const container = document.getElementById("power-effect-options-container");
  if (!container) return;

  if (effectKey === "Enhanced Trait") {
    container.style.display = "flex";
    container.innerHTML = `
      <div class="power-options-title">⚡ Enhanced Trait Configuration</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div class="field-group">
          <label style="font-size: 11px;">Trait Category</label>
          <select id="enhanced-trait-type" class="select-input" onchange="updateEnhancedTraitTargets()">
            <option value="Ability">Ability (2 PP / rank)</option>
            <option value="Defense">Defense (1 PP / rank)</option>
            <option value="Skill">Skill (0.5 PP / rank)</option>
            <option value="Advantage">Advantage (1 PP / rank)</option>
          </select>
        </div>
        <div class="field-group">
          <label style="font-size: 11px;">Target Trait</label>
          <select id="enhanced-trait-target" class="select-input" onchange="updateEnhancedTraitName()"></select>
        </div>
      </div>
    `;
    updateEnhancedTraitTargets();
  } else if (effectKey === "Immortality") {
    container.style.display = "flex";
    const ranks = parseInt(document.getElementById("power-input-ranks")?.value || "1", 10);
    const timeTable = {
      1: "30 days", 2: "14 days", 3: "7 days", 4: "4 days", 5: "2 days",
      6: "1 day (24 hours)", 7: "16 hours", 8: "12 hours", 9: "6 hours", 10: "2 hours",
      11: "1 hour", 12: "30 minutes", 13: "15 minutes", 14: "6 minutes", 15: "3 minutes",
      16: "1 minute (10 rounds)", 17: "30 seconds (5 rounds)", 18: "12 seconds (2 rounds)",
      19: "1 round", 20: "end of the same round"
    };
    const recTime = timeTable[Math.min(20, Math.max(1, ranks))] || "end of round";

    container.innerHTML = `
      <div class="power-options-title">⏳ Immortality Recovery Time</div>
      <div style="font-size: 12.5px; color: var(--text-main); line-height: 1.4;">
        Current Rank <strong>${ranks}</strong>: Returns to life after <strong style="color: var(--accent-secondary);">${recTime}</strong>.
      </div>
      <div style="font-size: 11px; color: var(--text-muted);">
        (Rank 1: 30 days &bull; Rank 5: 2 days &bull; Rank 10: 2 hours &bull; Rank 15: 3 minutes &bull; Rank 19: 1 round &bull; Rank 20: end of round)
      </div>
    `;
  } else if (effectKey === "Immunity") {
    container.style.display = "flex";
    container.innerHTML = `
      <div class="power-options-title">🛡️ Immunity Scope Presets</div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <select id="immunity-preset-select" class="select-input" style="flex: 1;" onchange="applyImmunityPreset()">
          <option value="">-- Choose Common Immunity Preset --</option>
          <option value="Aging:1">Aging (1 Rank - 1 PP)</option>
          <option value="Disease:1">Disease (1 Rank - 1 PP)</option>
          <option value="Poison:1">Poison (1 Rank - 1 PP)</option>
          <option value="Suffocation:2">Suffocation (2 Ranks - 2 PP)</option>
          <option value="Critical Hits:2">Critical Hits (2 Ranks - 2 PP)</option>
          <option value="Environmental Heat:2">Environmental Heat (2 Ranks - 2 PP)</option>
          <option value="Environmental Cold:2">Environmental Cold (2 Ranks - 2 PP)</option>
          <option value="Radiation:2">Radiation (2 Ranks - 2 PP)</option>
          <option value="All Environmental Conditions:5">All Environmental Conditions (5 Ranks - 5 PP)</option>
          <option value="Life Support:10">Full Life Support (10 Ranks - 10 PP)</option>
          <option value="Toughness Effects:80">All Toughness Effects (80 Ranks - 80 PP)</option>
        </select>
      </div>
    `;
  } else if (effectKey === "Senses") {
    container.style.display = "flex";
    container.innerHTML = `
      <div class="power-options-title">👁️ Senses Types &amp; Enhancements</div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <select id="senses-preset-select" class="select-input" style="flex: 1;" onchange="applySensesPreset()">
          <option value="">-- Append Sensory Type to Descriptors --</option>
          <option value="Darkvision (2 ranks)">Darkvision (2 ranks)</option>
          <option value="Low-Light Vision (1 rank)">Low-Light Vision (1 rank)</option>
          <option value="Infravision (1 rank)">Infravision (1 rank)</option>
          <option value="Ultravision (1 rank)">Ultravision (1 rank)</option>
          <option value="Radio (1 rank)">Radio Communication Sense (1 rank)</option>
          <option value="Distance Sense (1 rank)">Distance Sense (1 rank)</option>
          <option value="Time Sense (1 rank)">Time Sense (1 rank)</option>
          <option value="Tracking (1 rank)">Tracking (1 rank)</option>
          <option value="Counters Concealment (Visual - 2 ranks)">Counters Visual Concealment (2 ranks)</option>
          <option value="Counters Illusion (Visual - 2 ranks)">Counters Visual Illusion (2 ranks)</option>
          <option value="Penetrates Concealment (Visual - 4 ranks)">Penetrates Concealment (X-Ray - 4 ranks)</option>
        </select>
      </div>
    `;
  } else if (effectKey === "Morph") {
    container.style.display = "flex";
    container.innerHTML = `
      <div class="power-options-title">🎭 Morph Form Magnitude</div>
      <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
        Rank 1: Single humanoid form (5 PP) &bull; Rank 2: Narrow group of forms (10 PP) &bull; Rank 3: Broad group of forms (15 PP) &bull; Rank 4: Any form (20 PP)
      </div>
    `;
  } else if (effectKey === "Movement") {
    container.style.display = "flex";
    container.innerHTML = `
      <div class="power-options-title">🚀 Movement Modes (2 PP per rank)</div>
      <div style="font-size: 12px; color: var(--text-muted);">
        Options: Wall-Crawling, Water-Walking, Dimensional Travel, Space Travel, Environmental Adaptation, Permeate, Slithering, Swinging, Trackless.
      </div>
    `;
  } else {
    container.style.display = "none";
    container.innerHTML = "";
  }
}

window.updateEnhancedTraitTargets = function() {
  const typeSelect = document.getElementById("enhanced-trait-type");
  const targetSelect = document.getElementById("enhanced-trait-target");
  if (!typeSelect || !targetSelect) return;

  const cat = typeSelect.value;
  if (cat === "Ability") {
    targetSelect.innerHTML = Object.keys(VALIANT_DATA.abilities).map(a => `<option value="${a}">${a} (${VALIANT_DATA.abilities[a].name})</option>`).join("");
  } else if (cat === "Defense") {
    targetSelect.innerHTML = Object.keys(VALIANT_DATA.defenses).map(d => `<option value="${d}">${d} Defense</option>`).join("");
  } else if (cat === "Skill") {
    targetSelect.innerHTML = Object.keys(VALIANT_DATA.skills).sort().map(s => `<option value="${s}">${s}</option>`).join("");
  } else if (cat === "Advantage") {
    targetSelect.innerHTML = Object.keys(VALIANT_DATA.advantages).sort().map(adv => `<option value="${adv}">${adv}</option>`).join("");
  }
  updateEnhancedTraitName();
};

window.updateEnhancedTraitName = function() {
  const typeSelect = document.getElementById("enhanced-trait-type");
  const targetSelect = document.getElementById("enhanced-trait-target");
  const nameInput = document.getElementById("power-input-name");
  if (nameInput && targetSelect && typeSelect) {
    if (!nameInput.value || nameInput.value.startsWith("Enhanced ")) {
      nameInput.value = `Enhanced ${targetSelect.value}`;
    }
  }
  updatePowerCostPreview();
};

window.applyImmunityPreset = function() {
  const sel = document.getElementById("immunity-preset-select");
  if (!sel || !sel.value) return;
  const [desc, rankStr] = sel.value.split(":");
  const ranksInput = document.getElementById("power-input-ranks");
  const nameInput = document.getElementById("power-input-name");
  const descInput = document.getElementById("power-input-desc");

  if (ranksInput) ranksInput.value = rankStr;
  if (nameInput && (!nameInput.value || nameInput.value.startsWith("Immunity"))) {
    nameInput.value = `Immunity: ${desc}`;
  }
  if (descInput) {
    descInput.value = `Immunity to ${desc}.`;
  }
  updatePowerCostPreview();
};

window.applySensesPreset = function() {
  const sel = document.getElementById("senses-preset-select");
  if (!sel || !sel.value) return;
  const descInput = document.getElementById("power-input-desc");
  if (descInput) {
    const existing = descInput.value.trim();
    descInput.value = existing ? `${existing}, ${sel.value}` : sel.value;
  }
};

function updatePowerCostPreview() {
  const effectSelect = document.getElementById("power-input-effect");
  const ranksInput = document.getElementById("power-input-ranks");
  const preview = document.getElementById("power-calculated-cost-preview");
  if (!effectSelect || !ranksInput || !preview) return;

  const effectKey = effectSelect.value;
  const effectData = VALIANT_DATA.powerEffects[effectKey] || { baseCost: 1 };
  const ranks = parseInt(ranksInput.value, 10) || 1;

  let baseCostPerRank = effectData.baseCost;
  if (effectKey === "Enhanced Trait") {
    const traitType = document.getElementById("enhanced-trait-type")?.value || "Ability";
    if (traitType === "Ability") baseCostPerRank = 2;
    else if (traitType === "Defense") baseCostPerRank = 1;
    else if (traitType === "Skill") baseCostPerRank = 0.5;
    else if (traitType === "Advantage") baseCostPerRank = 1;
  }

  // Update Immortality preview dynamically if applicable
  if (effectKey === "Immortality") {
    renderEffectOptions(effectKey);
  }

  let costPerRank = baseCostPerRank;
  let flatExtra = 0;

  selectedPowerModifiers.forEach(mod => {
    if (mod.isFlat) {
      flatExtra += mod.costPerRank;
    } else {
      costPerRank += mod.costPerRank;
    }
  });

  let totalCost = 0;
  if (costPerRank >= 1) {
    totalCost = Math.round(costPerRank * ranks) + flatExtra;
  } else {
    // Fractional PP per rank (1 PP per (2 - costPerRank) ranks)
    const ranksPerPP = Math.max(2, Math.round(2 - costPerRank));
    totalCost = Math.ceil(ranks / ranksPerPP) + flatExtra;
  }
  totalCost = Math.max(1, totalCost);

  preview.textContent = `Estimated Cost: ${totalCost} PP (${costPerRank} PP/r × ${ranks} ranks${flatExtra ? ' + ' + flatExtra + ' flat' : ''})`;
  return totalCost;
}

function handleSavePower() {
  const nameInput = document.getElementById("power-input-name");
  const effectSelect = document.getElementById("power-input-effect");
  const ranksInput = document.getElementById("power-input-ranks");
  const descInput = document.getElementById("power-input-desc");

  const effect = effectSelect.value;
  const ranks = parseInt(ranksInput.value, 10) || 1;
  const name = nameInput.value.trim() || `${effect} Power`;
  const details = descInput.value.trim();
  const cost = updatePowerCostPreview();

  const extras = [];
  const flaws = [];
  selectedPowerModifiers.forEach(m => {
    if (m.type === "extra") extras.push(m.name);
    else flaws.push(m.name);
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
  selectedPowerModifiers = [];
  renderActivePowerModifiers();
  populateLegalModifiers(effect);
  saveAndRender();
}

function removePower(index) {
  currentCharacter.powers.splice(index, 1);
  saveAndRender();
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

function handleIncrementEquipmentAdv() {
  const existing = currentCharacter.advantages.find(a => a.name === "Equipment");
  if (existing) {
    existing.rank = (existing.rank || 1) + 1;
  } else {
    currentCharacter.advantages.push({ name: "Equipment", rank: 1 });
  }
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
  const nameEl = document.getElementById("delete-char-name");
  if (nameEl) {
    nameEl.textContent = currentCharacter.name || currentCharacter.fileName || "New Character";
  }
  openModal("modal-delete");
}

function autoSaveToSlot(fileName) {
  try {
    const key = `valiant_char_${fileName}`;
    const payload = JSON.stringify({
      character: currentCharacter,
      timestamp: Date.now()
    });
    localStorage.setItem(key, payload);
  } catch (e) {
    console.error("Local storage auto-save error:", e);
  }
}

function renderSavedSlots() {
  const container = document.getElementById("saved-slots-list");
  if (!container) return;

  const slots = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("valiant_char_")) {
      try {
        const val = JSON.parse(localStorage.getItem(k));
        slots.push({ key: k, data: val });
      } catch (e) {}
    }
  }

  if (slots.length === 0) {
    container.innerHTML = `<div style="font-size: 13px; color: var(--text-dim); padding: 8px;">No saved characters in browser storage.</div>`;
    return;
  }

  container.innerHTML = slots.map(slot => {
    const char = slot.data.character;
    const dateStr = new Date(slot.data.timestamp).toLocaleString();
    return `
      <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <strong style="color: var(--text-main); font-size: 14px;">${char.name || char.fileName || 'Unnamed'}</strong>
          <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">(PL ${char.pl || 10} &bull; ${char.concept || 'Custom'})</span>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">Saved: ${dateStr}</div>
        </div>
        <button class="btn-header primary" style="font-size: 12px; padding: 4px 10px;" onclick="loadCharacterFromStorage('${slot.key}')">Load</button>
      </div>
    `;
  }).join("");
}

window.loadCharacterFromStorage = function(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    checkUnsavedBeforeAction(() => {
      currentCharacter = parsed.character;
      savedSnapshot = JSON.stringify(currentCharacter);
      saveAndRender();
      closeModal("modal-load");
      alert(`Loaded "${currentCharacter.name || currentCharacter.fileName}" successfully!`);
    });
  } catch (e) {
    alert("Failed to load character: " + e.message);
  }
};

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      checkUnsavedBeforeAction(() => {
        currentCharacter = data;
        currentCharacter.fileName = file.name;
        savedSnapshot = JSON.stringify(currentCharacter);
        saveAndRender();
        closeModal("modal-load");
        alert(`Loaded "${file.name}" successfully!`);
      });
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// =====================================================================
// OFFICIAL VALIANT ARCHETYPES & TEMPLATES
// =====================================================================
function openArchetypesModal() {
  const grid = document.getElementById("archetypes-full-grid");
  if (grid) {
    grid.innerHTML = VALIANT_DATA.archetypes.map((arch, idx) => `
      <div style="background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="color: var(--accent-secondary); font-size: 16px;">${arch.name}</strong>
            <span style="font-size: 11px; font-weight: 700; background: var(--accent-glow); color: var(--accent-secondary); padding: 2px 6px; border-radius: 3px;">PL ${arch.pl} (150 PP)</span>
          </div>
          <p style="font-size: 12.5px; color: var(--text-main); line-height: 1.4; margin-bottom: 8px;">${arch.concept}</p>
          <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4;">
            <strong>Abilities:</strong> STR ${arch.abilities.STR}, STA ${arch.abilities.STA}, AGL ${arch.abilities.AGL}, DEX ${arch.abilities.DEX}, FGT ${arch.abilities.FGT}, INT ${arch.abilities.INT}, AWE ${arch.abilities.AWE}, PRE ${arch.abilities.PRE}
          </div>
        </div>
        <button class="btn-header primary" style="margin-top: 12px; width: 100%; justify-content: center;" onclick="loadArchetype(${idx})">
          Load This Archetype
        </button>
      </div>
    `).join("");
  }
  openModal("modal-archetypes");
}

window.loadArchetype = function(index) {
  const arch = VALIANT_DATA.archetypes[index];
  if (!arch) return;

  checkUnsavedBeforeAction(() => {
    currentCharacter = {
      id: "arch_" + Date.now(),
      name: arch.name,
      fileName: `${arch.name}.valadv`,
      realName: "Unknown Operative",
      pl: arch.pl || 10,
      identity: "Secret",
      concept: arch.concept,
      motivation: "Justice",
      motivationDesc: "Dedicated to the defense of humanity and the Valiant Universe.",
      complicationsList: [
        { id: "comp_1", category: "Adversaries", title: "Rival Syndicate & Secret Ops" },
        { id: "comp_2", category: "Responsibility", title: "Heroic Duty & Burden of Power" }
      ],
      bio: {
        gender: "Classified",
        age: "Classified",
        height: "6'0\"",
        weight: "195 lbs",
        eyes: "Brown",
        hair: "Dark",
        origin: arch.concept
      },
      abilities: JSON.parse(JSON.stringify(arch.abilities)),
      defenses: JSON.parse(JSON.stringify(arch.defenses)),
      skills: JSON.parse(JSON.stringify(arch.skills)),
      advantages: JSON.parse(JSON.stringify(arch.advantages)),
      powers: JSON.parse(JSON.stringify(arch.powers)),
      gear: JSON.parse(JSON.stringify(arch.gear || [])),
      hpRemaining: 1,
      bruises: 0
    };
    savedSnapshot = JSON.stringify(currentCharacter);
    saveAndRender();
    closeModal("modal-archetypes");
    closeModal("modal-load");
    alert(`Loaded archetype template: ${arch.name}!`);
  });
};

// =====================================================================
// TRAIT MODAL DISPLAY FUNCTIONS (VERBATIM RULEBOOK MECHANICS)
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
    <p style="margin-bottom: 8px; line-height: 1.5;">${description}</p>
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
    showTraitModal(skillName, `Skill (Governed by ${data.ability})`, `0.5 PP / rank (1 PP per 2 ranks)`, data.description);
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

window.showModifierModal = function(name, type) {
  const list = type === "extra" ? VALIANT_DATA.modifiers.extras : VALIANT_DATA.modifiers.flaws;
  const mod = list.find(m => m.name === name);
  if (mod) {
    showTraitModal(
      `${type === 'extra' ? 'Extra' : 'Flaw'}: ${mod.name}`,
      `Power Modifier (${type.toUpperCase()})`,
      `${mod.costPerRank > 0 ? '+' : ''}${mod.costPerRank} ${mod.isFlat ? 'flat' : 'PP / rank'}`,
      mod.description
    );
  }
};

// =====================================================================
// POPULATE DROPDOWNS
// =====================================================================
function populateDropdowns() {
  // Motivation dropdown
  const motSelect = document.getElementById("char-motivation-select");
  if (motSelect && VALIANT_DATA.backgroundPresets?.motivations) {
    motSelect.innerHTML = Object.keys(VALIANT_DATA.backgroundPresets.motivations).map(m => 
      `<option value="${m}">${m}</option>`
    ).join("");
  }

  // Complication categories dropdown
  const compCatSelect = document.getElementById("select-complication-category");
  if (compCatSelect && VALIANT_DATA.backgroundPresets?.complicationCategories) {
    compCatSelect.innerHTML = VALIANT_DATA.backgroundPresets.complicationCategories.map(c => 
      `<option value="${c}">${c}</option>`
    ).join("");
  }

  // Advantages dropdown
  const advSelect = document.getElementById("select-advantage");
  if (advSelect) {
    advSelect.innerHTML = Object.keys(VALIANT_DATA.advantages).sort().map(advName => {
      const adv = VALIANT_DATA.advantages[advName];
      return `<option value="${advName}">${advName} (${adv.category})</option>`;
    }).join("");
    handleAdvantageSelectChange();
  }

  // Power Effects dropdown
  const effectSelect = document.getElementById("power-input-effect");
  if (effectSelect) {
    effectSelect.innerHTML = Object.keys(VALIANT_DATA.powerEffects).sort().map(name => {
      const eff = VALIANT_DATA.powerEffects[name];
      return `<option value="${name}">${name} (${eff.baseCost} PP/rank)</option>`;
    }).join("");
    handlePowerEffectChange();
  }

  // Gear dropdown
  const gearSelect = document.getElementById("select-gear-catalog");
  if (gearSelect) {
    gearSelect.innerHTML = VALIANT_DATA.gearCatalog.map((item, idx) => {
      return `<option value="${idx}">${item.name} (${item.category} - ${item.costEP} EP)</option>`;
    }).join("");
  }
}

// =====================================================================
// TABLES & REFERENCE TAB RENDERING
// =====================================================================
function renderTablesAndReference() {
  const measBody = document.getElementById("measurements-table-body");
  if (measBody && VALIANT_DATA.tables?.measurements) {
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

  updateRankCalculator();

  const plBody = document.getElementById("pl-limits-table-body");
  if (plBody && VALIANT_DATA.tables?.plLimits) {
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

  const manBody = document.getElementById("combat-maneuvers-table-body");
  if (manBody && VALIANT_DATA.tables?.combatManeuvers) {
    manBody.innerHTML = VALIANT_DATA.tables.combatManeuvers.map(cm => `
      <tr>
        <td><strong>${cm.maneuver}</strong></td>
        <td><span style="font-size: 11px; padding: 2px 6px; border-radius: 3px; background: var(--bg-tertiary);">${cm.action}</span></td>
        <td>${cm.modifier}</td>
      </tr>
    `).join("");
  }

  const circBody = document.getElementById("circumstances-table-body");
  if (circBody && VALIANT_DATA.tables?.circumstances) {
    circBody.innerHTML = VALIANT_DATA.tables.circumstances.map(c => `
      <tr>
        <td><strong>${c.circumstance}</strong></td>
        <td>${c.effect}</td>
      </tr>
    `).join("");
  }

  const dmgBody = document.getElementById("damage-track-table-body");
  if (dmgBody && VALIANT_DATA.tables?.damageTrack) {
    dmgBody.innerHTML = VALIANT_DATA.tables.damageTrack.map(d => `
      <tr>
        <td><strong>${d.condition}</strong></td>
        <td>${d.trigger}</td>
        <td>${d.effect}</td>
      </tr>
    `).join("");
  }

  const benchBody = document.getElementById("benchmarks-table-body");
  if (benchBody && VALIANT_DATA.tables?.benchmarks) {
    benchBody.innerHTML = VALIANT_DATA.tables.benchmarks.map(b => `
      <tr>
        <td><strong>DC ${b.dc}</strong></td>
        <td><span style="font-weight: 600; color: var(--accent-secondary);">${b.difficulty}</span></td>
        <td>${b.example}</td>
      </tr>
    `).join("");
  }

  const matBody = document.getElementById("materials-table-body");
  if (matBody && VALIANT_DATA.tables?.materialToughness) {
    matBody.innerHTML = VALIANT_DATA.tables.materialToughness.map(mt => `
      <tr>
        <td><strong>${mt.material}</strong></td>
        <td><span style="font-weight: 700; color: var(--accent-secondary);">Toughness ${mt.toughness}</span></td>
        <td style="font-size: 12px; color: var(--text-muted);">${mt.examples}</td>
      </tr>
    `).join("");
  }

  const attBody = document.getElementById("attitudes-table-body");
  if (attBody && VALIANT_DATA.tables?.interactionAttitudes) {
    attBody.innerHTML = VALIANT_DATA.tables.interactionAttitudes.map(a => `
      <tr>
        <td><strong>${a.attitude}</strong></td>
        <td><span style="font-weight: 700; color: var(--accent-secondary);">${a.dcAdjustment}</span></td>
        <td style="font-size: 12px; color: var(--text-muted);">${a.description}</td>
      </tr>
    `).join("");
  }

  const archHelp = document.getElementById("archetypes-quick-load-list");
  const archModal = document.getElementById("archetype-modal-list");

  const archMarkup = (VALIANT_DATA.archetypes || []).map((arch, idx) => `
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

  const found = (VALIANT_DATA.tables?.measurements || []).find(m => m.rank === rank);
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
