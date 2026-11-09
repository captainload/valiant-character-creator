// Valiant Adventures RPG - Character Creator Core Application Logic
// Built for Valiant Adventures Hero's Handbook (Mutants & Masterminds 3E Engine)

// Global State
let currentCharacter = null;
let savedSnapshot = "";
let pendingProceedAction = null;
let selectedPowerModifiers = []; // [{ name, type, costPerRank, isFlat, description }]

// Application Release Version & Build Information
const CURRENT_APP_VERSION = {
    version: "1.3.0",
    build: "20261109.0130",
  releaseDate: "2026-11-09"
};

let autoUpdateTimerId = null;


window.stepNumberInput = function(inputId, delta, min = null, max = null) {
  const input = document.getElementById(inputId);
  if (!input) return;
  let val = parseInt(input.value || "0", 10) || 0;
  val += delta;
  if (min !== null && val < min) val = min;
  if (max !== null && val > max) val = max;
  input.value = val;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

// Session Tab & Dice Roller State (v1.2.0)
let lastRollOutput = "";
let lastRollIsCritical = false;
let lastRollCritType = null;
let isTypingDiceInput = false;
let rollHistory = []; // Array of up to 10 previous rolls { text, isCritical, critType }

// User Application Settings (Theme, Font Scale, Default PL, Layout Mode)
let appSettings = {
  theme: "default",
  fontScale: "standard",
  charFolder: "Characters",
  defaultPL: 10,
  layoutMode: "auto", // 'auto', 'normal', 'narrow'
  autoCheckUpdates: true, // Auto check updates every 30 minutes
  lastCheckedUpdates: null
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

  // Setup auto-update background timer (every 30 minutes if enabled)
  setupAutoUpdateTimer();
  if (appSettings.autoCheckUpdates !== false) {
    setTimeout(() => {
      checkForUpdates({ isManual: false });
    }, 4000);
  }

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
    contacts: "",
    complicationsList: [],
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
    damage: 0,
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

  // Update auto-update checkbox and last checked label
  const autoUpdateCheckbox = document.getElementById("setting-auto-check-updates");
  if (autoUpdateCheckbox) {
    autoUpdateCheckbox.checked = appSettings.autoCheckUpdates !== false;
  }
  const lastCheckedEl = document.getElementById("update-last-checked");
  if (lastCheckedEl && appSettings.lastCheckedUpdates) {
    try {
      const d = new Date(appSettings.lastCheckedUpdates);
      const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      lastCheckedEl.textContent = "Last checked: " + d.toLocaleDateString() + " at " + timeStr;
    } catch (e) {}
  }
  const curVerEl = document.getElementById("settings-current-version");
  if (curVerEl) curVerEl.textContent = "Version " + CURRENT_APP_VERSION.version;

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

  const autoUpdateCheckbox = document.getElementById("setting-auto-check-updates");
  appSettings.autoCheckUpdates = autoUpdateCheckbox ? autoUpdateCheckbox.checked : true;
  setupAutoUpdateTimer();

  // Save Discord Server inputs from modal
  const serverEls = document.querySelectorAll(".discord-server-item");
  if (serverEls && serverEls.length > 0) {
    const servers = getDiscordServers();
    serverEls.forEach((el, idx) => {
      const nameInp = el.querySelector(".discord-server-name-input");
      const urlInp = el.querySelector(".discord-server-url-input");
      const echoCb = el.querySelector(".discord-server-echo-checkbox");
      if (servers[idx]) {
        if (nameInp) servers[idx].name = nameInp.value.trim() || servers[idx].name;
        if (urlInp) servers[idx].webhookUrl = urlInp.value.trim();
        if (echoCb) servers[idx].echoFading = echoCb.checked;
      }
    });
    saveDiscordServers(servers);
  }

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

// =====================================================================
// APPLICATION UPDATES CHECKER & 30-MINUTE BACKGROUND TIMER
// =====================================================================
function setupAutoUpdateTimer() {
  if (autoUpdateTimerId) {
    clearInterval(autoUpdateTimerId);
    autoUpdateTimerId = null;
  }

  if (appSettings.autoCheckUpdates !== false) {
    // 30 minutes in milliseconds (30 * 60 * 1000)
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;
    autoUpdateTimerId = setInterval(() => {
      checkForUpdates({ isManual: false });
    }, THIRTY_MINUTES_MS);
  }
}

function isNewerVersion(remote, local) {
  if (!remote || !local) return false;

  if (remote.version && local.version) {
    const rParts = String(remote.version).replace(/^v/i, '').split(".").map(n => parseInt(n, 10) || 0);
    const lParts = String(local.version).replace(/^v/i, '').split(".").map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
      const r = rParts[i] || 0;
      const l = lParts[i] || 0;
      if (r > l) return true;
      if (r < l) return false;
    }
  }

  // Compare build timestamp if versions are identical
  if (remote.build && local.build) {
    if (String(remote.build) > String(local.build)) {
      return true;
    }
  }

  return false;
}

async function checkForUpdates({ isManual = false } = {}) {
  const statusIndicator = document.getElementById("update-status-indicator");
  const statusText = document.getElementById("update-status-text");
  const detailsBox = document.getElementById("update-details-box");
  const detailsMsg = document.getElementById("update-details-msg");
  const checkBtn = document.getElementById("btn-check-updates");
  const lastCheckedEl = document.getElementById("update-last-checked");

  if (isManual) {
    if (statusText) statusText.textContent = "Checking for updates...";
    if (statusIndicator) statusIndicator.style.backgroundColor = "var(--accent-warning, #f59e0b)";
    if (checkBtn) {
      checkBtn.disabled = true;
      const icon = checkBtn.querySelector(".update-refresh-icon");
      if (icon) icon.classList.add("spin");
    }
  }

  let updateFound = false;
  let remoteInfo = null;

  try {
    const res = await fetch(`version.json?_t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && isNewerVersion(data, CURRENT_APP_VERSION)) {
        updateFound = true;
        remoteInfo = data;
      }
    } else {
      console.warn("version.json fetch returned status:", res.status);
    }
  } catch (err) {
    console.warn("Could not check version.json:", err);
  }

  const now = new Date();
  appSettings.lastCheckedUpdates = now.toISOString();
  localStorage.setItem("valiant_settings", JSON.stringify(appSettings));

  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (lastCheckedEl) {
    lastCheckedEl.textContent = `Last checked: Today at ${timeString}`;
  }

  if (checkBtn) {
    checkBtn.disabled = false;
    const icon = checkBtn.querySelector(".update-refresh-icon");
    if (icon) icon.classList.remove("spin");
  }

  if (updateFound && remoteInfo) {
    if (statusIndicator) statusIndicator.style.backgroundColor = "var(--color-primary, #dc2626)";
    if (statusText) statusText.textContent = `Update available: v${remoteInfo.version || "New"}`;
    if (detailsBox && detailsMsg) {
      detailsBox.style.display = "block";
      detailsMsg.innerHTML = `<strong>A newer version (v${remoteInfo.version || ''}) is available!</strong><br><span style="font-size: 11px; color: var(--text-muted);">${remoteInfo.notes || ''}</span>`;
    }

    const banner = document.getElementById("app-update-notification-banner");
    const bannerVer = document.getElementById("banner-update-version");
    if (banner) {
      if (bannerVer) {
        bannerVer.textContent = remoteInfo.version ? `v${remoteInfo.version}` : "New";
      }
      banner.style.display = "flex";
    }
  } else {
    if (statusIndicator) statusIndicator.style.backgroundColor = "var(--accent-success, #22c55e)";
    if (statusText) statusText.textContent = `Up to date (v${CURRENT_APP_VERSION.version})`;
    if (detailsBox) detailsBox.style.display = "none";
  }

  return { updateFound, remoteInfo };
}

function applyApplicationUpdate() {
  checkUnsavedBeforeAction(() => {
    window.location.reload(true);
  });
}

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
      if (target === "tab-session") {
        renderSessionTab();
      }
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
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !charDropdown.classList.contains("open") && !charDropdown.classList.contains("show");
      if (willOpen) {
        charDropdown.classList.add("open");
        charDropdown.classList.add("show");
      } else {
        charDropdown.classList.remove("open");
        charDropdown.classList.remove("show");
      }
      btnCharMenu.setAttribute("aria-expanded", willOpen);
    });

    document.addEventListener("click", (e) => {
      if (!btnCharMenu.contains(e.target) && !charDropdown.contains(e.target)) {
        charDropdown.classList.remove("open");
        charDropdown.classList.remove("show");
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
    charDropdown?.classList.remove("open"); charDropdown?.classList.remove("show");
    checkUnsavedBeforeAction(() => handleNewCharacter(false));
  });

  document.getElementById("menu-archetypes")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open"); charDropdown?.classList.remove("show");
    openArchetypesModal();
  });

  document.getElementById("menu-load-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open"); charDropdown?.classList.remove("show");
    openModal("modal-load");
    renderSavedSlots();
  });

  document.getElementById("menu-save-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open"); charDropdown?.classList.remove("show");
    handleSaveCharacter();
  });

  document.getElementById("menu-rename-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open"); charDropdown?.classList.remove("show");
    handleOpenRename();
  });

  document.getElementById("menu-export-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open"); charDropdown?.classList.remove("show");
    openModal("modal-export");
  });

  document.getElementById("menu-delete-char")?.addEventListener("click", () => {
    charDropdown?.classList.remove("open"); charDropdown?.classList.remove("show");
    handleOpenDelete();
  });

  // Settings
  document.getElementById("btn-settings")?.addEventListener("click", () => {
    openModal("modal-settings");
  });
  document.getElementById("btn-save-settings")?.addEventListener("click", saveSettingsFromUI);

  // Application Updates Handlers
  document.getElementById("btn-check-updates")?.addEventListener("click", () => {
    checkForUpdates({ isManual: true });
  });

  document.getElementById("btn-apply-update-now")?.addEventListener("click", () => {
    applyApplicationUpdate();
  });

  document.getElementById("btn-banner-update-now")?.addEventListener("click", () => {
    applyApplicationUpdate();
  });

  document.getElementById("btn-dismiss-update-banner")?.addEventListener("click", () => {
    const banner = document.getElementById("app-update-notification-banner");
    if (banner) banner.style.display = "none";
  });

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
  // Damage Track (formerly Bruises)
  const handleDamageIncrement = () => {
    const cur = currentCharacter.damage !== undefined ? currentCharacter.damage : (currentCharacter.bruises || 0);
    currentCharacter.damage = cur + 1;
    currentCharacter.bruises = currentCharacter.damage;
    saveAndRender();
  };

  const handleDamageDecrement = () => {
    const cur = currentCharacter.damage !== undefined ? currentCharacter.damage : (currentCharacter.bruises || 0);
    if (cur > 0) {
      currentCharacter.damage = cur - 1;
      currentCharacter.bruises = currentCharacter.damage;
      saveAndRender();
    }
  };

  document.getElementById("btn-damage-plus")?.addEventListener("click", handleDamageIncrement);
  document.getElementById("btn-damage-minus")?.addEventListener("click", handleDamageDecrement);
  document.getElementById("btn-bruise-plus")?.addEventListener("click", handleDamageIncrement);
  document.getElementById("btn-bruise-minus")?.addEventListener("click", handleDamageDecrement);

  // Click character name on row 2 to focus Hero Name in builder
  document.getElementById("summary-char-name")?.addEventListener("click", () => {
    const tabBuilder = document.querySelector('[data-tab="tab-builder"]');
    if (tabBuilder) tabBuilder.click();
    const nameInput = document.getElementById("char-name-input");
    if (nameInput) {
      nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
      nameInput.focus();
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
    const val = e.target.value;
    const wrapCustom = document.getElementById("wrap-custom-motivation");
    const customInput = document.getElementById("char-motivation-custom");
    const descEl = document.getElementById("char-motivation-desc");

    if (val === "Other") {
      if (wrapCustom) wrapCustom.style.display = "block";
      if (customInput) {
        customInput.focus();
        currentCharacter.motivation = customInput.value.trim() || "Other";
      }
    } else {
      if (wrapCustom) wrapCustom.style.display = "none";
      currentCharacter.motivation = val;
      const found = (VALIANT_DATA.backgroundPresets?.motivations || []).find(m => m.name === val);
      if (found && descEl) {
        descEl.value = found.desc;
        currentCharacter.motivationDesc = found.desc;
        autoExpandTextarea(descEl);
      }
    }
    renderHeaderSummary();
  });

  document.getElementById("char-motivation-custom")?.addEventListener("input", (e) => {
    currentCharacter.motivation = e.target.value.trim() || "Other";
    renderHeaderSummary();
  });

  document.getElementById("char-motivation-desc")?.addEventListener("input", (e) => {
    currentCharacter.motivationDesc = e.target.value;
    autoExpandTextarea(e.target);
  });

  document.getElementById("select-complication-category")?.addEventListener("change", (e) => {
    const val = e.target.value;
    const wrapCustom = document.getElementById("wrap-custom-complication");
    const customInput = document.getElementById("input-complication-custom-cat");
    if (val === "Other") {
      if (wrapCustom) wrapCustom.style.display = "block";
      if (customInput) customInput.focus();
    } else {
      if (wrapCustom) wrapCustom.style.display = "none";
    }
  });

  document.getElementById("input-complication-title")?.addEventListener("input", (e) => {
    autoExpandTextarea(e.target);
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
  document.getElementById("char-contacts-input")?.addEventListener("input", (e) => {
    if (!currentCharacter.bio) currentCharacter.bio = {};
    currentCharacter.bio.contacts = e.target.value;
    currentCharacter.contacts = e.target.value;
    autoExpandTextarea(e.target);
  });

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

  initSessionRollerInput();

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

  // Collapsible Tables Tab Listeners
  document.querySelectorAll("[data-toggle-table]").forEach(header => {
    header.addEventListener("click", () => {
      const cardId = header.getAttribute("data-toggle-table");
      const card = document.getElementById(cardId);
      if (card) {
        card.classList.toggle("open");
        updateCollapseAllButtonState();
      }
    });
  });

  document.getElementById("btn-toggle-all-tables")?.addEventListener("click", handleToggleAllTables);
  initAutoExpandTextareas();
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
  renderSessionTab();
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
    renderSessionTab();
  }
}

function renderHeaderSummary() {
  const costs = calculateCosts(currentCharacter);

  const nameEl = document.getElementById("summary-char-name");
  const metaEl = document.getElementById("summary-char-meta");
  const plValEl = document.getElementById("summary-char-pl-val");
  const displayName = currentCharacter.name || (currentCharacter.fileName ? currentCharacter.fileName.replace(/\.valadv$/i, '') : "New Character (Unnamed)");

  if (nameEl) nameEl.textContent = displayName;
  if (plValEl) plValEl.textContent = currentCharacter.pl || 10;
  if (metaEl) {
    metaEl.textContent = `${currentCharacter.concept || "Custom Hero"}${hasUnsavedChanges() ? ' • (Unsaved Edits)' : ''}`;
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
  const curDamage = currentCharacter.damage !== undefined ? currentCharacter.damage : (currentCharacter.bruises || 0);
  const damageEl = document.getElementById("summary-damage-count");
  if (damageEl) damageEl.textContent = curDamage;
  const bruiseEl = document.getElementById("summary-bruise-count");
  if (bruiseEl) bruiseEl.textContent = curDamage;

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

// Auto-expanding textarea helper up to 3 rows
function autoExpandTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  const newHeight = Math.min(el.scrollHeight, 80);
  el.style.height = Math.max(34, newHeight) + 'px';
}

function initAutoExpandTextareas() {
  document.querySelectorAll(".expandable-auto-rows").forEach(ta => {
    ta.addEventListener("input", () => autoExpandTextarea(ta));
    ta.addEventListener("focus", () => autoExpandTextarea(ta));
    autoExpandTextarea(ta);
  });
}

// Render Background & Complications Section
function renderBackground() {
  const motSelect = document.getElementById("char-motivation-select");
  const customMotWrap = document.getElementById("wrap-custom-motivation");
  const customMotInput = document.getElementById("char-motivation-custom");
  const motDesc = document.getElementById("char-motivation-desc");

  const curMot = currentCharacter.motivation || "Justice";
  const presetFound = (VALIANT_DATA.backgroundPresets?.motivations || []).some(m => m.name.toLowerCase() === curMot.toLowerCase());

  if (motSelect) {
    if (presetFound) {
      motSelect.value = curMot;
      if (customMotWrap) customMotWrap.style.display = "none";
    } else {
      motSelect.value = "Other";
      if (customMotWrap) {
        customMotWrap.style.display = "block";
        if (customMotInput) customMotInput.value = curMot === "Other" ? "" : curMot;
      }
    }
  }

  if (motDesc && document.activeElement !== motDesc) {
    motDesc.value = currentCharacter.motivationDesc || "";
    autoExpandTextarea(motDesc);
  }

  // Complication categories custom wrap status
  const compCatSelect = document.getElementById("select-complication-category");
  const customCompWrap = document.getElementById("wrap-custom-complication");
  if (compCatSelect && customCompWrap) {
    customCompWrap.style.display = compCatSelect.value === "Other" ? "block" : "none";
  }

  // Render Complications list with zero "[object Object]" risk
  const compContainer = document.getElementById("complications-list-container");
  if (compContainer) {
    const list = currentCharacter.complicationsList || [];
    if (list.length === 0) {
      compContainer.innerHTML = `<div style="font-size: 12px; color: var(--text-dim); padding: 4px 0;">No complications added yet. Heroes typically have at least two (Motivation + 1 other) to earn Hero Points in play!</div>`;
    } else {
      compContainer.innerHTML = list.map((c, idx) => {
        const cat = typeof c.category === 'string' ? c.category : (c.category?.name || 'Other');
        const desc = typeof c.title === 'string' ? c.title : (c.title?.name || c.desc || '');
        return `
          <div class="complication-card">
            <div class="complication-card-content">
              <span class="comp-tag">${escapeAttr(cat)}</span>
              <span class="complication-card-desc">${escapeAttr(desc)}</span>
            </div>
            <button type="button" class="btn-remove-sub" onclick="removeComplication(${idx})" title="Remove complication">&times;</button>
          </div>
        `;
      }).join("");
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
  const contactsInput = document.getElementById("char-contacts-input");
  if (contactsInput && document.activeElement !== contactsInput) {
    contactsInput.value = bio.contacts || currentCharacter.contacts || "";
    autoExpandTextarea(contactsInput);
  }
}

function handleAddComplication() {
  const catSelect = document.getElementById("select-complication-category");
  const customCatInput = document.getElementById("input-complication-custom-cat");
  const descInput = document.getElementById("input-complication-title");
  if (!catSelect || !descInput) return;

  let category = catSelect.value;
  if (category === "Other") {
    category = (customCatInput ? customCatInput.value.trim() : "") || "Other";
  }

  const title = descInput.value.trim();
  if (!title) {
    alert("Please enter a complication description (e.g. Vulnerability to EMP, Nemesis Syndicate, etc.).");
    return;
  }

  if (!currentCharacter.complicationsList) currentCharacter.complicationsList = [];
  currentCharacter.complicationsList.push({
    id: "comp_" + Date.now(),
    category,
    title
  });

  descInput.value = "";
  autoExpandTextarea(descInput);
  if (customCatInput) customCatInput.value = "";
  catSelect.value = (VALIANT_DATA.backgroundPresets?.complicationCategories?.[0]?.name) || "Enemy";
  const customCompWrap = document.getElementById("wrap-custom-complication");
  if (customCompWrap) customCompWrap.style.display = "none";

  saveAndRender();
}

// // Render Core Abilities
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

// =====================================================================
// DISCORD INTEGRATION & WEBHOOK MANAGEMENT (v1.3.0)
// =====================================================================
function getDiscordServers() {
  try {
    const raw = localStorage.getItem("valiant_discord_servers");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading discord servers:", e);
  }
  return [];
}

function saveDiscordServers(servers) {
  try {
    localStorage.setItem("valiant_discord_servers", JSON.stringify(servers));
  } catch (e) {
    console.error("Error saving discord servers:", e);
  }
  renderHeaderDiscordServerSelect();
}

function getActiveDiscordServerId() {
  return localStorage.getItem("valiant_active_discord_server_id") || "";
}

function setActiveDiscordServerId(id) {
  localStorage.setItem("valiant_active_discord_server_id", id || "");
}
window.getDiscordServers = getDiscordServers;
window.saveDiscordServers = saveDiscordServers;
window.getActiveDiscordServerId = getActiveDiscordServerId;
window.setActiveDiscordServerId = setActiveDiscordServerId;
window.sendToActiveDiscordWebhook = sendToActiveDiscordWebhook;

function renderHeaderDiscordServerSelect() {
  const sel = document.getElementById("header-discord-server");
  if (!sel) return;
  const servers = getDiscordServers();
  const activeId = getActiveDiscordServerId();

  let html = '<option value="">None (Local)</option>';
  servers.forEach(s => {
    const isSelected = s.id === activeId ? "selected" : "";
    html += `<option value="${escapeAttr(s.id)}" ${isSelected}>${escapeAttr(s.name || "Discord Server")}</option>`;
  });
  sel.innerHTML = html;
}

async function queryDiscordWebhook(url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
  try {
    const res = await fetch(url.trim(), { method: "GET" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) return data.name;
    }
  } catch (err) {
    console.log("Could not query Discord webhook name directly (likely offline or CORS restriction):", err);
  }
  return null;
}

async function sendToActiveDiscordWebhook(payload) {
  const activeId = getActiveDiscordServerId();
  if (!activeId) return;
  const servers = getDiscordServers();
  const srv = servers.find(s => s.id === activeId);
  if (!srv || !srv.webhookUrl) return;

  try {
    const body = typeof payload === "string" ? { content: payload } : payload;
    if (!body.username) {
      body.username = `Valiant: ${currentCharacter?.name || "Hero"}`;
    }
    await fetch(srv.webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.warn("Discord webhook send failed:", err);
  }
}

function renderDiscordSettingsList() {
  const container = document.getElementById("discord-servers-list-container");
  if (!container) return;
  const servers = getDiscordServers();

  if (servers.length === 0) {
    container.innerHTML = '<div style="color: var(--text-dim); font-size: 12px; font-style: italic; padding: 6px 0;">No Discord servers configured. Click "+ Add Server" to route rolls to a Discord channel.</div>';
    return;
  }

  container.innerHTML = servers.map((s, idx) => {
    return `
      <div class="discord-server-item" data-server-idx="${idx}">
        <div class="discord-server-row-top">
          <input type="text" class="input-text discord-server-name-input" placeholder="Server / Channel Name" value="${escapeAttr(s.name || '')}" style="flex: 1; height: 32px; font-size: 12.5px; font-weight: 600;">
          <button type="button" class="btn-header small btn-test-webhook" onclick="testDiscordWebhook(${idx})" title="Send test ping to this webhook" style="height: 32px; font-size: 11px;">Test</button>
          <button type="button" class="btn-remove-sub" onclick="removeDiscordServer(${idx})" title="Remove this server">&times;</button>
        </div>
        <div class="discord-server-row-url">
          <input type="text" class="input-text discord-server-url-input" placeholder="https://discord.com/api/webhooks/..." value="${escapeAttr(s.webhookUrl || '')}" onchange="handleWebhookUrlChange(${idx}, this.value)" style="width: 100%; height: 30px; font-size: 11.5px; font-family: monospace;">
        </div>
        <div class="discord-server-row-bottom">
          <label class="checkbox-container" style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-main); font-size: 12px;">
            <input type="checkbox" class="discord-server-echo-checkbox" ${s.echoFading ? 'checked' : ''} onchange="toggleServerEcho(${idx}, this.checked)" style="accent-color: var(--color-primary); cursor: pointer;">
            <span>Echo details on fading effects to this webhook</span>
          </label>
        </div>
      </div>
    `;
  }).join("");
}

window.testDiscordWebhook = async function(idx) {
  const servers = getDiscordServers();
  const srv = servers[idx];
  if (!srv || !srv.webhookUrl) {
    alert("Please provide a valid Webhook URL first.");
    return;
  }
  try {
    await fetch(srv.webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `🔔 **Valiant Adventures RPG** Webhook Connected! Routing dice roller output for **${currentCharacter?.name || 'Bloodshot'}**.`,
        username: "Valiant Bot"
      })
    });
    alert("Test message successfully dispatched to Discord!");
  } catch (e) {
    alert("Failed to send test message. Please verify the Webhook URL and network connection.");
  }
};

window.handleWebhookUrlChange = async function(idx, newUrl) {
  const servers = getDiscordServers();
  if (!servers[idx]) return;
  servers[idx].webhookUrl = newUrl.trim();
  if (!servers[idx].name || servers[idx].name.startsWith("Server ")) {
    const pulledName = await queryDiscordWebhook(newUrl);
    if (pulledName) {
      servers[idx].name = pulledName;
      renderDiscordSettingsList();
    }
  }
  saveDiscordServers(servers);
};

window.toggleServerEcho = function(idx, isEcho) {
  const servers = getDiscordServers();
  if (servers[idx]) {
    servers[idx].echoFading = isEcho;
    saveDiscordServers(servers);
  }
};

window.removeDiscordServer = function(idx) {
  const servers = getDiscordServers();
  const removed = servers.splice(idx, 1)[0];
  if (removed && removed.id === getActiveDiscordServerId()) {
    setActiveDiscordServerId("");
  }
  saveDiscordServers(servers);
  renderDiscordSettingsList();
};

window.addDiscordServer = function() {
  const servers = getDiscordServers();
  servers.push({
    id: "srv_" + Date.now(),
    name: "Discord Server " + (servers.length + 1),
    webhookUrl: "",
    echoFading: true
  });
  saveDiscordServers(servers);
  renderDiscordSettingsList();
};

function renderPowers() {
  const container = document.getElementById("powers-list-container");
  if (!container) return;

  const list = currentCharacter.powers || [];
  if (list.length === 0) {
    container.innerHTML = `<div style="color: var(--text-dim); font-size: 13.5px; padding: 10px;">No powers defined. Use the Power Studio above to build and add powers.</div>`;
    return;
  }

  container.innerHTML = list.map((pow, idx) => {
    const isActive = pow.active !== false;
    return `
      <div class="power-entry-card ${isActive ? '' : 'power-inactive'}">
        <div class="power-entry-header">
          <div class="power-entry-title">
            <label class="power-toggle-wrap" title="Toggle power active / inactive (sustained, neutralized, or unavailable)">
              <input type="checkbox" class="power-active-checkbox" ${isActive ? 'checked' : ''} onchange="togglePowerActive(${idx}, this.checked)">
            </label>
            <a class="trait-link" onclick="showPowerEffectModal('${escapeAttr(pow.effect)}')">${escapeAttr(pow.name)}</a>
            <button class="trait-info-btn" onclick="showPowerEffectModal('${escapeAttr(pow.effect)}')">?</button>
            <span style="font-size: 12.5px; font-weight: 500; color: var(--text-muted);">
              (${escapeAttr(pow.effect)} ${pow.ranks || 1})
            </span>
            ${isActive ? '' : '<span class="power-inactive-badge">[Inactive]</span>'}
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

window.togglePowerActive = function(idx, isActive) {
  if (currentCharacter?.powers && currentCharacter.powers[idx]) {
    currentCharacter.powers[idx].active = isActive;
    saveAndRender();
  }
};

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
  const ranksInput = document.getElementById("power-input-ranks");
  if (ranksInput) {
    if (effectKey === "Senses") {
      ranksInput.value = 0;
    } else if (ranksInput.value === "0") {
      ranksInput.value = 4;
    }
  }

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

    // Check if explicitly legal for this effect
    const isExplicitlyLegal = effect.legalExtras && (
      effect.legalExtras.includes(ex.name) ||
      effect.legalExtras.some(le => ex.name.startsWith(le) || le.startsWith(ex.name))
    );

    if (isExplicitlyLegal) {
      if (effect.range === "Personal" && (ex.name === "Increased Range" || ex.name.startsWith("Area") || ex.name === "Selective")) {
        return false;
      }
      if (effect.range === "Perception" && ex.name === "Increased Range") {
        return false;
      }
      return true;
    }

    // Only if marked universal:
    if (ex.isUniversal !== true) return false;

    // Range / Action constraints for universal extras:
    if (effect.range === "Personal") {
      if (ex.name === "Increased Range" || ex.name.startsWith("Area") || ex.name === "Selective") return false;
    }
    if (effect.range === "Perception" && ex.name === "Increased Range") return false;

    return true;
  });

  // Filter Flaws:
  const legalFlaws = (VALIANT_DATA.modifiers.flaws || []).filter(fl => {
    if (appliedNames.has(fl.name)) return false;
    if (prohibitedByNeutralizing.has(fl.name)) return false;

    // Check if explicitly legal for this effect
    const isExplicitlyLegal = effect.legalFlaws && (
      effect.legalFlaws.includes(fl.name) ||
      effect.legalFlaws.some(lf => fl.name.startsWith(lf) || lf.startsWith(fl.name))
    );

    if (isExplicitlyLegal) {
      if (effect.range === "Close" && (fl.name === "Reduced Range" || fl.name === "Diminished Range" || fl.name === "Close Range")) return false;
      if (effect.range === "Personal" && (fl.name === "Reduced Range" || fl.name === "Diminished Range" || fl.name === "Close Range")) return false;
      return true;
    }

    // Only if marked universal:
    if (fl.isUniversal !== true) return false;

    // Range / Action constraints for universal flaws:
    if (effect.range === "Close" && (fl.name === "Reduced Range" || fl.name === "Diminished Range" || fl.name === "Close Range")) return false;
    if (effect.range === "Personal" && (fl.name === "Reduced Range" || fl.name === "Diminished Range" || fl.name === "Close Range")) return false;

    return true;
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
      <div style="display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 8px; width: 100%;">
        <div class="field-group">
          <label style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Trait Category</label>
          <select id="enhanced-trait-type" class="select-input" onchange="updateEnhancedTraitTargets()">
            <option value="Ability">Ability (2 PP / rank)</option>
            <option value="Defense">Defense (1 PP / rank)</option>
            <option value="Skill">Skill (0.5 PP / rank)</option>
            <option value="Advantage">Advantage (1 PP / rank)</option>
            <option value="Other">Other / Custom Trait</option>
          </select>
        </div>
        <div class="field-group">
          <label style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Target Trait</label>
          <select id="enhanced-trait-target" class="select-input" onchange="handleEnhancedTraitTargetChange()"></select>
        </div>
        <div class="field-group">
          <label style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Duration</label>
          <select id="enhanced-trait-duration" class="select-input" onchange="updateEnhancedTraitName()">
            <option value="Sustained">Sustained (Standard)</option>
            <option value="Permanent">Permanent (Constant)</option>
          </select>
        </div>
      </div>
      <div id="enhanced-trait-custom-container" style="display: none; width: 100%; margin-top: 6px; gap: 8px; align-items: flex-end;">
        <div class="field-group" style="flex: 2;">
          <label id="enhanced-trait-custom-label" style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Specific Specialty / Trait Focus</label>
          <input type="text" id="enhanced-trait-custom-spec" class="text-input" placeholder="e.g., Unarmed, Guns, Wealth, Science..." oninput="updateEnhancedTraitName()">
        </div>
        <div class="field-group" id="enhanced-trait-custom-cost-group" style="flex: 1; display: none;">
          <label style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Base Cost</label>
          <select id="enhanced-trait-custom-cost" class="select-input" onchange="updatePowerCostPreview()">
            <option value="0.5">0.5 PP / rank (1 PP per 2 ranks)</option>
            <option value="1" selected>1 PP / rank</option>
            <option value="2">2 PP / rank</option>
          </select>
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
      <div class="power-options-title">🛡️ Immunity Configuration &amp; Scope</div>
      <div class="immunity-options-row" style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; width: 100%;">
        <!-- Preset Dropdown (Half as wide: 50%) -->
        <div class="field-group" style="flex: 1 1 calc(50% - 6px); max-width: calc(50% - 6px); min-width: 210px;">
          <label for="immunity-preset-select" style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-dim);">
            Immunity Presets (Replaces Ranks)
          </label>
          <select id="immunity-preset-select" class="select-input" onchange="applyImmunityPreset()" style="width: 100%;">
            <option value="">-- Choose Full Preset --</option>
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

        <!-- All Immunity Settings Dropdown (Adds Ranks) (Half as wide: 50%) -->
        <div class="field-group" style="flex: 1 1 calc(50% - 6px); max-width: calc(50% - 6px); min-width: 210px;">
          <label for="immunity-add-setting-select" style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-dim);">
            All Immunity Settings (+ Adds Ranks)
          </label>
          <div style="display: flex; gap: 6px; width: 100%;">
            <select id="immunity-add-setting-select" class="select-input" style="flex: 1; min-width: 0;">
              <option value="">-- Select Setting to Add --</option>
              <optgroup label="1 Rank (Uncommon / Minor Hazard)">
                <option value="Aging:1">Aging (+1 Rank)</option>
                <option value="Disease:1">Disease (+1 Rank)</option>
                <option value="Need for Sleep:1">Need for Sleep (+1 Rank)</option>
                <option value="Poison:1">Poison (+1 Rank)</option>
                <option value="Starvation &amp; Thirst:1">Starvation &amp; Thirst (+1 Rank)</option>
                <option value="Suffocation (Extended Breath):1">Suffocation (Extended Breath) (+1 Rank)</option>
              </optgroup>
              <optgroup label="2 Ranks (Common Hazard / Environmental)">
                <option value="Critical Hits:2">Critical Hits (+2 Ranks)</option>
                <option value="Suffocation (All / No Need to Breathe):2">Suffocation (All / No Need to Breathe) (+2 Ranks)</option>
                <option value="Environmental Cold:2">Environmental Cold (+2 Ranks)</option>
                <option value="Environmental Heat:2">Environmental Heat (+2 Ranks)</option>
                <option value="High Pressure:2">High Pressure (+2 Ranks)</option>
                <option value="Low Pressure / Vacuum:2">Low Pressure / Vacuum (+2 Ranks)</option>
                <option value="Radiation:2">Radiation (+2 Ranks)</option>
                <option value="Drowning:2">Drowning (+2 Ranks)</option>
              </optgroup>
              <optgroup label="5 Ranks (Broad Hazard / Effect Category)">
                <option value="All Environmental Conditions:5">All Environmental Conditions (+5 Ranks)</option>
                <option value="Alteration Effects:5">Alteration Effects (+5 Ranks)</option>
                <option value="Emotion Effects:5">Emotion Effects (+5 Ranks)</option>
                <option value="Entrapment Effects:5">Entrapment Effects (+5 Ranks)</option>
                <option value="Fatigue Effects:5">Fatigue Effects (+5 Ranks)</option>
                <option value="Sensory Affliction Effects:5">Sensory Affliction Effects (+5 Ranks)</option>
                <option value="Sleep Effects:5">Sleep Effects (+5 Ranks)</option>
              </optgroup>
              <optgroup label="10 Ranks (Common Descriptor / Broad Hazard)">
                <option value="Full Life Support:10">Full Life Support (+10 Ranks)</option>
                <option value="Fire / Heat Effects:10">Fire / Heat Effects (+10 Ranks)</option>
                <option value="Cold / Ice Effects:10">Cold / Ice Effects (+10 Ranks)</option>
                <option value="Electricity / Lightning:10">Electricity / Lightning (+10 Ranks)</option>
                <option value="Radiation Effects:10">Radiation Effects (+10 Ranks)</option>
                <option value="Weather Effects:10">Weather Effects (+10 Ranks)</option>
                <option value="Darkness / Shadow:10">Darkness / Shadow (+10 Ranks)</option>
                <option value="Light Effects:10">Light Effects (+10 Ranks)</option>
                <option value="Magic Effects:10">Magic Effects (+10 Ranks)</option>
                <option value="Mental Effects:10">Mental Effects (+10 Ranks)</option>
                <option value="Nanites / Technopathy:10">Nanites / Technopathy (+10 Ranks)</option>
                <option value="Acid / Chemical:10">Acid / Chemical (+10 Ranks)</option>
                <option value="Sonic / Sound:10">Sonic / Sound (+10 Ranks)</option>
                <option value="Bleed / Toxin Effects:10">Bleed / Toxin Effects (+10 Ranks)</option>
              </optgroup>
              <optgroup label="20 Ranks (Very Broad Descriptor)">
                <option value="All Energy Effects:20">All Energy Effects (+20 Ranks)</option>
                <option value="All Physical Damage:20">All Physical Damage (+20 Ranks)</option>
                <option value="All Mental Attacks:20">All Mental Attacks (+20 Ranks)</option>
                <option value="All Magic Effects:20">All Magic Effects (+20 Ranks)</option>
                <option value="All Technological Attacks:20">All Technological Attacks (+20 Ranks)</option>
                <option value="Interaction Effects (Taunt/Trick):20">Interaction Effects (+20 Ranks)</option>
              </optgroup>
              <optgroup label="30 Ranks (Entire Defense Category)">
                <option value="All Fortitude Effects:30">All Fortitude Effects (+30 Ranks)</option>
                <option value="All Will Effects:30">All Will Effects (+30 Ranks)</option>
              </optgroup>
              <optgroup label="80 Ranks (Invulnerability)">
                <option value="All Toughness Effects (Damage Invulnerability):80">All Toughness Effects (+80 Ranks)</option>
              </optgroup>
            </select>
            <button type="button" id="btn-add-immunity-setting" class="btn-header primary small" onclick="addImmunitySetting()" style="height: 36px; padding: 0 12px; white-space: nowrap;">
              + Add
            </button>
          </div>
        </div>
      </div>
      <div id="immunity-added-items" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; font-size: 11.5px;"></div>
    `;
  } else if (effectKey === "Senses") {
    container.style.display = "flex";
    container.innerHTML = `
      <div class="power-options-title">👁️ Senses Studio: Meta-Senses &amp; Sensory Suite</div>
      
      <!-- Part 1: Apply Meta-Senses (Accurate, Acute, Analytical, etc.) to Individual Senses or Sense Types -->
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 8px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-secondary); margin-bottom: 6px; display: flex; justify-content: space-between;">
          <span>1. Apply Meta-Sense Enhancement</span>
          <span style="font-size: 10.5px; text-transform: none; color: var(--text-dim); font-weight: normal;">(Accurate 2r/4r; Acute/Analytical/Extended/Radius/Ranged/Rapid 1r/2r; Counters 2r/5r)</span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;">
          <div class="field-group" style="flex: 1.3; min-width: 190px;">
            <label style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Meta-Sense</label>
            <select id="senses-meta-select" class="select-input" onchange="updateMetaSenseUI()">
              <option value="Accurate">Accurate (Combat targeting: 2r indiv / 4r type)</option>
              <option value="Acute">Acute (Discriminate fine details &amp; identity: 1r indiv / 2r type)</option>
              <option value="Analytical">Analytical (Exact composition/wavelength: 1r indiv / 2r type)</option>
              <option value="Counters Concealment">Counters Concealment (Ignore concealment: 2r indiv / 5r type)</option>
              <option value="Counters Illusion">Counters Illusion (Ignore illusions: 2r indiv / 5r type)</option>
              <option value="Extended">Extended (Multiply distance range &times;10: 1r indiv / 2r type)</option>
              <option value="Penetrates Concealment">Penetrates Concealment (X-Ray / barrier bypass: 4 ranks)</option>
              <option value="Radius">Radius (360&deg; all-around perception: 1r indiv / 2r type)</option>
              <option value="Ranged">Ranged (Use touch/taste at distance: 1r indiv / 2r type)</option>
              <option value="Rapid">Rapid (Process/read 10&times; faster per rank: 1r indiv / 2r type)</option>
              <option value="Tracking">Tracking (Follow trails at Speed - 1: 1 rank)</option>
              <option value="Tracking:FullSpeed">Tracking (Follow trails at normal Speed: 2 ranks)</option>
            </select>
          </div>
          <div class="field-group" style="flex: 1.8; min-width: 240px;">
            <label style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Target Scope (Sense or Type)</label>
            <select id="senses-meta-target" class="select-input" onchange="updateMetaSenseUI()">
              <optgroup id="senses-meta-added-group" label="Configured on This Power" style="display: none;"></optgroup>
              <optgroup label="Visual Individual Senses">
                <option value="Darkvision:indiv">Darkvision (Individual Sense)</option>
                <option value="Normal Vision:indiv">Normal Vision (Individual Sense)</option>
                <option value="Low-Light Vision:indiv">Low-Light Vision (Individual Sense)</option>
                <option value="Infravision:indiv">Infravision (Individual Sense)</option>
                <option value="Ultravision:indiv">Ultravision (Individual Sense)</option>
                <option value="Microscopic Vision:indiv">Microscopic Vision (Individual Sense)</option>
              </optgroup>
              <optgroup label="Auditory Individual Senses">
                <option value="Normal Hearing:indiv">Normal Hearing (Individual Sense)</option>
                <option value="Ultra-Hearing:indiv">Ultra-Hearing (Individual Sense)</option>
                <option value="Sonar:indiv">Sonar (Individual Sense)</option>
              </optgroup>
              <optgroup label="Tactile, Olfactory &amp; Gustatory Individual Senses">
                <option value="Tactile (Touch):indiv">Tactile / Touch (Individual Sense)</option>
                <option value="Olfactory (Smell):indiv">Olfactory / Smell (Individual Sense)</option>
                <option value="Gustatory (Taste):indiv">Gustatory / Taste (Individual Sense)</option>
              </optgroup>
              <optgroup label="Radio &amp; Technology Individual Senses">
                <option value="Radio Sense:indiv">Radio Sense (Individual Sense)</option>
                <option value="Radar:indiv">Radar (Individual Sense)</option>
                <option value="Interface:indiv">Interface (Individual Sense)</option>
              </optgroup>
              <optgroup label="Mental, Awareness &amp; Detection Individual Senses">
                <option value="Mental Sense:indiv">Mental Sense (Individual Sense)</option>
                <option value="Awareness (General):indiv">Awareness (Individual Sense)</option>
                <option value="Magical Awareness:indiv">Magical Awareness (Individual Sense)</option>
                <option value="Psionic Awareness:indiv">Psionic Awareness (Individual Sense)</option>
                <option value="Cosmic Awareness:indiv">Cosmic Awareness (Individual Sense)</option>
                <option value="Technological Awareness:indiv">Technological Awareness (Individual Sense)</option>
                <option value="Divine Awareness:indiv">Divine Awareness (Individual Sense)</option>
                <option value="Necrotic / Undead Awareness:indiv">Necrotic / Undead Awareness (Individual Sense)</option>
                <option value="Deadside Awareness:indiv">Deadside Awareness (Individual Sense)</option>
                <option value="Detect by Touch:indiv">Detect by Touch (Individual Sense)</option>
                <option value="Detect at Range:indiv">Detect at Range (Individual Sense)</option>
                <option value="See Spirits:indiv">See Spirits (Individual Sense)</option>
                <option value="Communication Link:indiv">Communication Link (Individual Sense)</option>
              </optgroup>
              <optgroup label="Spatial &amp; Orientation Individual Senses">
                <option value="Danger Sense:indiv">Danger Sense (Individual Sense)</option>
                <option value="Direction Sense:indiv">Direction Sense (Individual Sense)</option>
                <option value="Distance Sense:indiv">Distance Sense (Individual Sense)</option>
                <option value="Time Sense:indiv">Time Sense (Individual Sense)</option>
              </optgroup>
              <optgroup label="Custom Individual Sense">
                <option value="Custom Individual Sense:indiv">Custom Individual Sense...</option>
              </optgroup>
              <optgroup label="Entire Sense Types">
                <option value="Visual Sense Type:type">Visual Sense Type (Entire Group)</option>
                <option value="Auditory Sense Type:type">Auditory Sense Type (Entire Group)</option>
                <option value="Olfactory / Gustatory Type:type">Olfactory / Gustatory Type (Entire Group)</option>
                <option value="Tactile Sense Type:type">Tactile Sense Type (Entire Group)</option>
                <option value="Radio Sense Type:type">Radio Sense Type (Entire Group)</option>
                <option value="Mental Sense Type:type">Mental Sense Type (Entire Group)</option>
                <option value="Custom Sense Type:type">Custom Sense Type...</option>
              </optgroup>
            </select>
          </div>
          <div class="field-group" id="senses-meta-custom-group" style="display: none; flex: 1.2; min-width: 150px;">
            <label style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Specify Custom Sense</label>
            <input type="text" id="senses-meta-custom-input" class="text-input" placeholder="e.g. Magnetic, Aura, Gravimetric">
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="senses-meta-cost-badge" class="badge-pp" style="padding: 7px 10px; font-size: 12px; font-weight: bold; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--accent-secondary); white-space: nowrap;">
              +2 Ranks
            </span>
            <button type="button" id="btn-add-meta-sense" class="btn-header primary small" onclick="addMetaSenseOption()" style="height: 36px; padding: 0 14px; white-space: nowrap;">
              + Add Meta-Sense
            </button>
          </div>
        </div>
      </div>

      <!-- Part 2: Standalone Senses & Sensory Capabilities -->
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-secondary); margin-bottom: 6px;">
          2. Add Standalone Sensory Capabilities &amp; Awareness
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;">
          <div class="field-group" style="flex: 2; min-width: 260px;">
            <label style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Sensory Capability</label>
            <select id="senses-standalone-select" class="select-input" onchange="updateStandaloneSenseUI()">
              <optgroup label="Vision Modes &amp; Enhancements">
                <option value="Darkvision:2">Darkvision (2 ranks - See in complete darkness as daylight)</option>
                <option value="Low-Light Vision:1">Low-Light Vision (1 rank - Ignore dim lighting penalties)</option>
                <option value="Infravision:1">Infravision (1 rank - Perceive heat patterns / ignore warm body darkness)</option>
                <option value="Ultravision:1">Ultravision (1 rank - See UV light / see at night by starlight)</option>
                <option value="Microscopic Vision (Dust):1">Microscopic Vision: Dust (1 rank)</option>
                <option value="Microscopic Vision (Cellular):2">Microscopic Vision: Cellular (2 ranks)</option>
                <option value="Microscopic Vision (Molecular / DNA):3">Microscopic Vision: Molecular / DNA (3 ranks)</option>
                <option value="Microscopic Vision (Atomic):4">Microscopic Vision: Atomic (4 ranks)</option>
              </optgroup>
              <optgroup label="Auditory Enhancements">
                <option value="Ultra-Hearing:1">Ultra-Hearing (1 rank - Infrasonic &amp; ultrasonic frequencies)</option>
                <option value="Sonar:3">Sonar (3 ranks - Accurate + Ultra-Hearing Echolocation)</option>
              </optgroup>
              <optgroup label="Radio &amp; Technology">
                <option value="Radio:1">Radio (1 rank - AM, FM, cellular, police, emergency bands)</option>
                <option value="Radar:3">Radar (3 ranks - Accurate Radio wave echoes)</option>
                <option value="Interface:4">Interface (4 ranks - Direct electronic/machine wireless communication)</option>
              </optgroup>
              <optgroup label="Spatial &amp; Orientation Senses">
                <option value="Danger Sense:1">Danger Sense (1 rank - DC 10 check to avoid surprise)</option>
                <option value="Direction Sense:1">Direction Sense (1 rank - Know magnetic north &amp; retrace steps)</option>
                <option value="Distance Sense:1">Distance Sense (1 rank - Accurately judge distances automatically)</option>
                <option value="Time Sense:1">Time Sense (1 rank - Internal clock / accurate time judgment)</option>
              </optgroup>
              <optgroup label="Sensory Awareness (Descriptor in Radius)">
                <option value="Magical Awareness:1">Magical Awareness (1 rank)</option>
                <option value="Psionic Awareness:1">Psionic Awareness (1 rank)</option>
                <option value="Cosmic Awareness:1">Cosmic Awareness (1 rank)</option>
                <option value="Technological Awareness:1">Technological Awareness (1 rank)</option>
                <option value="Divine Awareness:1">Divine Awareness (1 rank)</option>
                <option value="Necrotic / Undead Awareness:1">Necrotic / Undead Awareness (1 rank)</option>
                <option value="Deadside / Extradimensional Awareness:1">Deadside / Extradimensional Awareness (1 rank)</option>
                <option value="Custom Awareness:1">Custom Descriptor Awareness (1 rank)...</option>
              </optgroup>
              <optgroup label="Detection &amp; Mediums">
                <option value="Detect by Touch:1">Detect by Touch (1 rank - Sense item/quality presence)</option>
                <option value="Detect at Range:2">Detect at Range (2 ranks - Sense presence at distance)</option>
                <option value="See Spirits:2">See Spirits (2 ranks - Perceive unseen spiritual entities)</option>
              </optgroup>
              <optgroup label="Communication &amp; Comprehension">
                <option value="Comprehend: Understand Any Language:2">Comprehend: Understand Any Language (2 ranks)</option>
                <option value="Comprehend: Speak Any Language:2">Comprehend: Speak Any Language (2 ranks)</option>
                <option value="Comprehend: Speak &amp; Understand All Languages:4">Comprehend: Speak &amp; Understand All Languages (4 ranks)</option>
                <option value="Comprehend: Read All Written Languages:2">Comprehend: Read All Written Languages (+2 ranks)</option>
                <option value="Speak with Animals:4">Speak with Animals (4 ranks)</option>
                <option value="Speak with Plants:4">Speak with Plants (4 ranks)</option>
                <option value="Speak with Spirits:4">Speak with Spirits (4 ranks)</option>
                <option value="Communication Link:1">Communication Link (1 rank - Mental/Radio link across distance)</option>
              </optgroup>
            </select>
          </div>
          <div class="field-group" id="senses-standalone-custom-group" style="display: none; flex: 1.2; min-width: 170px;">
            <label style="font-size: 11px; font-weight: 700; color: var(--text-dim);">Specify Focus / Descriptor</label>
            <input type="text" id="senses-standalone-custom-input" class="text-input" placeholder="e.g. Psiots, Nanites, Radiation">
          </div>
          <button type="button" id="btn-add-standalone-sense" class="btn-header primary small" onclick="addStandaloneSenseOption()" style="height: 36px; padding: 0 14px; white-space: nowrap;">
            + Add Sense
          </button>
        </div>
      </div>

      <!-- Configured Senses Badges Container -->
      <div id="senses-added-items" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; font-size: 11.5px;"></div>
    `;
    syncSensesTargetDropdown();
    updateMetaSenseUI();
    updateStandaloneSenseUI();
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
  const customContainer = document.getElementById("enhanced-trait-custom-container");
  const customCostGroup = document.getElementById("enhanced-trait-custom-cost-group");
  const customLabel = document.getElementById("enhanced-trait-custom-label");
  const customInput = document.getElementById("enhanced-trait-custom-spec");
  if (!typeSelect || !targetSelect) return;

  const cat = typeSelect.value;
  if (customContainer) customContainer.style.display = "none";
  if (customCostGroup) customCostGroup.style.display = "none";
  if (customInput) customInput.value = "";

  if (cat === "Ability") {
    targetSelect.innerHTML = Object.keys(VALIANT_DATA.abilities).map(a => 
      `<option value="${a}">${a} - ${VALIANT_DATA.abilities[a].name} (2 PP/r)</option>`
    ).join("");
  } else if (cat === "Defense") {
    targetSelect.innerHTML = Object.keys(VALIANT_DATA.defenses).map(d => 
      `<option value="${d}">${d} Defense (1 PP/r)</option>`
    ).join("");
  } else if (cat === "Skill") {
    const generalSkills = [
      "Acrobatics (AGL)", "Athletics (STR)", "Computers (INT)", "Deception (PRE)",
      "Driving (DEX)", "Electronics (INT)", "Escape Artist (DEX)", "Insight (AWE)",
      "Intimidation (PRE)", "Investigation (INT)", "Mechanics (INT)", "Occult (INT)",
      "Perception (AWE)", "Persuasion (PRE)", "Piloting (DEX)", "Sleight of Hand (DEX)",
      "Stealth (AGL)", "Thievery (DEX)", "Treatment (INT)", "Vehicles (DEX)"
    ];
    const closeCombatSpecs = [
      "Close Combat: Unarmed", "Close Combat: Blades / Swords", "Close Combat: Clubs / Blunt",
      "Close Combat: Grappling", "Close Combat: Axes", "Close Combat: Polearms / Spears",
      "Close Combat: Knives / Daggers", "Close Combat: (Custom Specialty...)"
    ];
    const expertiseSpecs = [
      "Expertise: Acting", "Expertise: Art", "Expertise: Criminal / Streetwise",
      "Expertise: Current Events", "Expertise: Engineering", "Expertise: History",
      "Expertise: Journalism", "Expertise: Law", "Expertise: Medicine",
      "Expertise: Military / Tactics", "Expertise: Occult / Arcane", "Expertise: Philosophy",
      "Expertise: Popular Culture", "Expertise: Psychology", "Expertise: Science",
      "Expertise: Theology", "Expertise: (Custom Specialty...)"
    ];
    const rangedCombatSpecs = [
      "Ranged Combat: Guns / Ballistics", "Ranged Combat: Energy Weapons",
      "Ranged Combat: Archery / Bows", "Ranged Combat: Heavy Weapons / Artillery",
      "Ranged Combat: Throwing", "Ranged Combat: (Custom Specialty...)"
    ];

    targetSelect.innerHTML = `
      <optgroup label="General Skills (0.5 PP/rank)">
        ${generalSkills.map(s => `<option value="${s}">${s}</option>`).join("")}
      </optgroup>
      <optgroup label="Close Combat (0.5 PP/rank)">
        ${closeCombatSpecs.map(s => `<option value="${s}">${s}</option>`).join("")}
      </optgroup>
      <optgroup label="Expertise Specialties (0.5 PP/rank)">
        ${expertiseSpecs.map(s => `<option value="${s}">${s}</option>`).join("")}
      </optgroup>
      <optgroup label="Ranged Combat (0.5 PP/rank)">
        ${rangedCombatSpecs.map(s => `<option value="${s}">${s}</option>`).join("")}
      </optgroup>
      <optgroup label="Custom Skill">
        <option value="Other / Custom Skill...">Other / Custom Skill (Specify)...</option>
      </optgroup>
    `;
  } else if (cat === "Advantage") {
    const advNames = Object.keys(VALIANT_DATA.advantages).sort();
    targetSelect.innerHTML = advNames.map(adv => `<option value="${adv}">${adv} (1 PP/r)</option>`).join("") +
      `<option value="Other / Custom Advantage...">Other / Custom Advantage (Specify)...</option>`;
  } else if (cat === "Other") {
    targetSelect.innerHTML = `<option value="Custom Trait">Custom Trait</option>`;
    if (customContainer) customContainer.style.display = "flex";
    if (customCostGroup) customCostGroup.style.display = "block";
    if (customLabel) customLabel.textContent = "Custom Trait Name";
    if (customInput) customInput.placeholder = "Enter custom trait name (e.g. Nanite Resilience)";
  }

  handleEnhancedTraitTargetChange();
};

window.handleEnhancedTraitTargetChange = function() {
  const typeSelect = document.getElementById("enhanced-trait-type");
  const targetSelect = document.getElementById("enhanced-trait-target");
  const customContainer = document.getElementById("enhanced-trait-custom-container");
  const customCostGroup = document.getElementById("enhanced-trait-custom-cost-group");
  const customLabel = document.getElementById("enhanced-trait-custom-label");
  const customInput = document.getElementById("enhanced-trait-custom-spec");
  if (!typeSelect || !targetSelect) return;

  const cat = typeSelect.value;
  const val = targetSelect.value;

  const needsCustom = cat === "Other" || 
    val.includes("(Custom Specialty...)") || 
    val.startsWith("Other / Custom") || 
    val === "Benefit" || 
    val === "Favored Environment" || 
    val === "Favored Foe" || 
    val === "Equipment" || 
    val === "Languages" ||
    val === "Minion" ||
    val === "Sidekick";

  if (customContainer) {
    customContainer.style.display = needsCustom ? "flex" : "none";
  }
  if (customCostGroup) {
    customCostGroup.style.display = (cat === "Other") ? "block" : "none";
  }
  if (customLabel) {
    if (cat === "Other") customLabel.textContent = "Custom Trait Name";
    else if (val === "Benefit") customLabel.textContent = "Benefit Option (e.g. Wealth, Status, Security Clearance)";
    else if (val === "Favored Environment") customLabel.textContent = "Environment (e.g. Airborne, Aquatic, Darkness)";
    else if (val === "Favored Foe") customLabel.textContent = "Foe Type (e.g. Psiots, Aliens, Androids, Undead)";
    else if (val === "Equipment") customLabel.textContent = "Equipment Detail (e.g. Headquarters, Tactical Armor)";
    else if (val === "Languages") customLabel.textContent = "Languages Known (e.g. Ancient Sumerian, Latin)";
    else if (val.includes("Combat") || val.includes("Expertise")) customLabel.textContent = "Custom Specialty Detail";
    else customLabel.textContent = "Specification / Specialty";
  }

  updateEnhancedTraitName();
};

window.updateEnhancedTraitName = function() {
  const typeSelect = document.getElementById("enhanced-trait-type");
  const targetSelect = document.getElementById("enhanced-trait-target");
  const customInput = document.getElementById("enhanced-trait-custom-spec");
  const durationSelect = document.getElementById("enhanced-trait-duration");
  const nameInput = document.getElementById("power-input-name");
  const descInput = document.getElementById("power-input-desc");

  if (!typeSelect || !targetSelect || !nameInput) return;

  const cat = typeSelect.value;
  let targetVal = targetSelect.value;
  const customVal = customInput ? customInput.value.trim() : "";
  const duration = durationSelect ? durationSelect.value : "Sustained";

  let displayName = targetVal;
  if (cat === "Ability") {
    const fullAbility = VALIANT_DATA.abilities[targetVal];
    displayName = fullAbility ? fullAbility.name : targetVal;
  } else if (cat === "Other") {
    displayName = customVal || "Custom Trait";
  } else if (customVal) {
    if (targetVal.includes("(Custom Specialty...)")) {
      const basePrefix = targetVal.split(":")[0];
      displayName = `${basePrefix} (${customVal})`;
    } else if (targetVal.startsWith("Other / Custom")) {
      displayName = customVal;
    } else {
      displayName = `${targetVal} (${customVal})`;
    }
  }

  // Update power name
  if (!nameInput.value || nameInput.value.startsWith("Enhanced ")) {
    nameInput.value = `Enhanced ${displayName}`;
  }

  // Update power description/details
  if (descInput && (!descInput.value || descInput.value.startsWith("Enhanced "))) {
    descInput.value = `Enhanced ${displayName} [${cat}, Duration: ${duration}]`;
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
    descInput.value = `Immunity to ${desc} (${rankStr} ranks).`;
  }
  const chipsContainer = document.getElementById("immunity-added-items");
  if (chipsContainer) {
    chipsContainer.innerHTML = `<span class="power-chip">+ Preset: ${escapeAttr(desc)} (${rankStr} ranks)</span>`;
  }
  updatePowerCostPreview();
};

window.addImmunitySetting = function() {
  const sel = document.getElementById("immunity-add-setting-select");
  if (!sel || !sel.value) return;

  const [settingName, rankStr] = sel.value.split(":");
  const addedRanks = parseInt(rankStr, 10) || 0;
  if (addedRanks <= 0) return;

  const ranksInput = document.getElementById("power-input-ranks");
  const nameInput = document.getElementById("power-input-name");
  const descInput = document.getElementById("power-input-desc");

  // 1. Increment ranks in the power instance
  const currentRanks = parseInt(ranksInput && ranksInput.value ? ranksInput.value : "0", 10) || 0;
  const newRanks = currentRanks + addedRanks;
  if (ranksInput) ranksInput.value = newRanks;

  // 2. Append to power description
  const rankLabel = `${addedRanks} ${addedRanks === 1 ? 'rank' : 'ranks'}`;
  if (descInput) {
    const prev = descInput.value.trim();
    if (!prev || prev === "Immunity" || prev.startsWith("Immunity to ")) {
      if (!prev || prev === "Immunity") {
        descInput.value = `Immunity: ${settingName} (${rankLabel})`;
      } else {
        descInput.value = `${prev}, ${settingName} (${rankLabel})`;
      }
    } else {
      descInput.value = `${prev}, ${settingName} (${rankLabel})`;
    }
  }

  // 3. Update power name if appropriate
  if (nameInput) {
    if (!nameInput.value || nameInput.value === "Immunity" || nameInput.value.startsWith("Immunity:")) {
      if (!nameInput.value || nameInput.value === "Immunity") {
        nameInput.value = `Immunity: ${settingName}`;
      } else if (!nameInput.value.includes(settingName)) {
        nameInput.value = `${nameInput.value}, ${settingName}`;
      }
    }
  }

  // 4. Add visual badge
  const chipsContainer = document.getElementById("immunity-added-items");
  if (chipsContainer) {
    const chip = document.createElement("span");
    chip.className = "power-chip";
    chip.style.display = "inline-flex";
    chip.style.alignItems = "center";
    chip.style.gap = "6px";
    chip.innerHTML = `+ ${escapeAttr(settingName)} (${addedRanks} ${addedRanks === 1 ? 'rank' : 'ranks'}) <button type="button" class="btn-remove-chip" onclick="removeImmunityItem(this, ${addedRanks}, '${escapeAttr(settingName)}')">&times;</button>`;
    chipsContainer.appendChild(chip);
  }

  // Reset dropdown
  sel.value = "";

  updatePowerCostPreview();
};


window.removeImmunityItem = function(buttonEl, ranks, name) {
  const ranksInput = document.getElementById("power-input-ranks");
  const descInput = document.getElementById("power-input-desc");

  if (ranksInput) {
    const cur = parseInt(ranksInput.value || "1", 10) || 1;
    ranksInput.value = Math.max(1, cur - ranks);
  }

  if (descInput) {
    let text = descInput.value;
    text = text.split(", ").filter(part => !part.includes(name)).join(", ");
    if (!text || text === "Immunity:") text = "";
    descInput.value = text;
  }

  const chip = buttonEl?.closest(".power-chip");
  if (chip) chip.remove();

  updatePowerCostPreview();
};

window.syncSensesTargetDropdown = function() {
  const targetSel = document.getElementById("senses-meta-target");
  const addedGroup = document.getElementById("senses-meta-added-group");
  const container = document.getElementById("senses-added-items");
  if (!targetSel || !addedGroup) return;

  const currentVal = targetSel.value;
  const standaloneSenseNames = [];
  if (container) {
    const chips = container.querySelectorAll(".power-chip");
    chips.forEach(chip => {
      const txt = chip.childNodes[0]?.textContent || "";
      const match = txt.match(/^\+\s*(.+?)\s*\(\d+r\)/);
      if (match) {
        const itemLabel = match[1].trim();
        // Skip meta-senses that contain bracketed targets
        if (!itemLabel.includes("[")) {
          if (!standaloneSenseNames.includes(itemLabel)) {
            standaloneSenseNames.push(itemLabel);
          }
        }
      }
    });
  }

  if (standaloneSenseNames.length > 0) {
    addedGroup.innerHTML = standaloneSenseNames.map(name => {
      const cleanName = escapeAttr(name);
      return `<option value="${cleanName}:indiv">${cleanName} (Configured on Power)</option>`;
    }).join("");
    addedGroup.style.display = "";
  } else {
    addedGroup.innerHTML = "";
    addedGroup.style.display = "none";
  }

  // Preserve previous selection if still available
  if (currentVal && Array.from(targetSel.options).some(o => o.value === currentVal)) {
    targetSel.value = currentVal;
  }
};

window.updateMetaSenseUI = function() {
  const metaSel = document.getElementById("senses-meta-select");
  const targetSel = document.getElementById("senses-meta-target");
  const customGroup = document.getElementById("senses-meta-custom-group");
  const badge = document.getElementById("senses-meta-cost-badge");
  if (!metaSel || !targetSel || !badge) return;

  const meta = metaSel.value;
  const targetVal = targetSel.value;
  const isType = targetVal.endsWith(":type");

  if (customGroup) {
    customGroup.style.display = targetVal.startsWith("Custom") ? "block" : "none";
  }

  let ranks = 1;
  switch (meta) {
    case "Accurate":
      ranks = isType ? 4 : 2;
      break;
    case "Acute":
    case "Analytical":
    case "Extended":
    case "Radius":
    case "Ranged":
    case "Rapid":
      ranks = isType ? 2 : 1;
      break;
    case "Penetrates Concealment":
      ranks = 4;
      break;
    case "Tracking":
      ranks = 1;
      break;
    case "Tracking:FullSpeed":
      ranks = 2;
      break;
    case "Counters Concealment":
    case "Counters Illusion":
      ranks = isType ? 5 : 2;
      break;
    default:
      ranks = isType ? 2 : 1;
  }

  badge.textContent = `+${ranks} ${ranks === 1 ? 'Rank' : 'Ranks'}`;
};

window.addMetaSenseOption = function() {
  const metaSel = document.getElementById("senses-meta-select");
  const targetSel = document.getElementById("senses-meta-target");
  const customInput = document.getElementById("senses-meta-custom-input");
  const ranksInput = document.getElementById("power-input-ranks");
  const nameInput = document.getElementById("power-input-name");
  const descInput = document.getElementById("power-input-desc");
  const container = document.getElementById("senses-added-items");
  if (!metaSel || !targetSel) return;

  const meta = metaSel.value;
  const targetRaw = targetSel.value;
  const isType = targetRaw.endsWith(":type");
  let targetName = targetRaw.split(":")[0];
  if (targetRaw.startsWith("Custom") && customInput && customInput.value.trim()) {
    targetName = customInput.value.trim() + (isType ? " (Sense Type)" : "");
  }

  let addedRanks = 1;
  let metaLabel = meta;
  if (meta === "Tracking:FullSpeed") {
    metaLabel = "Tracking (Full Speed)";
    addedRanks = 2;
  } else if (meta === "Accurate") {
    addedRanks = isType ? 4 : 2;
  } else if (["Acute", "Analytical", "Extended", "Radius", "Ranged", "Rapid"].includes(meta)) {
    addedRanks = isType ? 2 : 1;
  } else if (meta === "Penetrates Concealment") {
    addedRanks = 4;
  } else if (["Counters Concealment", "Counters Illusion"].includes(meta)) {
    addedRanks = isType ? 5 : 2;
  }

  const fullLabel = `${metaLabel} [${targetName}]`;

  // 1. Increment power ranks
  const curRanks = parseInt(ranksInput && ranksInput.value ? ranksInput.value : "0", 10) || 0;
  const newRanks = curRanks + addedRanks;
  if (ranksInput) ranksInput.value = newRanks;

  // 2. Append to power description
  const entryDesc = `${fullLabel} (${addedRanks} ${addedRanks === 1 ? 'rank' : 'ranks'})`;
  if (descInput) {
    const prev = descInput.value.trim();
    if (!prev || prev === "Senses" || prev.startsWith("Senses:")) {
      if (!prev || prev === "Senses") {
        descInput.value = `Senses: ${entryDesc}`;
      } else {
        descInput.value = `${prev}, ${entryDesc}`;
      }
    } else {
      descInput.value = `${prev}, ${entryDesc}`;
    }
  }

  // 3. Update power name if default
  if (nameInput) {
    if (!nameInput.value || nameInput.value === "Senses" || nameInput.value.startsWith("Senses:")) {
      if (!nameInput.value || nameInput.value === "Senses") {
        nameInput.value = `Senses: ${fullLabel}`;
      } else if (!nameInput.value.includes(metaLabel)) {
        nameInput.value = `${nameInput.value}, ${metaLabel}`;
      }
    }
  }

  // 4. Add visual removable badge
  if (container) {
    const chip = document.createElement("span");
    chip.className = "power-chip";
    chip.style.display = "inline-flex";
    chip.style.alignItems = "center";
    chip.style.gap = "6px";
    chip.innerHTML = `+ ${escapeAttr(fullLabel)} (${addedRanks}r) <button type="button" class="btn-remove-chip" onclick="removeSensesItem(this, ${addedRanks}, '${escapeAttr(fullLabel)}')">&times;</button>`;
    container.appendChild(chip);
  }

  if (customInput) customInput.value = "";
  updatePowerCostPreview();
};

window.updateStandaloneSenseUI = function() {
  const sel = document.getElementById("senses-standalone-select");
  const customGroup = document.getElementById("senses-standalone-custom-group");
  if (!sel || !customGroup) return;

  const val = sel.value;
  const needsCustom = val.startsWith("Custom") || val.startsWith("Detect") || val.startsWith("Communication Link");
  customGroup.style.display = needsCustom ? "block" : "none";
};

window.addStandaloneSenseOption = function() {
  const sel = document.getElementById("senses-standalone-select");
  const customInput = document.getElementById("senses-standalone-custom-input");
  const ranksInput = document.getElementById("power-input-ranks");
  const nameInput = document.getElementById("power-input-name");
  const descInput = document.getElementById("power-input-desc");
  const container = document.getElementById("senses-added-items");
  if (!sel || !sel.value) return;

  const [rawName, rankStr] = sel.value.split(":");
  const addedRanks = parseInt(rankStr, 10) || 1;
  const customVal = customInput ? customInput.value.trim() : "";

  let label = rawName;
  if (customVal) {
    label = `${rawName} (${customVal})`;
  }

  // 1. Increment power ranks
  const curRanks = parseInt(ranksInput && ranksInput.value ? ranksInput.value : "0", 10) || 0;
  const newRanks = curRanks + addedRanks;
  if (ranksInput) ranksInput.value = newRanks;

  // 2. Append to power description
  const entryDesc = `${label} (${addedRanks} ${addedRanks === 1 ? 'rank' : 'ranks'})`;
  if (descInput) {
    const prev = descInput.value.trim();
    if (!prev || prev === "Senses" || prev.startsWith("Senses:")) {
      if (!prev || prev === "Senses") {
        descInput.value = `Senses: ${entryDesc}`;
      } else {
        descInput.value = `${prev}, ${entryDesc}`;
      }
    } else {
      descInput.value = `${prev}, ${entryDesc}`;
    }
  }

  // 3. Update power name
  if (nameInput) {
    if (!nameInput.value || nameInput.value === "Senses" || nameInput.value.startsWith("Senses:")) {
      if (!nameInput.value || nameInput.value === "Senses") {
        nameInput.value = `Senses: ${label}`;
      } else if (!nameInput.value.includes(rawName)) {
        nameInput.value = `${nameInput.value}, ${label}`;
      }
    }
  }

  // 4. Add removable chip
  if (container) {
    const chip = document.createElement("span");
    chip.className = "power-chip";
    chip.style.display = "inline-flex";
    chip.style.alignItems = "center";
    chip.style.gap = "6px";
    chip.innerHTML = `+ ${escapeAttr(label)} (${addedRanks}r) <button type="button" class="btn-remove-chip" onclick="removeSensesItem(this, ${addedRanks}, '${escapeAttr(label)}')">&times;</button>`;
    container.appendChild(chip);
  }

  if (typeof syncSensesTargetDropdown === "function") {
    syncSensesTargetDropdown();
  }

  if (customInput) customInput.value = "";
  updatePowerCostPreview();
};

window.removeSensesItem = function(buttonEl, ranks, label) {
  const ranksInput = document.getElementById("power-input-ranks");
  const descInput = document.getElementById("power-input-desc");

  // 1. Decrement ranks
  if (ranksInput) {
    const cur = parseInt(ranksInput.value || "0", 10) || 0;
    ranksInput.value = Math.max(0, cur - ranks);
  }

  // 2. Remove from description
  if (descInput) {
    let text = descInput.value;
    text = text.split(", ").filter(part => !part.includes(label)).join(", ");
    if (!text || text === "Senses:") text = "";
    descInput.value = text;
  }

  // 3. Remove chip element
  const chip = buttonEl?.closest(".power-chip");
  if (chip) chip.remove();

  if (typeof syncSensesTargetDropdown === "function") {
    syncSensesTargetDropdown();
  }

  updatePowerCostPreview();
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
  // Motivation dropdown (populated from rules with "Other" option)
  const motSelect = document.getElementById("char-motivation-select");
  if (motSelect && VALIANT_DATA.backgroundPresets?.motivations) {
    const list = VALIANT_DATA.backgroundPresets.motivations;
    let html = list.map(m => `<option value="${escapeAttr(m.name)}">${m.name}</option>`).join("");
    html += `<option value="Other">Other</option>`;
    motSelect.innerHTML = html;
  }

  // Complication categories dropdown (populated from rules with "Other" option)
  const compCatSelect = document.getElementById("select-complication-category");
  if (compCatSelect && VALIANT_DATA.backgroundPresets?.complicationCategories) {
    const list = VALIANT_DATA.backgroundPresets.complicationCategories;
    let html = list.map(c => `<option value="${escapeAttr(c.name)}">${c.name}</option>`).join("");
    html += `<option value="Other">Other</option>`;
    compCatSelect.innerHTML = html;
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


// =====================================================================
// COLLAPSIBLE TABLES TAB CONTROLS
// =====================================================================
function handleToggleAllTables() {
  const cards = document.querySelectorAll(".collapsible-table-card");
  const anyOpen = Array.from(cards).some(c => c.classList.contains("open"));
  
  cards.forEach(card => {
    if (anyOpen) {
      card.classList.remove("open");
    } else {
      card.classList.add("open");
    }
  });
  updateCollapseAllButtonState();
}

function updateCollapseAllButtonState() {
  const btn = document.getElementById("btn-toggle-all-tables");
  if (!btn) return;
  const cards = document.querySelectorAll(".collapsible-table-card");
  const anyOpen = Array.from(cards).some(c => c.classList.contains("open"));
  if (anyOpen) {
    btn.textContent = "▲ Collapse All";
  } else {
    btn.textContent = "▼ Expand All";
  }
}

window.removeComplication = function(index) {
  if (currentCharacter && currentCharacter.complicationsList) {
    currentCharacter.complicationsList.splice(index, 1);
    saveAndRender();
  }
};

window.checkForUpdates = checkForUpdates;
window.setupAutoUpdateTimer = setupAutoUpdateTimer;
window.applyApplicationUpdate = applyApplicationUpdate;
window.CURRENT_APP_VERSION = CURRENT_APP_VERSION;
window.isNewerVersion = isNewerVersion;
window.getAutoUpdateTimerId = () => autoUpdateTimerId;

if (typeof addImmunitySetting !== "undefined") window.addImmunitySetting = addImmunitySetting;

window.getCurrentCharacter = () => currentCharacter;
window.setCurrentCharacter = (c) => { currentCharacter = c; };
window.renderPowers = renderPowers;


// =====================================================================
// SESSION TAB & COMPACT DICE ROLLER IMPLEMENTATION (v1.2.0)
// =====================================================================

function formatRollResult(trait, rank, adjustment, roll, total) {
  const adjSign = adjustment >= 0 ? "+" : "-";
  const adjVal = Math.abs(adjustment);
  // ⭐ symbolizes trait rank, 🎲 symbolizes random die roll
  const suffix = ` ⭐${rank} ${adjSign} ${adjVal} + 🎲${roll} = ${total}`;
  const maxTraitLen = 48 - suffix.length;
  let cleanTrait = trait;
  if (cleanTrait.length > maxTraitLen) {
    cleanTrait = cleanTrait.substring(0, Math.max(3, maxTraitLen - 1)) + "…";
  }
  let res = `${cleanTrait}${suffix}`;
  if (res.length > 48) {
    res = res.substring(0, 48);
  }
  return res;
}

function recordRoll(formattedText, isCritical, critType) {
  // Save previous roll into history (up to 10 previous rolls)
  if (lastRollOutput) {
    rollHistory.unshift({
      text: lastRollOutput,
      isCritical: lastRollIsCritical,
      critType: lastRollCritType
    });
    if (rollHistory.length > 10) {
      rollHistory.pop();
    }
    updateSessionHistoryDropdown();
  }

  lastRollOutput = formattedText;
  lastRollIsCritical = isCritical;
  lastRollCritType = critType;
  isTypingDiceInput = false;

  const outputInput = document.getElementById("session-roller-output");
  if (outputInput) {
    outputInput.value = formattedText;
    applyCriticalStyleToRoller(critType);
  }

  // Echo roll to active Discord webhook
  sendToActiveDiscordWebhook({
    content: `🎲 **${currentCharacter?.name || "Hero"}** rolled: \`${formattedText}\``
  });
}

