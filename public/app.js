/* ============================================
   TAP BOT PRO — APPLICATION LOGIC v3.5
   Ultra-responsive multi-touch tap game engine
   ============================================ */

const API_BASE = window.location.origin;

const STATE = {
  user: null,
  count: 0,
  target: 100,
  multiplier: 1,
  totalAllTime: 0,
  streakDays: 1,
  level: 1,
  energy: 1000,
  maxEnergy: 1000,
  vibrationEnabled: true,
  soundEnabled: true,
  currentTab: 'counter',
  telegramId: null,
  isAdmin: false,
  isBlocked: false,
};

// Batch Sync
let _pendingTaps = 0;
let _batchTimer = null;
const BATCH_INTERVAL = 2500;
const BATCH_THRESHOLD = 15;

// Audio Context for synthetic coin click sound
let _audioCtx = null;
function playTapSound() {
  if (!STATE.soundEnabled) return;
  try {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_audioCtx.state === 'suspended') {
      _audioCtx.resume();
    }
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, _audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, _audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, _audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, _audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(_audioCtx.destination);

    osc.start();
    osc.stop(_audioCtx.currentTime + 0.09);
  } catch (e) {}
}

function triggerHaptic() {
  if (!STATE.vibrationEnabled) return;
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    } else if (navigator.vibrate) {
      navigator.vibrate(12);
    }
  } catch (e) {}
}

