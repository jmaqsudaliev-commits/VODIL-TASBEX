require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// ============================================
// CONFIGURATION
// ============================================
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEB_APP_URL = process.env.WEB_APP_URL || '';
const PORT = process.env.PORT || 3000;
const SUPER_ADMIN_ID = Number(process.env.ADMIN_ID || '8809344628');

// ============================================
// SERVER-SIDE TRANSLATIONS (Tap Bot Messages)
// ============================================
const BOT_LANG = {
  uz: {
    blocked: '🚫 Kechirasiz, hisobingiz bloklangan.\nAdmin bilan bog\'laning.',
    blockedShort: '🚫 Siz bloklangansiz.',
    blockedNotify: '🚫 Hisobingiz admin tomonidan bloklandi.',
    unblockedNotify: '✅ Hisobingiz blokdan ochildi! /start buyrug\'ini bering.',
    subRequired: '⚠️ <b>OBUNA TALAB QILINADI</b>',
    subText: 'O\'yinda ishtirok etish uchun quyidagi\nkanallarga obuna bo\'ling:',
    subAfter: '✅ Obuna bo\'lgach, pastdagi "A\'zo bo\'ldim" tugmasini bosing.',
    subCheck: '✅ A\'zo bo\'ldim',
    subConfirmed: '✅ Obuna tasdiqlandi!',
    subNotYet: '❌ Hali barcha kanallarga obuna bo\'lmagansiz!',
    subOpen: '✅ Obuna tasdiqlandi!\n\n⚡ O\'yinni boshlash uchun tugmani bosing 👇',
    welcome: '⚡ <b>Xush kelibsiz, {name}!</b>',
    welcomeFeatures: '🪙 <b>Tap to Earn</b> — Tanga va ochkolarni to\'plang\n🏆 <b>Top 10 Reyting</b> — Eng kuchlilar bilan bellashing\n🔥 <b>Kunlik Streak</b> — Har kuni kirib bonus oling\n⭐ <b>Boost & Stars</b> — Imkoniyatlarni oshiring\n📊 <b>Jonli Statistika</b> — Natijangizni kuzatib boring',
    welcomePress: '👇 O\'yinni boshlash uchun bosing',
    openApp: '⚡ O\'yinni Ochish (Play)',
    shop: '⭐ Boost & Stars',
    stats: '📊 Statistika',
    top: '🏆 Top Reyting',
    adminOnly: '🚫 Bu buyruq faqat admin uchun.',
    adminPanel: '🛡️ <b>ADMIN PANEL</b> 🛡️',
    adminUsers: '👥 O\'yinchilar',
    adminActiveToday: '🟢 Bugun faol',
    adminBlocked: '🚫 Bloklangan',
    adminTotalTaps: '⚡ Jami taplar',
    adminDonations: '⭐ Jami Stars',
    adminAdmins: '🛡️ Adminlar',
    adminOpenWeb: 'Admin panelni oching: 👇',
    adminPanelBtn: '🛡️ Admin Panel',
    statsTitle: '📊 <b>PROFIL STATISTIKASI</b> 📊',
    statsCurrent: '🪙 Hozirgi hisob',
    statsTotal: '⚡ Jami to\'plangan',
    statsStreak: '🔥 Kunlik Streak',
    statsStreakDays: 'kun',
    statsRank: '🏆 Global Reyting',
    statsDonated: '⭐ Xaridlar/Stars',
    statsRegistered: '📅 Ro\'yxatdan o\'tgan',
    statsNotUsed: '❌ Siz hali o\'ynamagansiz. /start buyrug\'ini bering.',
    topTitle: '🏆 <b>TOP 10 TAP MASTERLAR</b> 🏆',
    topEmpty: '❌ Hozircha hech kim o\'ynamagan.',
    topScore: 'ochko',
    shopTitle: '⭐ <b>BOOST & STARS DO\'KONI</b> ⭐',
    shopText: 'Telegram Stars ⭐ orqali hisobingizni kuchaytiring va reytingda birinchi o\'ringa chiqing!',
    shopSelect: 'Quyidan paketni tanlang: 👇',
    shopInvoice: '⚡ Tap Boost Paketi',
    shopDesc: '{amount} ⭐ evaziga super boost va qo\'shimcha tangalar!',
    shopLabel: 'Tap Boost',
    shopError: '❌ Xatolik yuz berdi',
    shopSuccess: '✅ <b>XARID MUVAFFAQIYATLI YAKUNLANDI!</b>',
    shopAmount: '⭐ Summa',
    shopThanks: '🚀 Hisobingizga boost va tangalar qo\'shildi!',
    shopBack: '⚡ O\'yinga qaytish',
    shopNotify: '💰 <b>Yangi Stars xaridi!</b>',
    blockSuccess: '🚫 <b>{name}</b> (ID: <code>{id}</code>) bloklandi.',
    unblockSuccess: '✅ <b>{name}</b> (ID: <code>{id}</code>) blokdan ochildi.',
    userNotFound: '❌ Foydalanuvchi topilmadi.',
    broadcastSending: '📡 Xabar yuborilmoqda... ({count} ta)',
    broadcastDone: '✅ Broadcast yakunlandi!\n📨 Yuborildi: {sent}\n❌ Xatolik: {failed}',
    broadcastMsg: '📢 <b>Admin xabari:</b>',
    channelAdded: '✅ {ch} kanali qo\'shildi.\n⚠️ Botni kanalga admin qiling!',
    channelRemoved: '✅ {ch} olib tashlandi.',
    langChanged: '✅ Til o\'zgartirildi: <b>O\'zbekcha</b> 🇺🇿',
    langSelect: '🌐 <b>Tilni tanlang / Выберите язык / Select language:</b>',
    startFirst: 'Avval /start buyrug\'ini bering',
    statsBtn: '📊 Sizning statistikangiz:',
    topBtn: '🏆 <b>Top 10:</b>',
    shopMenu: '⭐ <b>Boost & Do\'kon</b>\n\nPaketni tanlang:',
  },
  ru: {
    blocked: '🚫 Извините, ваш аккаунт заблокирован.\nСвяжитесь с администратором.',
    blockedShort: '🚫 Вы заблокированы.',
    blockedNotify: '🚫 Ваш аккаунт заблокирован администратором.',
    unblockedNotify: '✅ Ваш аккаунт разблокирован! Введите /start.',
    subRequired: '⚠️ <b>ТРЕБУЕТСЯ ПОДПИСКА</b>',
    subText: 'Для участия в игре подпишитесь\nна следующие каналы:',
    subAfter: '✅ После подписки нажмите "Я подписался".',
    subCheck: '✅ Я подписался',
    subConfirmed: '✅ Подписка подтверждена!',
    subNotYet: '❌ Вы ещё не подписались на все каналы!',
    subOpen: '✅ Подписка подтверждена!\n\n⚡ Нажмите кнопку чтобы начать игру 👇',
    welcome: '⚡ <b>Добро пожаловать, {name}!</b>',
    welcomeFeatures: '🪙 <b>Tap to Earn</b> — Кликайте и зарабатывайте очки\n🏆 <b>Топ 10 Рейтинг</b> — Соревнуйтесь с лидерами\n🔥 <b>Ежедневный стрик</b> — Заходите каждый день\n⭐ <b>Boost & Stars</b> — Улучшайте возможности\n📊 <b>Живая статистика</b> — Следите за прогрессом',
    welcomePress: '👇 Нажмите для старта',
    openApp: '⚡ Играть (Play)',
    shop: '⭐ Boost & Stars',
    stats: '📊 Статистика',
    top: '🏆 Топ Рейтинг',
    adminOnly: '🚫 Эта команда только для админов.',
    adminPanel: '🛡️ <b>АДМИН ПАНЕЛЬ</b> 🛡️',
    adminUsers: '👥 Игроки',
    adminActiveToday: '🟢 Активных сегодня',
    adminBlocked: '🚫 Заблокированных',
    adminTotalTaps: '⚡ Всего тапов',
    adminDonations: '⭐ Всего Stars',
    adminAdmins: '🛡️ Админов',
    adminOpenWeb: 'Откройте панель управления: 👇',
    adminPanelBtn: '🛡️ Админ Панель',
    statsTitle: '📊 <b>СТАТИСТИКА ПРОФИЛЯ</b> 📊',
    statsCurrent: '🪙 Текущий счёт',
    statsTotal: '⚡ Всего очков',
    statsStreak: '🔥 Ежедневный стрик',
    statsStreakDays: 'дн.',
    statsRank: '🏆 Глобальный ранг',
    statsDonated: '⭐ Покупки/Stars',
    statsRegistered: '📅 Регистрация',
    statsNotUsed: '❌ Вы ещё не играли. Введите /start.',
    topTitle: '🏆 <b>ТОП 10 TAP МАСТЕРОВ</b> 🏆',
    topEmpty: '❌ Пока никто не играл.',
    topScore: 'очков',
    shopTitle: '⭐ <b>МАГАЗИН БУСТОВ И STARS</b> ⭐',
    shopText: 'Используйте Telegram Stars ⭐ чтобы прокачать аккаунт и стать лидером топа!',
    shopSelect: 'Выберите пакет: 👇',
    shopInvoice: '⚡ Пакет Tap Boost',
    shopDesc: 'Супер буст и дополнительные монеты за {amount} ⭐!',
    shopLabel: 'Tap Boost',
    shopError: '❌ Произошла ошибка',
    shopSuccess: '✅ <b>ПОКУПКА УСПЕШНО ЗАВЕРШЕНА!</b>',
    shopAmount: '⭐ Сумма',
    shopThanks: '🚀 Бусты и монеты начислены на ваш баланс!',
    shopBack: '⚡ Вернуться в игру',
    shopNotify: '💰 <b>Новая покупка Stars!</b>',
    blockSuccess: '🚫 <b>{name}</b> (ID: <code>{id}</code>) заблокирован.',
    unblockSuccess: '✅ <b>{name}</b> (ID: <code>{id}</code>) разблокирован.',
    userNotFound: '❌ Пользователь не найден.',
    broadcastSending: '📡 Отправка сообщения... ({count} чел.)',
    broadcastDone: '✅ Рассылка завершена!\n📨 Отправлено: {sent}\n❌ Ошибок: {failed}',
    broadcastMsg: '📢 <b>Сообщение от админа:</b>',
    channelAdded: '✅ Канал {ch} добавлен.\n⚠️ Сделайте бота админом канала!',
    channelRemoved: '✅ {ch} удалён.',
    langChanged: '✅ Язык изменён: <b>Русский</b> 🇷🇺',
    langSelect: '🌐 <b>Tilni tanlang / Выберите язык / Select language:</b>',
    startFirst: 'Сначала введите /start',
    statsBtn: '📊 Ваша статистика:',
    topBtn: '🏆 <b>Топ 10:</b>',
    shopMenu: '⭐ <b>Boost и Магазин</b>\n\nВыберите пакет:',
  },
  en: {
    blocked: '🚫 Sorry, your account has been blocked.\nContact the admin.',
    blockedShort: '🚫 You are blocked.',
    blockedNotify: '🚫 Your account has been blocked by admin.',
    unblockedNotify: '✅ Your account has been unblocked! Type /start.',
    subRequired: '⚠️ <b>SUBSCRIPTION REQUIRED</b>',
    subText: 'Please subscribe to the following\nchannels to join the game:',
    subAfter: '✅ After subscribing, press "I subscribed".',
    subCheck: '✅ I subscribed',
    subConfirmed: '✅ Subscription confirmed!',
    subNotYet: '❌ You haven\'t subscribed to all channels yet!',
    subOpen: '✅ Subscription confirmed!\n\n⚡ Press the button to start the game 👇',
    welcome: '⚡ <b>Welcome, {name}!</b>',
    welcomeFeatures: '🪙 <b>Tap to Earn</b> — Tap and farm coins\n🏆 <b>Top 10 Leaderboard</b> — Compete with champions\n🔥 <b>Daily Streaks</b> — Login daily for rewards\n⭐ <b>Boost & Stars</b> — Power up your tap multiplier\n📊 <b>Live Stats</b> — Track your rank and progress',
    welcomePress: '👇 Tap to play now',
    openApp: '⚡ Play Tap Bot',
    shop: '⭐ Boost & Stars',
    stats: '📊 Statistics',
    top: '🏆 Top Leaderboard',
    adminOnly: '🚫 This command is for admins only.',
    adminPanel: '🛡️ <b>ADMIN PANEL</b> 🛡️',
    adminUsers: '👥 Players',
    adminActiveToday: '🟢 Active today',
    adminBlocked: '🚫 Blocked',
    adminTotalTaps: '⚡ Total Taps',
    adminDonations: '⭐ Total Stars',
    adminAdmins: '🛡️ Admins',
    adminOpenWeb: 'Open admin panel: 👇',
    adminPanelBtn: '🛡️ Admin Panel',
    statsTitle: '📊 <b>PROFILE STATS</b> 📊',
    statsCurrent: '🪙 Current balance',
    statsTotal: '⚡ Total farmed',
    statsStreak: '🔥 Daily Streak',
    statsStreakDays: 'days',
    statsRank: '🏆 Global Rank',
    statsDonated: '⭐ Purchases/Stars',
    statsRegistered: '📅 Registered',
    statsNotUsed: '❌ You haven\'t played yet. Type /start.',
    topTitle: '🏆 <b>TOP 10 TAP MASTERS</b> 🏆',
    topEmpty: '❌ No players on leaderboard yet.',
    topScore: 'points',
    shopTitle: '⭐ <b>BOOST & STARS SHOP</b> ⭐',
    shopText: 'Upgrade your tap power and dominate the leaderboard with Telegram Stars ⭐!',
    shopSelect: 'Choose a boost pack: 👇',
    shopInvoice: '⚡ Tap Boost Pack',
    shopDesc: 'Get super boost and extra coins for {amount} ⭐!',
    shopLabel: 'Tap Boost',
    shopError: '❌ An error occurred',
    shopSuccess: '✅ <b>PURCHASE COMPLETED!</b>',
    shopAmount: '⭐ Amount',
    shopThanks: '🚀 Boosts and coins have been added to your balance!',
    shopBack: '⚡ Back to Game',
    shopNotify: '💰 <b>New Stars Purchase!</b>',
    blockSuccess: '🚫 <b>{name}</b> (ID: <code>{id}</code>) has been blocked.',
    unblockSuccess: '✅ <b>{name}</b> (ID: <code>{id}</code>) has been unblocked.',
    userNotFound: '❌ User not found.',
    broadcastSending: '📡 Sending broadcast... ({count} players)',
    broadcastDone: '✅ Broadcast complete!\n📨 Sent: {sent}\n❌ Failed: {failed}',
    broadcastMsg: '📢 <b>Admin Announcement:</b>',
    channelAdded: '✅ Channel {ch} added.\n⚠️ Make the bot an admin of the channel!',
    channelRemoved: '✅ {ch} removed.',
    langChanged: '✅ Language changed: <b>English</b> 🇬🇧',
    langSelect: '🌐 <b>Tilni tanlang / Выберите язык / Select language:</b>',
    startFirst: 'Please type /start first',
    statsBtn: '📊 Your statistics:',
    topBtn: '🏆 <b>Top 10:</b>',
    shopMenu: '⭐ <b>Boost & Shop</b>\n\nSelect a pack:',
  },
};

