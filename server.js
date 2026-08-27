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
const SUPER_ADMIN_ID = Number(process.env.ADMIN_ID || '0');

// ============================================
// SERVER-SIDE TRANSLATIONS (Bot messages)
// ============================================
const BOT_LANG = {
  uz: {
    blocked: '🚫 Kechirasiz, hisobingiz bloklangan.\nAdmin bilan bog\'laning.',
    blockedShort: '🚫 Siz bloklangansiz.',
    blockedNotify: '🚫 Hisobingiz admin tomonidan bloklandi.',
    unblockedNotify: '✅ Hisobingiz blokdan ochildi! /start buyruqini bering.',
    subRequired: '⚠️  <b>OBUNA TALAB QILINADI</b>',
    subText: 'Botdan foydalanish uchun quyidagi\nkanallarga obuna bo\'ling:',
    subAfter: '✅ Obuna bo\'lgach, pastdagi "A\'zo bo\'ldim" tugmasini bosing.',
    subCheck: '✅ A\'zo bo\'ldim',
    subConfirmed: '✅ Obuna tasdiqlandi!',
    subNotYet: '❌ Hali barcha kanallarga obuna bolmagansiz!',
    subOpen: '✅ Obuna tasdiqlandi!\n\n📿 Tasbihni ochish uchun tugmani bosing 👇',
    welcome: '✨ Assalomu alaykum, <b>{name}</b>!',
    welcomeFeatures: '📿 Tasbih sanang\n🏆 Reytingda raqobatlashing\n🔥 Kunlik streak yig\'ing\n💝 Ehson qiling\n📊 Statistikangizni kuzating',
    welcomePress: '👇 Boshlash uchun bosing',
    openTasbih: '📿 Tasbihni Ochish',
    donate: '💝 Ehson Qilish',
    stats: '📊 Statistika',
    top: '🏆 Top',
    adminOnly: '🚫 Bu buyruq faqat admin uchun.',
    adminPanel: '🛡️  <b>ADMIN PANEL</b>  🛡️',
    adminUsers: '👥 Foydalanuvchilar',
    adminActiveToday: '🟢 Bugun faol',
    adminBlocked: '🚫 Bloklangan',
    adminTotalZikr: '📿 Jami zikrlar',
    adminDonations: '💰 Jami ehsonlar',
    adminAdmins: '🛡️ Adminlar',
    adminOpenWeb: 'Web panelni oching: 👇',
    adminPanelBtn: '🛡️ Admin Panel',
    statsTitle: '📊  <b>STATISTIKA</b>  📊',
    statsCurrent: '📿 Hozirgi son',
    statsTotal: '🏅 Jami zikr',
    statsStreak: '🔥 Streak',
    statsStreakDays: 'kun',
    statsRank: '🏆 Reyting',
    statsDonated: '💝 Ehsonlar',
    statsRegistered: '📅 Ro\'yxatdan',
    statsNotUsed: '❌ Siz hali tasbihdan foydalanmagansiz. /start buyruqini bering.',
    topTitle: '🏆  <b>TOP 10</b>  🏆',
    topEmpty: '❌ Hali hech kim tasbih sanashmagan.',
    topZikr: 'zikr',
    donateTitle: '💝  <b>EHSON QILISH</b>  💝',
    donateText: 'Telegram Stars ⭐ orqali ehson qiling.\nAlloh sizdan rozi bo\'lsin! 🤲',
    donateSelect: 'Quyidan summani tanlang: 👇',
    donateInvoice: '💝 Ehson',
    donateDesc: '{amount} ⭐ ehson qilish. Alloh sizdan rozi bo\'lsin! 🤲',
    donateLabel: 'Ehson',
    donateError: '❌ Xatolik yuz berdi',
    donateSuccess: '✅  <b>EHSON QABUL QILINDI</b>',
    donateAmount: '💝 Summa',
    donateThanks: '🤲 Alloh sizdan rozi bo\'lsin!',
    donateBack: '📿 Tasbihga qaytish',
    donateNotify: '💰 <b>Yangi ehson!</b>',
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
    startFirst: 'Avval /start buyruqini bering',
    statsBtn: '📊 Sizning statistikangiz:',
    topBtn: '🏆 <b>Top 10:</b>',
    donateMenu: '💝 <b>Ehson qilish</b>\n\nSummani tanlang:',
  },
  ru: {
    blocked: '🚫 Извините, ваш аккаунт заблокирован.\nСвяжитесь с администратором.',
    blockedShort: '🚫 Вы заблокированы.',
    blockedNotify: '🚫 Ваш аккаунт заблокирован администратором.',
    unblockedNotify: '✅ Ваш аккаунт разблокирован! Введите /start.',
    subRequired: '⚠️  <b>ТРЕБУЕТСЯ ПОДПИСКА</b>',
    subText: 'Для использования бота подпишитесь\nна следующие каналы:',
    subAfter: '✅ После подписки нажмите кнопку "Я подписался".',
    subCheck: '✅ Я подписался',
    subConfirmed: '✅ Подписка подтверждена!',
    subNotYet: '❌ Вы ещё не подписались на все каналы!',
    subOpen: '✅ Подписка подтверждена!\n\n📿 Нажмите кнопку чтобы открыть тасбих 👇',
    welcome: '✨ Ассаляму алейкум, <b>{name}</b>!',
    welcomeFeatures: '📿 Считайте зикры\n🏆 Соревнуйтесь в рейтинге\n🔥 Собирайте стрик\n💝 Делайте пожертвования\n📊 Следите за статистикой',
    welcomePress: '👇 Нажмите чтобы начать',
    openTasbih: '📿 Открыть Тасбих',
    donate: '💝 Пожертвовать',
    stats: '📊 Статистика',
    top: '🏆 Топ',
    adminOnly: '🚫 Эта команда только для админов.',
    adminPanel: '🛡️  <b>АДМИН ПАНЕЛЬ</b>  🛡️',
    adminUsers: '👥 Пользователи',
    adminActiveToday: '🟢 Активных сегодня',
    adminBlocked: '🚫 Заблокированных',
    adminTotalZikr: '📿 Всего зикров',
    adminDonations: '💰 Всего пожертвований',
    adminAdmins: '🛡️ Админов',
    adminOpenWeb: 'Откройте веб-панель: 👇',
    adminPanelBtn: '🛡️ Админ Панель',
    statsTitle: '📊  <b>СТАТИСТИКА</b>  📊',
    statsCurrent: '📿 Текущий счёт',
    statsTotal: '🏅 Всего зикров',
    statsStreak: '🔥 Стрик',
    statsStreakDays: 'дн.',
    statsRank: '🏆 Рейтинг',
    statsDonated: '💝 Пожертвования',
    statsRegistered: '📅 Регистрация',
    statsNotUsed: '❌ Вы ещё не использовали тасбих. Введите /start.',
    topTitle: '🏆  <b>ТОП 10</b>  🏆',
    topEmpty: '❌ Пока никто не использовал тасбих.',
    topZikr: 'зикр',
    donateTitle: '💝  <b>ПОЖЕРТВОВАНИЕ</b>  💝',
    donateText: 'Пожертвуйте через Telegram Stars ⭐.\nДа вознаградит вас Аллах! 🤲',
    donateSelect: 'Выберите сумму: 👇',
    donateInvoice: '💝 Пожертвование',
    donateDesc: 'Пожертвовать {amount} ⭐. Да вознаградит вас Аллах! 🤲',
    donateLabel: 'Пожертвование',
    donateError: '❌ Произошла ошибка',
    donateSuccess: '✅  <b>ПОЖЕРТВОВАНИЕ ПРИНЯТО</b>',
    donateAmount: '💝 Сумма',
    donateThanks: '🤲 Да вознаградит вас Аллах!',
    donateBack: '📿 Вернуться к тасбиху',
    donateNotify: '💰 <b>Новое пожертвование!</b>',
    blockSuccess: '🚫 <b>{name}</b> (ID: <code>{id}</code>) заблокирован.',
    unblockSuccess: '✅ <b>{name}</b> (ID: <code>{id}</code>) разблокирован.',
    userNotFound: '❌ Пользователь не найден.',
    broadcastSending: '📡 Отправка сообщения... ({count} чел.)',
    broadcastDone: '✅ Рассылка завершена!\n📨 Отправлено: {sent}\n❌ Ошибок: {failed}',
    broadcastMsg: '📢 <b>Сообщение от админа:</b>',
    channelAdded: '✅ Канал {ch} добавлен.\n⚠️ Добавьте бота как админа канала!',
    channelRemoved: '✅ {ch} удалён.',
    langChanged: '✅ Язык изменён: <b>Русский</b> 🇷🇺',
    langSelect: '🌐 <b>Tilni tanlang / Выберите язык / Select language:</b>',
    startFirst: 'Сначала введите /start',
    statsBtn: '📊 Ваша статистика:',
    topBtn: '🏆 <b>Топ 10:</b>',
    donateMenu: '💝 <b>Пожертвование</b>\n\nВыберите сумму:',
  },
  en: {
    blocked: '🚫 Sorry, your account has been blocked.\nContact the admin.',
    blockedShort: '🚫 You are blocked.',
    blockedNotify: '🚫 Your account has been blocked by the admin.',
    unblockedNotify: '✅ Your account has been unblocked! Type /start.',
    subRequired: '⚠️  <b>SUBSCRIPTION REQUIRED</b>',
    subText: 'Please subscribe to the following\nchannels to use the bot:',
    subAfter: '✅ After subscribing, press "I subscribed".',
    subCheck: '✅ I subscribed',
    subConfirmed: '✅ Subscription confirmed!',
    subNotYet: '❌ You haven\'t subscribed to all channels yet!',
    subOpen: '✅ Subscription confirmed!\n\n📿 Press the button to open tasbih 👇',
    welcome: '✨ Assalamu alaykum, <b>{name}</b>!',
    welcomeFeatures: '📿 Count your dhikr\n🏆 Compete in rankings\n🔥 Build daily streaks\n💝 Make donations\n📊 Track your statistics',
    welcomePress: '👇 Press to start',
    openTasbih: '📿 Open Tasbih',
    donate: '💝 Donate',
    stats: '📊 Statistics',
    top: '🏆 Top',
    adminOnly: '🚫 This command is for admins only.',
    adminPanel: '🛡️  <b>ADMIN PANEL</b>  🛡️',
    adminUsers: '👥 Users',
    adminActiveToday: '🟢 Active today',
    adminBlocked: '🚫 Blocked',
    adminTotalZikr: '📿 Total dhikr',
    adminDonations: '💰 Total donations',
    adminAdmins: '🛡️ Admins',
    adminOpenWeb: 'Open web panel: 👇',
    adminPanelBtn: '🛡️ Admin Panel',
    statsTitle: '📊  <b>STATISTICS</b>  📊',
    statsCurrent: '📿 Current count',
    statsTotal: '🏅 Total dhikr',
    statsStreak: '🔥 Streak',
    statsStreakDays: 'days',
    statsRank: '🏆 Rank',
    statsDonated: '💝 Donations',
    statsRegistered: '📅 Registered',
    statsNotUsed: '❌ You haven\'t used the tasbih yet. Type /start.',
    topTitle: '🏆  <b>TOP 10</b>  🏆',
    topEmpty: '❌ No one has used the tasbih yet.',
    topZikr: 'dhikr',
    donateTitle: '💝  <b>DONATE</b>  💝',
    donateText: 'Donate via Telegram Stars ⭐.\nMay Allah reward you! 🤲',
    donateSelect: 'Select an amount: 👇',
    donateInvoice: '💝 Donation',
    donateDesc: 'Donate {amount} ⭐. May Allah reward you! 🤲',
    donateLabel: 'Donation',
    donateError: '❌ An error occurred',
    donateSuccess: '✅  <b>DONATION ACCEPTED</b>',
    donateAmount: '💝 Amount',
    donateThanks: '🤲 May Allah reward you!',
    donateBack: '📿 Back to tasbih',
    donateNotify: '💰 <b>New donation!</b>',
    blockSuccess: '🚫 <b>{name}</b> (ID: <code>{id}</code>) has been blocked.',
    unblockSuccess: '✅ <b>{name}</b> (ID: <code>{id}</code>) has been unblocked.',
    userNotFound: '❌ User not found.',
    broadcastSending: '📡 Sending message... ({count} users)',
    broadcastDone: '✅ Broadcast complete!\n📨 Sent: {sent}\n❌ Failed: {failed}',
    broadcastMsg: '📢 <b>Admin message:</b>',
    channelAdded: '✅ Channel {ch} added.\n⚠️ Make the bot an admin of the channel!',
    channelRemoved: '✅ {ch} removed.',
    langChanged: '✅ Language changed: <b>English</b> 🇬🇧',
    langSelect: '🌐 <b>Tilni tanlang / Выберите язык / Select language:</b>',
    startFirst: 'Please type /start first',
    statsBtn: '📊 Your statistics:',
    topBtn: '🏆 <b>Top 10:</b>',
    donateMenu: '💝 <b>Donate</b>\n\nSelect amount:',
  },
};

