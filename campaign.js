// =====================================================================
// VALIANT ADVENTURES RPG - CAMPAIGN & GM PEER-TO-PEER NETWORKING SYSTEM
// Module: campaign.js (v1.6.33)
// Supports: GM Tab, P2P (WebRTC PeerJS + BroadcastChannel Fallback),
// Live Party Health & Bruises Tracker, Roll Log, and Alerts System.
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
      npcs: [],
      partyMembers: {}, // playerId -> { playerId, playerName, character, isConnected, lastSeen }
      alerts: [
        {
          id: generateId('alert_'),
          type: 'info',
          title: 'Campaign Created',
          message: `Campaign "${opts.title || 'New Campaign'}" successfully initiated. Share the campaign link with players to join.`,
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
      joinedAt: new Date().toISOString(),
      attachedCharacterId: '',
      attachedCharacterName: '',
      connectionStatus: 'connecting'
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
    const origin = window.location.origin || '';
    const pathname = window.location.pathname || '';
    return `${origin}${pathname}?campaign=${campaignId}`;
  }

  // GM HOST INITIALIZATION
  function initGMP2P() {
    const campaign = getActiveGMCampaign();
    if (!campaign) return;

    const campId = campaign.id;

    // 1. Initialize BroadcastChannel for same-browser / multi-tab zero-latency offline messaging
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

    // 2. Initialize PeerJS (WebRTC) for remote internet-wide connections
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
        // Return campaign info to connecting player
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
          npcsCount: (campaign.npcs || []).length
        };
        sendFromGMToPlayer(infoPkt, source);
        break;
      }

      case 'ATTACH_CHAR': {
        const { playerId, playerName, character } = pkt;
        if (!character) return;

        // Check slots
        const memberCount = Object.keys(campaign.partyMembers || {}).length;
        if (memberCount >= campaign.slots && !campaign.partyMembers[playerId]) {
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
          characterName: character.name
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
        const { characterName, rollText, isCrit, critType, formattedText, timestamp } = pkt;
        appendRollToGMLog(campaign, {
          id: generateId('roll_'),
          characterName: characterName || 'Player',
          rollText: rollText || formattedText,
          isCrit: !!isCrit,
          critType: critType || 'none',
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
          camp.connectionStatus = 'connected';
          savePlayerCampaigns(list);
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
      discordServerName: getCampaignDiscordServerName(campaign)
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

  function calculateOpenSlots(campaign) {
    const totalSlots = campaign.slots || 4;
    const occupied = Object.keys(campaign.partyMembers || {}).length;
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
  // LIVE ROLL LOGGING (GM & Player Hooks)
  // -------------------------------------------------------------------
  function appendRollToGMLog(campaign, rollEntry) {
    if (!campaign.rollLog) campaign.rollLog = [];
    campaign.rollLog.unshift(rollEntry); // newest first
    if (campaign.rollLog.length > 100) {
      campaign.rollLog.length = 100;
    }
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMRollLog();

    // Echo to Discord if GM has an active campaign Discord server attached
    if (campaign.discordServerId && typeof window.getDiscordServers === 'function') {
      const servers = window.getDiscordServers();
      const srv = servers.find(s => s.id === campaign.discordServerId);
      if (srv && srv.webhookUrl && srv.echoRolls !== false) {
        const payload = {
          content: `🎲 **${escapeHTML(rollEntry.characterName)}**: ${rollEntry.rollText}`,
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

  // Hook called by app.js when player rolls dice
  function broadcastRollFromPlayer(rollData) {
    const campaigns = getPlayerCampaigns();
    const char = window.currentCharacter;
    if (!char) return;

    campaigns.forEach(camp => {
      if (camp.attachedCharacterId === char.id || camp.attachedCharacterName === char.name) {
        sendFromPlayerToGM(camp.id, {
          type: 'ROLL_EVENT',
          campId: camp.id,
          characterName: char.name,
          rollText: rollData.formattedText || rollData.text,
          isCrit: rollData.isCrit,
          critType: rollData.critType,
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
        rollText: rollData.formattedText || rollData.text,
        isCrit: rollData.isCrit,
        critType: rollData.critType,
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
          hpRemaining: char.hpRemaining || 0
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

    // Render Active Campaign Overview & Invite Link Box
    const banner = document.getElementById('gm-active-camp-banner');
    if (banner) {
      const link = getCampaignLink(activeCamp.id);
      const memberCount = Object.keys(activeCamp.partyMembers || {}).length;
      const npcCount = (activeCamp.npcs || []).length;
      const openSlots = calculateOpenSlots(activeCamp);
      const discordName = getCampaignDiscordServerName(activeCamp);

      banner.innerHTML = `
        <div class="gm-camp-header-card">
          <div class="gm-camp-header-top">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <h2 style="font-size: 20px; color: var(--accent-secondary); margin: 0;">${escapeHTML(activeCamp.title)}</h2>
                <span class="gm-badge-pl">Target PL: ${activeCamp.plMin} – ${activeCamp.plMax}</span>
                <span class="gm-badge-slots ${openSlots === 0 ? 'full' : ''}">
                  ${memberCount} of ${activeCamp.slots} Slots Filled (${openSlots} open)
                </span>
                ${discordName ? `<span class="gm-badge-discord" title="Rolls echo to Discord">📡 ${escapeHTML(discordName)}</span>` : ''}
              </div>
              <p style="font-size: 10pt; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4;">
                ${escapeHTML(activeCamp.description || 'No description provided.')}
              </p>
            </div>
            <div style="display: flex; gap: 8px;">
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
    renderGMAssignedNPCs();
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
  // LIVE PARTY CONDITIONS & BRUISES TRACKER
  // -------------------------------------------------------------------
  function renderGMPartyTracker() {
    const container = document.getElementById('gm-party-members-grid');
    if (!container) return;

    const campaign = getActiveGMCampaign();
    if (!campaign) {
      container.innerHTML = '<div style="color: var(--text-dim); font-size: 10pt; padding: 12px;">No active campaign.</div>';
      return;
    }

    const members = Object.values(campaign.partyMembers || {});
    if (!members.length) {
      container.innerHTML = `
        <div style="padding: 18px; text-align: center; color: var(--text-dim); font-size: 10pt; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
          No heroes currently attached to this campaign. Players can join using the invite link.
        </div>
      `;
      return;
    }

    container.innerHTML = members.map(m => {
      const char = m.character;
      const bruises = char.bruises || 0;
      const hp = char.hpRemaining !== undefined ? char.hpRemaining : 1;
      const conditions = char.conditions || [];
      const isOnline = m.isConnected;

      return `
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
    }).join('');
  }
  window.renderGMPartyTracker = renderGMPartyTracker;

  // GM live adjustment handlers
  function gmAdjustMemberBruises(playerId, delta) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.partyMembers || !campaign.partyMembers[playerId]) return;
    const member = campaign.partyMembers[playerId];
    member.character.bruises = Math.max(0, (member.character.bruises || 0) + delta);
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

  // -------------------------------------------------------------------
  // GM NPC ASSIGNMENT & MANAGEMENT
  // -------------------------------------------------------------------
  function renderGMAssignedNPCs() {
    const container = document.getElementById('gm-npcs-list-container');
    if (!container) return;

    const campaign = getActiveGMCampaign();
    if (!campaign) {
      container.innerHTML = '';
      return;
    }

    const npcs = campaign.npcs || [];
    if (!npcs.length) {
      container.innerHTML = `
        <div style="color: var(--text-dim); font-size: 10pt; font-style: italic; padding: 8px 0;">
          No NPCs currently assigned. Click "+ Assign NPC" to assign villains, allies, or henchmen.
        </div>
      `;
      return;
    }

    container.innerHTML = npcs.map((npc, idx) => `
      <div class="gm-npc-item">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong style="color: var(--accent-secondary); font-size: 10pt;">${escapeHTML(npc.name)}</strong>
            <span style="font-size: 10pt; color: var(--text-dim); margin-left: 6px;">(PL ${npc.pl || 10})</span>
            <div style="font-size: 10pt; color: var(--text-muted); margin-top: 2px;">${escapeHTML(npc.concept || 'NPC Combatant')}</div>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button type="button" class="btn-header small" onclick="loadNPCIntoSession(${idx})" title="Load NPC into Session tab for combat rolling">
              Load in Session
            </button>
            <button type="button" class="btn-remove-sub" onclick="removeNPCFromCampaign(${idx})" title="Remove NPC">&times;</button>
          </div>
        </div>
      </div>
    `).join('');
  }
  window.renderGMAssignedNPCs = renderGMAssignedNPCs;

  function assignNPCToCampaign(npcData) {
    const campaign = getActiveGMCampaign();
    if (!campaign) return;

    if (!campaign.npcs) campaign.npcs = [];
    campaign.npcs.push(npcData);
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMAssignedNPCs();
    if (window.showToast) window.showToast(`Assigned NPC "${npcData.name}" to campaign!`, 'success');
  }
  window.assignNPCToCampaign = assignNPCToCampaign;

  function removeNPCFromCampaign(idx) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.npcs) return;

    campaign.npcs.splice(idx, 1);
    saveGMCampaigns(getGMCampaigns().map(c => c.id === campaign.id ? campaign : c));
    renderGMAssignedNPCs();
  }
  window.removeNPCFromCampaign = removeNPCFromCampaign;

  function loadNPCIntoSession(idx) {
    const campaign = getActiveGMCampaign();
    if (!campaign || !campaign.npcs || !campaign.npcs[idx]) return;

    const npc = campaign.npcs[idx];
    if (window.checkUnsavedBeforeAction) {
      window.checkUnsavedBeforeAction(() => {
        window.currentCharacter = JSON.parse(JSON.stringify(npc));
        if (window.saveAndRender) window.saveAndRender();
        // Switch to session tab
        const sessionTabBtn = document.getElementById('tab-btn-session');
        if (sessionTabBtn) sessionTabBtn.click();
        if (window.showToast) window.showToast(`Loaded NPC "${npc.name}" into active session!`, 'info');
      });
    }
  }
  window.loadNPCIntoSession = loadNPCIntoSession;

  // -------------------------------------------------------------------
  // GM CENTRAL ROLL LOG
  // -------------------------------------------------------------------
  function renderGMRollLog() {
    const container = document.getElementById('gm-rolls-feed-container');
    if (!container) return;

    const campaign = getActiveGMCampaign();
    if (!campaign) {
      container.innerHTML = '<div style="color: var(--text-dim); font-size: 10pt; padding: 8px;">No active campaign.</div>';
      return;
    }

    const rolls = campaign.rollLog || [];
    if (!rolls.length) {
      container.innerHTML = '<div style="color: var(--text-dim); font-size: 10pt; font-style: italic; padding: 12px; text-align: center;">No rolls logged yet for this campaign session.</div>';
      return;
    }

    container.innerHTML = rolls.map(r => {
      const timeStr = r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
      const isCrit = r.isCrit;
      const critClass = r.critType === 'crit_success' ? 'crit-success' : (r.critType === 'crit_fail' ? 'crit-fail' : '');

      return `
        <div class="gm-roll-log-entry ${critClass}">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <strong style="color: var(--accent-secondary); font-size: 10pt;">${escapeHTML(r.characterName)}</strong>
            <span style="font-size: 10pt; color: var(--text-dim);">${timeStr}</span>
          </div>
          <div style="font-size: 10pt; color: var(--text-main); margin-top: 2px; font-family: var(--font-mono, monospace);">
            ${escapeHTML(r.rollText)}
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
                <span class="gm-badge-pl">Required PL: ${c.plMin} – ${c.plMax}</span>
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
                <button type="button" class="btn-header primary small" onclick="attachCurrentCharacterToCampaign('${c.id}')" ${!currentChar ? 'disabled' : ''}>
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
    if (window.showToast) window.showToast(`Detached from campaign.`, 'info');
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

  // Assign NPC Modal
  function openAssignNPCModal() {
    const select = document.getElementById('assign-npc-select');
    if (select && window.VALIANT_DATA?.archetypes) {
      select.innerHTML = '<option value="">-- Choose Character / Archetype --</option>' +
        window.VALIANT_DATA.archetypes.map((a, i) => `
          <option value="arch_${i}">${escapeHTML(a.name)} (Stock PL ${a.pl || 10})</option>
        `).join('');
    }
    if (window.openModal) window.openModal('modal-assign-npc');
  }
  window.openAssignNPCModal = openAssignNPCModal;

  function handleAssignNPCSubmit() {
    const select = document.getElementById('assign-npc-select');
    if (!select || !select.value) return;

    const val = select.value;
    let npcData = null;

    if (val.startsWith('arch_')) {
      const idx = parseInt(val.replace('arch_', ''), 10);
      const arch = window.VALIANT_DATA?.archetypes?.[idx];
      if (arch) {
        npcData = {
          name: `${arch.name} (NPC)`,
          concept: arch.concept,
          pl: arch.pl || 10,
          abilities: JSON.parse(JSON.stringify(arch.abilities)),
          defenses: JSON.parse(JSON.stringify(arch.defenses)),
          skills: JSON.parse(JSON.stringify(arch.skills)),
          advantages: JSON.parse(JSON.stringify(arch.advantages)),
          powers: JSON.parse(JSON.stringify(arch.powers)),
          gear: JSON.parse(JSON.stringify(arch.gear || [])),
          bruises: 0,
          conditions: [],
          hpRemaining: 1
        };
      }
    }

    if (npcData) {
      assignNPCToCampaign(npcData);
      if (window.closeModal) window.closeModal('modal-assign-npc');
    }
  }
  window.handleAssignNPCSubmit = handleAssignNPCSubmit;

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
    createGMCampaign,
    updateGMCampaign,
    deleteGMCampaign,
    getPlayerCampaigns,
    joinCampaignByLinkOrCode,
    leavePlayerCampaign,
    assignNPCToCampaign,
    renderGMTab,
    renderPlayerCampaignsModal,
    broadcastRollFromPlayer,
    broadcastStateSyncFromPlayer
  };

})(typeof window !== 'undefined' ? window : global);
