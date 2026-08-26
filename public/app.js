/* ============================================
   ELEKTRON TASBIH - APPLICATION LOGIC v2.0
   With Lottie animations, batch API, offline support
   Optimized for 10,000+ users
   ============================================ */

// ============================================
// CONFIG & STATE
// ============================================
const API_BASE = window.location.origin;

const STATE = {
  user: null,
  count: 0,
  target: 33,
  totalAllTime: 0,
  streakDays: 0,
  currentZikr: 'subhanalloh',
  vibrationEnabled: true,
  soundEnabled: true,
  currentTab: 'counter',
  telegramId: null,
  isAdmin: false,
  isBlocked: false,
};

// ============================================
// BATCH API — Accumulate taps, send in bulk
// ============================================
let _pendingTaps = 0;
let _batchTimer = null;
const BATCH_INTERVAL = 3000;  // Send every 3 seconds
const BATCH_THRESHOLD = 10;   // Or every 10 taps

function queueTap() {
  _pendingTaps++;

  // Save to localStorage as backup
  try {
    const saved = parseInt(localStorage.getItem('tasbih_pending') || '0');
    localStorage.setItem('tasbih_pending', String(saved + 1));
  } catch (e) {}

  // Send immediately if threshold reached
  if (_pendingTaps >= BATCH_THRESHOLD) {
    flushTaps();
    return;
  }

  // Otherwise schedule batch send
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
    // Send batch count
    const result = await apiCall('/api/count-batch', 'POST', {
      telegram_id: STATE.telegramId,
      count: tapsToSend,
    });

    if (result) {
      STATE.user = result;
      STATE.count = result.count || 0;
      STATE.totalAllTime = result.total_all_time || 0;
      STATE.streakDays = result.streak_days || 0;

      // Clear localStorage backup
      try { localStorage.setItem('tasbih_pending', '0'); } catch (e) {}
    }
  } catch (e) {
    // Failed — re-queue
    _pendingTaps += tapsToSend;
    console.error('Batch send failed, will retry:', e);
  }
}

// Flush on page unload
window.addEventListener('beforeunload', () => {
  if (_pendingTaps > 0) {
    // Sync send on unload
    const data = JSON.stringify({
      telegram_id: STATE.telegramId,
      count: _pendingTaps,
    });
    navigator.sendBeacon(`${API_BASE}/api/count-batch`, new Blob([data], { type: 'application/json' }));
  }
});

// Recover pending taps from localStorage on startup
function recoverPendingTaps() {
  try {
    const saved = parseInt(localStorage.getItem('tasbih_pending') || '0');
    if (saved > 0) {
      _pendingTaps = saved;
      flushTaps();
    }
  } catch (e) {}
}

// ============================================
// LOTTIE ANIMATION MANAGER
// ============================================
const lottieInstances = {};

function initLottie(containerId, animationData, options = {}) {
  const container = document.getElementById(containerId);
  if (!container || !window.lottie || !animationData) return null;

  // Clear existing
  container.innerHTML = '';

  const defaults = {
    container: container,
    renderer: 'svg',
    loop: options.loop !== undefined ? options.loop : true,
    autoplay: options.autoplay !== undefined ? options.autoplay : true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet',
      clearCanvas: false,
    },
  };

  try {
    const anim = lottie.loadAnimation(defaults);
    lottieInstances[containerId] = anim;
    return anim;
  } catch (e) {
    console.warn(`Lottie init failed for ${containerId}:`, e);
    return null;
  }
}

function playLottieOnce(containerId, animationData) {
  const container = document.getElementById(containerId);
  if (!container || !window.lottie || !animationData) return;

  container.innerHTML = '';

  try {
    const anim = lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: animationData,
    });

    anim.addEventListener('complete', () => {
      anim.destroy();
    });
  } catch (e) {}
}

