# Valiant Adventures RPG - Character Creator

A web-based character creation application built for the **Valiant Adventures Tabletop RPG** (Green Ronin Publishing / Mutants & Masterminds 3rd Edition engine).

---

## Features

### 1. Persistent Top Rows
- **Top Row**:
  - **Program Title**: `VALIANT Adventures RPG // Character Creator`
  - **Character Menu**:
    - **New Character**: Starts a fresh build with customizable Power Level (PL).
    - **Load Character**: Load from `.valiant` / `.json` files, browser localStorage slots, or pre-configured official archetypes (Bloodshot, X-O Manowar, Harbinger Psiot, Ninjak).
    - **Save Character File**: Saves to browser storage and downloads a `.valiant` character file.
    - **Rename Character File**: Edit and update the character's active alias/file name.
    - **Export Character**: Export to **ODF** (`.fodt` OpenDocument Flat XML for LibreOffice/Word/Docs) or **PDF** (printable dossier layout).
    - **Delete Character File**: Confirm and remove the current character file.
  - **Settings Button**:
    - Popup modal allowing configuration of **UI Visual Themes** (*Valiant Dark, Bloodshot Crimson, Harbinger Cyan, X-O Gold, Deadside Violet, Comic Classic Light*), **Font Scale** (*Compact, Standard, Large, Extra Large*), **Default Character Folder**, and **Default Power Level**.

- **Second Row**:
  - **Leftwards Summary**:
    - **Character Name & Concept / PL**
    - **Total Power Points (PP) Used** vs. **Total PL Budget**
    - **PP Left / Remaining** (turns red when over budget)
    - **Hero Points (HP) Remaining** with `+` and `-` tracker buttons
    - **Bruises / Damage Track** counter
  - **Rightwards Tabs**:
    - **Character Builder**
    - **Tables** (Measurements Table, DC Benchmarks, Damage Track)
    - **Help & Reference** (System walkthrough, creation checklist, pre-made archetypes)

---

### 2. Character Builder Sections
All sections are collapsible accordions with interactive counters and point tracking:
1. **Core Abilities & Defenses**:
   - Strength (STR), Stamina (STA), Agility (AGL), Dexterity (DEX), Fighting (FGT), Intellect (INT), Awareness (AWE), Presence (PRE) at 2 PP per rank.
   - Derived Defenses: Dodge, Parry, Fortitude, Toughness, Will at 1 PP per extra bought rank.
2. **Skills**:
   - 16 core skills at 0.5 PP per rank (1 PP per 2 ranks), plus the ability to add custom specialties for Close Combat, Ranged Combat, and Expertise.
3. **Advantages**:
   - 45+ advantages across Combat, Fortune, General, and Skill categories.
   - Integrated dropdown selector with a dedicated **`?`** description button to preview advantages before adding them.
4. **Powers Studio**:
   - Select from 35+ base power effects (Blast, Flight, Protection, Regeneration, Nanite Swarm / Control, Mind Reading, Teleport, etc.).
   - Interactive Extras and Flaws modifier pills with automatic PP-per-rank calculations.
5. **Gear & Equipment**:
   - Automatically tracks Equipment Points (5 EP per rank in the "Equipment" advantage).
   - Pre-loaded arsenal of weapons, armor, tactical gadgets, vehicles, and safehouses, plus custom item entry.

---

### 3. Trait Links and Description Popups
As specified, all traits throughout the app are accessible for instant reference:
- In lists and cards, trait names are clickable **links** and accompanied by **`?`** circular icons that open full lore and rules popups.
- On select dropdowns (where clicking selects an item), a dedicated **`?`** button is positioned right next to the menu to inspect details immediately.

---

## Running the Application

### Option A: Open directly in any Web Browser
Double-click `index.html` or drag it into Chrome, Edge, Firefox, or Safari. The app is completely self-contained and operates 100% offline.

### Option B: Run via Node.js Server
Open a terminal in this directory and run:
```bash
node server.js
```
Then visit [http://localhost:3000](http://localhost:3000) in your browser.