function applyCriticalStyleToRoller(critType) {
  const outputInput = document.getElementById("session-roller-output");
  if (!outputInput) return;
  outputInput.classList.remove("is-critical-success", "is-critical-fail");
  if (critType === "success") {
    outputInput.classList.add("is-critical-success");
  } else if (critType === "fumble") {
    outputInput.classList.add("is-critical-fail");
  }
}

function updateSessionHistoryDropdown() {
  const sel = document.getElementById("session-roll-history");
  const listEl = document.getElementById("session-history-items-list");
  const countEl = document.getElementById("session-history-count");

  if (countEl) {
    countEl.textContent = `${rollHistory.length}`;
  }

  if (sel) {
    if (rollHistory.length === 0) {
      sel.innerHTML = '<option value="" disabled selected>📜 History (0)</option>';
    } else {
      let html = `<option value="" disabled selected>📜 History (${rollHistory.length})</option>`;
      rollHistory.forEach((r, idx) => {
        let prefix = r.isCritical ? (r.critType === "success" ? "★ CRIT 20: " : "⚠ NAT 1: ") : "";
        let optText = `${prefix}${r.text}`;
        if (optText.length > 48) {
          optText = optText.substring(0, 47) + "…";
        }
        html += `<option value="${idx}">${escapeAttr(optText)}</option>`;
      });
      sel.innerHTML = html;
    }
  }

  if (listEl) {
    if (rollHistory.length === 0) {
      listEl.innerHTML = '<div class="session-history-empty">No previous rolls</div>';
    } else {
      listEl.innerHTML = rollHistory.map((r, idx) => {
        const critClass = r.isCritical ? (r.critType === "success" ? "is-crit-success" : "is-crit-fail") : "";
        const badge = r.isCritical ? (r.critType === "success" ? "⭐ CRIT: " : "⚠ NAT 1: ") : "";
        return `
          <div class="session-history-item ${critClass}" onclick="selectRollFromHistory(${idx})" title="Restore this roll result">
            <span>${badge}${escapeAttr(r.text)}</span>
          </div>
        `;
      }).join("");
    }
  }
}