/**
 * Get bot translation
 * @param {string} lang - 'uz', 'ru', or 'en'
 * @param {string} key - translation key
 * @param {object} params - interpolation params
 */
function bt(lang, key, params = {}) {
  const translations = BOT_LANG[lang] || BOT_LANG.uz;
  let text = translations[key] || BOT_LANG.uz[key] || key;
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });
  return text;
}

/**
 * Get user language from DB, fallback to Telegram language
 */
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

/**
 * Save user language
 */
function setUserLang(telegramId, lang) {
  const db = loadDB();
  const id = String(telegramId);
  if (db.users[id]) {
    db.users[id].language = lang;
    saveDB(db);
  }
}

// ============================================
// JSON DATABASE — IN-MEMORY CACHED (MONGODB + DISK FALLBACK)
// ============================================
const DB_PATH = path.join(__dirname, 'data.json');
let _dbCache = null;
let _dbDirty = false;
let _dbSaveTimer = null;
let _useMongo = false;

const stateSchema = new mongoose.Schema({
  docId: { type: String, default: 'main' },
  data: mongoose.Schema.Types.Mixed
}, { strict: false });
const AppState = mongoose.models.AppState || mongoose.model('AppState', stateSchema);

async function initDB() {
  let loaded = false;

  // 1. Try MongoDB
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      console.log('✅ Connected to MongoDB');
      _useMongo = true;
      let state = await AppState.findOne({ docId: 'main' });
      if (state && state.data && typeof state.data === 'object') {
        _dbCache = state.data;
        loaded = true;
        console.log('💾 DB loaded from MongoDB');
      }
    } catch (e) {
      console.error('❌ MongoDB connection error:', e.message);
    }
  }

  // 2. Load / Merge with local data.json
  if (fs.existsSync(DB_PATH)) {
    try {
      const localData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      if (!_dbCache) {
        _dbCache = localData;
        loaded = true;
        console.log('💾 DB loaded from local data.json');
      } else if (localData.users) {
        // Merge local users into MongoDB cache if local had higher counts or missing users
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
      settings: { required_channels: [], donation_amounts: [10, 50, 100, 500], donation_card: { enabled: false, card_number: '', card_holder: '', bank_name: '', card_type: 'uzcard', reason: '' }, prayer_times: { enabled: false, location: '', mosque: '', notify_before: 10, times: { tong: '', bomdod: '', peshin: '', asr: '', shom: '', xufton: '' } } },
      donations: [],
      chats: {}
    };
  }

  // Ensure structure
  if (!_dbCache.users) _dbCache.users = {};
  if (!_dbCache.admins) _dbCache.admins = [SUPER_ADMIN_ID];
  if (!_dbCache.settings) _dbCache.settings = { required_channels: [], donation_amounts: [10, 50, 100, 500] };
  if (!_dbCache.settings.required_channels) _dbCache.settings.required_channels = [];
  if (!_dbCache.settings.donation_amounts) _dbCache.settings.donation_amounts = [10, 50, 100, 500];
  if (!_dbCache.settings.donation_card) _dbCache.settings.donation_card = { enabled: false, card_number: '', card_holder: '', bank_name: '', card_type: 'uzcard', reason: '' };
  if (!_dbCache.settings.prayer_times) _dbCache.settings.prayer_times = { enabled: false, location: '', mosque: '', notify_before: 10, times: { tong: '', bomdod: '', peshin: '', asr: '', shom: '', xufton: '' } };
  if (!_dbCache.donations) _dbCache.donations = [];
  if (!_dbCache.chats) _dbCache.chats = {};
  if (!_dbCache.admins.includes(SUPER_ADMIN_ID)) _dbCache.admins.push(SUPER_ADMIN_ID);
  
  // Save immediate local snapshot
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(_dbCache, null, 2), 'utf-8');
    if (_useMongo) {
      await AppState.updateOne({ docId: 'main' }, { $set: { data: _dbCache } }, { upsert: true });
    }
  } catch (err) {}

  console.log(`💾 DB initialized: ${Object.keys(_dbCache.users).length} users preserved`);
}