function initAllLottieAnimations() {
  if (!window.LOTTIE_DATA || !window.lottie) {
    console.warn('Lottie or animation data not available');
    return;
  }

  const LD = window.LOTTIE_DATA;

  // Tab navigation icons
  initLottie('tabCounterLottie', LD.tasbih, { loop: true, autoplay: true });
  initLottie('tabLeaderboardLottie', LD.trophy, { loop: true, autoplay: true });
  initLottie('tabDonateLottie', LD.heart, { loop: true, autoplay: true });

  // Tap button — tasbih beads
  initLottie('tapLottie', LD.tasbih, { loop: true, autoplay: true });

  // Mini stats
  initLottie('miniStatFire', LD.fire, { loop: true, autoplay: true });
  initLottie('miniStatMedal', LD.medal, { loop: true, autoplay: true });
  initLottie('miniStatChart', LD.chart, { loop: true, autoplay: true });

  // Leaderboard
  initLottie('leaderboardTrophyLottie', LD.trophy, { loop: true, autoplay: true });
  initLottie('podiumCrownLottie', LD.crown, { loop: true, autoplay: true });

  // Donate page
  initLottie('donateHeartLottie', LD.heart, { loop: true, autoplay: true });
  initLottie('donateStarLottie', LD.star, { loop: true, autoplay: true });
  initLottie('donateMosqueLottie', LD.mosque, { loop: true, autoplay: true });

  console.log('✨ Lottie animations initialized');
}

// ============================================
// AUDIO CONTEXT (Click Sound)
// ============================================
let audioCtx = null;

function playClickSound() {
  if (!STATE.soundEnabled) return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    // Audio not supported
  }
}

function playCompletionSound() {
  if (!STATE.soundEnabled) return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.12 + 0.3);

      osc.start(audioCtx.currentTime + i * 0.12);
      osc.stop(audioCtx.currentTime + i * 0.12 + 0.3);
    });
  } catch (e) {
    // Audio not supported
  }
}

// ============================================
// TELEGRAM WEB APP INTEGRATION
// ============================================
function initTelegram() {
  const tg = window.Telegram?.WebApp;

  if (tg) {
    tg.ready();
    tg.expand();

    // Set theme colors
    if (tg.themeParams) {
      document.documentElement.style.setProperty('--tg-bg', tg.themeParams.bg_color || '#0a0f1a');
    }

    // Get user data
    const user = tg.initDataUnsafe?.user;
    if (user) {
      STATE.telegramId = user.id;
      return {
        telegram_id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        photo_url: user.photo_url || '',
      };
    }
  }

  // Demo mode for testing outside Telegram
  console.log('⚠️ Running in demo mode (outside Telegram)');
  STATE.telegramId = 123456789;
  return {
    telegram_id: 123456789,
    first_name: 'Demo',
    last_name: 'User',
    username: 'demo_user',
    photo_url: '',
  };
}

// ============================================
// API CALLS (with retry)
// ============================================
async function apiCall(endpoint, method = 'GET', body = null, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) options.body = JSON.stringify(body);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
      options.signal = controller.signal;

      const response = await fetch(`${API_BASE}${endpoint}`, options);
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        console.error('API Error:', error);
        return null;
      }
      // Wait before retry
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return null;
}

async function registerUser(userData) {
  const result = await apiCall('/api/user', 'POST', userData);
  if (result) {
    STATE.user = result;
    STATE.count = result.count || 0;
    STATE.totalAllTime = result.total_all_time || 0;
    STATE.streakDays = result.streak_days || 0;
    STATE.isAdmin = result.is_admin || false;
    STATE.isBlocked = result.blocked || false;
  }
  return result;
}

// ============================================
// SUBSCRIPTION & BLOCKED CHECK
// ============================================
async function checkSubscription() {
  try {
    const result = await apiCall(`/api/check-subscription/${STATE.telegramId}`);
    if (result && !result.subscribed) {
      showSubscriptionOverlay(result.channels);
      return false;
    }
  } catch (e) {
    console.error('Subscription check error:', e);
  }
  return true;
}