// Spawn floating popup numbers on screen coordinate
function spawnTapPopup(x, y, amount) {
  const container = document.getElementById('tapParticlesContainer');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'tap-popup-number';
  el.textContent = `+${amount}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  container.appendChild(el);
  setTimeout(() => {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }, 800);
}

// Level Definition
const LEAGUES = [
  { level: 1, name: 'Bronze Liga', icon: '🥉', minXp: 0, maxXp: 500 },
  { level: 2, name: 'Silver Liga', icon: '🥈', minXp: 500, maxXp: 3000 },
  { level: 3, name: 'Gold Liga', icon: '🥇', minXp: 3000, maxXp: 10000 },
  { level: 4, name: 'Platinum Liga', icon: '💠', minXp: 10000, maxXp: 20000 },
  { level: 5, name: 'Diamond Liga', icon: '💎', minXp: 20000, maxXp: 50000 },
  { level: 6, name: 'Master Liga', icon: '👑', minXp: 50000, maxXp: 100000 },
  { level: 7, name: 'Legend Liga', icon: '⚡', minXp: 100000, maxXp: 9999999 },
];

function getCurrentLeague(totalScore) {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (totalScore >= LEAGUES[i].minXp) return LEAGUES[i];
  }
  return LEAGUES[0];
}

function updateLevelUI() {
  const league = getCurrentLeague(STATE.totalAllTime);
  STATE.level = league.level;

  const levelIconEl = document.getElementById('levelIcon');
  const levelTitleEl = document.getElementById('levelTitle');
  const topBadgeEl = document.getElementById('topLeagueBadge');
  const currentXpEl = document.getElementById('levelCurrentXp');
  const nextXpEl = document.getElementById('levelNextXp');
  const fillEl = document.getElementById('levelProgressFill');

  if (levelIconEl) levelIconEl.textContent = league.icon;
  if (levelTitleEl) levelTitleEl.textContent = league.name;
  if (topBadgeEl) topBadgeEl.textContent = `${league.icon} ${league.name.split(' ')[0]}`;

  if (currentXpEl) currentXpEl.textContent = STATE.totalAllTime.toLocaleString();
  if (nextXpEl) nextXpEl.textContent = league.maxXp.toLocaleString();

  if (fillEl) {
    const range = league.maxXp - league.minXp;
    const progress = Math.min(100, Math.max(0, ((STATE.totalAllTime - league.minXp) / range) * 100));
    fillEl.style.width = `${progress}%`;
  }
}

// Queue & Batch Send
function queueTap(amount = 1) {
  _pendingTaps += amount;
  if (_pendingTaps >= BATCH_THRESHOLD) {
    flushTaps();
    return;
  }
  if (!_batchTimer) {
    _batchTimer = setTimeout(flushTaps, BATCH_INTERVAL);
  }
}

async function flushTaps() {
  if (_batchTimer) {
    clearTimeout(_batchTimer);
    _batchTimer = null;
  }
  const tapsToSend = _pendingTaps;
  if (tapsToSend === 0) return;
  _pendingTaps = 0;

  try {
    const result = await apiCall('/api/count-batch', 'POST', {
      telegram_id: STATE.telegramId,
      count: tapsToSend,
    });
    if (result) {
      STATE.user = result;
      STATE.count = result.count || 0;
      STATE.totalAllTime = result.total_all_time || 0;
      STATE.streakDays = result.streak_days || 1;
      updateUI();
    }
  } catch (e) {
    _pendingTaps += tapsToSend;
  }
}

window.addEventListener('beforeunload', () => {
  if (_pendingTaps > 0) {
    const data = JSON.stringify({
      telegram_id: STATE.telegramId,
      count: _pendingTaps,
    });
    navigator.sendBeacon(`${API_BASE}/api/count-batch`, new Blob([data], { type: 'application/json' }));
  }
});

// API Helper
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) options.body = JSON.stringify(data);
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    return null;
  }
}

// Perform Tap
function handleTap(e) {
  e.preventDefault();

  const multiplier = STATE.multiplier || 1;
  const energyCost = multiplier;

  if (STATE.energy < energyCost) {
    // Energy depleted
    triggerHaptic();
    return;
  }

  // Deduct energy
  STATE.energy = Math.max(0, STATE.energy - energyCost);
  updateEnergyUI();

  // Increase count
  STATE.count += multiplier;
  STATE.totalAllTime += multiplier;

  // Sound and Haptic
  playTapSound();
  triggerHaptic();

  // Floating coordinates
  if (e.touches && e.touches.length > 0) {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      spawnTapPopup(touch.clientX, touch.clientY, multiplier);
    }
  } else {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() * 40 - 20);
    const y = rect.top + rect.height / 2 + (Math.random() * 40 - 20);
    spawnTapPopup(x, y, multiplier);
  }

  // Queue to server
  queueTap(multiplier);

  // Update UI & check celebration
  updateUI();
  checkTargetCelebration();
}

function updateEnergyUI() {
  const currentEl = document.getElementById('energyCurrent');
  const maxEl = document.getElementById('energyMax');
  const fillEl = document.getElementById('energyFill');

  if (currentEl) currentEl.textContent = STATE.energy;
  if (maxEl) maxEl.textContent = STATE.maxEnergy;
  if (fillEl) {
    const pct = (STATE.energy / STATE.maxEnergy) * 100;
    fillEl.style.width = `${pct}%`;
  }
}

// Energy Regeneration Loop (10 energy every second)
setInterval(() => {
  if (STATE.energy < STATE.maxEnergy) {
    STATE.energy = Math.min(STATE.maxEnergy, STATE.energy + 10);
    updateEnergyUI();
  }
}, 1000);

function setMultiplier(val) {
  STATE.multiplier = Number(val) || 1;
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.multiplier === String(val));
  });
}

function setTarget(val) {
  STATE.target = Number(val);
  document.querySelectorAll('.target-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.target === String(val));
  });
  updateUI();
}

function updateUI() {
  const countEl = document.getElementById('counterNumber');
  const targetEl = document.getElementById('counterTarget');
  const ringFill = document.getElementById('progressRing');
  const totalVal = document.getElementById('totalValue');
  const streakVal = document.getElementById('streakValue');

  if (countEl) countEl.textContent = STATE.count.toLocaleString();
  if (targetEl) targetEl.textContent = STATE.target === 0 ? '/ ∞' : `/ ${STATE.target.toLocaleString()}`;
  if (totalVal) totalVal.textContent = STATE.totalAllTime.toLocaleString();
  if (streakVal) streakVal.textContent = STATE.streakDays || 1;

  // Ring progress
  if (ringFill) {
    const max = STATE.target === 0 ? 1000 : STATE.target;
    const progress = Math.min(STATE.count / max, 1);
    const circumference = 2 * Math.PI * 120; // 753.98
    const offset = circumference - (progress * circumference);
    ringFill.style.strokeDashoffset = offset;
  }

  updateLevelUI();
  updateProfileStats();
}

function checkTargetCelebration() {
  if (STATE.target > 0 && STATE.count >= STATE.target) {
    showCelebrationModal(STATE.count);
  }
}

function showCelebrationModal(count) {
  const overlay = document.getElementById('celebrationOverlay');
  const text = document.getElementById('celebrationText');
  if (overlay && text) {
    text.textContent = `${count.toLocaleString()} ta tanga to'pladingiz!`;
    overlay.style.display = 'flex';
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  }
}