function loadDB() {
  return _dbCache;
}

function saveDB(data) {
  _dbCache = data;
  _dbDirty = true;
  _leaderboardCache = null; // Always clear leaderboard cache on save!

  if (!_dbSaveTimer) {
    _dbSaveTimer = setTimeout(async () => {
      _dbSaveTimer = null;
      if (_dbDirty) {
        _dbDirty = false;
        try {
          // Always write to local file as immediate persistence guarantee
          fs.writeFileSync(DB_PATH, JSON.stringify(_dbCache, null, 2), 'utf-8');
          if (_useMongo) {
            await AppState.updateOne({ docId: 'main' }, { $set: { data: _dbCache } }, { upsert: true });
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
        await AppState.updateOne({ docId: 'main' }, { $set: { data: _dbCache } }, { upsert: true });
      }
      _dbDirty = false;
      console.log('💾 DB flushed safely to disk & Mongo');
    } catch (e) {
      console.error('DB flush error:', e.message);
    }
  }
}
process.removeAllListeners('SIGINT');
process.removeAllListeners('SIGTERM');
process.removeAllListeners('exit');
process.on('SIGINT', async () => { await flushDB(); process.exit(0); });
process.on('SIGTERM', async () => { await flushDB(); process.exit(0); });
process.on('exit', () => { if (!_useMongo && _dbDirty) fs.writeFileSync(DB_PATH, JSON.stringify(_dbCache, null, 2), 'utf-8'); });

// ============================================
// USER FUNCTIONS
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
      streak_days: 0,
      last_active: '',
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

  const count = Math.min(Math.max(1, Math.floor(amount)), 100); // Sanitize: 1-100
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
    }
    _leaderboardCache = null;
    saveDB(db);
    return db.users[id];
  }
  return null;
}