window.selectRollFromHistory = function(idx) {
  const item = rollHistory[idx];
  if (!item) return;
  const input = document.getElementById("session-roller-output");
  if (input) {
    input.value = item.text;
    applyCriticalStyleToRoller(item.critType);
    lastRollOutput = item.text;
    lastRollIsCritical = item.isCritical;
    lastRollCritType = item.critType;
    isTypingDiceInput = false;
  }
  const menu = document.getElementById("session-history-menu");
  if (menu) menu.style.display = "none";
};

window.rollSessionTrait = function(traitName, rank, options = {}) {
  const adjInput = document.getElementById("session-roll-adjustment");
  const userAdj = parseInt(adjInput?.value || "0", 10) || 0;
  
  let totalAdj = userAdj;
  if (options.isToughness) {
    const damagePenalty = currentCharacter?.bruises || 0;
    totalAdj = userAdj - damagePenalty;
  }

  if (options.take10) {
    const roll = 10;
    const total = rank + totalAdj + roll;
    const formatted = formatRollResult(`${traitName} (Routine)`, rank, totalAdj, roll, total);
    recordRoll(formatted, false, null);
    return;
  }

  const roll = Math.floor(Math.random() * 20) + 1;
  const total = rank + totalAdj + roll;
  const isCrit = (roll === 20 || roll === 1);
  const critType = roll === 20 ? "success" : (roll === 1 ? "fumble" : null);

  const formatted = formatRollResult(traitName, rank, totalAdj, roll, total);
  recordRoll(formatted, isCrit, critType);
};