function showSubscriptionOverlay(channels) {
  // Remove existing overlay if any
  const existing = document.getElementById('subscriptionOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'subscriptionOverlay';
  overlay.className = 'subscription-overlay active';

  const channelLinks = channels.map(ch => {
    const username = ch.replace('@', '');
    return `<a href="https://t.me/${username}" target="_blank" class="sub-channel-link">📢 ${ch}</a>`;
  }).join('');

  overlay.innerHTML = `
    <div class="subscription-content">
      <div class="sub-icon">⚠️</div>
      <h2 class="sub-title">${t('subTitle')}</h2>
      <p class="sub-text">${t('subText')}</p>
      <div class="sub-channels">${channelLinks}</div>
      <button class="sub-check-btn" onclick="recheckSubscription()">${t('subCheckBtn')}</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

async function recheckSubscription() {
  const result = await apiCall(`/api/check-subscription/${STATE.telegramId}`);
  if (result && result.subscribed) {
    const overlay = document.getElementById('subscriptionOverlay');
    if (overlay) overlay.remove();
  } else {
    alert(t('subNotSubscribed'));
  }
}

function showBlockedOverlay() {
  const existing = document.getElementById('blockedOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'blockedOverlay';
  overlay.className = 'subscription-overlay active';
  overlay.innerHTML = `
    <div class="subscription-content">
      <div class="sub-icon">🚫</div>
      <h2 class="sub-title">${t('blockedTitle')}</h2>
      <p class="sub-text">${t('blockedText')}</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

async function incrementCount() {
  const result = await apiCall('/api/count', 'POST', {
    telegram_id: STATE.telegramId,
  });
  if (result) {
    STATE.user = result;
    STATE.count = result.count || 0;
    STATE.totalAllTime = result.total_all_time || 0;
    STATE.streakDays = result.streak_days || 0;
  }
  return result;
}

async function resetCount() {
  const result = await apiCall('/api/reset', 'POST', {
    telegram_id: STATE.telegramId,
  });
  if (result) {
    STATE.user = result;
    STATE.count = result.count || 0;
  }
  return result;
}

async function fetchLeaderboard() {
  return await apiCall('/api/leaderboard');
}

async function fetchRank() {
  return await apiCall(`/api/rank/${STATE.telegramId}`);
}

// ============================================
// UI UPDATES
// ============================================
function updateCounterDisplay() {
  const counterNumber = document.getElementById('counterNumber');
  const counterTarget = document.getElementById('counterTarget');
  const progressRing = document.getElementById('progressRing');

  // Update number with animation
  counterNumber.textContent = STATE.count;
  counterNumber.classList.remove('bump');
  void counterNumber.offsetWidth; // Force reflow
  counterNumber.classList.add('bump');

  // Update target display
  if (STATE.target > 0) {
    counterTarget.textContent = `/ ${STATE.target}`;
  } else {
    counterTarget.textContent = '∞';
  }

  // Update progress ring
  const circumference = 2 * Math.PI * 120; // r = 120
  let progress = 0;
  if (STATE.target > 0) {
    progress = Math.min(STATE.count / STATE.target, 1);
  } else {
    // For infinity mode, cycle every 100
    progress = (STATE.count % 100) / 100;
  }
  const offset = circumference * (1 - progress);
  progressRing.style.strokeDashoffset = offset;

  // Update mini stats
  document.getElementById('streakValue').textContent = STATE.streakDays;
  document.getElementById('totalValue').textContent = formatNumber(STATE.totalAllTime);
}

function updateProfileDisplay() {
  if (!STATE.user) return;

  const user = STATE.user;
  document.getElementById('profileName').textContent =
    `${user.first_name || ''} ${user.last_name || ''}`.trim() || t('profileDefaultName');
  document.getElementById('profileUsername').textContent =
    user.username ? `@${user.username}` : '';

  const avatarUrl = user.photo_url || generateAvatarUrl(user.first_name);
  document.getElementById('profileAvatar').src = avatarUrl;

  document.getElementById('profileCount').textContent = formatNumber(user.count || 0);
  document.getElementById('profileTotal').textContent = formatNumber(user.total_all_time || 0);
  document.getElementById('profileStreak').textContent = user.streak_days || 0;

  if (user.created_at) {
    document.getElementById('profileCreated').textContent = formatDate(user.created_at);
  }
  if (user.last_active) {
    document.getElementById('profileLastActive').textContent = user.last_active;
  }

  // Update achievements
  updateAchievements();
}

function updateAchievements() {
  const grid = document.getElementById('achievementsGrid');
  grid.innerHTML = '';

  const achievementsList = ACHIEVEMENTS_I18N[currentLanguage] || ACHIEVEMENTS_I18N.uz;

  achievementsList.forEach((ach) => {
    const card = document.createElement('div');
    let unlocked = false;

    if (ach.threshold > 0) {
      unlocked = STATE.totalAllTime >= ach.threshold;
    } else {
      unlocked = STATE.streakDays >= Math.abs(ach.threshold);
    }

    card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <span class="achievement-emoji">${ach.emoji}</span>
      <span class="achievement-name">${t(ach.nameKey)}</span>
      <span class="achievement-req">${t(ach.reqKey)}</span>
    `;
    grid.appendChild(card);
  });
}

async function updateLeaderboard() {
  const data = await fetchLeaderboard();
  if (!data) return;

  // Total users
  document.getElementById('totalUsersCount').textContent =
    `${data.total_users} ${t('usersCount')}`;

  const users = data.users;

  // Podium
  for (let i = 0; i < 3; i++) {
    const num = i + 1;
    const user = users[i];

    if (user) {
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || t('profileDefaultName');
      document.getElementById(`podiumName${num}`).textContent = name;
      document.getElementById(`podiumScore${num}`).textContent = formatNumber(user.total_all_time);

      const avatar = user.photo_url || generateAvatarUrl(user.first_name);
      document.getElementById(`podiumAvatar${num}`).src = avatar;
    }
  }

  // List (4th place and below)
  const listContainer = document.getElementById('leaderboardList');
  listContainer.innerHTML = '';

  users.slice(3).forEach((user, index) => {
    const rank = index + 4;
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || t('profileDefaultName');
    const isMe = user.telegram_id === STATE.telegramId;

    const item = document.createElement('div');
    item.className = `lb-item${isMe ? ' is-me' : ''}`;
    item.style.animationDelay = `${index * 0.05}s`;

    const avatarUrl = user.photo_url || generateAvatarUrl(user.first_name);

    item.innerHTML = `
      <span class="lb-rank">${rank}</span>
      <img class="lb-avatar" src="${avatarUrl}" alt="${name}" onerror="this.src='${generateAvatarUrl(user.first_name)}'">
      <div class="lb-info">
        <div class="lb-name">${name}${isMe ? ' ' + t('youLabel') : ''}</div>
        <div class="lb-username">${user.username ? '@' + user.username : ''}</div>
      </div>
      <div class="lb-score-wrap">
        <div class="lb-score">${formatNumber(user.total_all_time)}</div>
        <div class="lb-score-label">${t('zikrUnit')}</div>
      </div>
    `;

    listContainer.appendChild(item);
  });

  // Update rank
  const rankData = await fetchRank();
  if (rankData) {
    document.getElementById('rankValue').textContent = `#${rankData.rank}`;
    document.getElementById('profileRank').textContent = `#${rankData.rank}`;
  }
}

// ============================================
// EFFECTS
// ============================================
function triggerVibration() {
  if (!STATE.vibrationEnabled) return;

  try {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    } else if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  } catch (e) {
    // Vibration not supported
  }
}

function triggerCompletionVibration() {
  try {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    } else if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  } catch (e) {
    // Vibration not supported
  }
}

function showCelebration(target) {
  const overlay = document.getElementById('celebrationOverlay');
  const title = document.getElementById('celebrationTitle');
  const text = document.getElementById('celebrationText');

  title.textContent = t('celebrationTitle');
  text.textContent = t('celebrationText', {
    count: target,
    zikr: getZikrName(STATE.currentZikr),
  });

  overlay.classList.add('active');

  // Play Lottie celebration
  if (window.LOTTIE_DATA) {
    playLottieOnce('celebrationLottie', window.LOTTIE_DATA.celebration);
  }

  playCompletionSound();
  triggerCompletionVibration();
  createConfetti();
}

function hideCelebration() {
  document.getElementById('celebrationOverlay').classList.remove('active');
}

function createConfetti() {
  const colors = ['#ffd54f', '#66bb6a', '#42a5f5', '#ef5350', '#ab47bc', '#26c6da'];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 1}s`;
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

function createRipple() {
  const ripple = document.getElementById('tapRipple');
  ripple.classList.remove('active');
  void ripple.offsetWidth;
  ripple.classList.add('active');
}

function triggerTapPulse() {
  if (window.LOTTIE_DATA) {
    playLottieOnce('tapLottiePulse', window.LOTTIE_DATA.tapPulse);
  }
}

// ============================================
// BACKGROUND PARTICLES
// ============================================
function initParticles() {
  const container = document.getElementById('bgParticles');
  const particleCount = 15;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'bg-particle';

    const size = 2 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.background = `rgba(27, 94, 32, ${0.3 + Math.random() * 0.4})`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.animationDuration = `${6 + Math.random() * 6}s`;

    container.appendChild(particle);
  }
}

// ============================================
// SVG GRADIENT (for progress ring)
// ============================================
function addSVGGradient() {
  const svg = document.querySelector('.progress-ring');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'ringGradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '100%');

  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', '#66bb6a');

  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '50%');
  stop2.setAttribute('stop-color', '#1b5e20');

  const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop3.setAttribute('offset', '100%');
  stop3.setAttribute('stop-color', '#ffc107');

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  gradient.appendChild(stop3);
  defs.appendChild(gradient);
  svg.insertBefore(defs, svg.firstChild);
}

// ============================================
// HELPERS
// ============================================
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    const localeMap = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
    return date.toLocaleDateString(localeMap[currentLanguage] || 'uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function generateAvatarUrl(name) {
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user?.photo_url && (!name || name === tg.initDataUnsafe.user.first_name)) {
    return tg.initDataUnsafe.user.photo_url;
  }
  const initial = Array.from((name || '?').trim())[0]?.toUpperCase() || '?';
  const hue = (initial.charCodeAt(0) * 37) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="hsl(${hue},45%,35%)"/><text x="50" y="52" font-family="sans-serif" font-size="42" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${initial}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ============================================
// TAB NAVIGATION
// ============================================
function switchTab(tabName) {
  STATE.currentTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update pages
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.remove('active');
  });

  const pageId = `page${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
  document.getElementById(pageId).classList.add('active');

  // Load data for specific tabs
  if (tabName === 'leaderboard') {
    updateLeaderboard();
  }
  if (tabName === 'donate') {
    loadDonationCard();
  }
  if (tabName === 'profile') {
    updateProfileDisplay();
  }
  if (tabName === 'prayer') {
    loadPrayerTimes();
  }
}

// ============================================
// PRAYER TIMES
// ============================================
async function loadPrayerTimes() {
  try {
    const data = await apiCall('/api/prayer-times');
    const el = document.getElementById('prayerContent');
    const loc = document.getElementById('prayerLocation');
    
    if (!data || !data.enabled) {
      loc.textContent = 'Namoz eslatmalari o\'chirilgan';
      el.innerHTML = '<div style="text-align:center;color:var(--text-4);padding:40px 0;">Hozircha namoz vaqtlari belgilanmagan</div>';
      return;
    }
    
    loc.textContent = (data.location || '') + (data.mosque ? ` (${data.mosque})` : '');
    
    if (data.times) {
      const p = data.times;
      el.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px;">
          <div style="background:var(--surface);padding:16px;border-radius:12px;display:flex;justify-content:space-between;border:1px solid var(--border)">
            <span style="font-weight:600;color:var(--text-2)">Bomdod</span>
            <span style="font-weight:800;color:var(--text-1)">${p.bomdod || '-'}</span>
          </div>
          <div style="background:var(--surface);padding:16px;border-radius:12px;display:flex;justify-content:space-between;border:1px solid var(--border)">
            <span style="font-weight:600;color:var(--text-2)">Peshin</span>
            <span style="font-weight:800;color:var(--text-1)">${p.peshin || '-'}</span>
          </div>
          <div style="background:var(--surface);padding:16px;border-radius:12px;display:flex;justify-content:space-between;border:1px solid var(--border)">
            <span style="font-weight:600;color:var(--text-2)">Asr</span>
            <span style="font-weight:800;color:var(--text-1)">${p.asr || '-'}</span>
          </div>
          <div style="background:var(--surface);padding:16px;border-radius:12px;display:flex;justify-content:space-between;border:1px solid var(--border)">
            <span style="font-weight:600;color:var(--text-2)">Shom</span>
            <span style="font-weight:800;color:var(--text-1)">${p.shom || '-'}</span>
          </div>
          <div style="background:var(--surface);padding:16px;border-radius:12px;display:flex;justify-content:space-between;border:1px solid var(--border)">
            <span style="font-weight:600;color:var(--text-2)">Xufton</span>
            <span style="font-weight:800;color:var(--text-1)">${p.xufton || '-'}</span>
          </div>
        </div>
      `;
    }
  } catch (e) {
    document.getElementById('prayerContent').innerHTML = '<div style="color:var(--red-400);text-align:center;">Xatolik yuz berdi</div>';
  }
}

// ============================================
// DONATION CARD
// ============================================
let donationCardData = null;

async function loadDonationCard() {
  try {
    const [cardData, amountsData] = await Promise.all([
      apiCall('/api/donation-card'),
      apiCall('/api/donation-amounts'),
    ]);

    // Card section
    if (cardData && cardData.enabled) {
      donationCardData = cardData;
      showDonationCard(cardData);
    } else {
      hideDonationCard();
    }

    // Stars section
    if (amountsData && amountsData.amounts) {
      renderStarsButtons(amountsData.amounts);
    }
  } catch (e) {
    console.error('Donation load error:', e);
    hideDonationCard();
  }
}

function renderStarsButtons(amounts) {
  const grid = document.getElementById('starsGrid');
  if (!grid) return;

  grid.innerHTML = amounts.map(amount => `
    <button class="stars-btn" onclick="donateStars(${amount})">
      <span class="stars-btn-amount">${amount}</span>
      <span class="stars-btn-icon">⭐</span>
    </button>
  `).join('');
}

async function donateStars(amount) {
  const tg = window.Telegram?.WebApp;

  try {
    // Create invoice link via API
    const result = await apiCall('/api/create-invoice', 'POST', {
      amount: amount,
      telegram_id: STATE.telegramId,
    });

    if (result && result.invoice_url && tg) {
      // Open invoice in Telegram
      tg.openInvoice(result.invoice_url, (status) => {
        if (status === 'paid') {
          // Show success
          const dua = document.querySelector('.donate-dua p');
          if (dua) {
            dua.textContent = '✅ ' + t('donateDua');
            dua.style.color = '#4ade80';
            setTimeout(() => {
              dua.textContent = t('donateDua');
              dua.style.color = '';
            }, 3000);
          }
          // Haptic feedback
          try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}
        }
      });
    } else if (!tg) {
      alert('Telegram Stars faqat Telegram ilovasida ishlaydi');
    }
  } catch (e) {
    console.error('Donate stars error:', e);
  }
}

function showDonationCard(card) {
  const section = document.getElementById('donateCardSection');
  const noCard = document.getElementById('donateNoCard');
  if (section) section.style.display = 'block';
  if (noCard) noCard.style.display = 'none';

  // Fill card data
  const numberEl = document.getElementById('bankCardNumber');
  const holderEl = document.getElementById('bankCardHolder');
  const typeEl = document.getElementById('bankCardType');
  const bankEl = document.getElementById('bankCardBank');

  if (numberEl) numberEl.textContent = card.card_number || '•••• •••• •••• ••••';
  if (holderEl) holderEl.textContent = card.card_holder || '—';
  if (typeEl) typeEl.textContent = (card.card_type || 'uzcard').toUpperCase();
  if (bankEl) bankEl.textContent = card.bank_name || '💳';
}

function hideDonationCard() {
  const section = document.getElementById('donateCardSection');
  const noCard = document.getElementById('donateNoCard');
  if (section) section.style.display = 'none';
  if (noCard) noCard.style.display = 'block';
}

function copyCardNumber() {
  if (!donationCardData || !donationCardData.card_number) return;

  const cardNum = donationCardData.card_number.replace(/\s/g, '');
  navigator.clipboard.writeText(cardNum).then(() => {
    const btn = document.getElementById('donateCopyBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span class="copy-icon">✅</span><span>${t('donateCopySuccess')}</span>`;
    btn.classList.add('copied');

    // Haptic feedback
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      } else if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (e) {}

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = cardNum;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    const btn = document.getElementById('donateCopyBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span class="copy-icon">✅</span><span>${t('donateCopySuccess')}</span>`;
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ============================================
// LANGUAGE SWITCHER
// ============================================
function initLanguageSwitcher() {
  const switchBtn = document.getElementById('langSwitchBtn');
  const dropdown = document.getElementById('langDropdown');

  if (!switchBtn || !dropdown) return;

  // Toggle dropdown
  switchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
    switchBtn.classList.toggle('open');
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    switchBtn.classList.remove('open');
  });

  // Language option clicks
  document.querySelectorAll('.lang-option').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const lang = opt.dataset.lang;
      setLanguage(lang);
      dropdown.classList.remove('open');
      switchBtn.classList.remove('open');

      // Re-render dynamic content
      updateCounterDisplay();
      updateProfileDisplay();
      if (STATE.currentTab === 'leaderboard') {
        updateLeaderboard();
      }
    });
  });
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('📦 Service Worker registered:', reg.scope);
    }).catch((err) => {
      console.warn('SW registration failed:', err);
    });
  }
}