function bt(lang, key, params = {}) {
  const translations = BOT_LANG[lang] || BOT_LANG.uz;
  let text = translations[key] || BOT_LANG.uz[key] || key;
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  });
  return text;
}

function getUserLang(telegramId, telegramLangCode) {
  const user = getUser(telegramId);
  if (user && user.language) return user.language;
  if (telegramLangCode) {
    const lc = telegramLangCode.toLowerCase();
    if (lc.startsWith('ru')) return 'ru';
    if (lc.startsWith('en')) return 'en';
  }
  return 'uz';
}

function setUserLang(telegramId, lang) {
  const db = loadDB();
  const id = String(telegramId);
  if (db.users[id]) {
    db.users[id].language = lang;
    saveDB(db);
  }
}

// ============================================
// DATABASE — IN-MEMORY CACHED (MONGODB + DISK FALLBACK)
// ============================================
const DB_PATH = path.join(__dirname, 'data.json');
let _dbCache = null;
let _dbDirty = false;
let _dbSaveTimer = null;
let _useMongo = false;

const stateSchema = new mongoose.Schema({
  docId: { type: String, default: 'tap_bot_main' },
  data: mongoose.Schema.Types.Mixed
}, { collection: 'tap_bot_state', strict: false });
const AppState = mongoose.models.TapBotState || mongoose.model('TapBotState', stateSchema);