function closeCelebrationModal() {
  const overlay = document.getElementById('celebrationOverlay');
  if (overlay) overlay.style.display = 'none';
}

function resetCount() {
  if (confirm(t('resetConfirm'))) {
    STATE.count = 0;
    updateUI();
    apiCall('/api/reset', 'POST', { telegram_id: STATE.telegramId });
  }
}

// Navigation Tabs
function switchTab(tabName) {
  STATE.currentTab = tabName;

  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));

  const page = document.getElementById(`page${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
  const btn = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);

  if (page) page.classList.add('active');
  if (btn) btn.classList.add('active');

  if (tabName === 'leaderboard') loadLeaderboard();
  if (tabName === 'donate') loadShop();
  if (tabName === 'profile') loadProfile();
}

// Leaderboard Loading
async function loadLeaderboard() {
  const res = await apiCall('/api/leaderboard');
  if (!res || !res.users) return;

  const users = res.users;
  const countEl = document.getElementById('totalUsersCount');
  if (countEl) countEl.textContent = `${res.total_users || users.length} ${t('usersCount')}`;

  // Podium (Top 3)
  if (users[0]) {
    document.getElementById('podiumName1').textContent = users[0].first_name || users[0].username || 'Player';
    document.getElementById('podiumScore1').textContent = (users[0].total_all_time || 0).toLocaleString();
    const av1 = document.getElementById('podiumAvatar1');
    if (av1) av1.style.backgroundImage = `url('/api/avatar/${users[0].telegram_id}')`;
  }
  if (users[1]) {
    document.getElementById('podiumName2').textContent = users[1].first_name || users[1].username || 'Player';
    document.getElementById('podiumScore2').textContent = (users[1].total_all_time || 0).toLocaleString();
    const av2 = document.getElementById('podiumAvatar2');
    if (av2) av2.style.backgroundImage = `url('/api/avatar/${users[1].telegram_id}')`;
  }
  if (users[2]) {
    document.getElementById('podiumName3').textContent = users[2].first_name || users[2].username || 'Player';
    document.getElementById('podiumScore3').textContent = (users[2].total_all_time || 0).toLocaleString();
    const av3 = document.getElementById('podiumAvatar3');
    if (av3) av3.style.backgroundImage = `url('/api/avatar/${users[2].telegram_id}')`;
  }

  // Top 4 - 10
  const listEl = document.getElementById('leaderboardList');
  if (listEl) {
    const others = users.slice(3, 10);
    listEl.innerHTML = others.map((u, i) => `
      <div class="lb-card">
        <div class="lb-left">
          <span class="lb-rank">#${i + 4}</span>
          <div class="lb-avatar" style="background-image: url('/api/avatar/${u.telegram_id}');"></div>
          <span class="lb-name">${u.first_name || u.username || 'Player'}</span>
        </div>
        <span class="lb-score">${(u.total_all_time || 0).toLocaleString()} ⚡</span>
      </div>
    `).join('');
  }
}

// Shop & Stars
async function loadShop() {
  const amounts = [10, 50, 100, 500];
  const bonuses = {
    10: '+5,000 Tanga & 2x Boost',
    50: '+30,000 Tanga & VIP',
    100: '+75,000 Tanga & Super',
    500: '+500,000 Tanga & Legend'
  };

  const gridEl = document.getElementById('starsGrid');
  if (gridEl) {
    gridEl.innerHTML = amounts.map(amt => `
      <div class="star-card" onclick="buyStarsBoost(${amt})">
        <span class="star-amount">⭐ ${amt} Stars</span>
        <span class="star-bonus">${bonuses[amt] || `+${amt * 500} Tanga`}</span>
        <button class="star-btn">${t('buyBtn')}</button>
      </div>
    `).join('');
  }

  // Card info
  const card = await apiCall('/api/donation-card');
  const cardSec = document.getElementById('donateCardSection');
  const noCardSec = document.getElementById('donateNoCard');

  if (card && card.enabled) {
    if (cardSec) cardSec.style.display = 'block';
    if (noCardSec) noCardSec.style.display = 'none';
    const numEl = document.getElementById('bankCardNumber');
    const holderEl = document.getElementById('bankCardHolder');
    const bankEl = document.getElementById('bankCardBank');
    if (numEl) numEl.textContent = card.card_number || '•••• •••• •••• ••••';
    if (holderEl) holderEl.textContent = card.card_holder || '—';
    if (bankEl) bankEl.textContent = `💳 ${card.bank_name || 'Uzcard'}`;
  } else {
    if (cardSec) cardSec.style.display = 'none';
    if (noCardSec) noCardSec.style.display = 'block';
  }
}

async function buyStarsBoost(amount) {
  if (!window.Telegram?.WebApp) {
    alert(`Telegram Stars xaridi faqat Telegram ilovasi ichida ishlaydi (${amount} Stars)`);
    return;
  }

  const res = await apiCall('/api/create-invoice', 'POST', {
    amount,
    telegram_id: STATE.telegramId,
  });

  if (res && res.invoice_url) {
    window.Telegram.WebApp.openInvoice(res.invoice_url, (status) => {
      if (status === 'paid') {
        alert('✅ Xarid muvaffaqiyatli amalga oshirildi! Tangalar qo\'shildi.');
        flushTaps();
      }
    });
  }
}

// Profile & Achievements
function loadProfile() {
  updateProfileStats();
  renderAchievements();
}

function updateProfileStats() {
  const nameEl = document.getElementById('profileName');
  const unameEl = document.getElementById('profileUsername');
  const avEl = document.getElementById('profileAvatar');
  const countEl = document.getElementById('profileCount');
  const totalEl = document.getElementById('profileTotal');
  const streakEl = document.getElementById('profileStreak');
  const rankEl = document.getElementById('profileRank');
  const rankValEl = document.getElementById('rankValue');
  const createdEl = document.getElementById('profileCreated');
  const lastActiveEl = document.getElementById('profileLastActive');

  if (STATE.user) {
    if (nameEl) nameEl.textContent = `${STATE.user.first_name || ''} ${STATE.user.last_name || ''}`.trim() || 'Player';
    if (unameEl) unameEl.textContent = STATE.user.username ? `@${STATE.user.username}` : `ID: ${STATE.telegramId}`;
    if (avEl) avEl.style.backgroundImage = `url('/api/avatar/${STATE.telegramId}')`;
    if (createdEl) createdEl.textContent = STATE.user.created_at || '—';
    if (lastActiveEl) lastActiveEl.textContent = STATE.user.last_active || 'Bugun';
  }

  if (countEl) countEl.textContent = STATE.count.toLocaleString();
  if (totalEl) totalEl.textContent = STATE.totalAllTime.toLocaleString();
  if (streakEl) streakEl.textContent = STATE.streakDays || 1;

  apiCall(`/api/rank/${STATE.telegramId}`).then((r) => {
    if (r && r.rank) {
      if (rankEl) rankEl.textContent = `#${r.rank}`;
      if (rankValEl) rankValEl.textContent = `#${r.rank}`;
    }
  });
}

