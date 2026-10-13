// שם משתמש + סיסמה בלי אימייל אמיתי:
// השם הופך לכתובת פנימית ייחודית (Firebase דורש פורמט של אימייל ודואג שאין כפילויות).
// כדי לאפשר גם עברית, השם מקודד ל-hex: "נועה" -> u d7a0 d795 ... @kids.english-practice.app

export const USERNAME_DOMAIN = 'kids.english-practice.app';
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 15;
export const PASSWORD_MIN = 6;

const ALLOWED = /^[a-z0-9א-ת_-]+$/; // אותיות באנגלית / עברית, מספרים, _ ו- -

export const normalizeUsername = (name) => (name || '').trim().toLowerCase();

/** מחזיר הודעת שגיאה בעברית, או null אם השם תקין */
export const validateUsername = (raw) => {
  const name = normalizeUsername(raw);
  if (name.length < USERNAME_MIN) return `שם המשתמש צריך לפחות ${USERNAME_MIN} תווים`;
  if (name.length > USERNAME_MAX) return `שם המשתמש יכול להיות עד ${USERNAME_MAX} תווים`;
  if (!ALLOWED.test(name)) return 'אפשר רק אותיות (עברית או אנגלית), מספרים, _ או -, בלי רווחים';
  return null;
};

export const validatePassword = (password) =>
  (password || '').length < PASSWORD_MIN ? `הסיסמה צריכה לפחות ${PASSWORD_MIN} תווים` : null;

// UTF-8 bytes -> hex (בלי תלות ב-TextEncoder)
const toHex = (str) =>
  Array.from(unescape(encodeURIComponent(str)))
    .map(ch => ch.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

const fromHex = (hex) => {
  const bytes = hex.match(/../g) || [];
  return decodeURIComponent(escape(bytes.map(b => String.fromCharCode(parseInt(b, 16))).join('')));
};

export const usernameToEmail = (raw) => `u${toHex(normalizeUsername(raw))}@${USERNAME_DOMAIN}`;

/** אם זה חשבון שם-משתמש - מחזיר את השם; אחרת null */
export const emailToUsername = (email) => {
  const match = /^u([0-9a-f]+)@(.+)$/.exec(email || '');
  if (!match || match[2] !== USERNAME_DOMAIN) return null;
  try {
    return fromHex(match[1]);
  } catch {
    return null;
  }
};

/** איך להציג את החשבון: שם משתמש, או האימייל של Google */
export const accountLabel = (user) => {
  if (!user) return '';
  const username = emailToUsername(user.email);
  return username ? `👤 ${username}` : (user.email || '');
};