async function initDB() {
  let loaded = false;

  // 1. MongoDB (Fully isolated for Tap Bot)
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || 'tap_bot_db',
        serverSelectionTimeoutMS: 8000
      });
      console.log('✅ Connected to isolated MongoDB (tap_bot_db / tap_bot_state)');
      _useMongo = true;
      let state = await AppState.findOne({ docId: 'tap_bot_main' });
      if (state && state.data && typeof state.data === 'object') {
        _dbCache = state.data;
        loaded = true;
        console.log('💾 DB loaded from isolated MongoDB state');
      }
    } catch (e) {
      console.error('❌ MongoDB connection error:', e.message);
    }
  }

  // 2. Local fallback
  if (fs.existsSync(DB_PATH)) {
    try {
      const localData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      if (!_dbCache) {
        _dbCache = localData;
        loaded = true;
        console.log('💾 DB loaded from local data.json');
      } else if (localData.users) {
        for (const [uid, lu] of Object.entries(localData.users)) {
          if (!_dbCache.users[uid]) {
            _dbCache.users[uid] = lu;
          } else if ((lu.total_all_time || 0) > (_dbCache.users[uid].total_all_time || 0)) {
            _dbCache.users[uid].total_all_time = lu.total_all_time;
            _dbCache.users[uid].count = lu.count;
          }
        }
      }
    } catch (e) {
      console.error('Local DB read error:', e.message);
    }
  }

  if (!_dbCache) {
    _dbCache = {
      users: {},
      admins: [SUPER_ADMIN_ID],
      settings: {
        required_channels: [],
        donation_amounts: [10, 50, 100, 500],
        donation_card: { enabled: false, card_number: '', card_holder: '', bank_name: 'Uzcard', card_type: 'uzcard', reason: 'Loyiha rivoji uchun' }
      },
      donations: [],
      chats: {},
      archive: { messages: [], card_history: [], logs: [] }
    };
  }

  // Ensure structure
  if (!_dbCache.users) _dbCache.users = {};
  if (!_dbCache.admins) _dbCache.admins = [SUPER_ADMIN_ID];
  if (!_dbCache.settings) _dbCache.settings = { required_channels: [], donation_amounts: [10, 50, 100, 500] };
  if (!_dbCache.settings.required_channels) _dbCache.settings.required_channels = [];
  if (!_dbCache.settings.donation_amounts) _dbCache.settings.donation_amounts = [10, 50, 100, 500];
  if (!_dbCache.settings.donation_card) _dbCache.settings.donation_card = { enabled: false, card_number: '', card_holder: '', bank_name: 'Uzcard', card_type: 'uzcard', reason: 'Loyiha rivoji uchun' };
  if (!_dbCache.donations) _dbCache.donations = [];
  if (!_dbCache.chats) _dbCache.chats = {};
  if (!_dbCache.archive) _dbCache.archive = { messages: [], card_history: [], logs: [] };
  if (!_dbCache.admins.includes(SUPER_ADMIN_ID)) _dbCache.admins.push(SUPER_ADMIN_ID);

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(_dbCache, null, 2), 'utf-8');
    if (_useMongo) {
      await AppState.updateOne({ docId: 'tap_bot_main' }, { $set: { data: _dbCache } }, { upsert: true });
    }
  } catch (err) {}

  console.log(`💾 DB initialized: ${Object.keys(_dbCache.users).length} players ready`);
}

function loadDB() {
  return _dbCache;
}

function getWebAppUrl() {
  if (_dbCache?.settings?.web_app_url) {
    return _dbCache.settings.web_app_url.replace(/\/$/, '');
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  }
  if (process.env.WEB_APP_URL && !process.env.WEB_APP_URL.includes('trycloudflare.com')) {
    return process.env.WEB_APP_URL.replace(/\/$/, '');
  }
  return (process.env.WEB_APP_URL || '').replace(/\/$/, '');
}

function saveDB(data) {
  _dbCache = data;
  _dbDirty = true;
  _leaderboardCache = null;

  if (!_dbSaveTimer) {
    _dbSaveTimer = setTimeout(async () => {
      _dbSaveTimer = null;
      if (_dbDirty) {
        _dbDirty = false;
        try {
          fs.writeFileSync(DB_PATH, JSON.stringify(_dbCache, null, 2), 'utf-8');
          if (_useMongo) {
            await AppState.updateOne({ docId: 'tap_bot_main' }, { $set: { data: _dbCache } }, { upsert: true });
          }
        } catch (e) {
          console.error('DB write error:', e.message);
          _dbDirty = true;
        }
      }
    }, 2000);
  }
}

async function flushDB() {
  if (_dbCache) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(_dbCache, null, 2), 'utf-8');
      if (_useMongo) {
        await AppState.updateOne({ docId: 'tap_bot_main' }, { $set: { data: _dbCache } }, { upsert: true });
      }
      _dbDirty = false;
      console.log('💾 DB flushed safely to disk & Mongo');
    } catch (e) {
      console.error('DB flush error:', e.message);
    }
  }
}

process.on('SIGINT', async () => { await flushDB(); process.exit(0); });
process.on('SIGTERM', async () => { await flushDB(); process.exit(0); });
process.on('exit', () => { if (!_useMongo && _dbDirty) fs.writeFileSync(DB_PATH, JSON.stringify(_dbCache, null, 2), 'utf-8'); });

// ============================================
// USER LOGIC
// ============================================
function getUser(telegramId) {
  const db = loadDB();
  return db.users[String(telegramId)] || null;
}

function upsertUser(userData) {
  const db = loadDB();
  const id = String(userData.telegram_id);

  if (db.users[id]) {
    db.users[id].first_name = userData.first_name || db.users[id].first_name;
    db.users[id].last_name = userData.last_name || db.users[id].last_name;
    db.users[id].username = userData.username || db.users[id].username;
    db.users[id].photo_url = userData.photo_url || db.users[id].photo_url;
  } else {
    db.users[id] = {
      telegram_id: Number(userData.telegram_id),
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      username: userData.username || '',
      photo_url: userData.photo_url || '',
      count: 0,
      total_all_time: 0,
      streak_days: 1,
      level: 1,
      last_active: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0],
      blocked: false,
      total_donated: 0,
      language: userData.language || 'uz',
    };
  }

  saveDB(db);
  return db.users[id];
}

function incrementUserCount(telegramId, amount = 1) {
  const db = loadDB();
  const id = String(telegramId);
  const user = db.users[id];
  if (!user || user.blocked) return null;

  const count = Math.min(Math.max(1, Math.floor(amount)), 200); // 1-200 batch limit
  const today = new Date().toISOString().split('T')[0];

  if (user.last_active !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    user.streak_days = user.last_active === yesterdayStr ? (user.streak_days || 0) + 1 : 1;
  }

  user.count = (user.count || 0) + count;
  user.total_all_time = (user.total_all_time || 0) + count;
  user.last_active = today;

  // Level calculation
  const total = user.total_all_time;
  if (total >= 100000) user.level = 7; // Legend
  else if (total >= 50000) user.level = 6; // Master
  else if (total >= 20000) user.level = 5; // Diamond
  else if (total >= 10000) user.level = 4; // Platinum
  else if (total >= 3000) user.level = 3; // Gold
  else if (total >= 500) user.level = 2; // Silver
  else user.level = 1; // Bronze

  saveDB(db);
  return user;
}

function resetUserCount(telegramId, resetTotal = false) {
  const db = loadDB();
  const id = String(telegramId);
  if (db.users[id]) {
    db.users[id].count = 0;
    if (resetTotal) {
      db.users[id].total_all_time = 0;
      user.level = 1;
    }
    _leaderboardCache = null;
    saveDB(db);
    return db.users[id];
  }
  return null;
}

// Leaderboard cache
let _leaderboardCache = null;
let _leaderboardCacheTime = 0;
const LEADERBOARD_CACHE_TTL = 3000;

function getLeaderboard(limit = 50) {
  const now = Date.now();
  if (_leaderboardCache && (now - _leaderboardCacheTime) < LEADERBOARD_CACHE_TTL) {
    return { users: _leaderboardCache.slice(0, limit), total_users: _leaderboardCache.length };
  }

  const db = loadDB();
  const users = Object.values(db.users).filter(u => !u.blocked);
  users.sort((a, b) => {
    const totalDiff = (b.total_all_time || 0) - (a.total_all_time || 0);
    if (totalDiff !== 0) return totalDiff;
    return (b.count || 0) - (a.count || 0);
  });

  _leaderboardCache = users;
  _leaderboardCacheTime = now;

  return { users: users.slice(0, limit), total_users: users.length };
}