function renderAchievements() {
  const achs = [
    { id: 'first', icon: '⚡', title: t('achFirst'), desc: t('achReq1'), unlocked: STATE.totalAllTime >= 1 },
    { id: 'ten', icon: '🥉', title: t('achTen'), desc: t('achReq10'), unlocked: STATE.totalAllTime >= 10 },
    { id: 'hundred', icon: '🥈', title: t('achHundred'), desc: t('achReq100'), unlocked: STATE.totalAllTime >= 100 },
    { id: 'thousand', icon: '🥇', title: t('achThousand'), desc: t('achReq1000'), unlocked: STATE.totalAllTime >= 1000 },
    { id: 'tenk', icon: '💎', title: t('achTenK'), desc: t('achReq10000'), unlocked: STATE.totalAllTime >= 10000 },
    { id: 'hundredk', icon: '👑', title: t('achHundredK'), desc: t('achReq100000'), unlocked: STATE.totalAllTime >= 100000 },
    { id: 'streak3', icon: '🔥', title: t('achStreak3'), desc: t('achReq3days'), unlocked: STATE.streakDays >= 3 },
    { id: 'streak7', icon: '🚀', title: t('achStreak7'), desc: t('achReq7days'), unlocked: STATE.streakDays >= 7 },
  ];

  const gridEl = document.getElementById('achievementsGrid');
  if (gridEl) {
    gridEl.innerHTML = achs.map(a => `
      <div class="ach-card ${a.unlocked ? 'unlocked' : ''}">
        <span class="ach-icon">${a.icon}</span>
        <div class="ach-info">
          <span class="ach-title">${a.title}</span>
          <span class="ach-desc">${a.desc}</span>
        </div>
      </div>
    `).join('');
  }
}

