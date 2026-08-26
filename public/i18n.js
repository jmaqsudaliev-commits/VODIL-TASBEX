/* ============================================
   ELEKTRON TASBIH — INTERNATIONALIZATION (i18n)
   Supports: uz (O'zbek), ru (Русский), en (English)
   ============================================ */

const TRANSLATIONS = {
  // ==========================================
  // O'ZBEK TILI (default)
  // ==========================================
  uz: {
    // Tab Navigation
    tabCounter: 'Tasbih',
    tabLeaderboard: 'Top',
    tabDonate: 'Ehson',
    tabProfile: 'Profil',

    // Zikr types
    zikrSubhanalloh: 'SubhanAlloh',
    zikrAlhamdulillah: 'Alhamdulillah',
    zikrAllohuakbar: 'Allohu Akbar',
    zikrCustom: 'Boshqa',

    // Counter
    counterLabel: 'marta',
    tapText: 'Bosing',
    tapAriaLabel: 'Hisoblash',

    // Action buttons
    resetBtn: 'Qayta boshlash',
    vibrationBtn: 'Tebranish',
    soundBtn: 'Tovush',

    // Mini stats
    streakLabel: 'kun streak',
    totalZikrLabel: 'jami zikr',
    rankLabel: 'reyting',

    // Leaderboard
    leaderboardTitle: '🏆 Top Foydalanuvchilar',
    leaderboardSubtitle: 'Eng ko\'p zikr qilganlar',
    usersCount: 'foydalanuvchi',
    zikrUnit: 'zikr',
    youLabel: '(Siz)',

    // Profile
    profileDefaultName: 'Foydalanuvchi',
    profileCurrentCount: 'Hozirgi son',
    profileTotalZikr: 'Jami zikr',
    profileStreak: 'Streak (kun)',
    profileRank: 'Reyting',
    achievementsTitle: '🎖 Yutuqlar',
    profileRegistered: '📅 Ro\'yxatdan o\'tgan',
    profileLastActive: '⏱ Oxirgi faollik',

    // Achievements
    achFirst: 'Birinchi qadam',
    achTen: '10 ta zikr',
    achHundred: 'Yuz marta',
    achFiveHundred: 'Besh yuz',
    achThousand: 'Ming marta',
    achFiveK: 'Besh ming',
    achTenK: 'O\'n ming',
    achStreak3: '3 kun streak',
    achStreak7: 'Haftalik',
    achStreak30: 'Oylik',
    achReq1: '1 ta zikr',
    achReq10: '10 ta',
    achReq100: '100 ta',
    achReq500: '500 ta',
    achReq1000: '1,000 ta',
    achReq5000: '5,000 ta',
    achReq10000: '10,000 ta',
    achReq3days: '3 kun',
    achReq7days: '7 kun streak',
    achReq30days: '30 kun streak',

    // Celebration
    celebrationTitle: 'Tabriklaymiz!',
    celebrationText: '{count} marta {zikr} zikr qildingiz!',
    celebrationBtn: 'Davom etish',

    // Subscription overlay
    subTitle: 'Obuna bo\'ling!',
    subText: 'Botdan foydalanish uchun quyidagi kanallarga obuna bo\'ling:',
    subCheckBtn: '✅ Tekshirish',
    subNotSubscribed: '❌ Hali barcha kanallarga obuna bo\'lmagansiz!',

    // Blocked overlay
    blockedTitle: 'Hisobingiz bloklangan',
    blockedText: 'Admin tomonidan bloklangansiz. Botdan foydalana olmaysiz.',

    // Reset confirm
    resetConfirm: 'Hisoblagichni 0 ga qaytarasizmi?',

    // Donation
    donateTitle: '💝 Ehson qilish',
    donateSubtitle: 'Alloh yo\'lida ehson qiling',
    donateCardTitle: 'Karta orqali o\'tkazish',
    donateCardNumber: 'Karta raqami',
    donateCardHolder: 'Karta egasi',
    donateCopySuccess: '✅ Karta raqami nusxalandi!',
    donateCopyBtn: 'Nusxalash',
    donateNoCard: 'Hozircha ehson kartasi qo\'shilmagan',
    donateStarsTitle: 'Telegram Stars ⭐ orqali',
    donateDua: '🤲 Alloh sizdan rozi bo\'lsin!',
    donateReason: 'Ehson sababi',

    // Prayer times
    tabPrayer: 'Namoz',
    prayerTitle: '🕌 Namoz vaqtlari',
    prayerLocation: '📍 Joy',
    prayerMosque: '🕌 Masjid',
    prayerBomdod: 'Bomdod',
    prayerPeshin: 'Peshin',
    prayerAsr: 'Asr',
    prayerShom: 'Shom',
    prayerXufton: 'Xufton',
    prayerDisabled: 'Namoz vaqtlari hali sozlanmagan',
    prayerNextIn: 'keyingi',
    prayerNow: 'hozir!',

    // Language names
    langName: 'O\'zbekcha',
    langFlag: '🇺🇿',
  },

  // ==========================================
  // РУССКИЙ ЯЗЫК
  // ==========================================
  ru: {
    // Tab Navigation
    tabCounter: 'Тасбих',
    tabLeaderboard: 'Топ',
    tabProfile: 'Профиль',

    // Zikr types
    zikrSubhanalloh: 'СубханАллох',
    zikrAlhamdulillah: 'Альхамдулиллах',
    zikrAllohuakbar: 'Аллоху Акбар',
    zikrCustom: 'Другое',

    // Counter
    counterLabel: 'раз',
    tapText: 'Нажмите',
    tapAriaLabel: 'Считать',

    // Action buttons
    resetBtn: 'Сбросить',
    vibrationBtn: 'Вибрация',
    soundBtn: 'Звук',

    // Mini stats
    streakLabel: 'дней подряд',
    totalZikrLabel: 'всего зикр',
    rankLabel: 'рейтинг',

    // Leaderboard
    leaderboardTitle: '🏆 Топ пользователей',
    leaderboardSubtitle: 'Больше всего зикров',
    usersCount: 'пользователей',
    zikrUnit: 'зикр',
    youLabel: '(Вы)',

    // Profile
    profileDefaultName: 'Пользователь',
    profileCurrentCount: 'Текущий счёт',
    profileTotalZikr: 'Всего зикров',
    profileStreak: 'Стрик (дней)',
    profileRank: 'Рейтинг',
    achievementsTitle: '🎖 Достижения',
    profileRegistered: '📅 Регистрация',
    profileLastActive: '⏱ Последняя активность',

    // Achievements
    achFirst: 'Первый шаг',
    achTen: '10 зикров',
    achHundred: 'Сто раз',
    achFiveHundred: 'Пятьсот',
    achThousand: 'Тысяча',
    achFiveK: 'Пять тысяч',
    achTenK: 'Десять тысяч',
    achStreak3: '3 дня подряд',
    achStreak7: 'Неделя',
    achStreak30: 'Месяц',
    achReq1: '1 зикр',
    achReq10: '10 зикров',
    achReq100: '100 зикров',
    achReq500: '500 зикров',
    achReq1000: '1,000 зикров',
    achReq5000: '5,000 зикров',
    achReq10000: '10,000 зикров',
    achReq3days: '3 дня',
    achReq7days: '7 дней подряд',
    achReq30days: '30 дней подряд',

    // Celebration
    celebrationTitle: 'Поздравляем!',
    celebrationText: 'Вы совершили {count} зикров {zikr}!',
    celebrationBtn: 'Продолжить',

    // Subscription overlay
    subTitle: 'Подпишитесь!',
    subText: 'Для использования бота подпишитесь на следующие каналы:',
    subCheckBtn: '✅ Проверить',
    subNotSubscribed: '❌ Вы ещё не подписались на все каналы!',

    // Blocked overlay
    blockedTitle: 'Аккаунт заблокирован',
    blockedText: 'Вы заблокированы администратором. Доступ к боту ограничен.',

    // Reset confirm
    resetConfirm: 'Сбросить счётчик до 0?',

    // Donation
    donateTitle: '💝 Пожертвование',
    donateSubtitle: 'Пожертвуйте на пути Аллаха',
    donateCardTitle: 'Перевод на карту',
    donateCardNumber: 'Номер карты',
    donateCardHolder: 'Владелец карты',
    donateCopySuccess: '✅ Номер карты скопирован!',
    donateCopyBtn: 'Копировать',
    donateNoCard: 'Карта для пожертвований пока не добавлена',
    donateStarsTitle: 'Через Telegram Stars ⭐',
    donateDua: '🤲 Да вознаградит вас Аллах!',
    donateReason: 'Причина пожертвования',

    // Prayer times
    tabPrayer: 'Намаз',
    prayerTitle: '🕌 Время намаза',
    prayerLocation: '📍 Место',
    prayerMosque: '🕌 Мечеть',
    prayerBomdod: 'Фаджр',
    prayerPeshin: 'Зухр',
    prayerAsr: 'Аср',
    prayerShom: 'Магриб',
    prayerXufton: 'Иша',
    prayerDisabled: 'Время намаза ещё не настроено',
    prayerNextIn: 'через',
    prayerNow: 'сейчас!',

    // Language names
    langName: 'Русский',
    langFlag: '🇷🇺',
  },

  // ==========================================
  // ENGLISH
  // ==========================================
  en: {
    // Tab Navigation
    tabCounter: 'Tasbih',
    tabLeaderboard: 'Top',
    tabProfile: 'Profile',

    // Zikr types
    zikrSubhanalloh: 'SubhanAllah',
    zikrAlhamdulillah: 'Alhamdulillah',
    zikrAllohuakbar: 'Allahu Akbar',
    zikrCustom: 'Other',

    // Counter
    counterLabel: 'times',
    tapText: 'Tap',
    tapAriaLabel: 'Count',

    // Action buttons
    resetBtn: 'Reset',
    vibrationBtn: 'Vibration',
    soundBtn: 'Sound',

    // Mini stats
    streakLabel: 'day streak',
    totalZikrLabel: 'total dhikr',
    rankLabel: 'rank',

    // Leaderboard
    leaderboardTitle: '🏆 Top Users',
    leaderboardSubtitle: 'Most dhikr performed',
    usersCount: 'users',
    zikrUnit: 'dhikr',
    youLabel: '(You)',

    // Profile
    profileDefaultName: 'User',
    profileCurrentCount: 'Current count',
    profileTotalZikr: 'Total dhikr',
    profileStreak: 'Streak (days)',
    profileRank: 'Rank',
    achievementsTitle: '🎖 Achievements',
    profileRegistered: '📅 Registered',
    profileLastActive: '⏱ Last active',

    // Achievements
    achFirst: 'First step',
    achTen: '10 dhikr',
    achHundred: 'One hundred',
    achFiveHundred: 'Five hundred',
    achThousand: 'One thousand',
    achFiveK: 'Five thousand',
    achTenK: 'Ten thousand',
    achStreak3: '3-day streak',
    achStreak7: 'Weekly',
    achStreak30: 'Monthly',
    achReq1: '1 dhikr',
    achReq10: '10 dhikr',
    achReq100: '100 dhikr',
    achReq500: '500 dhikr',
    achReq1000: '1,000 dhikr',
    achReq5000: '5,000 dhikr',
    achReq10000: '10,000 dhikr',
    achReq3days: '3 days',
    achReq7days: '7-day streak',
    achReq30days: '30-day streak',

    // Celebration
    celebrationTitle: 'Congratulations!',
    celebrationText: 'You performed {count} {zikr} dhikr!',
    celebrationBtn: 'Continue',

    // Subscription overlay
    subTitle: 'Subscribe!',
    subText: 'Please subscribe to the following channels to use the bot:',
    subCheckBtn: '✅ Check',
    subNotSubscribed: '❌ You haven\'t subscribed to all channels yet!',

    // Blocked overlay
    blockedTitle: 'Account blocked',
    blockedText: 'You have been blocked by the admin. Bot access is restricted.',

    // Reset confirm
    resetConfirm: 'Reset counter to 0?',

    // Donation
    donateTitle: '💝 Donate',
    donateSubtitle: 'Give charity for the sake of Allah',
    donateCardTitle: 'Transfer to card',
    donateCardNumber: 'Card number',
    donateCardHolder: 'Cardholder',
    donateCopySuccess: '✅ Card number copied!',
    donateCopyBtn: 'Copy',
    donateNoCard: 'Donation card has not been added yet',
    donateStarsTitle: 'Via Telegram Stars ⭐',
    donateDua: '🤲 May Allah reward you!',
    donateReason: 'Donation reason',

    // Prayer times
    tabPrayer: 'Prayer',
    prayerTitle: '🕌 Prayer Times',
    prayerLocation: '📍 Location',
    prayerMosque: '🕌 Mosque',
    prayerBomdod: 'Fajr',
    prayerPeshin: 'Dhuhr',
    prayerAsr: 'Asr',
    prayerShom: 'Maghrib',
    prayerXufton: 'Isha',
    prayerDisabled: 'Prayer times have not been set up yet',
    prayerNextIn: 'in',
    prayerNow: 'now!',

    // Language names
    langName: 'English',
    langFlag: '🇬🇧',
  },
};