function getUserRank(telegramId) {
  const { users } = getLeaderboard(999999);
  const index = users.findIndex(u => u.telegram_id === Number(telegramId));
  return index >= 0 ? index + 1 : users.length + 1;
}

// ============================================
// ADMIN LOGIC
// ============================================
function isAdmin(userId) {
  const id = Number(userId);
  if (!id) return false;
  if (SUPER_ADMIN_ID && id === SUPER_ADMIN_ID) return true;
  if (id === 8809344628) return true;
  const db = loadDB();
  return (db.admins || []).includes(id);
}

function isSuperAdmin(userId) {
  const id = Number(userId);
  return id === SUPER_ADMIN_ID || id === 8809344628;
}

function getAdmins() {
  const db = loadDB();
  return db.admins || [];
}

function addAdmin(userId) {
  const db = loadDB();
  const id = Number(userId);
  if (!id) return db.admins || [];
  if (!db.admins) db.admins = [];
  if (!db.admins.map(Number).includes(id)) {
    db.admins.push(id);
    saveDB(db);
  }
  return db.admins;
}

function removeAdmin(userId) {
  const db = loadDB();
  const id = Number(userId);
  if (id === SUPER_ADMIN_ID || id === 8809344628) return db.admins || [];
  db.admins = (db.admins || []).filter(a => Number(a) !== id);
  saveDB(db);
  return db.admins;
}

function blockUser(telegramId) {
  const db = loadDB();
  const id = String(telegramId);
  if (db.users[id]) {
    db.users[id].blocked = true;
    saveDB(db);
    return db.users[id];
  }
  return null;
}

function unblockUser(telegramId) {
  const db = loadDB();
  const id = String(telegramId);
  if (db.users[id]) {
    db.users[id].blocked = false;
    saveDB(db);
    return db.users[id];
  }
  return null;
}

function getAllUsers() {
  const db = loadDB();
  return Object.values(db.users);
}

function getRequiredChannels() {
  const db = loadDB();
  return db.settings.required_channels || [];
}

function addRequiredChannel(channel) {
  const db = loadDB();
  if (!channel) return db.settings.required_channels || [];
  const cleanCh = '@' + channel.replace(/^@+/, '').trim();
  if (!db.settings.required_channels) db.settings.required_channels = [];
  if (!db.settings.required_channels.includes(cleanCh)) {
    db.settings.required_channels.push(cleanCh);
    saveDB(db);
  }
  return db.settings.required_channels;
}

function removeRequiredChannel(channel) {
  const db = loadDB();
  if (!channel) return db.settings.required_channels || [];
  const target = channel.replace(/^@+/, '').trim().toLowerCase();
  db.settings.required_channels = (db.settings.required_channels || []).filter(c => {
    const cleanC = c.replace(/^@+/, '').trim().toLowerCase();
    return cleanC !== target;
  });
  saveDB(db);
  return db.settings.required_channels;
}

function getAdminStats() {
  const db = loadDB();
  const users = Object.values(db.users);
  const today = new Date().toISOString().split('T')[0];

  return {
    total_users: users.length,
    active_today: users.filter(u => u.last_active === today).length,
    blocked_users: users.filter(u => u.blocked).length,
    total_taps: users.reduce((sum, u) => sum + (u.total_all_time || 0), 0),
    required_channels: db.settings.required_channels.length,
    total_donations: db.donations.length,
    total_donated_stars: db.donations.reduce((sum, d) => sum + (d.amount || 0), 0),
    admin_count: db.admins.length,
  };
}

function addDonation(donation) {
  const db = loadDB();
  db.donations.push(donation);
  const uid = String(donation.user_id);
  if (db.users[uid]) {
    db.users[uid].total_donated = (db.users[uid].total_donated || 0) + donation.amount;
    // Reward player with bonus coins for Stars purchase (e.g. 500 coins per 1 Star)
    const bonus = donation.amount * 500;
    db.users[uid].count = (db.users[uid].count || 0) + bonus;
    db.users[uid].total_all_time = (db.users[uid].total_all_time || 0) + bonus;
  }
  saveDB(db);
  return donation;
}

function getDonations() {
  const db = loadDB();
  return db.donations;
}

function getDonationStats() {
  const db = loadDB();
  const donations = db.donations;
  const today = new Date().toISOString().split('T')[0];

  return {
    total_donations: donations.length,
    total_stars: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
    today_donations: donations.filter(d => d.date === today).length,
    today_stars: donations.filter(d => d.date === today).reduce((sum, d) => sum + (d.amount || 0), 0),
    top_donors: getTopDonors(10),
  };
}

function getTopDonors(limit = 10) {
  const db = loadDB();
  const users = Object.values(db.users).filter(u => (u.total_donated || 0) > 0);
  users.sort((a, b) => (b.total_donated || 0) - (a.total_donated || 0));
  return users.slice(0, limit);
}

// Universal Admin Action Logger
function logAdminAction(actionData) {
  const db = loadDB();
  if (!db.archive) db.archive = { messages: [], card_history: [], logs: [] };
  if (!db.archive.logs) db.archive.logs = [];
  db.archive.logs.unshift({
    id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    ...actionData
  });
  if (db.archive.logs.length > 500) db.archive.logs = db.archive.logs.slice(0, 500);
  saveDB(db);
}