// Subscription Check
async function checkSubscription() {
  if (!STATE.telegramId) return;
  const res = await apiCall(`/api/check-subscription/${STATE.telegramId}`);
  const overlay = document.getElementById('subscriptionOverlay');
  if (!overlay) return;

  if (res && res.subscribed === false && res.channels?.length > 0) {
    const listEl = document.getElementById('subChannelsList');
    if (listEl) {
      listEl.innerHTML = res.channels.map(ch => `
        <a href="https://t.me/${ch.replace('@', '')}" target="_blank" class="sub-channel-link">
          📢 ${ch}
        </a>
      `).join('');
    }
    overlay.style.display = 'flex';
  } else {
    overlay.style.display = 'none';
  }
}

// Init App
async function initApp() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  initI18n();

  // Extract Telegram User
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  STATE.telegramId = tgUser?.id || (new URLSearchParams(window.location.search).get('id')) || 8809344628;

  // Register / Load User
  const user = await apiCall('/api/user', 'POST', {
    telegram_id: STATE.telegramId,
    first_name: tgUser?.first_name || 'Player',
    last_name: tgUser?.last_name || '',
    username: tgUser?.username || '',
    photo_url: tgUser?.photo_url || '',
  });

  if (user) {
    STATE.user = user;
    STATE.count = user.count || 0;
    STATE.totalAllTime = user.total_all_time || 0;
    STATE.streakDays = user.streak_days || 1;
    STATE.isAdmin = !!user.is_admin;
    STATE.isBlocked = !!user.blocked;
  }

  // Setup Tap Button
  const tapBtn = document.getElementById('tapButton');
  if (tapBtn) {
    tapBtn.addEventListener('touchstart', handleTap, { passive: false });
    tapBtn.addEventListener('mousedown', handleTap);
  }

  // Action Bar Buttons
  document.getElementById('resetBtn')?.addEventListener('click', resetCount);
  document.getElementById('vibrationBtn')?.addEventListener('click', function() {
    STATE.vibrationEnabled = !STATE.vibrationEnabled;
    this.classList.toggle('active-setting', STATE.vibrationEnabled);
  });
  document.getElementById('soundBtn')?.addEventListener('click', function() {
    STATE.soundEnabled = !STATE.soundEnabled;
    this.classList.toggle('active-setting', STATE.soundEnabled);
  });

  // Modal Buttons
  document.getElementById('celebrationBtn')?.addEventListener('click', closeCelebrationModal);
  document.getElementById('subCheckBtn')?.addEventListener('click', checkSubscription);

  // Copy card button
  document.getElementById('donateCopyBtn')?.addEventListener('click', () => {
    const numEl = document.getElementById('bankCardNumber');
    if (numEl) {
      navigator.clipboard.writeText(numEl.textContent.replace(/\s/g, ''));
      alert(t('shopCopied'));
    }
  });

  updateUI();
  checkSubscription();
}

document.addEventListener('DOMContentLoaded', initApp);
