// =====================================================================
// VALIANT ADVENTURES RPG - CAMPAIGN & GM PEER-TO-PEER NETWORKING SYSTEM
// Module: campaign.js (v1.6.34)
// Supports: GM Tab, P2P (WebRTC PeerJS + BroadcastChannel Fallback),
// Live Party Health Tracker (Players + NPCs), Round Advancing,
// Session Start/Stop, NPC Character File Assignment, Discord Auto-Sync,
// and Campaign Roll & Hero Point Log.
// =====================================================================

(function(window) {
  'use strict';

  // -------------------------------------------------------------------
  // STORAGE KEYS & CONSTANTS
  // -------------------------------------------------------------------
  const STORAGE_GM_CAMPAIGNS = 'valiant_gm_campaigns';
  const STORAGE_ACTIVE_GM_CAMP_ID = 'valiant_active_gm_campaign_id';
  const STORAGE_PLAYER_CAMPAIGNS = 'valiant_player_campaigns';
  const PEERJS_PREFIX = 'valiant-camp-';

  // State caches
  let activeGMPeer = null;
  let activeGMConnections = {}; // connId -> conn
  let activeGMBroadcastChannel = null;

  let activePlayerPeers = {}; // campId -> Peer
  let activePlayerConnections = {}; // campId -> DataConnection
  let activePlayerChannels = {}; // campId -> BroadcastChannel

  // Filter for GM Roll Log ('all' | 'rolls' | 'hp')
  let currentRollLogFilter = 'all';

  // -------------------------------------------------------------------
  // UTILITY HELPERS
  // -------------------------------------------------------------------
  function generateId(prefix = 'camp_') {
    return prefix + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  }

  function getSafeString(val, defaultVal = '') {
    return (val !== null && val !== undefined) ? String(val) : defaultVal;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------------
  // DISCORD AUTO-SYNC HELPER
  // -------------------------------------------------------------------
  function syncActiveDiscordServerWithCampaign(campaign) {
    if (!campaign || !campaign.discordServerId) return;
    if (typeof window.setActiveDiscordServerId === 'function') {
      window.setActiveDiscordServerId(campaign.discordServerId);
    }
    if (typeof window.renderHeaderDiscordServerSelect === 'function') {
      window.renderHeaderDiscordServerSelect();
    }
  }

  // -------------------------------------------------------------------
  // GM CAMPAIGN STORAGE & DATA MANAGEMENT
  // -------------------------------------------------------------------
  function getGMCampaigns() {
    try {
      const raw = localStorage.getItem(STORAGE_GM_CAMPAIGNS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[Campaign] Error reading GM campaigns:', e);
      return [];
    }
  }

  function saveGMCampaigns(campaigns) {
    try {
      localStorage.setItem(STORAGE_GM_CAMPAIGNS, JSON.stringify(campaigns || []));
      updateAlertsBadges();
    } catch (e) {
      console.error('[Campaign] Error saving GM campaigns:', e);
    }
  }

  function getActiveGMCampaignId() {
    return localStorage.getItem(STORAGE_ACTIVE_GM_CAMP_ID) || '';
  }

  function setActiveGMCampaignId(id) {
    localStorage.setItem(STORAGE_ACTIVE_GM_CAMP_ID, id || '');
    const camp = getActiveGMCampaign();
    if (camp && camp.discordServerId) {
      syncActiveDiscordServerWithCampaign(camp);
    }
    initGMP2P();
    renderGMTab();
  }
  window.setActiveGMCampaignId = setActiveGMCampaignId;

  function getActiveGMCampaign() {
    const campaigns = getGMCampaigns();
    const activeId = getActiveGMCampaignId();
    if (!campaigns.length) return null;
    return campaigns.find(c => c.id === activeId) || campaigns[0];
  }

  function createGMCampaign(opts) {
    const campaigns = getGMCampaigns();
    const id = generateId('camp_');
    const newCamp = {
      id,
      title: (opts.title || 'New Valiant Campaign').trim(),
      description: (opts.description || '').trim(),
      plMin: parseInt(opts.plMin, 10) || 8,
      plMax: parseInt(opts.plMax, 10) || 12,
      slots: Math.max(1, parseInt(opts.slots, 10) || 4),
      discordServerId: opts.discordServerId || '',
      createdAt: new Date().toISOString(),
      sessionActive: false,
      currentRound: 1,
      npcs: [],
      partyMembers: {}, // playerId -> { playerId, playerName, character, isConnected, lastSeen }
      alerts: [
        {
          id: generateId('alert_'),
          type: 'info',
          title: 'Campaign Created',
          message: `Campaign "${opts.title || 'New Campaign'}" initiated. Share the invite link with players to join.`,
          timestamp: new Date().toISOString(),
          read: false
        }
      ],
      rollLog: []
    };

    campaigns.push(newCamp);
    saveGMCampaigns(campaigns);
    setActiveGMCampaignId(id);
    return newCamp;
  }

  function updateGMCampaign(id, updates) {
    const campaigns = getGMCampaigns();
    const idx = campaigns.findIndex(c => c.id === id);
    if (idx === -1) return null;

    campaigns[idx] = { ...campaigns[idx], ...updates };
    saveGMCampaigns(campaigns);
    broadcastCampaignInfoToPlayers(campaigns[idx]);
    if (campaigns[idx].discordServerId && id === getActiveGMCampaignId()) {
      syncActiveDiscordServerWithCampaign(campaigns[idx]);
    }
    renderGMTab();
    return campaigns[idx];
  }

  function deleteGMCampaign(id) {
    let campaigns = getGMCampaigns();
    campaigns = campaigns.filter(c => c.id !== id);
    saveGMCampaigns(campaigns);
    if (getActiveGMCampaignId() === id) {
      setActiveGMCampaignId(campaigns.length ? campaigns[0].id : '');
    } else {
      renderGMTab();
    }
  }

  // -------------------------------------------------------------------
  // GAME SESSION STATE & ROUND ADVANCEMENT (GM & Player Controls)
  // -------------------------------------------------------------------
  function toggleGMSessionState(campId) {
    const campaign = getActiveGMCampaign();
    if (!campaign || campaign.id !== campId) return;

    campaign.sessionActive = !campaign.sessionActive;
    if (campaign.sessionActive) {
      campaign.currentRound = campaign.currentRound || 1;
      appendRollToGMLog(campaign, {
        id: generateId('roll_'),
        characterName: 'GM Host',
        playerId: 'gm',
        type: 'SESSION_STATE',
        rollText: `▶ GM started the game session. Live sync active at Round ${campaign.currentRound}.`,
        formattedText: `▶ GM started the game session. Live sync active at Round ${campaign.currentRound}.`,
        isCrit: false,
        critType: 'none',
        isHpSpend: false,
        timestamp: new Date().toISOString()
      });
      if (window.showToast) window.showToast('Game session is now LIVE!', 'success');
    } else {
      appendRollToGMLog(campaign, {
        id: generateId('roll_'),
        characterName: 'GM Host',
        playerId: 'gm',
        type: 'SESSION_STATE',
        rollText: '⏹ GM stopped the game session.',
        formattedText: '⏹ GM stopped the game session.',
        isCrit: false,
        critType: 'none',
        isHpSpend: false,
        timestamp: new Date().toISOString()
      });
      if (window.showToast) window.showToast('Game session stopped.', 'info');
    }

    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));

    // Broadcast session state to all connected players
    const pkt = {
      type: 'SESSION_STATE',
      campId: campaign.id,
      sessionActive: campaign.sessionActive,
      currentRound: campaign.currentRound
    };
    sendFromGMToPlayer(pkt, 'broadcast');
    Object.values(activeGMConnections).forEach(conn => {
      if (conn && conn.open) {
        try { conn.send(pkt); } catch (e) {}
      }
    });

    renderGMTab();
  }
  window.toggleGMSessionState = toggleGMSessionState;

  function advanceGMCampaignRound() {
    const campaign = getActiveGMCampaign();
    if (!campaign) return;

    // Ensure session is active if advancing
    if (!campaign.sessionActive) {
      campaign.sessionActive = true;
    }

    campaign.currentRound = (campaign.currentRound || 1) + 1;

    // Run round recovery and condition fading for assigned NPCs
    if (Array.isArray(campaign.npcs)) {
      campaign.npcs.forEach(npc => {
        // Automatic recovery for 1-round conditions like Dazed
        if (Array.isArray(npc.conditions)) {
          npc.conditions = npc.conditions.filter(c => c !== 'Dazed');
        }
        // Regeneration check if NPC has regeneration powers
        const hasRegen = (npc.powers || []).some(p => /regen/i.test(p.name || ''));
        if (hasRegen && (npc.bruises || 0) > 0) {
          npc.bruises = Math.max(0, npc.bruises - 1);
        }
      });
    }

    // Append to GM roll log
    appendRollToGMLog(campaign, {
      id: generateId('roll_'),
      characterName: 'Game Master',
      playerId: 'gm',
      type: 'ROUND_ADVANCE',
      rollText: `⏩ Round ${campaign.currentRound} begins! GM advanced the game round.`,
      formattedText: `⏩ Round ${campaign.currentRound} begins! GM advanced the game round.`,
      isCrit: false,
      critType: 'none',
      isHpSpend: false,
      timestamp: new Date().toISOString()
    });

    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));

    // Broadcast ADVANCE_ROUND packet to all connected player clients
    const pkt = {
      type: 'ADVANCE_ROUND',
      campId: campaign.id,
      round: campaign.currentRound,
      timestamp: new Date().toISOString()
    };
    sendFromGMToPlayer(pkt, 'broadcast');
    Object.values(activeGMConnections).forEach(conn => {
      if (conn && conn.open) {
        try { conn.send(pkt); } catch (e) {}
      }
    });

    // Update Round badge
    const badge = document.getElementById('gm-party-round-badge');
    if (badge) {
      badge.textContent = `Round ${campaign.currentRound}`;
    }

    renderGMPartyTracker();
    if (window.showToast) window.showToast(`Advanced to Round ${campaign.currentRound}!`, 'info');
  }
  window.advanceGMCampaignRound = advanceGMCampaignRound;

  // -------------------------------------------------------------------
  // PLAYER CAMPAIGN STORAGE & DATA MANAGEMENT
  // -------------------------------------------------------------------
  function getPlayerCampaigns() {
    try {
      const raw = localStorage.getItem(STORAGE_PLAYER_CAMPAIGNS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[Campaign] Error reading Player campaigns:', e);
      return [];
    }
  }

  function savePlayerCampaigns(campaigns) {
    try {
      localStorage.setItem(STORAGE_PLAYER_CAMPAIGNS, JSON.stringify(campaigns || []));
    } catch (e) {
      console.error('[Campaign] Error saving Player campaigns:', e);
    }
  }

  function getPlayerCampaign(campId) {
    const list = getPlayerCampaigns();
    return list.find(c => c.id === campId) || null;
  }

  function joinCampaignByLinkOrCode(inputStr) {
    if (!inputStr || !inputStr.trim()) {
      return { success: false, error: 'Please enter a campaign link or code.' };
    }

    let code = inputStr.trim();
    // Parse link if pasted full URL
    try {
      if (code.includes('?')) {
        const url = new URL(code, window.location.origin);
        const param = url.searchParams.get('campaign');
        if (param) code = param;
      }
    } catch (e) {
      // not a full URL, treat as raw code
    }

    // Sanitize code
    code = code.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!code) {
      return { success: false, error: 'Invalid campaign link or code format.' };
    }

    // RESTRICTION: GMs hosting an active game session cannot join campaigns from same instance
    const activeGmCamp = getActiveGMCampaign();
    if (activeGmCamp && activeGmCamp.sessionActive) {
      const errMsg = 'You cannot join a campaign while actively hosting a game session on this app instance. Please stop your active session first, or use a separate browser profile.';
      if (window.showToast) window.showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }

    // RESTRICTION: Cannot join own hosted campaign on same instance
    const gmCampaigns = getGMCampaigns();
    if (gmCampaigns.some(c => c.id === code)) {
      const errMsg = 'You cannot join your own hosted campaign from the same app instance.';
      if (window.showToast) window.showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }

    const currentList = getPlayerCampaigns();
    // DUPLICATE CHECK: Only one entry per campaign
    const exists = currentList.find(c => c.id === code);
    if (exists) {
      return {
        success: false,
        error: `You are already a member of campaign "${exists.title || code}".`,
        campaign: exists
      };
    }

    const newPlayerCamp = {
      id: code,
      title: 'Connecting to Campaign...',
      description: 'Requesting campaign data from GM...',
      plMin: 8,
      plMax: 12,
      slots: 4,
      openSlots: 4,
      discordServerName: '',
      discordServerId: '',
      joinedAt: new Date().toISOString(),
      attachedCharacterId: '',
      attachedCharacterName: '',
      connectionStatus: 'connecting',
      sessionActive: false
    };

    currentList.push(newPlayerCamp);
    savePlayerCampaigns(currentList);

    // Initiate P2P connection to GM
    connectPlayerToGMCampaign(code);

    return { success: true, campaign: newPlayerCamp };
  }

  function leavePlayerCampaign(campId) {
    detachCharacterFromCampaign(campId);
    let list = getPlayerCampaigns();
    list = list.filter(c => c.id !== campId);
    savePlayerCampaigns(list);

    // Close connections
    if (activePlayerConnections[campId]) {
      try { activePlayerConnections[campId].close(); } catch (e) {}
      delete activePlayerConnections[campId];
    }
    if (activePlayerChannels[campId]) {
      try { activePlayerChannels[campId].close(); } catch (e) {}
      delete activePlayerChannels[campId];
    }
    renderPlayerCampaignsModal();
  }

  // -------------------------------------------------------------------
  // P2P NETWORKING ENGINE (WebRTC PeerJS + BroadcastChannel Hybrid)
  // -------------------------------------------------------------------
  function getCampaignLink(campaignId) {
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
    const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
    return `${origin}${pathname}?campaign=${campaignId}`;
  }

  // GM HOST INITIALIZATION
  function initGMP2P() {
    const campaign = getActiveGMCampaign();
    if (!campaign) return;

    const campId = campaign.id;

    // 1. Initialize BroadcastChannel for same-browser / multi-tab offline messaging
    if (typeof BroadcastChannel !== 'undefined') {
      if (activeGMBroadcastChannel) {
        try { activeGMBroadcastChannel.close(); } catch (e) {}
      }
      activeGMBroadcastChannel = new BroadcastChannel('valiant_campaign_' + campId);
      activeGMBroadcastChannel.onmessage = (event) => {
        handleIncomingGMPacket(event.data, 'broadcast');
      };
      console.log(`[P2P GM] BroadcastChannel listening on valiant_campaign_${campId}`);
    }

    // 2. Initialize PeerJS (WebRTC) for remote connections
    if (typeof Peer !== 'undefined') {
      const peerId = PEERJS_PREFIX + campId;
      if (activeGMPeer && activeGMPeer.id === peerId && !activeGMPeer.destroyed) {
        return; // already active
      }
      if (activeGMPeer) {
        try { activeGMPeer.destroy(); } catch (e) {}
      }

      try {
        activeGMPeer = new Peer(peerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        activeGMPeer.on('open', (id) => {
          console.log(`[P2P GM] PeerJS online as Host: ${id}`);
          updateP2PStatusIndicator(true);
        });

        activeGMPeer.on('connection', (conn) => {
          console.log(`[P2P GM] Incoming peer connection from ${conn.peer}`);
          activeGMConnections[conn.peer] = conn;

          conn.on('data', (data) => {
            handleIncomingGMPacket(data, conn);
          });

          conn.on('close', () => {
            delete activeGMConnections[conn.peer];
            handlePlayerDisconnected(conn.peer);
          });

          conn.on('error', (err) => {
            console.warn(`[P2P GM] Connection error with ${conn.peer}:`, err);
          });
        });

        activeGMPeer.on('error', (err) => {
          console.warn('[P2P GM] PeerJS Host error:', err);
          updateP2PStatusIndicator(false, err.type);
        });
      } catch (err) {
        console.warn('[P2P GM] Could not initialize PeerJS:', err);
      }
    } else {
      updateP2PStatusIndicator(true, 'local_only');
    }
  }

  // PLAYER CLIENT INITIALIZATION
  function connectPlayerToGMCampaign(campId) {
    if (!campId) return;

    // 1. BroadcastChannel connection
    if (typeof BroadcastChannel !== 'undefined') {
      if (!activePlayerChannels[campId]) {
        const bc = new BroadcastChannel('valiant_campaign_' + campId);
        bc.onmessage = (event) => {
          handleIncomingPlayerPacket(event.data, campId);
        };
        activePlayerChannels[campId] = bc;
      }
      // Send HELLO packet to GM
      activePlayerChannels[campId].postMessage({
        type: 'CAMPAIGN_QUERY',
        campId,
        playerId: getPlayerUniqueId(),
        playerName: (window.currentCharacter?.name || 'Player')
      });
    }

    // 2. PeerJS WebRTC connection
    if (typeof Peer !== 'undefined') {
      let playerPeer = activePlayerPeers[campId];
      if (!playerPeer || playerPeer.destroyed) {
        playerPeer = new Peer({
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' }
            ]
          }
        });
        activePlayerPeers[campId] = playerPeer;

        playerPeer.on('open', () => {
          const targetPeerId = PEERJS_PREFIX + campId;
          const conn = playerPeer.connect(targetPeerId, { reliable: true });

          conn.on('open', () => {
            console.log(`[P2P Player] Connected to GM peer: ${targetPeerId}`);
            activePlayerConnections[campId] = conn;
            conn.send({
              type: 'CAMPAIGN_QUERY',
              campId,
              playerId: getPlayerUniqueId(),
              playerName: (window.currentCharacter?.name || 'Player')
            });
            updatePlayerCampConnectionStatus(campId, 'connected');
          });

          conn.on('data', (data) => {
            handleIncomingPlayerPacket(data, campId);
          });

          conn.on('close', () => {
            delete activePlayerConnections[campId];
            updatePlayerCampConnectionStatus(campId, 'offline');
          });

          conn.on('error', (err) => {
            console.warn(`[P2P Player] Peer connection error:`, err);
            updatePlayerCampConnectionStatus(campId, 'offline');
          });
        });

        playerPeer.on('error', (err) => {
          console.warn('[P2P Player] PeerJS error:', err);
        });
      }
    }
  }

  function getPlayerUniqueId() {
    let pid = localStorage.getItem('valiant_player_unique_id');
    if (!pid) {
      pid = 'player_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('valiant_player_unique_id', pid);
    }
    return pid;
  }

  function updatePlayerCampConnectionStatus(campId, status) {
    const list = getPlayerCampaigns();
    const camp = list.find(c => c.id === campId);
    if (camp) {
      camp.connectionStatus = status;
      savePlayerCampaigns(list);
      renderPlayerCampaignsModal();
    }
  }

  // -------------------------------------------------------------------
  // GM MESSAGE DISPATCHER & PACKET HANDLER
  // -------------------------------------------------------------------
  function handleIncomingGMPacket(pkt, source) {
    if (!pkt || !pkt.type) return;

    const campaign = getActiveGMCampaign();
    if (!campaign) return;

    switch (pkt.type) {
      case 'CAMPAIGN_QUERY': {
        const infoPkt = {
          type: 'CAMPAIGN_INFO',
          campId: campaign.id,
          title: campaign.title,
          description: campaign.description,
          plMin: campaign.plMin,
          plMax: campaign.plMax,
          slots: campaign.slots,
          openSlots: calculateOpenSlots(campaign),
          discordServerName: getCampaignDiscordServerName(campaign),
          discordServerId: campaign.discordServerId || '',
          sessionActive: !!campaign.sessionActive,
          currentRound: campaign.currentRound || 1
        };
        sendFromGMToPlayer(infoPkt, source);
        break;
      }

      case 'ATTACH_CHAR': {
        const { playerId, playerName, character } = pkt;
        if (!character) return;

        // Check if character name collides with an assigned NPC
        const charName = (character.name || '').trim();
        const hasNpcDup = (campaign.npcs || []).some(n => (n.name || '').trim().toLowerCase() === charName.toLowerCase());
        if (hasNpcDup) {
          sendFromGMToPlayer({
            type: 'ATTACH_FAILED',
            campId: campaign.id,
            reason: `A companion named "${charName}" is already assigned as an NPC in this party.`
          }, source);
          return;
        }

        // Check party slots (Players + NPCs share party slots)
        const totalCount = calculateTotalPartyCount(campaign);
        if (totalCount >= campaign.slots && !campaign.partyMembers[playerId]) {
          sendFromGMToPlayer({
            type: 'ATTACH_FAILED',
            campId: campaign.id,
            reason: `Campaign is full (${campaign.slots} of ${campaign.slots} slots filled).`
          }, source);
          return;
        }

        // Add / update party member
        if (!campaign.partyMembers) campaign.partyMembers = {};
        campaign.partyMembers[playerId] = {
          playerId,
          playerName: playerName || character.name,
          character,
          isConnected: true,
          lastSeen: Date.now()
        };

        // CREATE GM ALERT: Ordered from most recent to oldest
        addGMAlert(campaign, {
          type: 'player_join',
          title: 'Hero Attached to Campaign',
          message: `${escapeHTML(character.name)} (PL ${character.pl || 10}) was attached to the campaign by ${escapeHTML(playerName || 'Player')}.`,
          characterName: character.name
        });

        saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
        renderGMPartyTracker();
        renderGMAlerts();

        // Confirm to player
        sendFromGMToPlayer({
          type: 'ATTACH_CONFIRMED',
          campId: campaign.id,
          characterName: character.name,
          discordServerId: campaign.discordServerId || '',
          sessionActive: !!campaign.sessionActive,
          currentRound: campaign.currentRound || 1
        }, source);

        if (window.showToast) {
          window.showToast(`Hero attached: ${character.name}!`, 'info');
        }
        break;
      }

      case 'DETACH_CHAR': {
        const { playerId, characterName } = pkt;
        if (campaign.partyMembers && campaign.partyMembers[playerId]) {
          delete campaign.partyMembers[playerId];

          addGMAlert(campaign, {
            type: 'player_leave',
            title: 'Hero Detached',
            message: `${escapeHTML(characterName || 'Hero')} was detached from the campaign.`,
            characterName
          });

          saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
          renderGMPartyTracker();
          renderGMAlerts();
        }
        break;
      }

      case 'STATE_SYNC': {
        const { playerId, bruises, conditions, hpRemaining } = pkt;
        if (campaign.partyMembers && campaign.partyMembers[playerId]) {
          const m = campaign.partyMembers[playerId];
          m.character.bruises = bruises;
          m.character.damage = bruises;
          m.character.conditions = conditions || [];
          m.character.hpRemaining = hpRemaining;
          m.lastSeen = Date.now();
          m.isConnected = true;
          saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
          renderGMPartyTracker();
        }
        break;
      }

      case 'ROLL_EVENT': {
        const { characterName, rollText, isCrit, critType, formattedText, isHpSpend, timestamp } = pkt;
        appendRollToGMLog(campaign, {
          id: generateId('roll_'),
          characterName: characterName || 'Player',
          rollText: rollText || formattedText,
          formattedText: formattedText || rollText,
          isCrit: !!isCrit,
          critType: critType || 'none',
          isHpSpend: !!isHpSpend,
          timestamp: timestamp || new Date().toISOString()
        });
        break;
      }
    }
  }

  function handleIncomingPlayerPacket(pkt, campId) {
    if (!pkt || !pkt.type) return;

    switch (pkt.type) {
      case 'CAMPAIGN_INFO': {
        const list = getPlayerCampaigns();
        const camp = list.find(c => c.id === campId);
        if (camp) {
          camp.title = pkt.title || camp.title;
          camp.description = pkt.description || camp.description;
          camp.plMin = pkt.plMin !== undefined ? pkt.plMin : camp.plMin;
          camp.plMax = pkt.plMax !== undefined ? pkt.plMax : camp.plMax;
          camp.slots = pkt.slots || camp.slots;
          camp.openSlots = pkt.openSlots !== undefined ? pkt.openSlots : camp.openSlots;
          camp.discordServerName = pkt.discordServerName || '';
          camp.discordServerId = pkt.discordServerId || camp.discordServerId || '';
          camp.sessionActive = !!pkt.sessionActive;
          camp.currentRound = pkt.currentRound || 1;
          camp.connectionStatus = 'connected';
          savePlayerCampaigns(list);

          // Auto-sync Discord dropdown if this campaign is attached or active
          if (camp.discordServerId && (camp.attachedCharacterId || camp.attachedCharacterName)) {
            syncActiveDiscordServerWithCampaign(camp);
          }

          renderPlayerCampaignsModal();
        }
        break;
      }

      case 'ATTACH_CONFIRMED': {
        const list = getPlayerCampaigns();
        const camp = list.find(c => c.id === campId);
        if (camp) {
          camp.attachedCharacterName = pkt.characterName;
          camp.connectionStatus = 'connected';
          if (pkt.discordServerId) {
            camp.discordServerId = pkt.discordServerId;
            syncActiveDiscordServerWithCampaign(camp);
          }
          savePlayerCampaigns(list);
          renderPlayerCampaignsModal();
          if (window.showToast) {
            window.showToast(`Attached to campaign "${camp.title}"!`, 'success');
          }
        }
        break;
      }

      case 'ATTACH_FAILED': {
        if (window.showToast) {
          window.showToast(`Attachment failed: ${pkt.reason}`, 'error');
        }
        break;
      }

      case 'ADVANCE_ROUND': {
        // Advance player client round
        if (typeof window.advanceSessionRound === 'function') {
          window.advanceSessionRound();
        }
        if (window.showToast) {
          window.showToast(`GM advanced the game session to Round ${pkt.round || ''}!`, 'info');
        }
        break;
      }

      case 'SESSION_STATE': {
        const list = getPlayerCampaigns();
        const camp = list.find(c => c.id === campId);
        if (camp) {
          camp.sessionActive = !!pkt.sessionActive;
          savePlayerCampaigns(list);
        }
        if (window.showToast) {
          if (pkt.sessionActive) {
            window.showToast('Game session is now LIVE!', 'success');
          } else {
            window.showToast('Game session stopped by GM.', 'info');
          }
        }
        break;
      }
    }
  }

  function sendFromGMToPlayer(pkt, target) {
    if (target === 'broadcast') {
      if (activeGMBroadcastChannel) {
        activeGMBroadcastChannel.postMessage(pkt);
      }
    } else if (target && typeof target.send === 'function') {
      try { target.send(pkt); } catch (e) {}
    }
  }

  function sendFromPlayerToGM(campId, pkt) {
    // Send via BroadcastChannel
    if (activePlayerChannels[campId]) {
      activePlayerChannels[campId].postMessage(pkt);
    }
    // Send via PeerJS connection
    if (activePlayerConnections[campId] && activePlayerConnections[campId].open) {
      try { activePlayerConnections[campId].send(pkt); } catch (e) {}
    }
  }

  function broadcastCampaignInfoToPlayers(campaign) {
    const pkt = {
      type: 'CAMPAIGN_INFO',
      campId: campaign.id,
      title: campaign.title,
      description: campaign.description,
      plMin: campaign.plMin,
      plMax: campaign.plMax,
      slots: campaign.slots,
      openSlots: calculateOpenSlots(campaign),
      discordServerName: getCampaignDiscordServerName(campaign),
      discordServerId: campaign.discordServerId || '',
      sessionActive: !!campaign.sessionActive,
      currentRound: campaign.currentRound || 1
    };
    if (activeGMBroadcastChannel) {
      activeGMBroadcastChannel.postMessage(pkt);
    }
    Object.values(activeGMConnections).forEach(conn => {
      if (conn && conn.open) {
        try { conn.send(pkt); } catch (e) {}
      }
    });
  }

  function calculateTotalPartyCount(campaign) {
    const playerCount = Object.keys(campaign.partyMembers || {}).length;
    const npcCount = (campaign.npcs || []).length;
    return playerCount + npcCount;
  }

  function calculateOpenSlots(campaign) {
    const totalSlots = campaign.slots || 4;
    const occupied = calculateTotalPartyCount(campaign);
    return Math.max(0, totalSlots - occupied);
  }

  function getCampaignDiscordServerName(campaign) {
    if (!campaign.discordServerId || typeof window.getDiscordServers !== 'function') return '';
    const servers = window.getDiscordServers();
    const s = servers.find(srv => srv.id === campaign.discordServerId);
    return s ? s.name : '';
  }

  function handlePlayerDisconnected(peerId) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.partyMembers) return;

    let updated = false;
    for (const [pid, member] of Object.entries(campaign.partyMembers)) {
      if (member.isConnected) {
        member.isConnected = false;
        updated = true;
      }
    }
    if (updated) {
      saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
      renderGMPartyTracker();
    }
  }

  // -------------------------------------------------------------------
  // LIVE ROLL & HERO POINT LOGGING (GM & Player Hooks)
  // -------------------------------------------------------------------
  function appendRollToGMLog(campaign, rollEntry) {
    if (!campaign.rollLog) campaign.rollLog = [];
    campaign.rollLog.unshift(rollEntry); // newest first
    if (campaign.rollLog.length > 150) {
      campaign.rollLog.length = 150;
    }
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMRollLog();

    // Echo to Discord if GM has an active campaign Discord server attached
    if (campaign.discordServerId && typeof window.getDiscordServers === 'function') {
      const servers = window.getDiscordServers();
      const srv = servers.find(s => s.id === campaign.discordServerId);
      if (srv && srv.webhookUrl && srv.echoRolls !== false) {
        const textContent = rollEntry.isHpSpend 
          ? `⭐ **[Hero Point] ${escapeHTML(rollEntry.characterName)}**: ${rollEntry.rollText}`
          : `🎲 **${escapeHTML(rollEntry.characterName)}**: ${rollEntry.rollText}`;
        const payload = {
          content: textContent,
          username: rollEntry.characterName
        };
        fetch(srv.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => console.warn('[Campaign Discord Echo Error]', err));
      }
    }
  }

  // Hook called by app.js when player rolls dice or spends Hero Points
  function broadcastRollFromPlayer(rollData) {
    const campaigns = getPlayerCampaigns();
    const char = window.currentCharacter;
    if (!char) return;

    const formattedText = rollData.formattedText || rollData.text || '';
    const isHpSpend = !!(rollData.isHpSpend || formattedText.includes('Hero Point Spent') || formattedText.includes('[HP Re-roll]'));

    campaigns.forEach(camp => {
      if (camp.attachedCharacterId === char.id || camp.attachedCharacterName === char.name) {
        sendFromPlayerToGM(camp.id, {
          type: 'ROLL_EVENT',
          campId: camp.id,
          characterName: char.name,
          rollText: formattedText,
          formattedText: formattedText,
          isCrit: rollData.isCrit,
          critType: rollData.critType,
          isHpSpend: isHpSpend,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Also if current instance is GM and rolling as GM or NPC
    const gmCamp = getActiveGMCampaign();
    if (gmCamp) {
      appendRollToGMLog(gmCamp, {
        id: generateId('roll_'),
        characterName: char.name,
        rollText: formattedText,
        formattedText: formattedText,
        isCrit: rollData.isCrit,
        critType: rollData.critType,
        isHpSpend: isHpSpend,
        timestamp: new Date().toISOString()
      });
    }
  }
  window.broadcastRollFromPlayer = broadcastRollFromPlayer;

  // Hook called by app.js when conditions or bruises change in Session
  function broadcastStateSyncFromPlayer() {
    const char = window.currentCharacter;
    if (!char) return;

    const campaigns = getPlayerCampaigns();
    campaigns.forEach(camp => {
      if (camp.attachedCharacterId === char.id || camp.attachedCharacterName === char.name) {
        sendFromPlayerToGM(camp.id, {
          type: 'STATE_SYNC',
          campId: camp.id,
          playerId: getPlayerUniqueId(),
          bruises: char.bruises || 0,
          conditions: char.conditions || [],
          hpRemaining: char.hpRemaining !== undefined ? char.hpRemaining : 1
        });
      }
    });
  }
  window.broadcastStateSyncFromPlayer = broadcastStateSyncFromPlayer;

  // -------------------------------------------------------------------
  // ALERTS SYSTEM & MENU BADGE
  // -------------------------------------------------------------------
  function addGMAlert(campaign, alertData) {
    if (!campaign.alerts) campaign.alerts = [];
    const newAlert = {
      id: generateId('alert_'),
      type: alertData.type || 'info',
      title: alertData.title || 'Notification',
      message: alertData.message || '',
      characterName: alertData.characterName || '',
      timestamp: new Date().toISOString(),
      read: false
    };

    // Prepend to top: Ordered from most recent to oldest
    campaign.alerts.unshift(newAlert);
    if (campaign.alerts.length > 50) {
      campaign.alerts.length = 50;
    }
    updateAlertsBadges();
  }

  function updateAlertsBadges() {
    const campaign = getActiveGMCampaign();
    const unreadCount = campaign ? (campaign.alerts || []).filter(a => !a.read).length : 0;

    // 1. Badge next to Character Menu button (top row)
    const menuBadge = document.getElementById('char-menu-alert-badge');
    if (menuBadge) {
      if (unreadCount > 0) {
        menuBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        menuBadge.style.display = 'inline-flex';
        menuBadge.title = `${unreadCount} unread campaign alert${unreadCount > 1 ? 's' : ''}`;
      } else {
        menuBadge.style.display = 'none';
      }
    }

    // 2. Badge in GM Tab alerts button
    const gmBadge = document.getElementById('gm-alerts-badge');
    if (gmBadge) {
      if (unreadCount > 0) {
        gmBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        gmBadge.style.display = 'inline-flex';
      } else {
        gmBadge.style.display = 'none';
      }
    }
  }
  window.updateAlertsBadges = updateAlertsBadges;

  function markAllAlertsRead() {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.alerts) return;

    campaign.alerts.forEach(a => a.read = true);
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    updateAlertsBadges();
    renderGMAlerts();
  }
  window.markAllAlertsRead = markAllAlertsRead;

  function clearGMAlerts() {
    const campaign = getActiveGMCampaign();
    if (!campaign) return;

    campaign.alerts = [];
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    updateAlertsBadges();
    renderGMAlerts();
    if (window.showToast) window.showToast('All campaign alerts cleared.', 'info');
  }
  window.clearGMAlerts = clearGMAlerts;

  function toggleGMAlertsDropdown() {
    const dropdown = document.getElementById('gm-alerts-dropdown');
    if (!dropdown) return;
    const isVisible = dropdown.style.display !== 'none';
    if (isVisible) {
      dropdown.style.display = 'none';
    } else {
      dropdown.style.display = 'flex';
      renderGMAlerts();
      markAllAlertsRead();
    }
  }
  window.toggleGMAlertsDropdown = toggleGMAlertsDropdown;

  // -------------------------------------------------------------------
  // GM TAB RENDERING
  // -------------------------------------------------------------------
  function renderGMTab() {
    const container = document.getElementById('tab-gm');
    if (!container) return;

    const campaigns = getGMCampaigns();
    const activeCamp = getActiveGMCampaign();

    // Render Campaign Selector Options
    const selector = document.getElementById('gm-campaign-select');
    if (selector) {
      if (!campaigns.length) {
        selector.innerHTML = '<option value="">No Campaigns Created</option>';
      } else {
        selector.innerHTML = campaigns.map(c => `
          <option value="${c.id}" ${activeCamp && c.id === activeCamp.id ? 'selected' : ''}>
            ${escapeHTML(c.title)} (PL ${c.plMin}-${c.plMax})
          </option>
        `).join('');
      }
    }

    if (!activeCamp) {
      const banner = document.getElementById('gm-active-camp-banner');
      if (banner) {
        banner.innerHTML = `
          <div style="padding: 24px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
            <h3 style="color: var(--accent-secondary); margin-bottom: 8px;">No Campaign Selected</h3>
            <p style="font-size: 10pt; max-width: 500px; margin: 0 auto 16px auto;">
              Create your first campaign to generate a peer-to-peer invite link, assign NPCs, track party bruises and conditions in real time, and log player rolls.
            </p>
            <button class="btn-header primary" onclick="openCreateCampaignModal()">+ Create New Campaign</button>
          </div>
        `;
      }
      return;
    }

    // Auto-sync Discord dropdown if active campaign has discordServerId
    if (activeCamp.discordServerId) {
      syncActiveDiscordServerWithCampaign(activeCamp);
    }

    // Render Active Campaign Overview & Invite Link Box
    const banner = document.getElementById('gm-active-camp-banner');
    if (banner) {
      const link = getCampaignLink(activeCamp.id);
      const totalPartyCount = calculateTotalPartyCount(activeCamp);
      const openSlots = calculateOpenSlots(activeCamp);
      const discordName = getCampaignDiscordServerName(activeCamp);
      const isLive = !!activeCamp.sessionActive;

      banner.innerHTML = `
        <div class="gm-camp-header-card">
          <div class="gm-camp-header-top">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h2 style="font-size: 20px; color: var(--accent-secondary); margin: 0;">${escapeHTML(activeCamp.title)}</h2>
                <span class="gm-badge-session ${isLive ? 'live' : 'idle'}">
                  ${isLive ? '● LIVE SESSION' : '○ Session Idle'}
                </span>
                <span class="gm-badge-pl">PL: ${activeCamp.plMin} – ${activeCamp.plMax}</span>
                <span class="gm-badge-slots ${totalPartyCount >= activeCamp.slots ? 'full' : ''}">
                  ${totalPartyCount}/${activeCamp.slots} slots filled
                </span>
                ${discordName ? `<span class="gm-badge-discord" title="Discord Server: ${escapeHTML(discordName)}">📡 ${escapeHTML(discordName)}</span>` : ''}
              </div>
              <p style="font-size: 10pt; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4;">
                ${escapeHTML(activeCamp.description || 'No description provided.')}
              </p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <button class="btn-header ${isLive ? 'danger' : 'primary'}" onclick="toggleGMSessionState('${activeCamp.id}')" title="${isLive ? 'Stop Live Game Session' : 'Start Live Game Session'}">
                ${isLive ? '⏹ Stop Session' : '▶ Start Session'}
              </button>
              <button class="btn-header" onclick="openEditCampaignModal('${activeCamp.id}')" title="Edit Campaign Settings">
                ⚙️ Settings
              </button>
              <button class="btn-header danger" onclick="confirmDeleteCampaign('${activeCamp.id}')" title="Delete Campaign">
                🗑️ Delete
              </button>
            </div>
          </div>

          <!-- Campaign Link Box -->
          <div class="gm-camp-link-box">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <label style="font-size: 10pt; font-weight: 700; color: var(--accent-primary);">
                🔗 Player Invite Link (Give this to your players):
              </label>
              <span style="font-size: 10pt; color: var(--text-dim);">Code: <code>${activeCamp.id}</code></span>
            </div>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="gm-share-link-input" class="input-text" readonly value="${escapeHTML(link)}" style="flex: 1; font-family: monospace; font-size: 10pt;">
              <button type="button" class="btn-header primary" onclick="copyCampaignLink()" title="Copy to clipboard">
                📋 Copy Link
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderGMPartyTracker();
    renderGMRollLog();
    renderGMAlerts();
    updateAlertsBadges();
  }
  window.renderGMTab = renderGMTab;

  function updateP2PStatusIndicator(isActive, reason) {
    const el = document.getElementById('gm-p2p-status-pill');
    if (!el) return;
    if (isActive) {
      el.className = 'status-pill-online';
      el.innerHTML = '🟢 P2P Active (Ready)';
      el.title = 'Peer-to-peer networking is active and awaiting player connections.';
    } else {
      el.className = 'status-pill-offline';
      el.innerHTML = `🟡 Local Mode (${reason || 'Local Only'})`;
      el.title = 'Local multi-tab broadcast is active. WebRTC handshake was unavailable.';
    }
  }

  // -------------------------------------------------------------------
  // LIVE PARTY HEALTH & CONDITIONS TRACKER (PLAYERS + ASSIGNED NPCS)
  // -------------------------------------------------------------------
  function renderGMPartyTracker() {
    const container = document.getElementById('gm-party-members-grid');
    if (!container) return;

    const campaign = getActiveGMCampaign();
    if (!campaign) {
      container.innerHTML = '<div style="color: var(--text-dim); font-size: 10pt; padding: 12px;">No active campaign.</div>';
      return;
    }

    // Update Round Badge in card header
    const roundBadge = document.getElementById('gm-party-round-badge');
    if (roundBadge) {
      roundBadge.textContent = `Round ${campaign.currentRound || 1}`;
    }

    const members = Object.values(campaign.partyMembers || {});
    const npcs = campaign.npcs || [];

    if (!members.length && !npcs.length) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 10pt; border: 1px dashed var(--border-color); border-radius: var(--radius-md); grid-column: 1 / -1;">
          No heroes or NPCs currently in this party. Players can join using the invite link, or click <strong>+ Assign NPC</strong> above to add companions from character files.
        </div>
      `;
      return;
    }

    let cardsHtml = '';

    // 1. Render Connected Player Heroes
    members.forEach(m => {
      const char = m.character;
      const bruises = char.bruises || char.damage || 0;
      const hp = char.hpRemaining !== undefined ? char.hpRemaining : 1;
      const conditions = char.conditions || [];
      const isOnline = m.isConnected;

      cardsHtml += `
        <div class="party-hero-card ${isOnline ? 'online' : 'offline'}">
          <div class="party-hero-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="conn-dot ${isOnline ? 'green' : 'gray'}" title="${isOnline ? 'Player Connected' : 'Player Disconnected'}"></span>
                <strong style="font-size: 14px; color: var(--text-main);">${escapeHTML(char.name)}</strong>
                <span style="font-size: 10pt; background: var(--accent-glow); color: var(--accent-secondary); padding: 1px 6px; border-radius: 3px; font-weight: 700;">
                  PL ${char.pl || 10}
                </span>
              </div>
              <div style="font-size: 10pt; color: var(--text-dim); margin-top: 2px;">
                Player: <strong>${escapeHTML(m.playerName)}</strong> &bull; ${escapeHTML(char.concept || 'Hero')}
              </div>
            </div>
            <button class="btn-remove-sub" onclick="gmKickPartyMember('${m.playerId}')" title="Kick hero from party">&times;</button>
          </div>

          <!-- Bruises & HP Row -->
          <div class="party-hero-stats">
            <div class="stat-pill-box">
              <span style="font-size: 10pt; font-weight: 700; color: var(--accent-danger);">Bruises:</span>
              <span class="stat-pill-val">${bruises}</span>
              <div style="display: flex; gap: 3px; margin-left: 6px;">
                <button type="button" class="btn-mini-counter" onclick="gmAdjustMemberBruises('${m.playerId}', -1)">-</button>
                <button type="button" class="btn-mini-counter" onclick="gmAdjustMemberBruises('${m.playerId}', 1)">+</button>
              </div>
            </div>
            <div class="stat-pill-box">
              <span style="font-size: 10pt; font-weight: 700; color: var(--accent-primary);">HP:</span>
              <span class="stat-pill-val">${hp}</span>
              <div style="display: flex; gap: 3px; margin-left: 6px;">
                <button type="button" class="btn-mini-counter" onclick="gmAdjustMemberHP('${m.playerId}', -1)">-</button>
                <button type="button" class="btn-mini-counter" onclick="gmAdjustMemberHP('${m.playerId}', 1)">+</button>
              </div>
            </div>
          </div>

          <!-- Active Conditions Badges -->
          <div class="party-hero-conditions">
            <div style="font-size: 10pt; font-weight: 600; color: var(--text-dim); margin-bottom: 4px;">Conditions:</div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${conditions.length === 0 ? '<span style="font-size: 10pt; color: var(--accent-success); font-style: italic;">Normal (Unharmed)</span>' : ''}
              ${conditions.map(c => `
                <span class="condition-badge active">
                  ${escapeHTML(c)}
                  <span class="cond-del" onclick="gmRemoveMemberCondition('${m.playerId}', '${escapeHTML(c)}')">&times;</span>
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: flex; gap: 6px; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 8px;">
            <select class="select-input" style="font-size: 10pt; height: 28px; flex: 1;" onchange="if(this.value){ gmAddMemberCondition('${m.playerId}', this.value); this.value=''; }">
              <option value="">+ Add Condition...</option>
              <option value="Dazed">Dazed</option>
              <option value="Staggered">Staggered</option>
              <option value="Incapacitated">Incapacitated</option>
              <option value="Compelled">Compelled</option>
              <option value="Controlled">Controlled</option>
              <option value="Defenseless">Defenseless</option>
              <option value="Disabled">Disabled</option>
              <option value="Fatigued">Fatigued</option>
              <option value="Exhausted">Exhausted</option>
              <option value="Hindered">Hindered</option>
              <option value="Immobilized">Immobilized</option>
              <option value="Impaired">Impaired</option>
              <option value="Prone">Prone</option>
              <option value="Stunned">Stunned</option>
              <option value="Vulnerable">Vulnerable</option>
            </select>
            <button type="button" class="btn-header" style="font-size: 10pt; height: 28px; padding: 0 8px;" onclick="gmClearMemberState('${m.playerId}')" title="Remove all conditions & bruises">
              Clear All
            </button>
          </div>
        </div>
      `;
    });

    // 2. Render Assigned NPCs (Integrated as Part of the Party)
    npcs.forEach((npc, idx) => {
      const bruises = npc.bruises || 0;
      const hp = npc.hpRemaining !== undefined ? npc.hpRemaining : 1;
      const conditions = npc.conditions || [];

      cardsHtml += `
        <div class="party-hero-card online" style="border-left: 3px solid var(--accent-secondary);">
          <div class="party-hero-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="conn-dot green" title="NPC (Party Ally / Companion)"></span>
                <strong style="font-size: 14px; color: var(--accent-secondary);">${escapeHTML(npc.name)}</strong>
                <span style="font-size: 10pt; background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 1px 6px; border-radius: 3px; font-weight: 700; border: 1px solid rgba(99, 102, 241, 0.3);">
                  NPC
                </span>
                <span style="font-size: 10pt; background: var(--accent-glow); color: var(--accent-secondary); padding: 1px 6px; border-radius: 3px; font-weight: 700;">
                  PL ${npc.pl || 10}
                </span>
              </div>
              <div style="font-size: 10pt; color: var(--text-dim); margin-top: 2px;">
                ${escapeHTML(npc.concept || 'Party Companion')}
              </div>
            </div>
            <button class="btn-remove-sub" onclick="removeNPCFromCampaign(${idx})" title="Remove NPC from Party">&times;</button>
          </div>

          <!-- Bruises & HP Row -->
          <div class="party-hero-stats">
            <div class="stat-pill-box">
              <span style="font-size: 10pt; font-weight: 700; color: var(--accent-danger);">Bruises:</span>
              <span class="stat-pill-val">${bruises}</span>
              <div style="display: flex; gap: 3px; margin-left: 6px;">
                <button type="button" class="btn-mini-counter" onclick="gmAdjustNPCBruises(${idx}, -1)">-</button>
                <button type="button" class="btn-mini-counter" onclick="gmAdjustNPCBruises(${idx}, 1)">+</button>
              </div>
            </div>
            <div class="stat-pill-box">
              <span style="font-size: 10pt; font-weight: 700; color: var(--accent-primary);">HP:</span>
              <span class="stat-pill-val">${hp}</span>
              <div style="display: flex; gap: 3px; margin-left: 6px;">
                <button type="button" class="btn-mini-counter" onclick="gmAdjustNPCHP(${idx}, -1)">-</button>
                <button type="button" class="btn-mini-counter" onclick="gmAdjustNPCHP(${idx}, 1)">+</button>
              </div>
            </div>
          </div>

          <!-- Active Conditions Badges -->
          <div class="party-hero-conditions">
            <div style="font-size: 10pt; font-weight: 600; color: var(--text-dim); margin-bottom: 4px;">Conditions:</div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${conditions.length === 0 ? '<span style="font-size: 10pt; color: var(--accent-success); font-style: italic;">Normal (Unharmed)</span>' : ''}
              ${conditions.map(c => `
                <span class="condition-badge active">
                  ${escapeHTML(c)}
                  <span class="cond-del" onclick="gmRemoveNPCCondition(${idx}, '${escapeHTML(c)}')">&times;</span>
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Actions Row: Load into Session, Condition Select, Clear -->
          <div style="display: flex; gap: 6px; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 8px; flex-wrap: wrap;">
            <button type="button" class="btn-header small" onclick="loadNPCIntoSession(${idx})" style="font-size: 10pt; height: 28px; padding: 0 8px;" title="Load NPC into Session tab for rolling">
              Load in Session
            </button>
            <select class="select-input" style="font-size: 10pt; height: 28px; flex: 1; min-width: 110px;" onchange="if(this.value){ gmAddNPCCondition(${idx}, this.value); this.value=''; }">
              <option value="">+ Condition...</option>
              <option value="Dazed">Dazed</option>
              <option value="Staggered">Staggered</option>
              <option value="Incapacitated">Incapacitated</option>
              <option value="Compelled">Compelled</option>
              <option value="Controlled">Controlled</option>
              <option value="Defenseless">Defenseless</option>
              <option value="Disabled">Disabled</option>
              <option value="Fatigued">Fatigued</option>
              <option value="Exhausted">Exhausted</option>
              <option value="Hindered">Hindered</option>
              <option value="Immobilized">Immobilized</option>
              <option value="Impaired">Impaired</option>
              <option value="Prone">Prone</option>
              <option value="Stunned">Stunned</option>
              <option value="Vulnerable">Vulnerable</option>
            </select>
            <button type="button" class="btn-header" style="font-size: 10pt; height: 28px; padding: 0 8px;" onclick="gmClearNPCState(${idx})" title="Remove all conditions & bruises">
              Clear All
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = cardsHtml;
  }
  window.renderGMPartyTracker = renderGMPartyTracker;

  // GM live adjustment handlers for Player Heroes
  function gmAdjustMemberBruises(playerId, delta) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.partyMembers || !campaign.partyMembers[playerId]) return;
    const member = campaign.partyMembers[playerId];
    member.character.bruises = Math.max(0, (member.character.bruises || 0) + delta);
    member.character.damage = member.character.bruises;
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMPartyTracker();

    // Broadcast update to player
    sendFromGMToPlayer({
      type: 'GM_UPDATE_STATE',
      bruises: member.character.bruises,
      conditions: member.character.conditions,
      hpRemaining: member.character.hpRemaining
    }, 'broadcast');
  }
  window.gmAdjustMemberBruises = gmAdjustMemberBruises;

  function gmAdjustMemberHP(playerId, delta) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.partyMembers || !campaign.partyMembers[playerId]) return;
    const member = campaign.partyMembers[playerId];
    member.character.hpRemaining = Math.max(0, (member.character.hpRemaining !== undefined ? member.character.hpRemaining : 1) + delta);
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMPartyTracker();
  }
  window.gmAdjustMemberHP = gmAdjustMemberHP;

  function gmAddMemberCondition(playerId, condition) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.partyMembers || !campaign.partyMembers[playerId]) return;
    const member = campaign.partyMembers[playerId];
    if (!member.character.conditions) member.character.conditions = [];
    if (!member.character.conditions.includes(condition)) {
      member.character.conditions.push(condition);
      saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
      renderGMPartyTracker();
    }
  }
  window.gmAddMemberCondition = gmAddMemberCondition;

  function gmRemoveMemberCondition(playerId, condition) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.partyMembers || !campaign.partyMembers[playerId]) return;
    const member = campaign.partyMembers[playerId];
    if (member.character.conditions) {
      member.character.conditions = member.character.conditions.filter(c => c !== condition);
      saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
      renderGMPartyTracker();
    }
  }
  window.gmRemoveMemberCondition = gmRemoveMemberCondition;

  function gmClearMemberState(playerId) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.partyMembers || !campaign.partyMembers[playerId]) return;
    const member = campaign.partyMembers[playerId];
    member.character.bruises = 0;
    member.character.damage = 0;
    member.character.conditions = [];
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMPartyTracker();
    if (window.showToast) window.showToast(`Cleared conditions for ${member.character.name}.`, 'info');
  }
  window.gmClearMemberState = gmClearMemberState;

  function gmKickPartyMember(playerId) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.partyMembers || !campaign.partyMembers[playerId]) return;
    const name = campaign.partyMembers[playerId].character.name;
    delete campaign.partyMembers[playerId];
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMPartyTracker();
    if (window.showToast) window.showToast(`Removed ${name} from party.`, 'info');
  }
  window.gmKickPartyMember = gmKickPartyMember;

  // GM live adjustment handlers for NPCs in Party
  function gmAdjustNPCBruises(idx, delta) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.npcs || !campaign.npcs[idx]) return;
    const npc = campaign.npcs[idx];
    npc.bruises = Math.max(0, (npc.bruises || 0) + delta);
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMPartyTracker();
  }
  window.gmAdjustNPCBruises = gmAdjustNPCBruises;

  function gmAdjustNPCHP(idx, delta) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.npcs || !campaign.npcs[idx]) return;
    const npc = campaign.npcs[idx];
    npc.hpRemaining = Math.max(0, (npc.hpRemaining !== undefined ? npc.hpRemaining : 1) + delta);
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMPartyTracker();
  }
  window.gmAdjustNPCHP = gmAdjustNPCHP;

  function gmAddNPCCondition(idx, condition) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.npcs || !campaign.npcs[idx]) return;
    const npc = campaign.npcs[idx];
    if (!Array.isArray(npc.conditions)) npc.conditions = [];
    if (!npc.conditions.includes(condition)) {
      npc.conditions.push(condition);
      saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
      renderGMPartyTracker();
    }
  }
  window.gmAddNPCCondition = gmAddNPCCondition;

  function gmRemoveNPCCondition(idx, condition) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.npcs || !campaign.npcs[idx]) return;
    const npc = campaign.npcs[idx];
    if (Array.isArray(npc.conditions)) {
      npc.conditions = npc.conditions.filter(c => c !== condition);
      saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
      renderGMPartyTracker();
    }
  }
  window.gmRemoveNPCCondition = gmRemoveNPCCondition;

  function gmClearNPCState(idx) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.npcs || !campaign.npcs[idx]) return;
    const npc = campaign.npcs[idx];
    npc.bruises = 0;
    npc.conditions = [];
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMPartyTracker();
    if (window.showToast) window.showToast(`Cleared conditions for NPC ${npc.name}.`, 'info');
  }
  window.gmClearNPCState = gmClearNPCState;

  function removeNPCFromCampaign(idx) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.npcs || !campaign.npcs[idx]) return;

    const name = campaign.npcs[idx].name;
    campaign.npcs.splice(idx, 1);
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMPartyTracker();
    if (window.showToast) window.showToast(`Removed NPC "${name}" from party.`, 'info');
  }
  window.removeNPCFromCampaign = removeNPCFromCampaign;

  function loadNPCIntoSession(idx) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.npcs || !campaign.npcs[idx]) return;

    const npc = campaign.npcs[idx];
    if (window.checkUnsavedBeforeAction) {
      window.checkUnsavedBeforeAction(() => {
        window.currentCharacter = JSON.parse(JSON.stringify(npc.fullCharacter || npc));
        if (window.saveAndRender) window.saveAndRender();
        // Switch to session tab
        const sessionTabBtn = document.getElementById('tab-btn-session');
        if (sessionTabBtn) sessionTabBtn.click();
        if (window.showToast) window.showToast(`Loaded NPC "${npc.name}" into active session!`, 'info');
      });
    } else {
      window.currentCharacter = JSON.parse(JSON.stringify(npc.fullCharacter || npc));
      if (window.saveAndRender) window.saveAndRender();
      const sessionTabBtn = document.getElementById('tab-btn-session');
      if (sessionTabBtn) sessionTabBtn.click();
      if (window.showToast) window.showToast(`Loaded NPC "${npc.name}" into active session!`, 'info');
    }
  }
  window.loadNPCIntoSession = loadNPCIntoSession;

  // -------------------------------------------------------------------
  // NPC ASSIGNMENT: CHARACTER FILES & SAVED CHARACTERS (NO DUPLICATES)
  // -------------------------------------------------------------------
  function checkCharacterNameCollision(campaign, charName) {
    if (!charName || !campaign) return false;
    const cleanName = charName.trim().toLowerCase();

    // Check against player members
    const playerDup = Object.values(campaign.partyMembers || {}).some(
      m => (m.character?.name || '').trim().toLowerCase() === cleanName
    );
    if (playerDup) return true;

    // Check against existing assigned NPCs
    const npcDup = (campaign.npcs || []).some(
      n => (n.name || '').trim().toLowerCase() === cleanName
    );
    return npcDup;
  }

  function assignCharacterAsNPC(rawChar) {
    const campaign = getActiveGMCampaign();
    if (!campaign) {
      if (window.showToast) window.showToast('Please create or select an active campaign first.', 'error');
      return;
    }

    if (!rawChar || !rawChar.name) {
      if (window.showToast) window.showToast('Invalid character file or structure.', 'error');
      return;
    }

    const charName = rawChar.name.trim();

    // STRICT DUPLICATE PREVENTION: Checked against party members & NPCs
    if (checkCharacterNameCollision(campaign, charName)) {
      if (window.showToast) {
        window.showToast(`A character named "${charName}" is already in the party or assigned as an NPC. Duplicates are strictly not allowed.`, 'error');
      }
      return;
    }

    // Party Slot Check
    const totalCount = calculateTotalPartyCount(campaign);
    if (totalCount >= campaign.slots) {
      if (window.showToast) {
        window.showToast(`Campaign party is full (${campaign.slots} of ${campaign.slots} slots filled). Increase slots in Settings to assign more.`, 'warning');
      }
      return;
    }

    const newNPC = {
      id: generateId('npc_'),
      name: charName,
      concept: rawChar.concept || 'NPC Companion',
      pl: parseInt(rawChar.pl, 10) || 10,
      abilities: rawChar.abilities ? JSON.parse(JSON.stringify(rawChar.abilities)) : {},
      defenses: rawChar.defenses ? JSON.parse(JSON.stringify(rawChar.defenses)) : {},
      skills: rawChar.skills ? JSON.parse(JSON.stringify(rawChar.skills)) : [],
      advantages: rawChar.advantages ? JSON.parse(JSON.stringify(rawChar.advantages)) : [],
      powers: rawChar.powers ? JSON.parse(JSON.stringify(rawChar.powers)) : [],
      gear: rawChar.gear ? JSON.parse(JSON.stringify(rawChar.gear)) : [],
      bruises: rawChar.bruises || 0,
      conditions: Array.isArray(rawChar.conditions) ? [...rawChar.conditions] : [],
      hpRemaining: rawChar.hpRemaining !== undefined ? rawChar.hpRemaining : 1,
      fullCharacter: JSON.parse(JSON.stringify(rawChar))
    };

    if (!campaign.npcs) campaign.npcs = [];
    campaign.npcs.push(newNPC);

    // Alert
    addGMAlert(campaign, {
      type: 'npc_assign',
      title: 'NPC Assigned to Party',
      message: `${escapeHTML(newNPC.name)} (PL ${newNPC.pl}) assigned as NPC companion to party.`,
      characterName: newNPC.name
    });

    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMPartyTracker();
    renderGMAlerts();

    if (window.closeModal) window.closeModal('modal-assign-npc');
    if (window.showToast) window.showToast(`Assigned NPC companion "${newNPC.name}" to party!`, 'success');
  }

  function handleNPCFileUpload(fileInput) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const json = JSON.parse(e.target.result);
        const charData = json.character || json;
        assignCharacterAsNPC(charData);
      } catch (err) {
        console.error('[NPC File Load Error]', err);
        if (window.showToast) window.showToast('Failed to parse character file: invalid JSON format.', 'error');
      } finally {
        fileInput.value = '';
      }
    };
    reader.onerror = function() {
      if (window.showToast) window.showToast('Failed to read character file.', 'error');
      fileInput.value = '';
    };
    reader.readAsText(file);
  }
  window.handleNPCFileUpload = handleNPCFileUpload;

  function handleAssignSavedNPCSubmit() {
    const select = document.getElementById('assign-npc-saved-select');
    if (!select || !select.value) {
      if (window.showToast) window.showToast('Please select a character from the list.', 'warning');
      return;
    }

    try {
      const raw = localStorage.getItem(select.value);
      if (!raw) {
        if (window.showToast) window.showToast('Character not found in browser storage.', 'error');
        return;
      }
      const data = JSON.parse(raw);
      const char = data.character || data;
      assignCharacterAsNPC(char);
    } catch (err) {
      console.error('[Assign Saved NPC Error]', err);
      if (window.showToast) window.showToast('Could not load saved character.', 'error');
    }
  }
  window.handleAssignSavedNPCSubmit = handleAssignSavedNPCSubmit;

  function openAssignNPCModal() {
    const savedSelect = document.getElementById('assign-npc-saved-select');
    if (savedSelect) {
      savedSelect.innerHTML = '<option value="">-- Choose Saved Character in Browser --</option>';
      try {
        const savedKeys = Object.keys(localStorage).filter(k => k.startsWith('valiant_char_'));
        if (!savedKeys.length) {
          savedSelect.innerHTML += '<option value="" disabled>No saved characters found in browser storage</option>';
        } else {
          savedKeys.forEach(k => {
            try {
              const item = JSON.parse(localStorage.getItem(k));
              const char = item.character || item;
              if (char && char.name) {
                savedSelect.innerHTML += `<option value="${escapeHTML(k)}">${escapeHTML(char.name)} (PL ${char.pl || 10})</option>`;
              }
            } catch (e) {}
          });
        }
      } catch (e) {
        console.error('Error listing saved characters:', e);
      }
    }
    if (window.openModal) window.openModal('modal-assign-npc');
  }
  window.openAssignNPCModal = openAssignNPCModal;

  // -------------------------------------------------------------------
  // GM CENTRAL ROLL & HERO POINT LOG
  // -------------------------------------------------------------------
  function setRollLogFilter(filterType) {
    currentRollLogFilter = filterType || 'all';
    renderGMRollLog();
  }
  window.setRollLogFilter = setRollLogFilter;

  function renderGMRollLog() {
    const container = document.getElementById('gm-rolls-feed-container');
    if (!container) return;

    const campaign = getActiveGMCampaign();
    if (!campaign) {
      container.innerHTML = '<div style="color: var(--text-dim); font-size: 10pt; padding: 8px;">No active campaign.</div>';
      return;
    }

    let rolls = campaign.rollLog || [];
    if (currentRollLogFilter === 'rolls') {
      rolls = rolls.filter(r => !r.isHpSpend && r.type !== 'ROUND_ADVANCE' && r.type !== 'SESSION_STATE');
    } else if (currentRollLogFilter === 'hp') {
      rolls = rolls.filter(r => r.isHpSpend);
    }

    if (!rolls.length) {
      container.innerHTML = `
        <div style="color: var(--text-dim); font-size: 10pt; font-style: italic; padding: 12px; text-align: center;">
          ${currentRollLogFilter === 'all' ? 'No rolls or Hero Point actions logged yet for this campaign session.' : 'No entries matching current filter.'}
        </div>
      `;
      return;
    }

    container.innerHTML = rolls.map(r => {
      const timeStr = r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
      const isHp = !!r.isHpSpend;
      const isRoundAdv = r.type === 'ROUND_ADVANCE';
      const isSessionState = r.type === 'SESSION_STATE';
      const critClass = r.critType === 'crit_success' ? 'crit-success' : (r.critType === 'crit_fail' ? 'crit-fail' : '');

      let tagBadge = '';
      if (isHp) {
        tagBadge = '<span style="font-size: 10pt; background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 1px 5px; border-radius: 3px; font-weight: 700; margin-left: 6px;">⭐ Hero Point</span>';
      } else if (isRoundAdv) {
        tagBadge = '<span style="font-size: 10pt; background: var(--accent-glow); color: var(--accent-secondary); padding: 1px 5px; border-radius: 3px; font-weight: 700; margin-left: 6px;">⏩ Round Advance</span>';
      } else if (isSessionState) {
        tagBadge = '<span style="font-size: 10pt; background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 1px 5px; border-radius: 3px; font-weight: 700; margin-left: 6px;">● Session</span>';
      }

      return `
        <div class="gm-roll-log-entry ${critClass}" style="${isHp ? 'border-left: 3px solid #f59e0b;' : ''}">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong style="color: var(--accent-secondary); font-size: 10pt;">${escapeHTML(r.characterName)}</strong>
              ${tagBadge}
            </div>
            <span style="font-size: 10pt; color: var(--text-dim);">${timeStr}</span>
          </div>
          <div style="font-size: 10pt; color: var(--text-main); margin-top: 3px; font-family: var(--font-mono, monospace); line-height: 1.35;">
            ${escapeHTML(r.rollText || r.formattedText)}
          </div>
        </div>
      `;
    }).join('');
  }
  window.renderGMRollLog = renderGMRollLog;

  function clearGMRollLog() {
    const campaign = getActiveGMCampaign();
    if (!campaign) return;

    campaign.rollLog = [];
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMRollLog();
    if (window.showToast) window.showToast('Roll log cleared.', 'info');
  }
  window.clearGMRollLog = clearGMRollLog;

  // -------------------------------------------------------------------
  // GM ALERTS RENDERING (Dropdown: newest to oldest)
  // -------------------------------------------------------------------
  function renderGMAlerts() {
    const container = document.getElementById('gm-alerts-list');
    if (!container) return;

    const campaign = getActiveGMCampaign();
    if (!campaign) {
      container.innerHTML = '<div style="color: var(--text-dim); font-size: 10pt; padding: 12px;">No active campaign.</div>';
      return;
    }

    const alerts = campaign.alerts || [];
    if (!alerts.length) {
      container.innerHTML = '<div style="color: var(--text-dim); font-size: 10pt; padding: 16px; text-align: center; font-style: italic;">No alerts or notifications recorded.</div>';
      return;
    }

    // Ordered from most recent to oldest
    container.innerHTML = alerts.map(a => {
      const timeStr = a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      return `
        <div class="gm-alert-item ${a.read ? 'read' : 'unread'}">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <strong style="font-size: 10pt; color: ${a.type === 'player_join' ? 'var(--accent-success)' : 'var(--text-main)'};">
              ${escapeHTML(a.title)}
            </strong>
            <span style="font-size: 10pt; color: var(--text-dim);">${timeStr}</span>
          </div>
          <p style="font-size: 10pt; color: var(--text-muted); margin: 3px 0 0 0; line-height: 1.35;">
            ${escapeHTML(a.message)}
          </p>
        </div>
      `;
    }).join('');
  }
  window.renderGMAlerts = renderGMAlerts;

  // -------------------------------------------------------------------
  // PLAYER CAMPAIGNS MODAL RENDERING & CONTROLS
  // -------------------------------------------------------------------
  function renderPlayerCampaignsModal() {
    const container = document.getElementById('player-campaigns-list');
    if (!container) return;

    const campaigns = getPlayerCampaigns();
    const currentChar = window.currentCharacter;
    const activeGmCamp = getActiveGMCampaign();
    const isHostingLiveSession = !!(activeGmCamp && activeGmCamp.sessionActive);

    // Host warning banner container if GM is actively hosting
    const joinInput = document.getElementById('join-camp-link-input');
    const joinBtn = document.getElementById('btn-join-campaign');
    const warningContainer = document.getElementById('player-campaigns-warning');

    if (joinInput && joinBtn) {
      if (isHostingLiveSession) {
        joinInput.disabled = true;
        joinBtn.disabled = true;
        if (warningContainer) {
          warningContainer.innerHTML = `
            <div class="gm-host-warning-banner">
              ⚠️ You are actively hosting a game session as GM ("${escapeHTML(activeGmCamp.title)}"). Joining or connecting to other campaigns is disabled while your hosted session is live.
            </div>
          `;
          warningContainer.style.display = 'block';
        }
      } else {
        joinInput.disabled = false;
        joinBtn.disabled = false;
        if (warningContainer) {
          warningContainer.innerHTML = '';
          warningContainer.style.display = 'none';
        }
      }
    }

    if (!campaigns.length) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 10pt; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
          You haven't joined any campaigns yet. Paste a Campaign Invite Link above to connect to your GM.
        </div>
      `;
      return;
    }

    container.innerHTML = campaigns.map(c => {
      const isAttached = currentChar && (c.attachedCharacterId === currentChar.id || c.attachedCharacterName === currentChar.name);
      const connStatus = c.connectionStatus || 'offline';
      const statusLabel = connStatus === 'connected' ? '🟢 Connected' : (connStatus === 'connecting' ? '🟡 Connecting...' : '⚪ Offline');

      return `
        <div class="player-camp-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <strong style="font-size: 15px; color: var(--accent-secondary);">${escapeHTML(c.title)}</strong>
                <span class="status-pill-${connStatus}">${statusLabel}</span>
                <span class="gm-badge-pl">PL: ${c.plMin} – ${c.plMax}</span>
              </div>
              <p style="font-size: 10pt; color: var(--text-muted); margin: 4px 0 8px 0; line-height: 1.4;">
                ${escapeHTML(c.description || 'Campaign in progress.')}
              </p>
              <div style="font-size: 10pt; color: var(--text-dim);">
                Slots: <strong>${c.openSlots !== undefined ? c.openSlots : '?'} open</strong> (out of ${c.slots || 4})
                ${c.discordServerName ? ` &bull; Discord: <strong>${escapeHTML(c.discordServerName)}</strong>` : ''}
              </div>
            </div>
            <button class="btn-remove-sub" onclick="confirmLeaveCampaign('${c.id}')" title="Leave Campaign">&times;</button>
          </div>

          <!-- Character Attachment Status & Controls -->
          <div class="player-camp-attach-bar">
            ${isAttached ? `
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: var(--accent-success); font-size: 14px;">✔</span>
                  <span style="font-size: 10pt; color: var(--text-main);">
                    Attached Character: <strong>${escapeHTML(currentChar.name)}</strong> (PL ${currentChar.pl || 10})
                  </span>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn-header small" onclick="syncCharacterToCampaign('${c.id}')" title="Resync health, bruises, and stats to GM">
                    🔄 Resync
                  </button>
                  <button type="button" class="btn-header danger small" onclick="detachCharacterFromCampaign('${c.id}')">
                    Detach
                  </button>
                </div>
              </div>
            ` : `
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 8px;">
                <span style="font-size: 10pt; color: var(--text-dim);">
                  ${currentChar ? `Attach active character: <strong>${escapeHTML(currentChar.name)}</strong> (PL ${currentChar.pl || 10})` : 'Create or load a character to attach to this campaign.'}
                </span>
                <button type="button" class="btn-header primary small" onclick="attachCurrentCharacterToCampaign('${c.id}')" ${!currentChar || isHostingLiveSession ? 'disabled' : ''}>
                  Attach Character
                </button>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  }
  window.renderPlayerCampaignsModal = renderPlayerCampaignsModal;

  function attachCurrentCharacterToCampaign(campId) {
    const char = window.currentCharacter;
    if (!char) {
      if (window.showToast) window.showToast('Please load or create a character first.', 'warning');
      return;
    }

    const list = getPlayerCampaigns();
    const camp = list.find(c => c.id === campId);
    if (!camp) return;

    camp.attachedCharacterId = char.id;
    camp.attachedCharacterName = char.name;
    savePlayerCampaigns(list);

    // Auto-sync Discord server to campaign's server if defined
    if (camp.discordServerId) {
      syncActiveDiscordServerWithCampaign(camp);
    }

    // Send ATTACH packet to GM
    sendFromPlayerToGM(campId, {
      type: 'ATTACH_CHAR',
      campId,
      playerId: getPlayerUniqueId(),
      playerName: char.name,
      character: JSON.parse(JSON.stringify(char))
    });

    renderPlayerCampaignsModal();
    if (window.showToast) window.showToast(`Sent ${char.name} to GM for campaign "${camp.title}"!`, 'info');
  }
  window.attachCurrentCharacterToCampaign = attachCurrentCharacterToCampaign;

  function detachCharacterFromCampaign(campId) {
    const list = getPlayerCampaigns();
    const camp = list.find(c => c.id === campId);
    if (!camp) return;

    const oldName = camp.attachedCharacterName;
    camp.attachedCharacterId = '';
    camp.attachedCharacterName = '';
    savePlayerCampaigns(list);

    sendFromPlayerToGM(campId, {
      type: 'DETACH_CHAR',
      campId,
      playerId: getPlayerUniqueId(),
      characterName: oldName
    });

    renderPlayerCampaignsModal();
    if (window.showToast) window.showToast('Detached from campaign.', 'info');
  }
  window.detachCharacterFromCampaign = detachCharacterFromCampaign;

  function syncCharacterToCampaign(campId) {
    broadcastStateSyncFromPlayer();
    if (window.showToast) window.showToast('Character status synced to GM.', 'success');
  }
  window.syncCharacterToCampaign = syncCharacterToCampaign;

  function confirmLeaveCampaign(campId) {
    if (confirm('Are you sure you want to leave this campaign?')) {
      leavePlayerCampaign(campId);
    }
  }
  window.confirmLeaveCampaign = confirmLeaveCampaign;

  // -------------------------------------------------------------------
  // MODAL CONTROLS & EVENT BINDINGS
  // -------------------------------------------------------------------
  function openCampaignsModal() {
    renderPlayerCampaignsModal();
    if (window.openModal) window.openModal('modal-campaigns');
  }
  window.openCampaignsModal = openCampaignsModal;

  let editingCampaignId = null;

  function openCreateCampaignModal() {
    editingCampaignId = null;
    const titleInp = document.getElementById('create-camp-title');
    const descInp = document.getElementById('create-camp-desc');
    const plMinInp = document.getElementById('create-camp-pl-min');
    const plMaxInp = document.getElementById('create-camp-pl-max');
    const slotsInp = document.getElementById('create-camp-slots');
    const discordSel = document.getElementById('create-camp-discord');

    if (titleInp) titleInp.value = 'New Valiant Campaign';
    if (descInp) descInp.value = '';
    if (plMinInp) plMinInp.value = '8';
    if (plMaxInp) plMaxInp.value = '12';
    if (slotsInp) slotsInp.value = '4';

    // Populate Discord servers dropdown
    if (discordSel && typeof window.getDiscordServers === 'function') {
      const servers = window.getDiscordServers();
      discordSel.innerHTML = '<option value="">None (Local Only)</option>' +
        servers.map(s => `<option value="${s.id}">${escapeHTML(s.name)}</option>`).join('');
    }

    if (window.openModal) window.openModal('modal-create-campaign');
  }
  window.openCreateCampaignModal = openCreateCampaignModal;

  function openEditCampaignModal(id) {
    editingCampaignId = id;
    const camp = getGMCampaigns().find(c => c.id === id);
    if (!camp) return;

    const titleInp = document.getElementById('create-camp-title');
    const descInp = document.getElementById('create-camp-desc');
    const plMinInp = document.getElementById('create-camp-pl-min');
    const plMaxInp = document.getElementById('create-camp-pl-max');
    const slotsInp = document.getElementById('create-camp-slots');
    const discordSel = document.getElementById('create-camp-discord');

    if (titleInp) titleInp.value = camp.title || '';
    if (descInp) descInp.value = camp.description || '';
    if (plMinInp) plMinInp.value = camp.plMin || 8;
    if (plMaxInp) plMaxInp.value = camp.plMax || 12;
    if (slotsInp) slotsInp.value = camp.slots || 4;

    if (discordSel && typeof window.getDiscordServers === 'function') {
      const servers = window.getDiscordServers();
      discordSel.innerHTML = '<option value="">None (Local Only)</option>' +
        servers.map(s => `<option value="${s.id}" ${s.id === camp.discordServerId ? 'selected' : ''}>${escapeHTML(s.name)}</option>`).join('');
    }

    if (window.openModal) window.openModal('modal-create-campaign');
  }
  window.openEditCampaignModal = openEditCampaignModal;

  function handleCreateCampaignSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const title = document.getElementById('create-camp-title')?.value || 'Valiant Campaign';
    const description = document.getElementById('create-camp-desc')?.value || '';
    const plMin = document.getElementById('create-camp-pl-min')?.value || 8;
    const plMax = document.getElementById('create-camp-pl-max')?.value || 12;
    const slots = document.getElementById('create-camp-slots')?.value || 4;
    const discordServerId = document.getElementById('create-camp-discord')?.value || '';

    if (editingCampaignId) {
      updateGMCampaign(editingCampaignId, {
        title,
        description,
        plMin: parseInt(plMin, 10) || 8,
        plMax: parseInt(plMax, 10) || 12,
        slots: Math.max(1, parseInt(slots, 10) || 4),
        discordServerId
      });
      editingCampaignId = null;
      if (window.closeModal) window.closeModal('modal-create-campaign');
      if (window.showToast) window.showToast('Campaign settings updated!', 'success');
      renderGMTab();
    } else {
      const camp = createGMCampaign({ title, description, plMin, plMax, slots, discordServerId });
      if (window.closeModal) window.closeModal('modal-create-campaign');
      if (window.showToast) window.showToast(`Campaign "${camp.title}" created successfully!`, 'success');
      renderGMTab();
    }
  }
  window.handleCreateCampaignSubmit = handleCreateCampaignSubmit;

  function confirmDeleteCampaign(id) {
    const camp = getGMCampaigns().find(c => c.id === id);
    if (!camp) return;

    if (confirm(`Are you sure you want to delete campaign "${camp.title}"? This cannot be undone.`)) {
      deleteGMCampaign(id);
      if (window.showToast) window.showToast('Campaign deleted.', 'info');
    }
  }
  window.confirmDeleteCampaign = confirmDeleteCampaign;

  function copyCampaignLink() {
    const input = document.getElementById('gm-share-link-input');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        if (window.showToast) window.showToast('Campaign invite link copied to clipboard!', 'success');
      }).catch(() => {
        document.execCommand('copy');
        if (window.showToast) window.showToast('Campaign invite link copied!', 'success');
      });
    }
  }
  window.copyCampaignLink = copyCampaignLink;

  function handleJoinCampaignInputSubmit() {
    const inp = document.getElementById('join-camp-link-input');
    if (!inp || !inp.value.trim()) return;

    const res = joinCampaignByLinkOrCode(inp.value.trim());
    if (res.success) {
      inp.value = '';
      renderPlayerCampaignsModal();
      if (window.showToast) window.showToast('Connected to campaign! Now attach your character.', 'success');
    } else {
      if (window.showToast) window.showToast(res.error, 'warning');
    }
  }
  window.handleJoinCampaignInputSubmit = handleJoinCampaignInputSubmit;

  // -------------------------------------------------------------------
  // INITIALIZATION ON PAGE LOAD
  // -------------------------------------------------------------------
  function initCampaignModule() {
    // Check if URL has ?campaign=code
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const campParam = urlParams.get('campaign');
      if (campParam) {
        setTimeout(() => {
          const res = joinCampaignByLinkOrCode(campParam);
          openCampaignsModal();
          if (res.success && window.showToast) {
            window.showToast(`Joined campaign from link! Attach your hero below.`, 'info');
          }
        }, 500);
      }
    } catch (e) {}

    // Init active GM campaign peer
    initGMP2P();
    updateAlertsBadges();

    // Auto-connect player to existing joined campaigns
    const playerCamps = getPlayerCampaigns();
    playerCamps.forEach(c => {
      connectPlayerToGMCampaign(c.id);
    });
  }

  // Bind to DOMContentLoaded or execute immediately if document is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCampaignModule);
    } else {
      initCampaignModule();
    }
  }

  // Export module to global scope
  window.ValiantCampaign = {
    getGMCampaigns,
    saveGMCampaigns,
    getActiveGMCampaign,
    getActiveGMCampaignId,
    setActiveGMCampaignId,
    createGMCampaign,
    updateGMCampaign,
    deleteGMCampaign,
    toggleGMSessionState,
    advanceGMCampaignRound,
    getPlayerCampaigns,
    joinCampaignByLinkOrCode,
    leavePlayerCampaign,
    assignCharacterAsNPC,
    renderGMTab,
    renderPlayerCampaignsModal,
    broadcastRollFromPlayer,
    broadcastStateSyncFromPlayer
  };

})(typeof window !== 'undefined' ? window : global);
