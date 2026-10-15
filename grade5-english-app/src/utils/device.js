// תיאור קצר וקריא של המכשיר והדפדפן, למשל "iPhone · Safari"
export const describeDevice = (ua = '', touchPoints = 0) => {
  let os = 'מחשב';
  let type = 'desktop';
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1)) {
    os = 'iPad';
    type = 'tablet';
  } else if (/iPhone|iPod/.test(ua)) {
    os = 'iPhone';
    type = 'mobile';
  } else if (/Android/.test(ua)) {
    type = /Mobile/.test(ua) ? 'mobile' : 'tablet';
    os = type === 'mobile' ? 'Android' : 'טאבלט Android';
  } else if (/CrOS/.test(ua)) {
    os = 'Chromebook';
  } else if (/Windows/.test(ua)) {
    os = 'Windows';
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = 'Mac';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  let browser = '';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/SamsungBrowser/.test(ua)) browser = 'Samsung';
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (/Firefox|FxiOS/.test(ua)) browser = 'Firefox';
  else if (/Chrome|CriOS/.test(ua)) browser = 'Chrome';
  else if (/Safari/.test(ua)) browser = 'Safari';

  return { type, label: browser ? `${os} · ${browser}` : os };
};

export const DEVICE_ICONS = { mobile: '📱', tablet: '📲', desktop: '💻' };

export const currentDevice = () => {
  try {
    return describeDevice(navigator.userAgent, navigator.maxTouchPoints || 0);
  } catch {
    return { type: 'desktop', label: 'לא ידוע' };
  }
};