function executeDiceNotationRoll(notation) {
  notation = notation.trim();
  const adjInput = document.getElementById("session-roll-adjustment");
  const totalAdj = parseInt(adjInput?.value || "0", 10) || 0;

  // Match expressions like "d20", "1d20+5", "2d6-1", "d100", "+5", "12"
  const diceMatch = notation.match(/^(\d*)d(\d+)(?:\s*([+-]\s*\d+))?$/i);
  if (diceMatch) {
    const numDice = diceMatch[1] ? Math.max(1, parseInt(diceMatch[1], 10)) : 1;
    const sides = parseInt(diceMatch[2], 10);
    const bonus = diceMatch[3] ? parseInt(diceMatch[3].replace(/\s+/g, ""), 10) : 0;

    let rollSum = 0;
    for (let i = 0; i < Math.min(50, numDice); i++) {
      rollSum += Math.floor(Math.random() * sides) + 1;
    }

    const total = bonus + totalAdj + rollSum;
    let traitName = numDice === 1 && sides === 20 ? "d20" : `${numDice}d${sides}`;
    
    let isCrit = false;
    let critType = null;
    if (numDice === 1 && sides === 20) {
      if (rollSum === 20) { isCrit = true; critType = "success"; }
      else if (rollSum === 1) { isCrit = true; critType = "fumble"; }
    }

    const formatted = formatRollResult(traitName, bonus, totalAdj, rollSum, total);
    recordRoll(formatted, isCrit, critType);
    return;
  }

  // Check flat modifier like "+5" or "-2" or "5"
  const flatMatch = notation.match(/^([+-]?\s*\d+)$/);
  if (flatMatch) {
    const bonus = parseInt(flatMatch[1].replace(/\s+/g, ""), 10);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = bonus + totalAdj + roll;
    const isCrit = (roll === 20 || roll === 1);
    const critType = roll === 20 ? "success" : (roll === 1 ? "fumble" : null);

    const formatted = formatRollResult("d20", bonus, totalAdj, roll, total);
    recordRoll(formatted, isCrit, critType);
    return;
  }

  // Fallback: standard 1d20 roll with custom label
  const roll = Math.floor(Math.random() * 20) + 1;
  const total = 0 + totalAdj + roll;
  const isCrit = (roll === 20 || roll === 1);
  const critType = roll === 20 ? "success" : (roll === 1 ? "fumble" : null);
  const formatted = formatRollResult(notation, 0, totalAdj, roll, total);
  recordRoll(formatted, isCrit, critType);
}