// ============================================
// EVENT HANDLERS
// ============================================
function handleTap() {
  // Increment locally for instant feedback
  STATE.count++;
  STATE.totalAllTime++;

  updateCounterDisplay();
  playClickSound();
  triggerVibration();
  createRipple();
  triggerTapPulse();

  // Check if target reached
  if (STATE.target > 0 && STATE.count % STATE.target === 0 && STATE.count > 0) {
    setTimeout(() => showCelebration(STATE.target), 200);
  }

  // Queue for batch send (instead of sending each tap individually)
  queueTap();
}

function handleReset() {
  if (STATE.count === 0) return;

  // Confirm reset
  const confirmed = confirm(t('resetConfirm'));
  if (!confirmed) return;

  // Flush any pending taps first
  _pendingTaps = 0;
  try { localStorage.setItem('tasbih_pending', '0'); } catch(e) {}

  STATE.count = 0;
  resetCount();
  updateCounterDisplay();

  // Vibration feedback
  triggerVibration();
}

// ============================================
// INITIALIZATION
// ============================================
async function init() {
  // Detect and set language FIRST
  const detectedLang = detectLanguage();
  setLanguage(detectedLang);

  // Init language switcher
  initLanguageSwitcher();

  // Init background particles
  initParticles();

  // Add SVG gradient
  addSVGGradient();

  // Register Service Worker
  registerServiceWorker();

  // Init Telegram
  const userData = initTelegram();

  // Register/get user
  await registerUser(userData);

  // Recover any pending taps from previous session
  recoverPendingTaps();

  // Check if user is blocked
  if (STATE.isBlocked) {
    showBlockedOverlay();
    return;
  }

  // Check subscription
  const isSubscribed = await checkSubscription();

  // Update displays
  updateCounterDisplay();
  updateProfileDisplay();

  // Init Lottie animations (after DOM is ready)
  initAllLottieAnimations();

  // Fetch rank
  const rankData = await fetchRank();
  if (rankData) {
    document.getElementById('rankValue').textContent = `#${rankData.rank}`;
    document.getElementById('profileRank').textContent = `#${rankData.rank}`;
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Tap button
  document.getElementById('tapButton').addEventListener('click', handleTap);

  // Keyboard support (Space bar)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && STATE.currentTab === 'counter') {
      e.preventDefault();
      handleTap();
    }
  });

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', handleReset);

  // Vibration toggle
  const vibBtn = document.getElementById('vibrationBtn');
  vibBtn.classList.add('active');
  vibBtn.addEventListener('click', () => {
    STATE.vibrationEnabled = !STATE.vibrationEnabled;
    vibBtn.classList.toggle('active', STATE.vibrationEnabled);
  });

  // Sound toggle
  const sndBtn = document.getElementById('soundBtn');
  sndBtn.classList.add('active');
  sndBtn.addEventListener('click', () => {
    STATE.soundEnabled = !STATE.soundEnabled;
    sndBtn.classList.toggle('active', STATE.soundEnabled);
    // Update icon
    sndBtn.querySelector('.action-icon').textContent = STATE.soundEnabled ? '🔊' : '🔇';
  });

  // Target selector
  document.querySelectorAll('.target-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.target-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.target = parseInt(btn.dataset.target) || 0;
      updateCounterDisplay();
    });
  });

  // Zikr type selector
  document.querySelectorAll('.zikr-type').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.zikr-type').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.currentZikr = btn.dataset.zikr;
    });
  });

  // Celebration close
  document.getElementById('celebrationBtn').addEventListener('click', hideCelebration);
  document.getElementById('celebrationOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideCelebration();
  });

  // Donate copy button
  const copyBtn = document.getElementById('donateCopyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyCardNumber);
  }

  // Bank card click = copy
  const bankCard = document.getElementById('bankCard');
  if (bankCard) {
    bankCard.addEventListener('click', copyCardNumber);
  }

  console.log(`📿 Tasbih App v2.0 initialized! Language: ${currentLanguage}`);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
