const STORAGE_KEY = 'trustradar.locale.v1'
export const SUPPORTED_LOCALES = Object.freeze(['en', 'ar', 'fr', 'de', 'zh-cn'])
export const LOCALE_META = Object.freeze({
  en: { label: 'English', native: 'English', dir: 'ltr' },
  ar: { label: 'Arabic', native: 'العربية', dir: 'rtl' },
  fr: { label: 'French', native: 'Français', dir: 'ltr' },
  de: { label: 'German', native: 'Deutsch', dir: 'ltr' },
  'zh-cn': { label: 'Chinese (Simplified)', native: '简体中文', dir: 'ltr' }
})

const messages = {
  en: { overview:'Overview', investigate:'Investigate', reports:'Report register', newReport:'New report', saved:'Saved indicators', settings:'Settings', language:'Language', languageHelp:'Choose the language used by the workspace.', appearance:'Appearance', localStorage:'Local device storage', demoStorage:'Demo session storage', active:'ACTIVE', sessionOnly:'SESSION ONLY', providers:'External intelligence providers', notConnected:'NOT CONNECTED', sync:'Community synchronization', disabled:'DISABLED', appVersion:'Application version', workspaceSettings:'Workspace settings', backup:'Copy local backup', clearData:'Clear all local data', home:'Home', search:'Search', add:'Add', more:'More', languageChanged:'Language preference saved.', themeChanged:'Appearance preference saved.', appearanceHelp:'Choose a theme for this device.', dark:'Dark', light:'Light', system:'System' },
  ar: { overview:'نظرة عامة', investigate:'التحقيق', reports:'سجل البلاغات', newReport:'بلاغ جديد', saved:'المؤشرات المحفوظة', settings:'الإعدادات', language:'اللغة', languageHelp:'اختر لغة مساحة العمل.', appearance:'المظهر', localStorage:'التخزين على الجهاز', demoStorage:'تخزين الجلسة التجريبية', active:'نشط', sessionOnly:'الجلسة فقط', providers:'مصادر المعلومات الخارجية', notConnected:'غير متصل', sync:'مزامنة المجتمع', disabled:'معطّل', appVersion:'إصدار التطبيق', workspaceSettings:'إعدادات مساحة العمل', backup:'نسخ احتياطي محلي', clearData:'مسح كل البيانات المحلية', home:'الرئيسية', search:'بحث', add:'إضافة', more:'المزيد', languageChanged:'تم حفظ تفضيل اللغة.', themeChanged:'تم حفظ تفضيل المظهر.', appearanceHelp:'اختر مظهر التطبيق على هذا الجهاز.', dark:'داكن', light:'فاتح', system:'حسب الجهاز' },
  fr: { overview:'Vue d’ensemble', investigate:'Enquêter', reports:'Registre des signalements', newReport:'Nouveau signalement', saved:'Indicateurs enregistrés', settings:'Paramètres', language:'Langue', languageHelp:'Choisissez la langue de l’espace de travail.', appearance:'Apparence', localStorage:'Stockage local', demoStorage:'Stockage de la session démo', active:'ACTIF', sessionOnly:'SESSION UNIQUEMENT', providers:'Fournisseurs de renseignement externes', notConnected:'NON CONNECTÉ', sync:'Synchronisation communautaire', disabled:'DÉSACTIVÉ', appVersion:'Version de l’application', workspaceSettings:'Paramètres de l’espace de travail', backup:'Copier la sauvegarde locale', clearData:'Effacer toutes les données locales', home:'Accueil', search:'Recherche', add:'Ajouter', more:'Plus', languageChanged:'Préférence linguistique enregistrée.', themeChanged:'Préférence d’apparence enregistrée.', appearanceHelp:'Choisissez le thème de cet appareil.', dark:'Sombre', light:'Clair', system:'Système' },
  'zh-cn': { overview:'总览', investigate:'调查', reports:'报告记录', newReport:'新建报告', saved:'已保存的指标', settings:'设置', language:'语言', languageHelp:'选择工作区使用的语言。', appearance:'外观', localStorage:'本地设备存储', demoStorage:'演示会话存储', active:'已启用', sessionOnly:'仅限本次会话', providers:'外部情报来源', notConnected:'未连接', sync:'社区同步', disabled:'已禁用', appVersion:'应用版本', workspaceSettings:'工作区设置', backup:'复制本地备份', clearData:'清除所有本地数据', home:'主页', search:'搜索', add:'添加', more:'更多', languageChanged:'语言设置已保存。', themeChanged:'外观设置已保存。', appearanceHelp:'选择此设备的主题。', dark:'深色', light:'浅色', system:'跟随系统' },
  de: { overview:'Übersicht', investigate:'Untersuchen', reports:'Meldungsregister', newReport:'Neue Meldung', saved:'Gespeicherte Indikatoren', settings:'Einstellungen', language:'Sprache', languageHelp:'Wählen Sie die Sprache des Arbeitsbereichs.', appearance:'Darstellung', localStorage:'Lokaler Gerätespeicher', demoStorage:'Demo-Sitzungsspeicher', active:'AKTIV', sessionOnly:'NUR SITZUNG', providers:'Externe Intelligence-Anbieter', notConnected:'NICHT VERBUNDEN', sync:'Community-Synchronisierung', disabled:'DEAKTIVIERT', appVersion:'Anwendungsversion', workspaceSettings:'Arbeitsbereich-Einstellungen', backup:'Lokales Backup kopieren', clearData:'Alle lokalen Daten löschen', home:'Startseite', search:'Suche', add:'Hinzufügen', more:'Mehr', languageChanged:'Spracheinstellung gespeichert.', themeChanged:'Darstellungseinstellung gespeichert.', appearanceHelp:'Wählen Sie das Design für dieses Gerät.', dark:'Dunkel', light:'Hell', system:'System' }
}

export function normalizeLocale(locale) {
  const raw = String(locale || '').toLowerCase()
  const candidate = raw.startsWith('zh-') ? 'zh-cn' : raw.split('-')[0]
  return SUPPORTED_LOCALES.includes(candidate) ? candidate : 'en'
}
export function getLocaleMeta(locale) { return LOCALE_META[normalizeLocale(locale)] }
export function translate(locale, key) {
  const lang = normalizeLocale(locale)
  return messages[lang][key] ?? messages.en[key] ?? key
}
export function readLocale(storage = globalThis.uni) {
  try {
    const value = storage?.getStorageSync?.(STORAGE_KEY)
    if (value) return normalizeLocale(value)
  } catch (_) { /* fall through to web storage */ }
  try {
    const value = globalThis.localStorage?.getItem(STORAGE_KEY)
    return normalizeLocale(value)
  } catch (_) { return 'en' }
}
export function writeLocale(locale, storage = globalThis.uni) {
  const value = normalizeLocale(locale)
  try {
    if (storage?.setStorageSync) { storage.setStorageSync(STORAGE_KEY, value); return { ok: true, locale: value } }
  } catch (_) { /* try web storage */ }
  try {
    if (globalThis.localStorage) { globalThis.localStorage.setItem(STORAGE_KEY, value); return { ok: true, locale: value } }
  } catch (_) { /* unavailable */ }
  return { ok: false, locale: value }
}
