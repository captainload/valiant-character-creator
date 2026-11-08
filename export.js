// Export functions for Valiant Adventures Character Creator
// Supports ODF (.fodt OpenDocument Flat XML), PDF (print sheet & export), and JSON (.valiant)

const ValiantExporter = {
  // Export character as ODF (Flat XML .fodt)
  exportODF(character) {
    const rawName = character.name || character.fileName || 'character';
    const cleanBase = rawName.replace(/\.valadv$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanBase}.fodt`;
    
    // Abilities table rows
    const abilityRows = Object.entries(VALIANT_DATA.abilities).map(([key, item]) => {
      const rank = character.abilities[key] || 0;
      const pts = rank * 2;
      return `
        <table:table-row>
          <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Bold">${escapeXML(item.name)}</text:p></table:table-cell>
          <table:table-cell office:value-type="float" office:value="${rank}"><text:p text:style-name="Table_20_Cell_20_Center">${rank}</text:p></table:table-cell>
          <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Center">${pts} PP</text:p></table:table-cell>
        </table:table-row>`;
    }).join('\n');

    // Defenses table rows
    const defenseRows = Object.entries(VALIANT_DATA.defenses).map(([key, item]) => {
      const base = character.abilities[item.ability] || 0;
      const extra = character.defenses[key] || 0;
      const total = base + extra;
      return `
        <table:table-row>
          <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Bold">${escapeXML(item.name)} (${item.ability})</text:p></table:table-cell>
          <table:table-cell office:value-type="float" office:value="${base}"><text:p text:style-name="Table_20_Cell_20_Center">${base}</text:p></table:table-cell>
          <table:table-cell office:value-type="float" office:value="${extra}"><text:p text:style-name="Table_20_Cell_20_Center">+${extra}</text:p></table:table-cell>
          <table:table-cell office:value-type="float" office:value="${total}"><text:p text:style-name="Table_20_Cell_20_Center_20_Bold">${total}</text:p></table:table-cell>
        </table:table-row>`;
    }).join('\n');

    // Skills
    const skillList = Object.entries(character.skills || {})
      .filter(([_, rank]) => rank > 0)
      .map(([name, rank]) => {
        const info = VALIANT_DATA.skills[name] || { ability: 'AGL' };
        const base = character.abilities[info.ability] || 0;
        const total = base + rank;
        return `<text:p text:style-name="Bullet_20_Item"><text:span text:style-name="Bold_20_Text">${escapeXML(name)}</text:span> (${info.ability}): +${total} (Rank ${rank})</text:p>`;
      }).join('\n') || '<text:p text:style-name="Standard">No trained skills.</text:p>';

    // Advantages
    const advantageList = (character.advantages || []).map(adv => {
      return `<text:p text:style-name="Bullet_20_Item"><text:span text:style-name="Bold_20_Text">${escapeXML(adv.name)}</text:span> (Rank ${adv.rank || 1})</text:p>`;
    }).join('\n') || '<text:p text:style-name="Standard">No advantages selected.</text:p>';

    // Powers
    const powerList = (character.powers || []).map(pow => {
      return `<text:p text:style-name="Power_20_Heading"><text:span text:style-name="Bold_20_Text">${escapeXML(pow.name)}</text:span> - ${escapeXML(pow.effect)} Rank ${pow.ranks || 1} [${pow.cost || 0} PP]</text:p>
              <text:p text:style-name="Power_20_Desc">${escapeXML(pow.details || '')}</text:p>`;
    }).join('\n') || '<text:p text:style-name="Standard">No powers recorded.</text:p>';

    // Gear
    const gearList = (character.gear || []).map(g => {
      return `<text:p text:style-name="Bullet_20_Item"><text:span text:style-name="Bold_20_Text">${escapeXML(g.name)}</text:span> [${g.costEP || 0} EP]: ${escapeXML(g.description || '')}</text:p>`;
    }).join('\n') || '<text:p text:style-name="Standard">No gear equipped.</text:p>';

    // Costs
    const costs = calculateCosts(character);

    const fodtContent = `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
 xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
 xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
 xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
 xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
 office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.text">
 <office:styles>
  <style:style style:name="Standard" style:family="paragraph" style:class="text">
   <style:text-properties fo:font-size="10.5pt" fo:font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fo:color="#1a1a1a"/>
  </style:style>
  <style:style style:name="Title" style:family="paragraph" style:class="chapter">
   <style:text-properties fo:font-size="22pt" fo:font-weight="bold" fo:color="#b91c1c" fo:font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif"/>
   <style:paragraph-properties fo:margin-bottom="4pt"/>
  </style:style>
  <style:style style:name="Subtitle" style:family="paragraph" style:class="chapter">
   <style:text-properties fo:font-size="13pt" fo:font-weight="bold" fo:color="#4b5563"/>
   <style:paragraph-properties fo:margin-bottom="12pt"/>
  </style:style>
  <style:style style:name="Section_20_Header" style:family="paragraph">
   <style:text-properties fo:font-size="14pt" fo:font-weight="bold" fo:color="#1e3a8a"/>
   <style:paragraph-properties fo:margin-top="10pt" fo:margin-bottom="4pt" fo:border-bottom="1.5pt solid #1e3a8a"/>
  </style:style>
  <style:style style:name="Table_20_Cell_20_Bold" style:family="paragraph">
   <style:text-properties fo:font-size="10pt" fo:font-weight="bold"/>
  </style:style>
  <style:style style:name="Table_20_Cell_20_Center" style:family="paragraph">
   <style:paragraph-properties fo:text-align="center"/>
   <style:text-properties fo:font-size="10pt"/>
  </style:style>
  <style:style style:name="Table_20_Cell_20_Center_20_Bold" style:family="paragraph">
   <style:paragraph-properties fo:text-align="center"/>
   <style:text-properties fo:font-size="10pt" fo:font-weight="bold" fo:color="#b91c1c"/>
  </style:style>
  <style:style style:name="Bold_20_Text" style:family="text">
   <style:text-properties fo:font-weight="bold"/>
  </style:style>
  <style:style style:name="Bullet_20_Item" style:family="paragraph">
   <style:paragraph-properties fo:margin-left="10pt" fo:margin-bottom="3pt"/>
  </style:style>
  <style:style style:name="Power_20_Heading" style:family="paragraph">
   <style:paragraph-properties fo:margin-top="6pt" fo:margin-bottom="2pt"/>
  </style:style>
  <style:style style:name="Power_20_Desc" style:family="paragraph">
   <style:paragraph-properties fo:margin-left="12pt" fo:margin-bottom="4pt"/>
   <style:text-properties fo:font-size="9.5pt" fo:color="#374151" fo:font-style="italic"/>
  </style:style>
 </office:styles>
 <office:body>
  <office:text>
   <text:p text:style-name="Title">VALIANT ADVENTURES RPG</text:p>
   <text:p text:style-name="Subtitle">${escapeXML(character.name || 'Unnamed Hero')} | Power Level ${character.pl || 10} | Hero Points: ${character.hpRemaining || 1}</text:p>
   
   <text:p text:style-name="Standard"><text:span text:style-name="Bold_20_Text">Real Name:</text:span> ${escapeXML(character.realName || 'Unknown')} | <text:span text:style-name="Bold_20_Text">Identity:</text:span> ${escapeXML(character.identity || 'Secret')} | <text:span text:style-name="Bold_20_Text">Archetype:</text:span> ${escapeXML(character.concept || 'Custom')}</text:p>
   <text:p text:style-name="Standard"><text:span text:style-name="Bold_20_Text">Motivation:</text:span> ${escapeXML(character.motivation || 'Justice / Survival')} | <text:span text:style-name="Bold_20_Text">Complications:</text:span> ${escapeXML(character.complications || 'None')}</text:p>
   <text:p text:style-name="Standard"><text:span text:style-name="Bold_20_Text">Power Points:</text:span> ${costs.totalUsed} Used / ${costs.totalBudget} Budget (${costs.remaining} Left) [Abilities: ${costs.abilities} | Skills: ${costs.skills} | Advantages: ${costs.advantages} | Powers: ${costs.powers} | Defenses: ${costs.defenses}]</text:p>

   <text:p text:style-name="Section_20_Header">CORE ABILITIES</text:p>
   <table:table table:name="AbilitiesTable">
    <table:table-column table:number-columns-repeated="1"/>
    <table:table-column table:number-columns-repeated="1"/>
    <table:table-column table:number-columns-repeated="1"/>
    <table:table-header-rows>
     <table:table-row>
      <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Bold">Ability</text:p></table:table-cell>
      <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Center">Rank</text:p></table:table-cell>
      <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Center">Points</text:p></table:table-cell>
     </table:table-row>
    </table:table-header-rows>
    ${abilityRows}
   </table:table>

   <text:p text:style-name="Section_20_Header">DEFENSES</text:p>
   <table:table table:name="DefensesTable">
    <table:table-column table:number-columns-repeated="1"/>
    <table:table-column table:number-columns-repeated="1"/>
    <table:table-column table:number-columns-repeated="1"/>
    <table:table-column table:number-columns-repeated="1"/>
    <table:table-header-rows>
     <table:table-row>
      <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Bold">Defense</text:p></table:table-cell>
      <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Center">Base</text:p></table:table-cell>
      <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Center">Bought</text:p></table:table-cell>
      <table:table-cell office:value-type="string"><text:p text:style-name="Table_20_Cell_20_Center_20_Bold">Total</text:p></table:table-cell>
     </table:table-row>
    </table:table-header-rows>
    ${defenseRows}
   </table:table>

   <text:p text:style-name="Section_20_Header">SKILLS</text:p>
   ${skillList}

   <text:p text:style-name="Section_20_Header">ADVANTAGES</text:p>
   ${advantageList}

   <text:p text:style-name="Section_20_Header">POWERS</text:p>
   ${powerList}

   <text:p text:style-name="Section_20_Header">GEAR &amp; EQUIPMENT</text:p>
   ${gearList}
  </office:text>
 </office:body>
</office:document>`;

    downloadBlob(fodtContent, filename, 'application/vnd.oasis.opendocument.text');
  },

  // Export as VALADV file (.valadv)
  exportVALADV(character, customFileName) {
    let filename = customFileName;
    if (!filename) {
      const trimmed = (character.name || '').trim();
      if (trimmed) {
        filename = `${trimmed.replace(/[/\\?%*:|"<>]/g, '_')}.valadv`;
      } else if (character.fileName) {
        filename = character.fileName.endsWith('.valadv') ? character.fileName : `${character.fileName}.valadv`;
      } else {
        filename = 'New character 1.valadv';
      }
    }
    const jsonStr = JSON.stringify(character, null, 2);
    downloadBlob(jsonStr, filename, 'application/json');
    return filename;
  },

  // Export as JSON (.valiant or .valadv character file)
  exportJSON(character) {
    return this.exportVALADV(character);
  },

  // Export to PDF by opening a clean, highly styled print preview that immediately invokes window.print()
  exportPDF(character) {
    // Generate clean printable document in an iframe or dedicated printable element
    const printContainer = document.getElementById('print-sheet-area');
    if (!printContainer) return;
    
    printContainer.innerHTML = generatePrintSheetHTML(character);
    window.print();
  }
};

function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function downloadBlob(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function calculateCosts(character) {
  if (!character) {
    return {
      abilities: 0,
      defenses: 0,
      skills: 0,
      advantages: 0,
      powers: 0,
      totalUsed: 0,
      totalBudget: 150,
      remaining: 150
    };
  }

  let abilities = 0;
  Object.values(character.abilities || {}).forEach(val => {
    abilities += (Number(val) || 0) * 2;
  });

  let defenses = 0;
  Object.values(character.defenses || {}).forEach(val => {
    defenses += (Number(val) || 0) * 1;
  });

  let totalSkillRanks = 0;
  Object.values(character.skills || {}).forEach(val => {
    totalSkillRanks += (Number(val) || 0);
  });
  const skills = Math.ceil(totalSkillRanks / 2);

  let advantages = 0;
  (character.advantages || []).forEach(adv => {
    advantages += (Number(adv.rank) || 1);
  });

  let powers = 0;
  (character.powers || []).forEach(pow => {
    powers += (Number(pow.cost) || 0);
  });

  const totalUsed = abilities + defenses + skills + advantages + powers;
  const pl = character.pl || 10;
  const totalBudget = pl * 15;
  const remaining = totalBudget - totalUsed;

  return {
    abilities,
    defenses,
    skills,
    advantages,
    powers,
    totalUsed,
    totalBudget,
    remaining
  };
}

function generatePrintSheetHTML(character) {
  const costs = calculateCosts(character);

  const abilitiesMarkup = Object.entries(VALIANT_DATA.abilities).map(([key, item]) => {
    const rank = character.abilities[key] || 0;
    return `
      <div class="print-stat-box">
        <div class="print-stat-label">${item.short}</div>
        <div class="print-stat-val">${rank >= 0 ? '+' + rank : rank}</div>
        <div class="print-stat-pts">${rank * 2} PP</div>
      </div>
    `;
  }).join('');

  const defensesMarkup = Object.entries(VALIANT_DATA.defenses).map(([key, item]) => {
    const base = character.abilities[item.ability] || 0;
    const extra = character.defenses[key] || 0;
    const total = base + extra;
    return `
      <div class="print-defense-box">
        <span class="p-def-name">${item.name} (${item.ability}):</span>
        <span class="p-def-calc">${base} base + ${extra} bought = </span>
        <span class="p-def-total"><strong>${total}</strong></span>
      </div>
    `;
  }).join('');

  const skillsMarkup = Object.entries(character.skills || {})
    .filter(([_, r]) => r > 0)
    .map(([name, r]) => {
      const info = VALIANT_DATA.skills[name] || { ability: 'AGL' };
      const base = character.abilities[info.ability] || 0;
      const total = base + r;
      return `<div class="print-list-item"><strong>${name}</strong> (${info.ability}): <strong>+${total}</strong> (Rank ${r})</div>`;
    }).join('') || '<em>No trained skills</em>';

  const advantagesMarkup = (character.advantages || []).map(adv => {
    return `<div class="print-list-item"><strong>${adv.name}</strong> (Rank ${adv.rank || 1})</div>`;
  }).join('') || '<em>No advantages</em>';

  const powersMarkup = (character.powers || []).map(pow => {
    return `
      <div class="print-power-card">
        <div class="p-pow-head">
          <span class="p-pow-name"><strong>${pow.name}</strong> (${pow.effect} ${pow.ranks || 1})</span>
          <span class="p-pow-cost">${pow.cost || 0} PP</span>
        </div>
        <div class="p-pow-desc">${pow.details || ''}</div>
      </div>
    `;
  }).join('') || '<em>No powers</em>';

  const gearMarkup = (character.gear || []).map(g => {
    return `<div class="print-list-item"><strong>${g.name}</strong> [${g.costEP || 0} EP]: ${g.description || ''}</div>`;
  }).join('') || '<em>No gear</em>';

  return `
    <div class="valiant-print-sheet">
      <div class="print-header">
        <div class="print-logo-row">
          <h1>VALIANT ADVENTURES RPG</h1>
          <span class="print-badge">CHARACTER DOSSIER</span>
        </div>
        <div class="print-subhead">
          <div><strong>Hero:</strong> ${character.name || 'Unnamed'} | <strong>Real Name:</strong> ${character.realName || 'Unknown'}</div>
          <div><strong>PL:</strong> ${character.pl || 10} | <strong>Hero Points (HP):</strong> ${character.hpRemaining || 1} | <strong>PP Used:</strong> ${costs.totalUsed} / ${costs.totalBudget}</div>
          <div><strong>Concept:</strong> ${character.concept || 'Operative'} | <strong>Identity:</strong> ${character.identity || 'Secret'}</div>
        </div>
      </div>

      <div class="print-grid-two">
        <div class="print-col">
          <div class="print-block">
            <h3>ABILITIES</h3>
            <div class="print-abilities-grid">
              ${abilitiesMarkup}
            </div>
          </div>

          <div class="print-block">
            <h3>DEFENSES</h3>
            <div class="print-defenses-list">
              ${defensesMarkup}
            </div>
          </div>

          <div class="print-block">
            <h3>SKILLS (${costs.skills} PP)</h3>
            <div class="print-skills-list">
              ${skillsMarkup}
            </div>
          </div>

          <div class="print-block">
            <h3>ADVANTAGES (${costs.advantages} PP)</h3>
            <div class="print-advantages-list">
              ${advantagesMarkup}
            </div>
          </div>
        </div>

        <div class="print-col">
          <div class="print-block">
            <h3>POWERS (${costs.powers} PP)</h3>
            <div class="print-powers-list">
              ${powersMarkup}
            </div>
          </div>

          <div class="print-block">
            <h3>GEAR &amp; EQUIPMENT</h3>
            <div class="print-gear-list">
              ${gearMarkup}
            </div>
          </div>

          <div class="print-block">
            <h3>COMPLICATIONS &amp; MOTIVATION</h3>
            <p><strong>Motivation:</strong> ${character.motivation || 'Duty / Survival'}</p>
            <p><strong>Complications:</strong> ${character.complications || 'None listed'}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

if (typeof window !== 'undefined') {
  window.ValiantExporter = ValiantExporter;
  window.calculateCosts = calculateCosts;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ValiantExporter, calculateCosts, generatePrintSheetHTML };
}