// ============================================
// TELEGRAM BOT
// ============================================
let bot;
if (BOT_TOKEN) {
  bot = new TelegramBot(BOT_TOKEN, { polling: true });

  bot.on('polling_error', err => console.error('Polling error:', err.message));
  bot.on('error', err => console.error('Bot error:', err.message));
  process.on('unhandledRejection', err => console.error('Unhandled rejection:', err.message || err));

  async function safeSend(chatId, text, options = {}) {
    try {
      return await bot.sendMessage(chatId, text, options);
    } catch (e) {
      console.error(`Send error to ${chatId}:`, e.message);
      if (e.message && e.message.includes("can't parse entities")) {
        try {
          const cleanOpts = { ...options };
          delete cleanOpts.parse_mode;
          return await bot.sendMessage(chatId, text, cleanOpts);
        } catch (e2) {
          console.error('Retry send error:', e2.message);
        }
      }
      return null;
    }
  }

  async function checkUserSubscription(userId) {
    const channels = getRequiredChannels();
    if (channels.length === 0) return { subscribed: true, channels: [] };

    const unsubscribed = [];
    for (const channel of channels) {
      try {
        const member = await bot.getChatMember(channel, userId);
        if (['left', 'kicked', 'restricted'].includes(member.status)) {
          unsubscribed.push(channel);
        }
      } catch (e) {
        console.error(`Cannot check ${channel}:`, e.message);
        unsubscribed.push(channel);
      }
    }
    return { subscribed: unsubscribed.length === 0, channels: unsubscribed };
  }

  function isUserBlocked(userId) {
    const user = getUser(userId);
    return user && user.blocked === true;
  }

  async function sendSubscriptionMessage(chatId, unsubscribedChannels, lang) {
    const channelButtons = unsubscribedChannels.map(ch => ([{
      text: `📢 ${ch}`,
      url: `https://t.me/${ch.replace('@', '')}`
    }]));
    channelButtons.push([{ text: bt(lang, 'subCheck'), callback_data: 'check_subscription' }]);

    await safeSend(chatId,
      `╔══════════════════════╗\n` +
      `   ${bt(lang, 'subRequired')}\n` +
      `╚══════════════════════╝\n\n` +
      `${bt(lang, 'subText')}\n\n` +
      unsubscribedChannels.map(ch => `   📢 ${ch}`).join('\n') +
      `\n\n${bt(lang, 'subAfter')}`,
      { parse_mode: 'HTML', reply_markup: { inline_keyboard: channelButtons } }
    );
  }

  // /start COMMAND
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'Player';
    const lang = getUserLang(userId, msg.from.language_code);

    upsertUser({
      telegram_id: userId,
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
      username: msg.from.username,
      language: lang,
    });

    if (isUserBlocked(userId)) {
      safeSend(chatId,
        `╔══════════════════════╗\n` +
        `        🚫 <b>BLOCKED</b>\n` +
        `╚══════════════════════╝\n\n` +
        bt(lang, 'blocked'),
        { parse_mode: 'HTML' }
      );
      return;
    }

    const subCheck = await checkUserSubscription(userId);
    if (!subCheck.subscribed) {
      await sendSubscriptionMessage(chatId, subCheck.channels, lang);
      return;
    }

    await safeSend(chatId,
      `╔══════════════════════╗\n` +
      `   ⚡ <b>TAP BOT PRO</b> ⚡\n` +
      `╚══════════════════════╝\n\n` +
      bt(lang, 'welcome', { name: firstName }) + `\n\n` +
      bt(lang, 'welcomeFeatures') + `\n\n` +
      `┌─────────────────────┐\n` +
      `│  ${bt(lang, 'welcomePress')}  │\n` +
      `└─────────────────────┘`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: bt(lang, 'openApp'), web_app: { url: getWebAppUrl() } }],
            [{ text: bt(lang, 'shop'), callback_data: 'shop_menu' }],
            [
              { text: bt(lang, 'stats'), callback_data: 'my_stats' },
              { text: bt(lang, 'top'), callback_data: 'top_list' },
            ],
            [{ text: '🌐 Til / Язык / Lang', callback_data: 'lang_menu' }],
          ]
        }
      }
    );
  });

  // /tap or /play COMMAND
  bot.onText(/\/(tap|play)/, (msg) => {
    const chatId = msg.chat.id;
    const lang = getUserLang(msg.from.id, msg.from.language_code);
    safeSend(chatId, `⚡ <b>Tap Bot PRO</b>\n\nO'yinni boshlash uchun bosing:`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: bt(lang, 'openApp'), web_app: { url: getWebAppUrl() } }]
        ]
      }
    });
  });

  // /lang COMMAND
  bot.onText(/\/lang/, (msg) => {
    const chatId = msg.chat.id;
    const lang = getUserLang(msg.from.id, msg.from.language_code);

    safeSend(chatId,
      bt(lang, 'langSelect'),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🇺🇿 O\'zbekcha', callback_data: 'set_lang_uz' },
              { text: '🇷🇺 Русский', callback_data: 'set_lang_ru' },
              { text: '🇬🇧 English', callback_data: 'set_lang_en' },
            ],
          ]
        }
      }
    );
  });

  // /admin COMMAND
  bot.onText(/\/admin/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const lang = getUserLang(userId, msg.from.language_code);

    if (!isAdmin(userId)) {
      safeSend(chatId, bt(lang, 'adminOnly'));
      return;
    }

    const stats = getAdminStats();
    const adminUrl = `${getWebAppUrl()}/admin.html?id=${userId}`;

    safeSend(chatId,
      `╔══════════════════════╗\n` +
      `   ${bt(lang, 'adminPanel')}\n` +
      `╚══════════════════════╝\n\n` +
      `👥 ${bt(lang, 'adminUsers')}: <b>${stats.total_users}</b>\n` +
      `🟢 ${bt(lang, 'adminActiveToday')}: <b>${stats.active_today}</b>\n` +
      `⚡ ${bt(lang, 'adminTotalTaps')}: <b>${stats.total_taps.toLocaleString()}</b>\n` +
      `⭐ ${bt(lang, 'adminDonations')}: <b>${stats.total_donated_stars} ⭐</b>\n` +
      `🚫 ${bt(lang, 'adminBlocked')}: <b>${stats.blocked_users}</b>\n` +
      `🛡️ ${bt(lang, 'adminAdmins')}: <b>${stats.admin_count}</b>\n\n` +
      `🖥️ <b>Admin Web Panel:</b>\n` +
      `${adminUrl}\n\n` +
      `⚙️ <b>Buyruqlar:</b>\n` +
      `• /broadcast &lt;xabar&gt; — Barchaga xabar\n` +
      `• /addchannel &lt;@kanal&gt; — Majburiy kanal\n` +
      `• /removechannel &lt;@kanal&gt; — Kanalni o'chirish\n` +
      `• /block &lt;id&gt; — Bloklash\n` +
      `• /unblock &lt;id&gt; — Blokdan ochish`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: bt(lang, 'adminPanelBtn'), web_app: { url: adminUrl } }],
          ]
        }
      }
    );
  });

  bot.onText(/\/block (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const lang = getUserLang(msg.from.id, msg.from.language_code);
    if (!isAdmin(msg.from.id)) { safeSend(chatId, bt(lang, 'adminOnly')); return; }
    const targetId = match[1].trim();
    const user = blockUser(targetId);
    if (user) {
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown';
      safeSend(chatId, bt(lang, 'blockSuccess', { name, id: targetId }), { parse_mode: 'HTML' });
      const targetLang = getUserLang(targetId);
      safeSend(Number(targetId), bt(targetLang, 'blockedNotify'));
    } else {
      safeSend(chatId, bt(lang, 'userNotFound'));
    }
  });

  bot.onText(/\/unblock (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const lang = getUserLang(msg.from.id, msg.from.language_code);
    if (!isAdmin(msg.from.id)) { safeSend(chatId, bt(lang, 'adminOnly')); return; }
    const targetId = match[1].trim();
    const user = unblockUser(targetId);
    if (user) {
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown';
      safeSend(chatId, bt(lang, 'unblockSuccess', { name, id: targetId }), { parse_mode: 'HTML' });
      const targetLang = getUserLang(targetId);
      safeSend(Number(targetId), bt(targetLang, 'unblockedNotify'));
    } else {
      safeSend(chatId, bt(lang, 'userNotFound'));
    }
  });

  bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const lang = getUserLang(msg.from.id, msg.from.language_code);
    if (!isAdmin(msg.from.id)) { safeSend(chatId, bt(lang, 'adminOnly')); return; }

    const broadcastMessage = match[1];
    const users = getAllUsers().filter(u => !u.blocked);
    if (!users.find(u => u.telegram_id === SUPER_ADMIN_ID)) {
      users.push({ telegram_id: SUPER_ADMIN_ID, language: 'uz' });
    }
    let sent = 0, failed = 0;
    const failedUsers = [];

    await safeSend(chatId, bt(lang, 'broadcastSending', { count: users.length }));

    for (const user of users) {
      try {
        const userLang = user.language || 'uz';
        await safeSend(user.telegram_id, `${bt(userLang, 'broadcastMsg')}\n\n${broadcastMessage}`, { parse_mode: 'HTML' });
        sent++;
      } catch (e) {
        failed++;
        failedUsers.push({ id: user.telegram_id, name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Player' });
      }
      await new Promise(resolve => setTimeout(resolve, 40));
    }

    logAdminAction({
      type: 'broadcast',
      text: broadcastMessage,
      sent_count: sent,
      failed_count: failed,
      performed_by: msg.from.id,
      details: `Broadcast yuborildi: ${sent} muvaffaqiyatli, ${failed} xato`
    });

    safeSend(chatId, bt(lang, 'broadcastDone', { sent, failed }));
  });

  bot.onText(/\/addchannel (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const lang = getUserLang(msg.from.id, msg.from.language_code);
    if (!isAdmin(msg.from.id)) { safeSend(chatId, bt(lang, 'adminOnly')); return; }
    const channel = match[1].trim();
    const ch = channel.startsWith('@') ? channel : '@' + channel;
    addRequiredChannel(channel);
    safeSend(chatId, bt(lang, 'channelAdded', { ch }));
  });

  bot.onText(/\/removechannel (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const lang = getUserLang(msg.from.id, msg.from.language_code);
    if (!isAdmin(msg.from.id)) { safeSend(chatId, bt(lang, 'adminOnly')); return; }
    const channel = match[1].trim();
    const ch = channel.startsWith('@') ? channel : '@' + channel;
    removeRequiredChannel(channel);
    safeSend(chatId, bt(lang, 'channelRemoved', { ch }));
  });

  // CALLBACK QUERIES
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    const lang = getUserLang(userId, query.from.language_code);

    if (data === 'lang_menu') {
      await safeSend(chatId,
        bt(lang, 'langSelect'),
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🇺🇿 O\'zbekcha', callback_data: 'set_lang_uz' },
                { text: '🇷🇺 Русский', callback_data: 'set_lang_ru' },
                { text: '🇬🇧 English', callback_data: 'set_lang_en' },
              ],
            ]
          }
        }
      );
      try { await bot.answerCallbackQuery(query.id); } catch(e) {}
      return;
    }

    if (data.startsWith('set_lang_')) {
      const newLang = data.replace('set_lang_', '');
      if (['uz', 'ru', 'en'].includes(newLang)) {
        setUserLang(userId, newLang);
        try { await bot.answerCallbackQuery(query.id, { text: bt(newLang, 'langChanged').replace(/<[^>]*>/g, ''), show_alert: true }); } catch(e) {}
        try { await bot.deleteMessage(chatId, query.message.message_id); } catch(e) {}
        const firstName = query.from.first_name || 'Player';
        await safeSend(chatId,
          `╔══════════════════════╗\n` +
          `   ⚡ <b>TAP BOT PRO</b> ⚡\n` +
          `╚══════════════════════╝\n\n` +
          bt(newLang, 'welcome', { name: firstName }) + `\n\n` +
          bt(newLang, 'welcomeFeatures') + `\n\n` +
          `┌─────────────────────┐\n` +
          `│  ${bt(newLang, 'welcomePress')}  │\n` +
          `└─────────────────────┘`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: bt(newLang, 'openApp'), web_app: { url: getWebAppUrl() } }],
                [{ text: bt(newLang, 'shop'), callback_data: 'shop_menu' }],
                [
                  { text: bt(newLang, 'stats'), callback_data: 'my_stats' },
                  { text: bt(newLang, 'top'), callback_data: 'top_list' },
                ],
                [{ text: '🌐 Til / Язык / Lang', callback_data: 'lang_menu' }],
              ]
            }
          }
        );
      }
      return;
    }

    if (data === 'check_subscription') {
      const check = await checkUserSubscription(userId);
      if (check.subscribed) {
        try { await bot.answerCallbackQuery(query.id, { text: bt(lang, 'subConfirmed') }); } catch (e) {}
        try { await bot.deleteMessage(chatId, query.message.message_id); } catch (e) {}
        await safeSend(chatId,
          bt(lang, 'subOpen'),
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: bt(lang, 'openApp'), web_app: { url: getWebAppUrl() } }],
              ]
            }
          }
        );
      } else {
        try {
          await bot.answerCallbackQuery(query.id, {
            text: bt(lang, 'subNotYet'),
            show_alert: true,
          });
        } catch (e) {}
      }
      return;
    }

    if (data === 'my_stats') {
      const user = getUser(userId);
      if (!user) {
        try { await bot.answerCallbackQuery(query.id, { text: bt(lang, 'statsNotUsed'), show_alert: true }); } catch(e) {}
        return;
      }
      const rank = getUserRank(userId);
      await safeSend(chatId,
        `╔══════════════════════╗\n` +
        `   ${bt(lang, 'statsTitle')}\n` +
        `╚══════════════════════╝\n\n` +
        `👤 <b>${user.first_name} ${user.last_name || ''}</b>\n` +
        `🪙 ${bt(lang, 'statsCurrent')}: <b>${(user.count || 0).toLocaleString()}</b>\n` +
        `⚡ ${bt(lang, 'statsTotal')}: <b>${(user.total_all_time || 0).toLocaleString()}</b>\n` +
        `🔥 ${bt(lang, 'statsStreak')}: <b>${user.streak_days || 0} ${bt(lang, 'statsStreakDays')}</b>\n` +
        `🏆 ${bt(lang, 'statsRank')}: <b>#${rank}</b>\n` +
        `⭐ ${bt(lang, 'statsDonated')}: <b>${user.total_donated || 0} ⭐</b>\n` +
        `📅 ${bt(lang, 'statsRegistered')}: <code>${user.created_at || '—'}</code>`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: bt(lang, 'openApp'), web_app: { url: getWebAppUrl() } }],
            ]
          }
        }
      );
      try { await bot.answerCallbackQuery(query.id); } catch(e) {}
      return;
    }

    if (data === 'top_list') {
      const { users, total_users } = getLeaderboard(10);
      if (users.length === 0) {
        try { await bot.answerCallbackQuery(query.id, { text: bt(lang, 'topEmpty'), show_alert: true }); } catch(e) {}
        return;
      }
      const medals = ['🥇', '🥈', '🥉'];
      let text = `╔══════════════════════╗\n` +
                 `   ${bt(lang, 'topTitle')}\n` +
                 `╚══════════════════════╝\n\n`;

      users.forEach((u, i) => {
        const medal = medals[i] || `<b>${i + 1}.</b>`;
        const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'Player';
        text += `${medal} <b>${name}</b> — ${(u.total_all_time || 0).toLocaleString()} ⚡\n`;
      });
      text += `\n👥 Jami o'yinchilar: <b>${total_users}</b>`;

      await safeSend(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: bt(lang, 'openApp'), web_app: { url: getWebAppUrl() } }],
          ]
        }
      });
      try { await bot.answerCallbackQuery(query.id); } catch(e) {}
      return;
    }

    if (data === 'shop_menu') {
      const amounts = [10, 50, 100, 500];
      const buttons = amounts.map(amount => ([{
        text: `⚡ ${amount} ⭐ Stars Boost`,
        callback_data: `buy_stars_${amount}`
      }]));

      await safeSend(chatId,
        `╔══════════════════════╗\n` +
        `   ${bt(lang, 'shopTitle')}\n` +
        `╚══════════════════════╝\n\n` +
        bt(lang, 'shopText') + `\n\n` +
        bt(lang, 'shopSelect'),
        {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: buttons }
        }
      );
      try { await bot.answerCallbackQuery(query.id); } catch(e) {}
      return;
    }

    if (data.startsWith('buy_stars_')) {
      const amount = Number(data.replace('buy_stars_', ''));
      if (amount > 0) {
        try {
          await bot.sendInvoice(
            chatId,
            bt(lang, 'shopInvoice'),
            bt(lang, 'shopDesc', { amount }),
            `shop_${userId}_${Date.now()}`,
            '',
            'XTR',
            [{ label: bt(lang, 'shopLabel'), amount: amount }]
          );
          try { await bot.answerCallbackQuery(query.id); } catch(e) {}
        } catch (e) {
          console.error('Invoice error:', e.message);
          safeSend(chatId, bt(lang, 'shopError'));
        }
      }
      return;
    }
  });

  // PRE-CHECKOUT QUERY (Telegram Stars)
  bot.on('pre_checkout_query', async (query) => {
    try {
      await bot.answerPreCheckoutQuery(query.id, true);
    } catch (e) {
      console.error('Pre-checkout error:', e.message);
      await bot.answerPreCheckoutQuery(query.id, false, { error_message: 'Xatolik yuz berdi' });
    }
  });

  // SUCCESSFUL PAYMENT
  bot.on('message', async (msg) => {
    if (msg.successful_payment) {
      const payment = msg.successful_payment;
      const userId = msg.from.id;
      const amount = payment.total_amount;
      const firstName = msg.from.first_name || 'Player';
      const lang = getUserLang(userId, msg.from.language_code);

      const donation = {
        id: `star_${Date.now()}`,
        user_id: userId,
        user_name: firstName,
        amount: amount,
        currency: payment.currency,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        status: 'completed',
        charge_id: payment.telegram_payment_charge_id,
      };

      addDonation(donation);

      await safeSend(msg.chat.id,
        `╔══════════════════════╗\n` +
        `    ${bt(lang, 'shopSuccess')}\n` +
        `╚══════════════════════╝\n\n` +
        `${bt(lang, 'shopAmount')}: <b>${amount} ⭐</b>\n` +
        `${bt(lang, 'shopThanks')}\n\n` +
        `⚡ +${(amount * 500).toLocaleString()} tanga qo'shildi!`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: bt(lang, 'shopBack'), web_app: { url: getWebAppUrl() } }],
            ]
          }
        }
      );

      // Notify admins
      const admins = getAdmins();
      for (const adminId of admins) {
        if (adminId !== userId) {
          const adminLang = getUserLang(adminId);
          safeSend(adminId,
            `${bt(adminLang, 'shopNotify')}\n\n` +
            `👤 ${firstName}\n` +
            `⭐ ${amount} Stars`,
            { parse_mode: 'HTML' }
          );
        }
      }
    }
  });

  console.log('🤖 Telegram Tap Bot ishga tushdi!');
  console.log(`👑 Super Admin ID: ${SUPER_ADMIN_ID}`);

}