function initSessionRollerInput() {
  const container = document.getElementById("session-roller-cards-container");
  if (container && !container.dataset.hasListener) {
    container.dataset.hasListener = "true";
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".roller-card");
      if (!card) return;
      const trait = card.getAttribute("data-roll-trait") || card.querySelector(".roller-card-title")?.textContent || "Roll";
      const rank = parseInt(card.getAttribute("data-roll-rank") || "0", 10) || 0;
      const isToughness = card.getAttribute("data-is-toughness") === "true";
      const take10 = card.getAttribute("data-take-10") === "true";
      rollSessionTrait(trait, rank, { isToughness, take10 });
    });
  }

  const input = document.getElementById("session-roller-output");
  const historySel = document.getElementById("session-roll-history");
  const historyBtn = document.getElementById("session-history-dropdown-btn");
  const historyMenu = document.getElementById("session-history-menu");
  const btnRoundPlus = document.getElementById("btn-session-round-plus");
  const adjInput = document.getElementById("session-roll-adjustment");
  const btnMinus = document.getElementById("btn-session-adj-minus");
  const btnPlus = document.getElementById("btn-session-adj-plus");
  const btnReset = document.getElementById("btn-session-adj-reset");

  if (historyBtn && historyMenu && !historyBtn.dataset.hasListener) {
    historyBtn.dataset.hasListener = "true";
    historyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      historyMenu.style.display = historyMenu.style.display === "none" ? "block" : "none";
    });
  }

  if (!document.body.dataset.hasHistoryMenuListener) {
    document.body.dataset.hasHistoryMenuListener = "true";
    document.addEventListener("click", (e) => {
      const wrap = document.getElementById("session-roller-field-wrap");
      const menu = document.getElementById("session-history-menu");
      if (menu && wrap && !wrap.contains(e.target)) {
        menu.style.display = "none";
      }
    });
  }

  if (btnRoundPlus && !btnRoundPlus.dataset.hasListener) {
    btnRoundPlus.dataset.hasListener = "true";
    btnRoundPlus.addEventListener("click", () => {
      advanceSessionRound();
    });
  }

  if (btnMinus && adjInput) {
    btnMinus.onclick = () => {
      const cur = parseInt(adjInput.value || "0", 10) || 0;
      adjInput.value = cur - 1;
    };
  }
  if (btnPlus && adjInput) {
    btnPlus.onclick = () => {
      const cur = parseInt(adjInput.value || "0", 10) || 0;
      adjInput.value = cur + 1;
    };
  }
  if (btnReset && adjInput) {
    btnReset.onclick = () => {
      adjInput.value = 0;
    };
  }

  if (historySel) {
    historySel.onchange = () => {
      const idx = parseInt(historySel.value, 10);
      if (!isNaN(idx) && rollHistory[idx]) {
        const item = rollHistory[idx];
        if (input) {
          input.value = item.text;
          applyCriticalStyleToRoller(item.critType);
          lastRollOutput = item.text;
          lastRollIsCritical = item.isCritical;
          lastRollCritType = item.critType;
          isTypingDiceInput = false;
        }
      }
    };
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      // ESC restores previous content
      if (e.key === "Escape") {
        e.preventDefault();
        if (isTypingDiceInput) {
          input.value = lastRollOutput;
          applyCriticalStyleToRoller(lastRollCritType);
          isTypingDiceInput = false;
          input.blur();
        }
        return;
      }

      // ENTER evaluates dice notation
      if (e.key === "Enter") {
        e.preventDefault();
        const expr = input.value.trim();
        if (expr) {
          executeDiceNotationRoll(expr);
        } else {
          input.value = lastRollOutput;
          applyCriticalStyleToRoller(lastRollCritType);
        }
        isTypingDiceInput = false;
        input.blur();
        return;
      }

      // Typing in the field clears it for the text being typed
      if (!isTypingDiceInput && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        input.value = "";
        applyCriticalStyleToRoller(null);
        isTypingDiceInput = true;
      } else if (!isTypingDiceInput && (e.key === "Backspace" || e.key === "Delete")) {
        input.value = "";
        applyCriticalStyleToRoller(null);
        isTypingDiceInput = true;
        e.preventDefault();
      }
    });

    input.addEventListener("paste", () => {
      if (!isTypingDiceInput) {
        input.value = "";
        applyCriticalStyleToRoller(null);
        isTypingDiceInput = true;
      }
    });

    input.addEventListener("blur", () => {
      if (isTypingDiceInput && !input.value.trim()) {
        input.value = lastRollOutput;
        applyCriticalStyleToRoller(lastRollCritType);
        isTypingDiceInput = false;
      }
    });
  }

  renderSessionTab();
}