// Leaderboard cache — avoid sorting on every request
let _leaderboardCache = null;
let _leaderboardCacheTime = 0;
const LEADERBOARD_CACHE_TTL = 3000; // 3 seconds

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
  const db = loadDB();
  const users = Object.values(db.users).filter(u => !u.blocked);
  users.sort((a, b) => {
    const totalDiff = (b.total_all_time || 0) - (a.total_all_time || 0);
    if (totalDiff !== 0) return totalDiff;
    return (b.count || 0) - (a.count || 0);
  });
  const index = users.findIndex(u => u.telegram_id === Number(telegramId));
  return index >= 0 ? index + 1 : users.length + 1;
}

// ============================================
// ADMIN FUNCTIONS
// ============================================
function isAdmin(userId) {
  const db = loadDB();
  return db.admins.includes(Number(userId));
}

function isSuperAdmin(userId) {
  return Number(userId) === SUPER_ADMIN_ID;
}

function getAdmins() {
  const db = loadDB();
  return db.admins;
}

function addAdmin(userId) {
  const db = loadDB();
  const id = Number(userId);
  if (!db.admins.includes(id)) {
    db.admins.push(id);
    saveDB(db);
  }
  return db.admins;
}

function removeAdmin(userId) {
  const db = loadDB();
  const id = Number(userId);
  if (id === SUPER_ADMIN_ID) return db.admins; // Cannot remove super admin
  db.admins = db.admins.filter(a => a !== id);
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
  const ch = channel.startsWith('@') ? channel : '@' + channel;
  if (!db.settings.required_channels.includes(ch)) {
    db.settings.required_channels.push(ch);
    saveDB(db);
  }
  return db.settings.required_channels;
}

function removeRequiredChannel(channel) {
  const db = loadDB();
  const ch = channel.startsWith('@') ? channel : '@' + channel;
  db.settings.required_channels = db.settings.required_channels.filter(c => c !== ch);
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
    total_zikr: users.reduce((sum, u) => sum + (u.total_all_time || 0), 0),
    required_channels: db.settings.required_channels.length,
    total_donations: db.donations.length,
    total_donated_stars: db.donations.reduce((sum, d) => sum + (d.amount || 0), 0),
    admin_count: db.admins.length,
  };
}