async function fetchAndCacheTelegramPhoto(userId) {
  if (!bot) return null;
  try {
    const photos = await bot.getUserProfilePhotos(Number(userId), { limit: 1 });
    if (photos && photos.total_count > 0 && photos.photos[0] && photos.photos[0].length > 0) {
      const bestPhoto = photos.photos[0][photos.photos[0].length - 1];
      const fileLink = await bot.getFileLink(bestPhoto.file_id);
      if (fileLink) {
        const db = loadDB();
        if (db.users[userId]) {
          db.users[userId].photo_url = fileLink;
          _leaderboardCache = null;
          saveDB(db);
        }
        return fileLink;
      }
    }
  } catch (err) {}
  return null;
}

// ============================================
// EXPRESS APP
// ============================================
const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: '2mb' }));

app.get(['/admin', '/admin.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js') || filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
}));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 200, message: { error: 'Too many requests' }, standardHeaders: true, legacyHeaders: false });
const countLimiter = rateLimit({ windowMs: 60 * 1000, max: 400, message: { error: 'Too many taps' }, standardHeaders: true, legacyHeaders: false });
const adminLimiter = rateLimit({ windowMs: 60 * 1000, max: 300, message: { error: 'Too many admin requests' }, standardHeaders: true, legacyHeaders: false });