// =====================================================================
// FADING EFFECTS & COMBAT ROUND ADVANCEMENT (v1.3.0)
// =====================================================================
window.sessionCurrentRound = 1;

window.advanceSessionRound = function() {
  window.sessionCurrentRound = (window.sessionCurrentRound || 1) + 1;
  const badge = document.getElementById("session-round-badge");
  if (badge) badge.textContent = `R${window.sessionCurrentRound}`;

  const fadingPowers = (currentCharacter?.powers || []).filter(p => {
    return (p.flaws && p.flaws.some(f => (typeof f === 'string' ? f : f.name).toLowerCase().includes("fade"))) || p.hasFade;
  });

  const fadeStatuses = [];
  fadingPowers.forEach(p => {
    const cur = p.effectiveRank !== undefined ? p.effectiveRank : (p.ranks || 1);
    const next = Math.max(0, cur - 1);
    p.effectiveRank = next;
    if (next === 0) p.fadeActive = false;
    fadeStatuses.push(`• **${p.name}**: Effective Rank **${next}** / ${p.ranks || 1}${next === 0 ? ' *(Depleted)*' : ''}`);
  });

  saveAndRender();

  // Discord echo if active server has echoFading enabled
  const activeId = getActiveDiscordServerId();
  const servers = getDiscordServers();
  const srv = servers.find(s => s.id === activeId);
  if (srv && srv.echoFading && fadeStatuses.length > 0) {
    const charName = currentCharacter?.name || "Hero";
    const msg = `⏱️ **Round ${window.sessionCurrentRound}** Fading Effects for **${charName}**:
${fadeStatuses.join('\n')}`;
    sendToActiveDiscordWebhook({ content: msg });
  }
};