// ============================================
// DONATION FUNCTIONS
// ============================================
function addDonation(donation) {
  const db = loadDB();
  db.donations.push(donation);
  // Update user total_donated
  const uid = String(donation.user_id);
  if (db.users[uid]) {
    db.users[uid].total_donated = (db.users[uid].total_donated || 0) + donation.amount;
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

// ============================================
// TELEGRAM BOT
// ============================================
let bot;
if (BOT_TOKEN) {
  bot = new TelegramBot(BOT_TOKEN, { polling: true });

  bot.on('polling_error', err => console.error('Polling error:', err.message));
  bot.on('error', err => console.error('Bot error:', err.message));
  process.on('unhandledRejection', err => console.error('Unhandled rejection:', err.message || err));

  // Safe send wrapper
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

  // Check subscription
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

  // Check blocked
  function isUserBlocked(userId) {
    const user = getUser(userId);
    return user && user.blocked === true;
  }

  // Send subscription message
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

  // ==========================================
  // /start COMMAND
  // ==========================================
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'User';
    const lang = getUserLang(userId, msg.from.language_code);

    if (isUserBlocked(userId)) {
      safeSend(chatId,
        `╔══════════════════════╗\n` +
        `        🚫  <b>BLOCKED</b>\n` +
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
      `   🕌  <b>ELEKTRON TASBIH</b>  🕌\n` +
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
            [{ text: bt(lang, 'openTasbih'), web_app: { url: WEB_APP_URL } }],
            [{ text: bt(lang, 'donate'), callback_data: 'donate_menu' }],
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

  // ==========================================
  // /lang COMMAND
  // ==========================================
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

  // ==========================================
  // /admin COMMAND
  // ==========================================
  bot.onText(/\/admin/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const lang = getUserLang(userId, msg.from.language_code);

    if (!isAdmin(userId)) {
      safeSend(chatId, bt(lang, 'adminOnly'));
      return;
    }

    const stats = getAdminStats();

    safeSend(chatId,
      `╔══════════════════════╗\n` +
      `    ${bt(lang, 'adminPanel')}\n` +
      `╚══════════════════════╝\n\n` +
      `${bt(lang, 'adminUsers')}: <b>${stats.total_users}</b>\n` +
      `${bt(lang, 'adminActiveToday')}: <b>${stats.active_today}</b>\n` +
      `${bt(lang, 'adminBlocked')}: <b>${stats.blocked_users}</b>\n` +
      `${bt(lang, 'adminTotalZikr')}: <b>${stats.total_zikr}</b>\n` +
      `${bt(lang, 'adminDonations')}: <b>${stats.total_donated_stars}⭐</b>\n` +
      `${bt(lang, 'adminAdmins')}: <b>${stats.admin_count}</b>\n\n` +
      bt(lang, 'adminOpenWeb'),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: bt(lang, 'adminPanelBtn'), web_app: { url: WEB_APP_URL + '/admin.html' } }],
          ]
        }
      }
    );
  });

  // ==========================================
  // /stats COMMAND
  // ==========================================
  bot.onText(/\/stats$/, (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const lang = getUserLang(telegramId, msg.from.language_code);

    if (isUserBlocked(telegramId)) { safeSend(chatId, bt(lang, 'blockedShort')); return; }

    const user = getUser(telegramId);
    if (!user) { safeSend(chatId, bt(lang, 'statsNotUsed')); return; }

    const rank = getUserRank(telegramId);

    safeSend(chatId,
      `╔══════════════════════╗\n` +
      `    ${bt(lang, 'statsTitle')}\n` +
      `╚══════════════════════╝\n\n` +
      `${bt(lang, 'statsCurrent')}: <b>${user.count}</b>\n` +
      `${bt(lang, 'statsTotal')}: <b>${user.total_all_time}</b>\n` +
      `${bt(lang, 'statsStreak')}: <b>${user.streak_days} ${bt(lang, 'statsStreakDays')}</b>\n` +
      `${bt(lang, 'statsRank')}: <b>#${rank}</b>\n` +
      `${bt(lang, 'statsDonated')}: <b>${user.total_donated || 0}⭐</b>\n` +
      `${bt(lang, 'statsRegistered')}: <b>${user.created_at}</b>`,
      { parse_mode: 'HTML' }
    );
  });

  // ==========================================
  // /top COMMAND
  // ==========================================
  bot.onText(/\/top/, (msg) => {
    const chatId = msg.chat.id;
    const lang = getUserLang(msg.from.id, msg.from.language_code);
    const { users: topUsers } = getLeaderboard(10);

    if (topUsers.length === 0) { safeSend(chatId, bt(lang, 'topEmpty')); return; }

    const medals = ['🥇', '🥈', '🥉'];
    let message = `╔══════════════════════╗\n` +
      `    ${bt(lang, 'topTitle')}\n` +
      `╚══════════════════════╝\n\n`;

    topUsers.forEach((user, index) => {
      const medal = medals[index] || `   ${index + 1}.`;
      const name = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
      message += `${medal} <b>${name}</b> — ${user.total_all_time} ${bt(lang, 'topZikr')}\n`;
    });

    safeSend(chatId, message, { parse_mode: 'HTML' });
  });

  // ==========================================
  // /ehson COMMAND
  // ==========================================
  bot.onText(/\/ehson/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const lang = getUserLang(userId, msg.from.language_code);

    if (isUserBlocked(userId)) { safeSend(chatId, bt(lang, 'blockedShort')); return; }

    const amounts = loadDB().settings.donation_amounts || [10, 50, 100, 500];

    safeSend(chatId,
      `╔══════════════════════╗\n` +
      `    ${bt(lang, 'donateTitle')}\n` +
      `╚══════════════════════╝\n\n` +
      `${bt(lang, 'donateText')}\n\n` +
      bt(lang, 'donateSelect'),
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            amounts.slice(0, 2).map(a => ({ text: `${a} ⭐`, callback_data: `donate_${a}` })),
            amounts.slice(2, 4).map(a => ({ text: `${a} ⭐`, callback_data: `donate_${a}` })),
          ].filter(row => row.length > 0)
        }
      }
    );
  });

  // ==========================================
  // Admin text commands
  // ==========================================
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

    await safeSend(chatId, bt(lang, 'broadcastSending', { count: users.length }));

    for (const user of users) {
      try {
        const userLang = user.language || 'uz';
        await safeSend(user.telegram_id, `${bt(userLang, 'broadcastMsg')}\n\n${broadcastMessage}`, { parse_mode: 'HTML' });
        sent++;
      } catch (e) { failed++; }
      await new Promise(resolve => setTimeout(resolve, 50));
    }

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

  // ==========================================
  // CALLBACK QUERIES
  // ==========================================
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    const lang = getUserLang(userId, query.from.language_code);

    // Language selection callbacks
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
        // Re-send start in new language
        const firstName = query.from.first_name || 'User';
        await safeSend(chatId,
          `╔══════════════════════╗\n` +
          `   🕌  <b>ELEKTRON TASBIH</b>  🕌\n` +
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
                [{ text: bt(newLang, 'openTasbih'), web_app: { url: WEB_APP_URL } }],
                [{ text: bt(newLang, 'donate'), callback_data: 'donate_menu' }],
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

    // Check subscription callback
    if (data === 'check_subscription') {
      const subCheck = await checkUserSubscription(userId);
      if (subCheck.subscribed) {
        try { await bot.answerCallbackQuery(query.id, { text: bt(lang, 'subConfirmed'), show_alert: true }); } catch(e) {}
        try { await bot.deleteMessage(chatId, query.message.message_id); } catch(e) {}
        await safeSend(chatId,
          bt(lang, 'subOpen'),
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: bt(lang, 'openTasbih'), web_app: { url: WEB_APP_URL } }]]
            }
          }
        );
      } else {
        try { await bot.answerCallbackQuery(query.id, { text: bt(lang, 'subNotYet'), show_alert: true }); } catch(e) {}
      }
      return;
    }

    // My stats callback
    if (data === 'my_stats') {
      const user = getUser(userId);
      if (!user) {
        try { await bot.answerCallbackQuery(query.id, { text: bt(lang, 'startFirst'), show_alert: true }); } catch(e) {}
        return;
      }
      const rank = getUserRank(userId);
      await safeSend(chatId,
        `${bt(lang, 'statsBtn')}\n\n` +
        `${bt(lang, 'statsCurrent')}: <b>${user.count}</b>\n` +
        `${bt(lang, 'statsTotal')}: <b>${user.total_all_time}</b>\n` +
        `${bt(lang, 'statsStreak')}: <b>${user.streak_days} ${bt(lang, 'statsStreakDays')}</b>\n` +
        `${bt(lang, 'statsRank')}: <b>#${rank}</b>`,
        { parse_mode: 'HTML' }
      );
      try { await bot.answerCallbackQuery(query.id); } catch(e) {}
      return;
    }

    // Top list callback
    if (data === 'top_list') {
      const { users: topUsers } = getLeaderboard(10);
      if (topUsers.length === 0) {
        try { await bot.answerCallbackQuery(query.id, { text: bt(lang, 'topEmpty').replace(/[❌ ]/g, '').trim(), show_alert: true }); } catch(e) {}
        return;
      }
      const medals = ['🥇', '🥈', '🥉'];
      let message = `${bt(lang, 'topBtn')}\n\n`;
      topUsers.forEach((user, i) => {
        const medal = medals[i] || `${i + 1}.`;
        const name = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
        message += `${medal} <b>${name}</b> — ${user.total_all_time}\n`;
      });
      await safeSend(chatId, message, { parse_mode: 'HTML' });
      try { await bot.answerCallbackQuery(query.id); } catch(e) {}
      return;
    }

    // Donate menu callback
    if (data === 'donate_menu') {
      const amounts = loadDB().settings.donation_amounts || [10, 50, 100, 500];
      await safeSend(chatId,
        bt(lang, 'donateMenu'),
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              amounts.slice(0, 2).map(a => ({ text: `${a} ⭐`, callback_data: `donate_${a}` })),
              amounts.slice(2, 4).map(a => ({ text: `${a} ⭐`, callback_data: `donate_${a}` })),
            ].filter(row => row.length > 0)
          }
        }
      );
      try { await bot.answerCallbackQuery(query.id); } catch(e) {}
      return;
    }

    // Donate amount callback
    if (data.startsWith('donate_')) {
      const amount = parseInt(data.replace('donate_', ''));
      if (!amount || amount <= 0) return;

      try {
        await bot.sendInvoice(chatId,
          bt(lang, 'donateInvoice'),
          bt(lang, 'donateDesc', { amount }),
          `donate_${userId}_${Date.now()}`,
          '', // provider_token — empty for Stars
          'XTR', // currency — Telegram Stars
          [{ label: bt(lang, 'donateLabel'), amount: amount }],
        );
        try { await bot.answerCallbackQuery(query.id); } catch(e) {}
      } catch (e) {
        console.error('Invoice error:', e.message);
        try { await bot.answerCallbackQuery(query.id, { text: bt(lang, 'donateError'), show_alert: true }); } catch(e2) {}
      }
      return;
    }
  });

  // ==========================================
  // PAYMENT HANDLERS
  // ==========================================
  bot.on('pre_checkout_query', async (query) => {
    try {
      await bot.answerPreCheckoutQuery(query.id, true);
    } catch (e) {
      console.error('Pre-checkout error:', e.message);
    }
  });

  // Track groups and channels where bot is added/removed
  bot.on('my_chat_member', (msg) => {
    const chat = msg.chat;
    const newStatus = msg.new_chat_member.status;
    
    if (chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') {
      if (!_dbCache.chats) _dbCache.chats = {};
      if (['administrator', 'creator', 'member'].includes(newStatus)) {
        _dbCache.chats[chat.id] = {
          title: chat.title || 'Noma\'lum guruh/kanal',
          type: chat.type,
          addedAt: new Date().toISOString()
        };
      } else if (['left', 'kicked'].includes(newStatus)) {
        delete _dbCache.chats[chat.id];
      }
      saveDB(_dbCache);
    }
  });

  bot.on('message', async (msg) => {
    if (msg.successful_payment) {
      const payment = msg.successful_payment;
      const userId = msg.from.id;
      const amount = payment.total_amount;
      const firstName = msg.from.first_name || 'User';
      const lang = getUserLang(userId, msg.from.language_code);

      // Record donation
      const donation = {
        id: `don_${Date.now()}`,
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
        `    ${bt(lang, 'donateSuccess')}\n` +
        `╚══════════════════════╝\n\n` +
        `${bt(lang, 'donateAmount')}: <b>${amount} ⭐</b>\n` +
        `${bt(lang, 'donateThanks')}\n\n` +
        `📿 `,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: bt(lang, 'donateBack'), web_app: { url: WEB_APP_URL } }],
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
            `${bt(adminLang, 'donateNotify')}\n\n` +
            `👤 ${firstName}\n` +
            `💝 ${amount} ⭐`,
            { parse_mode: 'HTML' }
          );
        }
      }
    }
  });

  console.log('🤖 Telegram bot ishga tushdi!');
  console.log(`👑 Super Admin ID: ${SUPER_ADMIN_ID}`);

  // ==========================================
  // PRAYER TIME NOTIFICATION SCHEDULER
  // ==========================================
  // ==========================================
  // PRAYER TIME NOTIFICATION SCHEDULER
  // ==========================================
  const PRAYER_NAMES = {
    uz: { tong: 'Tong/Quyosh', bomdod: 'Bomdod', peshin: 'Peshin', asr: 'Asr', shom: 'Shom', xufton: 'Xufton' },
    ru: { tong: 'Восход', bomdod: 'Фаджр', peshin: 'Зухр', asr: 'Аср', shom: 'Магриб', xufton: 'Иша' },
    en: { tong: 'Sunrise', bomdod: 'Fajr', peshin: 'Dhuhr', asr: 'Asr', shom: 'Maghrib', xufton: 'Isha' },
  };

  let lastNotifiedPrayer = ''; // Track to avoid duplicate notifications

  setInterval(() => {
    try {
      const db = loadDB();
      const pt = db.settings.prayer_times;
      if (!pt || !pt.enabled) return;

      const nowUTC = new Date();
      // Server UTC vaqtidan qat'iy nazar Toshkent vaqtini olamiz
      const tashkentTime = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }));
      const notifyBefore = pt.notify_before || 10;

      // Check each prayer time
      const prayerKeys = ['tong', 'bomdod', 'peshin', 'asr', 'shom', 'xufton'];
      for (const key of prayerKeys) {
        const timeStrRaw = pt.times[key];
        if (!timeStrRaw) continue;

        // "04:30 05:00" kabi erkin yozilgan matndan birinchi soat formatini qidirib topamiz
        const match = timeStrRaw.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
        if (!match) continue;
        
        const hours = Number(match[1]);
        const minutes = Number(match[2]);

        // Calculate prayer time in minutes from midnight
        const prayerMinutes = hours * 60 + minutes;
        const nowMinutes = tashkentTime.getHours() * 60 + tashkentTime.getMinutes();
        const diff = prayerMinutes - nowMinutes;

        // Send notification X minutes before prayer
        const yyyy = tashkentTime.getFullYear();
        const mm = String(tashkentTime.getMonth() + 1).padStart(2, '0');
        const dd = String(tashkentTime.getDate()).padStart(2, '0');
        const notifyKey = `${key}_${yyyy}-${mm}-${dd}`;
        if (diff === notifyBefore && lastNotifiedPrayer !== notifyKey) {
          lastNotifiedPrayer = notifyKey;

          console.log(`🕌 Namoz eslatma yuborilmoqda: ${key} (${timeStr})`);

          // Send to all non-blocked users
          const users = Object.values(db.users).filter(u => !u.blocked);
          let sent = 0;

          for (const user of users) {
            const lang = user.language || 'uz';
            const prayerName = (PRAYER_NAMES[lang] || PRAYER_NAMES.uz)[key] || key;
            const location = pt.location || '';
            const mosque = pt.mosque || '';

            let message = `🕌  <b>${prayerName} namozi</b>\n\n`;
            message += `⏰ Vaqti: <b>${timeStrRaw}</b>\n`;
            if (location) message += `📍 ${location}\n`;
            if (mosque) message += `🕌 ${mosque}\n`;
            message += `\n⏳ ${notifyBefore} daqiqadan so'ng namoz vaqti kiradi!\n`;
            message += `\n🤲 Alloh qabul qilsin!`;

            safeSend(user.telegram_id, message, { parse_mode: 'HTML' })
              .then(() => { sent++; })
              .catch(() => {});
          }
        }
      }
    } catch (e) {
      console.error('Prayer notification error:', e.message);
    }
  }, 60000); // Check every 1 minute

  console.log('🕌 Namoz eslatma tizimi ishga tushdi!');

} else {
  console.log('⚠️ BOT_TOKEN topilmadi — bot o\'chirilgan, faqat API ishlaydi.');
}