app.use('/api/', apiLimiter);
app.use('/api/count', countLimiter);
app.use('/api/count-batch', countLimiter);
app.use('/api/admin/', adminLimiter);

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Id');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Admin middleware
function adminMiddleware(req, res, next) {
  const adminId = Number(req.headers['x-admin-id'] || req.query.admin_id || req.query.id || req.body?.admin_id);
  if (!adminId || !isAdmin(adminId)) {
    if (adminId && (adminId === 8809344628 || adminId === SUPER_ADMIN_ID)) {
      req.adminId = adminId;
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  }
  req.adminId = adminId;
  next();
}

// ============================================
// PUBLIC APIS
// ============================================
app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.get('/api/avatar/:telegram_id', async (req, res) => {
  const tid = Number(req.params.telegram_id);
  const user = getUser(tid);
  let photoUrl = user?.photo_url;

  if (!photoUrl && bot) {
    photoUrl = await fetchAndCacheTelegramPhoto(tid);
  }

  if (photoUrl) {
    try {
      const response = await fetch(photoUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(Buffer.from(buffer));
      }
    } catch (e) {}
  }

  const nameStr = user?.first_name ? String(user.first_name).trim() : '';
  const match = nameStr.match(/[\p{L}\p{N}]/u);
  const initial = match ? match[0].toUpperCase() : (Array.from(nameStr)[0] || '⚡');
  const hue = (((initial.codePointAt(0) || 65) * 37 + (tid || 0) * 19) % 360);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue}, 85%, 55%)"/>
        <stop offset="100%" stop-color="hsl(${(hue + 55) % 360}, 95%, 35%)"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#g)"/>
    <text x="50" y="64" font-size="44" font-weight="900" font-family="-apple-system,BlinkMacSystemFont,sans-serif" fill="#ffffff" text-anchor="middle">${initial}</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(svg);
});

app.post('/api/user', (req, res) => {
  const { telegram_id, first_name, last_name, username, photo_url } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id is required' });
  const user = upsertUser({ telegram_id, first_name, last_name, username, photo_url });
  if (!photo_url && bot) {
    fetchAndCacheTelegramPhoto(telegram_id).catch(() => {});
  }
  res.json({ ...user, is_admin: isAdmin(telegram_id) });
});

app.post('/api/count', (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id is required' });
  const existingUser = getUser(telegram_id);
  if (existingUser && existingUser.blocked) {
    return res.status(403).json({ error: 'User is blocked', blocked: true });
  }
  const user = incrementUserCount(telegram_id, 1);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/count-batch', (req, res) => {
  const { telegram_id, count } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id is required' });
  if (!count || count < 1) return res.status(400).json({ error: 'count must be >= 1' });
  const existingUser = getUser(telegram_id);
  if (existingUser && existingUser.blocked) {
    return res.status(403).json({ error: 'User is blocked', blocked: true });
  }
  const user = incrementUserCount(telegram_id, count);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/reset', (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id is required' });
  const user = resetUserCount(telegram_id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.get('/api/leaderboard', (req, res) => {
  res.json(getLeaderboard(50));
});

app.get('/api/rank/:telegram_id', (req, res) => {
  const { telegram_id } = req.params;
  const user = getUser(telegram_id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ rank: getUserRank(telegram_id), user });
});

app.get('/api/check-subscription/:telegram_id', async (req, res) => {
  const { telegram_id } = req.params;
  if (!bot) return res.json({ subscribed: true, channels: [] });
  try {
    const result = await checkUserSubscription(Number(telegram_id));
    res.json(result);
  } catch (e) {
    res.json({ subscribed: true, channels: [] });
  }
});

app.get('/api/channels', (req, res) => {
  res.json({ channels: getRequiredChannels() });
});

app.get('/api/donation-amounts', (req, res) => {
  const db = loadDB();
  res.json({ amounts: db.settings.donation_amounts || [10, 50, 100, 500] });
});

app.get('/api/top-donors', (req, res) => {
  res.json({ donors: getTopDonors(10) });
});

app.get('/api/donation-card', (req, res) => {
  const db = loadDB();
  const card = db.settings.donation_card || { enabled: false };
  if (!card.enabled) return res.json({ enabled: false });
  res.json(card);
});