window.startFadePower = function(idx) {
  const pow = currentCharacter?.powers?.[idx];
  if (!pow) return;
  const maxRank = pow.ranks || 1;
  pow.effectiveRank = maxRank;
  pow.fadeActive = true;
  saveAndRender();

  const activeId = getActiveDiscordServerId();
  const servers = getDiscordServers();
  const srv = servers.find(s => s.id === activeId);
  if (srv && srv.echoFading) {
    const charName = currentCharacter?.name || "Hero";
    sendToActiveDiscordWebhook({
      content: `⚡ **${charName}** activated **${pow.name}** at full strength (Effective Rank **${maxRank}**)! `
    });
  }
};

window.stopFadePower = function(idx) {
  const pow = currentCharacter?.powers?.[idx];
  if (!pow) return;
  pow.fadeActive = false;
  pow.effectiveRank = 0;
  saveAndRender();
};

window.adjustFadeRank = function(idx, delta) {
  const pow = currentCharacter?.powers?.[idx];
  if (!pow) return;
  const maxRank = pow.ranks || 1;
  const cur = pow.effectiveRank !== undefined ? pow.effectiveRank : maxRank;
  let next = cur + delta;
  if (next < 0) next = 0;
  if (next > maxRank) next = maxRank;
  pow.effectiveRank = next;
  pow.fadeActive = (next > 0);
  saveAndRender();
};