// ============================================
// EXPRESS SERVER + API
// ============================================
const app = express();

// Trust proxy (for rate limiting behind Nginx/Cloudflare)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://telegram.org"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Gzip compression
app.use(compression());

// JSON body parser
app.use(express.json({ limit: '1mb' }));

// Static files with aggressive no-cache headers for instant updates
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
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const countLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200, // Higher limit for tap counting
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many admin requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/count', countLimiter);
app.use('/api/count-batch', countLimiter);
app.use('/api/admin/', adminLimiter);

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Id');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Admin middleware
function adminMiddleware(req, res, next) {
  const adminId = Number(req.headers['x-admin-id']);
  if (!isAdmin(adminId)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  req.adminId = adminId;
  next();
}

// ============================================
// PUBLIC API
// ============================================
app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.post('/api/user', (req, res) => {
  const { telegram_id, first_name, last_name, username, photo_url } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id is required' });
  const user = upsertUser({ telegram_id, first_name, last_name, username, photo_url });
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

// Batch count endpoint — accumulates multiple taps in one request
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

app.post('/api/abuse-lock', (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id is required' });
  const db = loadDB();
  const idStr = telegram_id.toString();
  if (db.users[idStr]) {
    db.users[idStr].blocked = true;
    saveDB(db);
    return res.json({ success: true, message: 'User blocked due to abuse' });
  }
  res.status(404).json({ error: 'User not found' });
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

// Donation card (public)
app.get('/api/donation-card', (req, res) => {
  const db = loadDB();
  const card = db.settings.donation_card || { enabled: false };
  if (!card.enabled) return res.json({ enabled: false });
  res.json(card);
});

// Prayer times (public)
app.get('/api/prayer-times', (req, res) => {
  const db = loadDB();
  const pt = db.settings.prayer_times || { enabled: false };
  if (!pt.enabled) return res.json({ enabled: false });
  res.json(pt);
});

// Create Stars invoice link (for WebApp)
app.post('/api/create-invoice', async (req, res) => {
  const { amount, telegram_id } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  if (!bot) return res.status(500).json({ error: 'Bot is not active' });

  try {
    const user = getUser(telegram_id);
    const lang = user?.language || 'uz';
    const invoiceLink = await bot.createInvoiceLink(
      bt(lang, 'donateInvoice'),
      bt(lang, 'donateDesc', { amount }),
      `donate_${telegram_id}_${Date.now()}`,
      '', // provider_token — empty for Stars
      'XTR', // currency — Telegram Stars
      [{ label: bt(lang, 'donateLabel'), amount: amount }]
    );
    res.json({ success: true, invoice_url: invoiceLink });
  } catch (e) {
    console.error('Create invoice error:', e.message);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// ============================================
// ADMIN API
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
  if (bot) {
    const targetLang = getUserLang(telegram_id);
    try { bot.sendMessage(Number(telegram_id), bt(targetLang, 'unblockedNotify')); } catch(e) {}
  }
  res.json({ success: true, user });
});

app.post('/api/admin/reset-user', adminMiddleware, (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  const user = resetUserCount(telegram_id, true); // Reset total score completely so rank clears
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user });
});

app.get('/api/admin/channels', adminMiddleware, (req, res) => {
  res.json({ channels: getRequiredChannels() });
});

app.post('/api/admin/channels', adminMiddleware, (req, res) => {
  const { channel } = req.body;
  if (!channel) return res.status(400).json({ error: 'channel required' });
  const channels = addRequiredChannel(channel);
  res.json({ success: true, channels });
});

app.delete('/api/admin/channels', adminMiddleware, (req, res) => {
  const { channel } = req.body;
  if (!channel) return res.status(400).json({ error: 'channel required' });
  const channels = removeRequiredChannel(channel);
  res.json({ success: true, channels });
});

app.get('/api/admin/admins', adminMiddleware, (req, res) => {
  const admins = getAdmins();
  const adminUsers = admins.map(id => {
    const user = getUser(id);
    return {
      telegram_id: id,
      first_name: user ? user.first_name : 'Unknown',
      last_name: user ? user.last_name : '',
      username: user ? user.username : '',
      is_super: id === SUPER_ADMIN_ID,
    };
  });
  res.json({ admins: adminUsers, super_admin: SUPER_ADMIN_ID });
});

app.post('/api/admin/admins', adminMiddleware, (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  // Only super admin can add admins
  if (!isSuperAdmin(req.adminId)) {
    return res.status(403).json({ error: 'Only super admin can add admins' });
  }
  const admins = addAdmin(telegram_id);
  res.json({ success: true, admins });
});

app.delete('/api/admin/admins', adminMiddleware, (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  if (!isSuperAdmin(req.adminId)) {
    return res.status(403).json({ error: 'Only super admin can remove admins' });
  }
  if (Number(telegram_id) === SUPER_ADMIN_ID) {
    return res.status(400).json({ error: 'Cannot remove super admin' });
  }
  const admins = removeAdmin(telegram_id);
  res.json({ success: true, admins });
});

app.get('/api/admin/donations', adminMiddleware, (req, res) => {
  res.json(getDonationStats());
});

app.get('/api/admin/donations/list', adminMiddleware, (req, res) => {
  const donations = getDonations();
  res.json({ donations: donations.reverse().slice(0, 100) });
});

// Admin: Get donation card settings
app.get('/api/admin/donation-card', adminMiddleware, (req, res) => {
  const db = loadDB();
  res.json(db.settings.donation_card || { enabled: false, card_number: '', card_holder: '', bank_name: '', card_type: 'uzcard' });
});

// Admin: Update donation card settings
app.put('/api/admin/donation-card', adminMiddleware, (req, res) => {
  const { enabled, card_number, card_holder, bank_name, card_type } = req.body;
  const db = loadDB();
  db.settings.donation_card = {
    enabled: enabled !== undefined ? enabled : false,
    card_number: card_number || '',
    card_holder: card_holder || '',
    bank_name: bank_name || '',
    card_type: card_type || 'uzcard',
  };
  saveDB(db);
  res.json({ success: true, donation_card: db.settings.donation_card });
});

// Admin: Get prayer times settings
app.get('/api/admin/prayer-times', adminMiddleware, (req, res) => {
  const db = loadDB();
  res.json(db.settings.prayer_times || { enabled: false, location: '', mosque: '', notify_before: 10, times: { bomdod: '', peshin: '', asr: '', shom: '', xufton: '' } });
});

// Admin: Get tracked chats (groups/channels)
app.get('/api/admin/chats', adminMiddleware, (req, res) => {
  const db = loadDB();
  res.json({ chats: db.chats || {} });
});

// Admin: Update prayer times settings
app.put('/api/admin/prayer-times', adminMiddleware, async (req, res) => {
  const { enabled, location, mosque, notify_before, times, broadcast, broadcast_text, broadcast_targets } = req.body;
  const db = loadDB();
  db.settings.prayer_times = {
    enabled: enabled !== undefined ? enabled : false,
    location: location || '',
    mosque: mosque || '',
    notify_before: notify_before || 10,
    times: times || { tong: '', bomdod: '', peshin: '', asr: '', shom: '', xufton: '' },
    footer_text: broadcast_text || '' // doimiy tavsif uchun saqlaymiz
  };
  saveDB(db);
  
  if (broadcast && db.chats) {
    const pt = db.settings.prayer_times;
    let msg = `🕌 *${pt.mosque || 'Masjid'}* namoz vaqtlari yangilandi!
📍 Hudud: *${pt.location || 'Noma\'lum'}*

🌅 Tong/Quyosh: *${pt.times.tong || '-'}*
🌅 Bomdod: *${pt.times.bomdod || '-'}*
☀️ Peshin: *${pt.times.peshin || '-'}*
🌇 Asr: *${pt.times.asr || '-'}*
🌆 Shom: *${pt.times.shom || '-'}*
🌃 Xufton: *${pt.times.xufton || '-'}*`;

    if (broadcast_text) {
      msg += `\n\n_${broadcast_text}_`;
    }
    
    let targetChatIds = Object.keys(db.chats);
    if (broadcast_targets && broadcast_targets !== 'all') {
      if (Array.isArray(broadcast_targets)) {
        targetChatIds = targetChatIds.filter(id => broadcast_targets.includes(id));
      }
    }

    let sentCount = 0;
    for (const chatId of targetChatIds) {
      try {
        await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
        sentCount++;
      } catch (err) {
        console.error(`Failed to broadcast prayer times to chat ${chatId}:`, err.message);
      }
    }
    res.json({ success: true, prayer_times: db.settings.prayer_times, broadcastCount: sentCount });
  } else {
    res.json({ success: true, prayer_times: db.settings.prayer_times });
  }
});

// Admin: Update donation reason
app.put('/api/admin/donation-reason', adminMiddleware, (req, res) => {
  const { reason } = req.body;
  const db = loadDB();
  if (!db.settings.donation_card) db.settings.donation_card = {};
  db.settings.donation_card.reason = reason || '';
  saveDB(db);
  res.json({ success: true, reason: db.settings.donation_card.reason });
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
    } catch (e) { failed++; }
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  res.json({ success: true, sent, failed, total: users.length });
});

// ============================================
// HEALTH CHECK (for Docker/PM2/monitoring)
// ============================================
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

// ============================================
// SERVE PAGES
// ============================================
// PWA manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'Elektron Tasbih',
    short_name: 'Tasbih',
    description: 'Telegram Elektron Tasbih — Zikr qiling',
    start_url: '/',
    display: 'standalone',
    background_color: '#060d1a',
    theme_color: '#0a1a0f',
    icons: [{
      src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23166534"/><text x="50" y="60" text-anchor="middle" font-size="50">📿</text></svg>'),
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
    console.log(`🚀 Server v2.0: http://localhost:${PORT}`);
    console.log(`📿 Tasbih: http://localhost:${PORT}`);
    console.log(`🛡️ Admin: http://localhost:${PORT}/admin.html`);
    console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
    console.log(`📦 Compression: enabled`);
    console.log(`🔒 Helmet: enabled`);
    console.log(`⏱ Rate limiting: enabled`);

    // O'z-o'zini uyg'otish tizimi
    const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.WEB_APP_URL;
    if (selfUrl) {
      console.log(`⏰ Keep-alive tizimi yoqildi: ${selfUrl}`);
      setInterval(async () => {
        try {
          await fetch(`${selfUrl}/api/ping`);
        } catch (e) {}
      }, 14 * 60 * 1000);
    }
  });
});