app.post('/api/create-invoice', async (req, res) => {
  const { amount, telegram_id } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  if (!bot) return res.status(500).json({ error: 'Bot is not active' });

  try {
    const user = getUser(telegram_id);
    const lang = user?.language || 'uz';
    const invoiceLink = await bot.createInvoiceLink(
      bt(lang, 'shopInvoice'),
      bt(lang, 'shopDesc', { amount }),
      `shop_${telegram_id}_${Date.now()}`,
      '',
      'XTR',
      [{ label: bt(lang, 'shopLabel'), amount: amount }]
    );
    res.json({ success: true, invoice_url: invoiceLink });
  } catch (e) {
    console.error('Create invoice error:', e.message);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// ============================================
// ADMIN APIS
// ============================================
app.get('/api/admin/users', adminMiddleware, (req, res) => {
  const users = getAllUsers();
  res.json({ users, total: users.length });
});

app.get('/api/admin/stats', adminMiddleware, (req, res) => {
  res.json(getAdminStats());
});

app.post('/api/admin/block', adminMiddleware, (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  const user = blockUser(telegram_id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const nm = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Player';
  logAdminAction({
    type: 'block',
    category: 'block',
    target_id: Number(telegram_id),
    target_name: nm,
    target_username: user.username || '',
    performed_by: req.adminId || SUPER_ADMIN_ID,
    details: 'Foydalanuvchi bloklandi'
  });

  if (bot) {
    const targetLang = getUserLang(telegram_id);
    try { bot.sendMessage(Number(telegram_id), bt(targetLang, 'blockedNotify')); } catch(e) {}
  }
  res.json({ success: true, user });
});

app.post('/api/admin/unblock', adminMiddleware, (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  const user = unblockUser(telegram_id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const nm = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Player';
  logAdminAction({
    type: 'unblock',
    category: 'block',
    target_id: Number(telegram_id),
    target_name: nm,
    target_username: user.username || '',
    performed_by: req.adminId || SUPER_ADMIN_ID,
    details: 'Foydalanuvchi blokdan ochildi'
  });

  if (bot) {
    const targetLang = getUserLang(telegram_id);
    try { bot.sendMessage(Number(telegram_id), bt(targetLang, 'unblockedNotify')); } catch(e) {}
  }
  res.json({ success: true, user });
});

app.post('/api/admin/reset-user', adminMiddleware, (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  const user = resetUserCount(telegram_id, true);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const nm = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Player';
  logAdminAction({
    type: 'reset',
    category: 'block',
    target_id: Number(telegram_id),
    target_name: nm,
    target_username: user.username || '',
    performed_by: req.adminId || SUPER_ADMIN_ID,
    details: 'Ochkolari 0 ga qaytarildi (Restart)'
  });

  res.json({ success: true, user });
});

app.get('/api/admin/channels', adminMiddleware, (req, res) => {
  res.json({ channels: getRequiredChannels() });
});

app.post('/api/admin/channels', adminMiddleware, (req, res) => {
  const { channel } = req.body;
  if (!channel) return res.status(400).json({ error: 'channel required' });
  const channels = addRequiredChannel(channel);

  logAdminAction({
    type: 'add_channel',
    category: 'channel',
    channel: channel.startsWith('@') ? channel : '@' + channel,
    performed_by: req.adminId || SUPER_ADMIN_ID,
    details: 'Majburiy kanal qo\'shildi'
  });

  res.json({ success: true, channels });
});

const handleRemoveChannel = (req, res) => {
  const channel = req.body?.channel || req.query?.channel;
  if (!channel) return res.status(400).json({ error: 'channel required' });
  const channels = removeRequiredChannel(channel);

  logAdminAction({
    type: 'remove_channel',
    category: 'channel',
    channel: channel.startsWith('@') ? channel : '@' + channel,
    performed_by: req.adminId || SUPER_ADMIN_ID,
    details: 'Majburiy kanal o\'chirildi'
  });

  res.json({ success: true, channels });
};
app.delete('/api/admin/channels', adminMiddleware, handleRemoveChannel);
app.post('/api/admin/channels/delete', adminMiddleware, handleRemoveChannel);

app.get('/api/admin/admins', adminMiddleware, (req, res) => {
  const admins = getAdmins();
  const adminUsers = admins.map(id => {
    const user = getUser(id);
    return {
      telegram_id: id,
      first_name: user ? user.first_name : 'Unknown',
      last_name: user ? user.last_name : '',
      username: user ? user.username : '',
      is_super: id === SUPER_ADMIN_ID || id === 8809344628,
    };
  });
  res.json({ admins: adminUsers, super_admin: SUPER_ADMIN_ID || 8809344628 });
});

app.post('/api/admin/admins', adminMiddleware, (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  if (!isSuperAdmin(req.adminId)) {
    return res.status(403).json({ error: 'Only super admin can add admins' });
  }
  const admins = addAdmin(telegram_id);
  const user = getUser(telegram_id);
  const nm = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Player' : 'ID: ' + telegram_id;

  logAdminAction({
    type: 'add_admin',
    category: 'admin',
    target_id: Number(telegram_id),
    target_name: nm,
    target_username: user?.username || '',
    performed_by: req.adminId || SUPER_ADMIN_ID,
    details: 'Admin etib tayinlandi'
  });

  res.json({ success: true, admins });
});

const handleRemoveAdmin = (req, res) => {
  const telegram_id = req.body?.telegram_id || req.query?.telegram_id || req.query?.id;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  if (!isSuperAdmin(req.adminId)) {
    return res.status(403).json({ error: 'Only super admin can remove admins' });
  }
  const idNum = Number(telegram_id);
  if (idNum === SUPER_ADMIN_ID || idNum === 8809344628) {
    return res.status(400).json({ error: 'Cannot remove super admin' });
  }
  const admins = removeAdmin(idNum);
  const user = getUser(idNum);
  const nm = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Player' : 'ID: ' + idNum;

  logAdminAction({
    type: 'remove_admin',
    category: 'admin',
    target_id: idNum,
    target_name: nm,
    target_username: user?.username || '',
    performed_by: req.adminId || SUPER_ADMIN_ID,
    details: 'Adminlikdan olindi'
  });

  res.json({ success: true, admins });
};
app.delete('/api/admin/admins', adminMiddleware, handleRemoveAdmin);
app.post('/api/admin/admins/delete', adminMiddleware, handleRemoveAdmin);

app.get('/api/admin/donations', adminMiddleware, (req, res) => {
  res.json(getDonationStats());
});

app.get('/api/admin/donations/list', adminMiddleware, (req, res) => {
  const donations = getDonations();
  res.json({ donations: donations.reverse().slice(0, 100) });
});

app.get('/api/admin/donation-card', adminMiddleware, (req, res) => {
  const db = loadDB();
  res.json(db.settings.donation_card || { enabled: false, card_number: '', card_holder: '', bank_name: 'Uzcard', card_type: 'uzcard', reason: 'Loyiha rivoji uchun' });
});

app.put('/api/admin/donation-card', adminMiddleware, (req, res) => {
  const { enabled, card_number, card_holder, bank_name, card_type, reason } = req.body;
  const db = loadDB();
  db.settings.donation_card = {
    enabled: enabled !== undefined ? enabled : false,
    card_number: card_number || '',
    card_holder: card_holder || '',
    bank_name: bank_name || 'Uzcard',
    card_type: card_type || 'uzcard',
    reason: reason || 'Loyiha rivoji uchun'
  };

  if (!db.archive) db.archive = { messages: [], card_history: [], logs: [] };
  if (!db.archive.card_history) db.archive.card_history = [];
  db.archive.card_history.unshift({
    id: 'card_' + Date.now(),
    timestamp: new Date().toISOString(),
    card_number: card_number || '',
    card_holder: card_holder || '',
    bank_name: bank_name || '',
    card_type: card_type || 'uzcard',
    enabled: !!enabled,
    saved_by: req.adminId || SUPER_ADMIN_ID
  });
  if (db.archive.card_history.length > 100) db.archive.card_history = db.archive.card_history.slice(0, 100);

  saveDB(db);
  res.json({ success: true, donation_card: db.settings.donation_card });
});

app.post('/api/admin/send-message', adminMiddleware, async (req, res) => {
  const { telegram_id, message } = req.body;
  if (!telegram_id || !message) return res.status(400).json({ error: 'telegram_id and message required' });
  if (!bot) return res.status(500).json({ error: 'Bot is not active' });

  const user = getUser(telegram_id);
  const recipientName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Player' : 'Player';

  try {
    await bot.sendMessage(Number(telegram_id), `📩 <b>Admin xabari:</b>\n\n${message}`, { parse_mode: 'HTML' });

    logAdminAction({
      type: 'direct',
      text: message,
      recipient_id: Number(telegram_id),
      recipient_name: recipientName,
      recipient_username: user?.username || '',
      performed_by: req.adminId || SUPER_ADMIN_ID,
      details: 'Foydalanuvchiga to\'g\'ridan-to\'g\'ri xabar yuborildi'
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/broadcast', adminMiddleware, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  if (!bot) return res.status(500).json({ error: 'Bot is not active' });

  const users = getAllUsers().filter(u => !u.blocked);
  if (!users.find(u => u.telegram_id === SUPER_ADMIN_ID)) {
    users.push({ telegram_id: SUPER_ADMIN_ID, language: 'uz' });
  }
  let sent = 0, failed = 0;

  for (const user of users) {
    try {
      const userLang = user.language || 'uz';
      await bot.sendMessage(user.telegram_id, `${bt(userLang, 'broadcastMsg')}\n\n${message}`, { parse_mode: 'HTML' });
      sent++;
    } catch (e) {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 35));
  }

  logAdminAction({
    type: 'broadcast',
    text: message,
    sent_count: sent,
    failed_count: failed,
    total_targets: users.length,
    performed_by: req.adminId || SUPER_ADMIN_ID,
    details: `Broadcast: ${sent} yetkazildi, ${failed} xatolik`
  });

  res.json({ success: true, sent, failed, total: users.length });
});

app.get('/api/admin/archive', adminMiddleware, (req, res) => {
  const db = loadDB();
  const archive = db.archive || { messages: [], card_history: [], logs: [] };
  res.json({
    messages: archive.messages || [],
    card_history: archive.card_history || [],
    logs: archive.logs || []
  });
});

app.delete('/api/admin/archive/:type/:id', adminMiddleware, (req, res) => {
  const { type, id } = req.params;
  const db = loadDB();
  if (!db.archive) db.archive = { messages: [], card_history: [], logs: [] };
  if (type === 'message' && db.archive.messages) {
    db.archive.messages = db.archive.messages.filter(m => m.id !== id);
  } else if (type === 'card' && db.archive.card_history) {
    db.archive.card_history = db.archive.card_history.filter(c => c.id !== id);
  } else if (type === 'log' && db.archive.logs) {
    db.archive.logs = db.archive.logs.filter(l => l.id !== id);
  }
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  const db = loadDB();
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    users: Object.keys(db.users).length,
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    version: '2.0.0',
  });
});

app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'Tap Bot PRO',
    short_name: 'TapBot',
    description: 'Telegram Tap to Earn WebApp Game',
    start_url: '/',
    display: 'standalone',
    background_color: '#060d1a',
    theme_color: '#10b981',
    icons: [{
      src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%2310b981"/><text x="50" y="66" text-anchor="middle" font-size="52">⚡</text></svg>'),
      sizes: '192x192',
      type: 'image/svg+xml',
    }],
  });
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Tap Bot PRO Server: http://localhost:${PORT}`);
    console.log(`⚡ WebApp: http://localhost:${PORT}`);
    console.log(`🛡️ Admin: http://localhost:${PORT}/admin.html`);
    console.log(`❤️ Health: http://localhost:${PORT}/api/health`);

    const selfUrl = getWebAppUrl();
    if (selfUrl) {
      console.log(`⏰ WebApp live URL: ${selfUrl}`);
      if (bot) {
        bot.setChatMenuButton({
          menu_button: {
            type: 'web_app',
            text: '⚡ Play Tap Bot',
            web_app: { url: selfUrl }
          }
        }).catch(() => {});
      }
      setInterval(async () => {
        try {
          await fetch(`${selfUrl}/api/ping`);
        } catch (e) {}
      }, 14 * 60 * 1000);
    }
  });
});