function renderSessionTab() {
  const container = document.getElementById("session-roller-cards-container");
  if (!container) return;

  const char = currentCharacter || {
    abilities: { STR: 0, STA: 0, AGL: 0, DEX: 0, FGT: 0, INT: 0, AWE: 0, PRE: 0 },
    defenses: { Dodge: 0, Parry: 0, Fortitude: 0, Toughness: 0, Will: 0 },
    skills: {},
    advantages: [],
    powers: [],
    bruises: 0
  };

  const ab = char.abilities || {};
  const def = char.defenses || {};
  const bruises = char.bruises || 0;

  // Calculate Defenses
  const dodgeTotal = (ab.AGL || 0) + (def.Dodge || 0);
  const parryTotal = (ab.FGT || 0) + (def.Parry || 0);
  const fortTotal = (ab.STA || 0) + (def.Fortitude || 0);
  const toughTotal = (ab.STA || 0) + (def.Toughness || 0);
  const willTotal = (ab.AWE || 0) + (def.Will || 0);

  // Initiative calculation
  let improvedInitBonus = 0;
  if (Array.isArray(char.advantages)) {
    char.advantages.forEach(adv => {
      const advName = typeof adv === "string" ? adv : (adv.name || "");
      if (advName.startsWith("Improved Initiative")) {
        const rMatch = advName.match(/(\d+)/);
        const r = rMatch ? parseInt(rMatch[1], 10) : 1;
        improvedInitBonus += r * 4;
      }
    });
  }
  const initTotal = (ab.AGL || 0) + improvedInitBonus;

  let html = ``;

  // 1. Quick Rolls & Defenses Section
  html += `
    <div class="session-section">
      <div class="session-section-header">
        <span>⚔️ Combat &amp; Defenses</span>
      </div>
      <div class="session-cards-grid">
        <button type="button" class="roller-card" data-roll-trait="Initiative" data-roll-rank="${initTotal}" onclick="rollSessionTrait('Initiative', ${initTotal})" title="Roll Initiative (AGL ${ab.AGL || 0}${improvedInitBonus ? ' + Init Adv ' + improvedInitBonus : ''})">
          <span class="roller-card-title">Initiative</span>
          <span class="roller-card-rank">${initTotal >= 0 ? '+' + initTotal : initTotal}</span>
          <span class="roller-card-sub">AGL ${improvedInitBonus ? '+ Adv' : ''}</span>
        </button>

        <button type="button" class="roller-card" data-roll-trait="Toughness" data-roll-rank="${toughTotal}" data-is-toughness="true" onclick="rollSessionTrait('Toughness', ${toughTotal}, { isToughness: true })" title="Damage Resistance Check (Toughness ${toughTotal} ${bruises ? '- ' + bruises + ' Damage' : ''})">
          <span class="roller-card-title">Toughness</span>
          <span class="roller-card-rank">${toughTotal >= 0 ? '+' + toughTotal : toughTotal}</span>
          <span class="roller-card-sub">${bruises > 0 ? 'Dmg Penalty -' + bruises : 'STA Check'}</span>
        </button>

        <button type="button" class="roller-card" data-roll-trait="Dodge" data-roll-rank="${dodgeTotal}" onclick="rollSessionTrait('Dodge', ${dodgeTotal})" title="Dodge Defense Check">
          <span class="roller-card-title">Dodge</span>
          <span class="roller-card-rank">${dodgeTotal >= 0 ? '+' + dodgeTotal : dodgeTotal}</span>
          <span class="roller-card-sub">AGL Base</span>
        </button>

        <button type="button" class="roller-card" data-roll-trait="Parry" data-roll-rank="${parryTotal}" onclick="rollSessionTrait('Parry', ${parryTotal})" title="Parry Defense Check">
          <span class="roller-card-title">Parry</span>
          <span class="roller-card-rank">${parryTotal >= 0 ? '+' + parryTotal : parryTotal}</span>
          <span class="roller-card-sub">FGT Base</span>
        </button>

        <button type="button" class="roller-card" data-roll-trait="Fortitude" data-roll-rank="${fortTotal}" onclick="rollSessionTrait('Fortitude', ${fortTotal})" title="Fortitude Resistance Check">
          <span class="roller-card-title">Fortitude</span>
          <span class="roller-card-rank">${fortTotal >= 0 ? '+' + fortTotal : fortTotal}</span>
          <span class="roller-card-sub">STA Base</span>
        </button>

        <button type="button" class="roller-card" data-roll-trait="Will" data-roll-rank="${willTotal}" onclick="rollSessionTrait('Will', ${willTotal})" title="Will Resistance Check">
          <span class="roller-card-title">Will</span>
          <span class="roller-card-rank">${willTotal >= 0 ? '+' + willTotal : willTotal}</span>
          <span class="roller-card-sub">AWE Base</span>
        </button>

        <button type="button" class="roller-card" data-roll-trait="Flat d20" data-roll-rank="0" onclick="rollSessionTrait('Flat d20', 0)" title="Unmodified Flat d20 Check">
          <span class="roller-card-title">Flat d20</span>
          <span class="roller-card-rank">+0</span>
          <span class="roller-card-sub">DC Check</span>
        </button>

        <button type="button" class="roller-card" data-roll-trait="Routine" data-roll-rank="0" data-take-10="true" onclick="rollSessionTrait('Routine', 0, { take10: true })" title="Routine Check (Take 10)">
          <span class="roller-card-title">Routine</span>
          <span class="roller-card-rank">10</span>
          <span class="roller-card-sub">Take 10</span>
        </button>
      </div>
    </div>
  `;

  // 2. Abilities Section
  const abilityOrder = [
    { key: "STR", name: "Strength" },
    { key: "STA", name: "Stamina" },
    { key: "AGL", name: "Agility" },
    { key: "DEX", name: "Dexterity" },
    { key: "FGT", name: "Fighting" },
    { key: "INT", name: "Intellect" },
    { key: "AWE", name: "Awareness" },
    { key: "PRE", name: "Presence" }
  ];

  html += `
    <div class="session-section">
      <div class="session-section-header">
        <span>💪 Core Abilities</span>
      </div>
      <div class="session-cards-grid">
  `;

  abilityOrder.forEach(item => {
    const r = ab[item.key] || 0;
    html += `
      <button type="button" class="roller-card" data-roll-trait="${item.name} (${item.key})" data-roll-rank="${r}" onclick="rollSessionTrait('${item.name} (${item.key})', ${r})" title="Roll ${item.name} Check">
        <span class="roller-card-title">${item.key}</span>
        <span class="roller-card-rank">${r >= 0 ? '+' + r : r}</span>
        <span class="roller-card-sub">${item.name}</span>
      </button>
    `;
  });

  html += `
      </div>
    </div>
  `;

  // 3. Skills Section (Filtered: untrained skills OR skills with bought ranks)
  const UNTRAINED_SKILLS = new Set([
    "Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Persuasion", "Stealth"
  ]);

  const skillEntries = Object.entries(char.skills || {}).filter(([skillName, boughtRank]) => {
    if (boughtRank > 0) return true;
    let baseKey = skillName;
    if (!VALIANT_DATA.skills[baseKey]) {
      for (const k of Object.keys(VALIANT_DATA.skills)) {
        if (skillName.startsWith(k)) {
          baseKey = k;
          break;
        }
      }
    }
    if (baseKey === "Expertise" || baseKey.startsWith("Close Combat") || baseKey.startsWith("Ranged Combat")) {
      return false;
    }
    if (UNTRAINED_SKILLS.has(baseKey)) return true;
    const def = VALIANT_DATA.skills[baseKey];
    return !!(def && def.trainedOnly === false);
  });

  if (skillEntries.length > 0) {
    html += `
      <div class="session-section">
        <div class="session-section-header">
          <span>🎯 Available Skills &amp; Specialties</span>
        </div>
        <div class="session-cards-grid">
    `;

    skillEntries.forEach(([skillName, boughtRank]) => {
      let abilityKey = "AGL";
      if (VALIANT_DATA.skills[skillName]) {
        abilityKey = VALIANT_DATA.skills[skillName].ability;
      } else {
        for (const [k, v] of Object.entries(VALIANT_DATA.skills)) {
          if (skillName.startsWith(k)) {
            abilityKey = v.ability;
            break;
          }
        }
      }
      const abilityMod = ab[abilityKey] || 0;
      const totalSkillMod = abilityMod + (boughtRank || 0);

      html += `
        <button type="button" class="roller-card" data-roll-trait="${escapeAttr(skillName)}" data-roll-rank="${totalSkillMod}" onclick="rollSessionTrait('${escapeAttr(skillName)}', ${totalSkillMod})" title="Roll ${escapeAttr(skillName)} Check (${abilityKey} ${abilityMod} + Rank ${boughtRank})">
          <span class="roller-card-title">${escapeAttr(skillName)}</span>
          <span class="roller-card-rank">${totalSkillMod >= 0 ? '+' + totalSkillMod : totalSkillMod}</span>
          <span class="roller-card-sub">${abilityKey} (${boughtRank}r)</span>
        </button>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  // 4. Powers & Effects Section (Checks requiring rolls or Fading trackers)
  const sessionPowers = (char.powers || []).map((p, idx) => ({ pow: p, idx })).filter(({ pow }) => {
    const eff = pow.effect || "";
    const hasFade = (pow.flaws && pow.flaws.some(f => (typeof f === 'string' ? f : f.name).toLowerCase().includes("fade"))) || pow.hasFade;
    const checkRequired = [
      "Damage", "Affliction", "Blast", "Weaken", "Move Object", "Snare", "Nullify",
      "Mind Control", "Illusion", "Transform", "Healing", "Deflect", "Summon", "Trip", "Disarm"
    ].includes(eff) || (pow.name && pow.name.toLowerCase().includes("attack")) || hasFade;
    return checkRequired;
  });

  if (sessionPowers.length > 0) {
    html += `
      <div class="session-section">
        <div class="session-section-header">
          <span>💥 Powers &amp; Combat Effects</span>
        </div>
        <div class="session-cards-grid">
    `;

    sessionPowers.forEach(({ pow, idx }) => {
      const isActive = pow.active !== false;
      const hasFade = (pow.flaws && pow.flaws.some(f => (typeof f === 'string' ? f : f.name).toLowerCase().includes("fade"))) || pow.hasFade;
      const maxRank = pow.ranks || 1;
      const effectiveRank = pow.effectiveRank !== undefined ? pow.effectiveRank : maxRank;
      const powName = pow.name || "Power Effect";

      if (hasFade) {
        html += `
          <div class="fade-tracker-card ${isActive ? '' : 'power-inactive'}">
            <div class="fade-tracker-top">
              <span class="fade-tracker-title">${escapeAttr(powName)}</span>
              <span class="fade-tracker-effective">${effectiveRank} / ${maxRank} r</span>
            </div>
            <button type="button" class="roller-card" style="width: 100%; margin: 2px 0;" onclick="${isActive ? `rollSessionTrait('${escapeAttr(powName)}', ${effectiveRank})` : `alert('Power is inactive')`}" title="Roll ${escapeAttr(powName)} (Effective Rank ${effectiveRank})">
              <span class="roller-card-title">Roll ${escapeAttr(pow.effect || 'Effect')}</span>
              <span class="roller-card-rank">+${effectiveRank}</span>
              <span class="roller-card-sub">Effective Rank</span>
            </button>
            <div class="fade-tracker-controls">
              <div class="fade-tracker-stepper">
                <button type="button" class="btn-mini-counter" onclick="adjustFadeRank(${idx}, -1)" title="Decrease effective rank by 1">-</button>
                <button type="button" class="btn-mini-counter" onclick="adjustFadeRank(${idx}, 1)" title="Increase effective rank by 1">+</button>
              </div>
              <button type="button" class="btn-fade-action start" onclick="startFadePower(${idx})" title="Activate effect at full strength (${maxRank})">Start</button>
              ${pow.duration !== "Permanent" ? `<button type="button" class="btn-fade-action stop" onclick="stopFadePower(${idx})" title="Cancel / stop effect">Stop</button>` : ''}
            </div>
          </div>
        `;
      } else {
        html += `
          <button type="button" class="roller-card ${isActive ? '' : 'power-inactive'}" onclick="${isActive ? `rollSessionTrait('${escapeAttr(powName)}', ${effectiveRank})` : `alert('Power is inactive')`}" title="Roll ${escapeAttr(powName)} Check">
            <span class="roller-card-title">${escapeAttr(powName)}</span>
            <span class="roller-card-rank">+${effectiveRank}</span>
            <span class="roller-card-sub">${pow.effect || 'Power'} R${maxRank}${isActive ? '' : ' [OFF]'}</span>
          </button>
        `;
      }
    });

    html += `
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}
window.renderSessionTab = renderSessionTab;