// ==========================================
// ZIKR NAMES per language
// ==========================================
const ZIKR_NAMES_I18N = {
  uz: {
    subhanalloh: 'SubhanAlloh',
    alhamdulillah: 'Alhamdulillah',
    allohuakbar: 'Allohu Akbar',
    custom: 'Boshqa zikr',
  },
  ru: {
    subhanalloh: 'СубханАллох',
    alhamdulillah: 'Альхамдулиллах',
    allohuakbar: 'Аллоху Акбар',
    custom: 'Другой зикр',
  },
  en: {
    subhanalloh: 'SubhanAllah',
    alhamdulillah: 'Alhamdulillah',
    allohuakbar: 'Allahu Akbar',
    custom: 'Other dhikr',
  },
};

// ==========================================
// ACHIEVEMENTS per language
// ==========================================
const ACHIEVEMENTS_I18N = {
  uz: [
    { id: 'first', emoji: '🌟', nameKey: 'achFirst', reqKey: 'achReq1', threshold: 1 },
    { id: 'ten', emoji: '✨', nameKey: 'achTen', reqKey: 'achReq10', threshold: 10 },
    { id: 'hundred', emoji: '💫', nameKey: 'achHundred', reqKey: 'achReq100', threshold: 100 },
    { id: 'fivehundred', emoji: '🌙', nameKey: 'achFiveHundred', reqKey: 'achReq500', threshold: 500 },
    { id: 'thousand', emoji: '⭐', nameKey: 'achThousand', reqKey: 'achReq1000', threshold: 1000 },
    { id: 'fivek', emoji: '🕌', nameKey: 'achFiveK', reqKey: 'achReq5000', threshold: 5000 },
    { id: 'tenk', emoji: '🏆', nameKey: 'achTenK', reqKey: 'achReq10000', threshold: 10000 },
    { id: 'streak3', emoji: '🔥', nameKey: 'achStreak3', reqKey: 'achReq3days', threshold: -3 },
    { id: 'streak7', emoji: '💎', nameKey: 'achStreak7', reqKey: 'achReq7days', threshold: -7 },
    { id: 'streak30', emoji: '👑', nameKey: 'achStreak30', reqKey: 'achReq30days', threshold: -30 },
  ],
};

