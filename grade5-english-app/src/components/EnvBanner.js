import React, { useEffect } from 'react';
import { IS_TEST_ENV, DB_ROOT, ENV_BRANCH, ENV_COMMIT } from '../services/env';

// תגית קטנה בפינה - כדי שתמיד יהיה ברור שזו סביבת בדיקות ולא האתר של הילדים
const EnvBanner = () => {
  useEffect(() => {
    if (IS_TEST_ENV && !document.title.startsWith('🧪')) document.title = `🧪 ${document.title}`;
  }, []);

  if (!IS_TEST_ENV) return null;
  return (
    <div className="env-banner" role="status" title={`נתונים נשמרים תחת ${DB_ROOT}/`}>
      🧪 סביבת בדיקות
      {(ENV_BRANCH || ENV_COMMIT) && <> · <bdi dir="ltr">{[ENV_BRANCH, ENV_COMMIT && `@${ENV_COMMIT}`].filter(Boolean).join(' ')}</bdi></>}
    </div>
  );
};

export default EnvBanner;