// Same structure for all languages — they share the same achievements list
ACHIEVEMENTS_I18N.ru = ACHIEVEMENTS_I18N.uz;
ACHIEVEMENTS_I18N.en = ACHIEVEMENTS_I18N.uz;

// ==========================================
// i18n UTILITY FUNCTIONS
// ==========================================
let currentLanguage = 'uz';

/**
 * Get translation by key
 * @param {string} key — translation key
 * @param {object} params — optional interpolation params like {count: 33, zikr: 'SubhanAlloh'}
 * @returns {string}
 */
function t(key, params = {}) {
  const lang = TRANSLATIONS[currentLanguage] || TRANSLATIONS.uz;
  let text = lang[key] || TRANSLATIONS.uz[key] || key;

  // Interpolation: replace {param} with value
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });

  return text;
}

/**
 * Detect language from Telegram or browser
 * Priority: localStorage > Telegram language > browser language > 'uz'
 */
function detectLanguage() {
  // 1. Check localStorage
  const saved = localStorage.getItem('tasbih_language');
  if (saved && TRANSLATIONS[saved]) return saved;

  // 2. Check Telegram language
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user?.language_code) {
    const tgLang = tg.initDataUnsafe.user.language_code.toLowerCase();
    if (tgLang.startsWith('ru')) return 'ru';
    if (tgLang.startsWith('en')) return 'en';
    if (tgLang.startsWith('uz')) return 'uz';
  }

  // 3. Check browser language
  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('en')) return 'en';

  // 4. Default
  return 'uz';
}

/**
 * Set language and update all UI elements
 * @param {string} lang — 'uz', 'ru', or 'en'
 */
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = 'uz';
  currentLanguage = lang;
  localStorage.setItem('tasbih_language', lang);

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Update all elements with data-i18n-placeholder attribute
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // Update all elements with data-i18n-aria attribute
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    el.setAttribute('aria-label', t(key));
  });

  // Update language selector button text
  const langBtn = document.getElementById('langSwitchBtn');
  if (langBtn) {
    langBtn.querySelector('.lang-flag').textContent = t('langFlag');
    langBtn.querySelector('.lang-name').textContent = t('langName');
  }

  // Update active class on language dropdown items
  document.querySelectorAll('.lang-option').forEach((opt) => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });

  // Update HTML lang attribute
  document.documentElement.lang = lang === 'uz' ? 'uz' : lang === 'ru' ? 'ru' : 'en';
}

/**
 * Get current language code
 */
function getLang() {
  return currentLanguage;
}

/**
 * Get zikr name in current language
 */
function getZikrName(zikrKey) {
  const names = ZIKR_NAMES_I18N[currentLanguage] || ZIKR_NAMES_I18N.uz;
  return names[zikrKey] || zikrKey;
}
