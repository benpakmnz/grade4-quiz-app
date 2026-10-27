import React, { useEffect, useMemo, useState } from 'react';
import { allCategories as categories } from '../data/subjects';
import { ADMIN_SECTIONS, MATH_ADMIN_SECTIONS, emptyItem, emptyPassageQuestion, cleanItem } from '../data/adminSchemas';
import MathText from './MathText';
import { listBank, onContentChange } from '../data/contentStore';
import { addQuestion, deleteCustomQuestion, setBuiltinHidden } from '../services/contentSync';
import './Game.css';
import './EnglishGame.css';
import UsersDashboard from './UsersDashboard';
import UsageDashboard from './UsageDashboard';
import EscapeDashboard from './EscapeDashboard';
import './AdminPanel.css';

const BLANK = '____';

// ---------- שדות הטופס ----------
const Field = ({ field, value, onChange }) => {
  const dir = field.ltr ? 'ltr' : 'rtl';
  if (field.type === 'select') {
    return (
      <select className="admin-input" value={value} onChange={e => onChange(e.target.value)} dir={dir}>
        {field.options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
      </select>
    );
  }
  if (field.type === 'textarea') {
    return (
      <textarea className="admin-input" rows={field.rows || 7} dir={dir} value={value} placeholder={field.placeholder}
        onChange={e => onChange(e.target.value)} />
    );
  }
  if (field.type === 'list') {
    return (
      <div className="admin-list">
        {value.map((v, i) => (
          <input key={i} className="admin-input" dir={dir} value={v} placeholder={`${i + 1}`}
            onChange={e => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
        ))}
      </div>
    );
  }
  if (field.type === 'questions') {
    return <PassageQuestionsEditor value={value} onChange={onChange} />;
  }
  return (
    <div className="admin-row">
      <input className="admin-input" dir={dir} value={value} placeholder={field.placeholder}
        onChange={e => onChange(e.target.value)} />
      {field.blankButton && (
        <button type="button" className="admin-small-btn" title="הוספת מקום חסר"
          onClick={() => onChange(value.includes(BLANK) ? value : `${value}${value && !value.endsWith(' ') ? ' ' : ''}${BLANK}`)}>
          + ____
        </button>
      )}
    </div>
  );
};

// עורך השאלות של קטע קריאה / האזנה
const PassageQuestionsEditor = ({ value, onChange }) => {
  const update = (i, q) => onChange(value.map((x, j) => (j === i ? q : x)));
  const removeAt = (i) => onChange(value.filter((_, j) => j !== i));

  return (
    <div className="admin-questions">
      {value.map((q, i) => (
        <div key={i} className="admin-question">
          <div className="admin-row">
            <b>שאלה {i + 1}</b>
            <select className="admin-input narrow" value={q.type}
              onChange={e => update(i, emptyPassageQuestion(e.target.value))}>
              <option value="mc">אמריקאית</option>
              <option value="yesno">Yes / No</option>
              <option value="order">סידור אירועים</option>
            </select>
            {value.length > 1 && (
              <button type="button" className="admin-small-btn danger" onClick={() => removeAt(i)}>🗑️</button>
            )}
          </div>

          {q.type !== 'order' && (
            <input className="admin-input" dir="ltr" placeholder="Question in English" value={q.q}
              onChange={e => update(i, { ...q, q: e.target.value })} />
          )}

          {q.type === 'mc' && (
            <div className="admin-list">
              {q.options.map((opt, k) => (
                <label key={k} className="admin-option">
                  <input type="radio" name={`q${i}`} checked={q.answer !== '' && q.answer === opt}
                    onChange={() => update(i, { ...q, answer: opt })} title="התשובה הנכונה" />
                  <input className="admin-input" dir="ltr" value={opt} placeholder={`Option ${k + 1}`}
                    onChange={e => {
                      const options = q.options.map((o, j) => (j === k ? e.target.value : o));
                      // אם זו התשובה המסומנת - מעדכנים גם אותה
                      update(i, { ...q, options, answer: q.answer === opt ? e.target.value : q.answer });
                    }} />
                </label>
              ))}
              <span className="admin-hint">● מסמנים את התשובה הנכונה בעיגול שליד</span>
            </div>
          )}

          {q.type === 'yesno' && (
            <div className="admin-row">
              {['Yes', 'No'].map(a => (
                <label key={a} className="admin-option">
                  <input type="radio" name={`q${i}`} checked={q.answer === a}
                    onChange={() => update(i, { ...q, answer: a })} /> {a}
                </label>
              ))}
            </div>
          )}

          {q.type === 'order' && (
            <div className="admin-list">
              <span className="admin-hint">כותבים את האירועים לפי הסדר הנכון - באפליקציה הם יעורבבו</span>
              {q.events.map((ev, k) => (
                <div key={k} className="admin-row">
                  <span>{k + 1}.</span>
                  <input className="admin-input" dir="ltr" value={ev}
                    onChange={e => update(i, { ...q, events: q.events.map((x, j) => (j === k ? e.target.value : x)) })} />
                  {q.events.length > 2 && (
                    <button type="button" className="admin-small-btn danger"
                      onClick={() => update(i, { ...q, events: q.events.filter((_, j) => j !== k) })}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="admin-small-btn"
                onClick={() => update(i, { ...q, events: [...q.events, ''] })}>+ אירוע</button>
            </div>
          )}
        </div>
      ))}
      <div className="admin-row">
        <button type="button" className="admin-small-btn" onClick={() => onChange([...value, emptyPassageQuestion('mc')])}>+ שאלה אמריקאית</button>
        <button type="button" className="admin-small-btn" onClick={() => onChange([...value, emptyPassageQuestion('yesno')])}>+ Yes / No</button>
        <button type="button" className="admin-small-btn" onClick={() => onChange([...value, emptyPassageQuestion('order')])}>+ סידור אירועים</button>
      </div>
    </div>
  );
};

// ---------- טופס הוספה ----------
const AddForm = ({ bankDef, onDone }) => {
  const [item, setItem] = useState(() => emptyItem(bankDef));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const cleaned = cleanItem(item);
    const problem = bankDef.validate(cleaned);
    const clean = bankDef.prepare ? bankDef.prepare(cleaned) : cleaned;
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addQuestion(bankDef.bank, clean);
      setItem(emptyItem(bankDef));
      onDone('✅ השאלה נשמרה ותופיע באפליקציה');
    } catch (err) {
      setError(/permission/i.test(err?.message || '')
        ? 'אין הרשאת ניהול - צריך להגדיר את החשבון כמנהל ב-Firebase (ראו README)'
        : `השמירה נכשלה: ${err?.message || err}`);
    }
    setSaving(false);
  };

  return (
    <div className="admin-form">
      {bankDef.fields.filter(f => !f.showIf || f.showIf(item)).map(f => (
        <div key={f.name} className="admin-field">
          <label>{f.label}</label>
          <Field field={f} value={item[f.name]} onChange={v => setItem({ ...item, [f.name]: v })} />
        </div>
      ))}
      {error && <div className="admin-error">⚠️ {error}</div>}
      <div className="admin-row">
        <button className="admin-save" onClick={save} disabled={saving}>{saving ? 'שומרים...' : '💾 שמירה'}</button>
        <button className="admin-small-btn" onClick={() => onDone(null)}>ביטול</button>
      </div>
    </div>
  );
};

// ---------- עורך השאלות (משמש גם בממשק המורה) ----------
// עובד על מאגר השאלות שנטען כרגע - של הכיתה שמוצגת. note - הערה בראש העורך (למשל: "השינויים רק לכיתה X")
export const QuestionsEditor = ({ note = null }) => {
  const [subject, setSubject] = useState('english');
  const sections = (subject === 'math' ? MATH_ADMIN_SECTIONS : ADMIN_SECTIONS)
    .map(s => ({ ...s, category: categories.find(c => c.id === s.id) }));
  const [sectionId, setSectionId] = useState(sections[0].id);
  const isMath = subject === 'math';
  const [bankIndex, setBankIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [, setVersion] = useState(0);

  // רענון כשהתוכן ב-Firebase משתנה
  useEffect(() => onContentChange(() => setVersion(v => v + 1)), []);

  const section = sections.find(s => s.id === sectionId) || sections[0];
  const bankDef = section.banks[Math.min(bankIndex, section.banks.length - 1)];
  const entries = listBank(bankDef.bank);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter(e =>
      (showHidden || !e.hidden) &&
      (!term || JSON.stringify(e.item).toLowerCase().includes(term))
    );
  }, [entries, search, showHidden]);

  const activeCount = entries.filter(e => !e.hidden).length;
  const customCount = entries.filter(e => e.source === 'custom').length;
  const hiddenCount = entries.filter(e => e.hidden).length;

  const flash = (text) => {
    setMessage(text);
    if (text) setTimeout(() => setMessage(null), 3500);
  };

  const run = async (fn, okText) => {
    try {
      await fn();
      flash(okText);
    } catch (err) {
      flash(`⚠️ הפעולה נכשלה: ${err?.message || err}`);
    }
  };

  const onDelete = (entry) => {
    const text = bankDef.summary(entry.item);
    if (entry.source === 'custom') {
      if (window.confirm(`למחוק את השאלה?\n\n${text}`)) {
        run(() => deleteCustomQuestion(bankDef.bank, entry.id), '🗑️ השאלה נמחקה');
      }
    } else if (window.confirm(`להסתיר את השאלה המובנית? (אפשר להחזיר אותה אחר כך)\n\n${text}`)) {
      run(() => setBuiltinHidden(bankDef.bank, entry.id, true), '🙈 השאלה הוסתרה');
    }
  };

  const onRestore = (entry) => run(() => setBuiltinHidden(bankDef.bank, entry.id, false), '↩️ השאלה הוחזרה');

  return (
    <>
      {note && <div className="admin-scope-note">{note}</div>}
      <div className="admin-card">
        <div className="report-subjects" role="tablist" aria-label="מקצוע">
          {[['english', '🔤 אנגלית'], ['math', '🔢 חשבון']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={subject === id}
              className={`report-subject ${subject === id ? 'active' : ''}`}
              onClick={() => {
                setSubject(id);
                setSectionId((id === 'math' ? MATH_ADMIN_SECTIONS : ADMIN_SECTIONS)[0].id);
                setBankIndex(0); setAdding(false); setSearch('');
              }}>
              {label}
            </button>
          ))}
        </div>

        {isMath && (
          <p className="admin-hint math-admin-hint">
            בחשבון השאלות נוצרות אוטומטית עם מספרים חדשים בכל פעם. כאן אפשר להוסיף שאלות משלך לכל נושא
            (למשל בנוסח של המורה) - הן יתערבבו בתרגול, ובנושא שיש בו יותר שאלות שלך הן יופיעו לעתים קרובות יותר (עד כ-40%).
          </p>
        )}

        <div className="admin-tabs">
          {sections.map(s => (
            <button key={s.id} className={`admin-tab ${s.id === sectionId ? 'active' : ''}`}
              onClick={() => { setSectionId(s.id); setBankIndex(0); setAdding(false); setSearch(''); }}>
              {s.category?.title || s.id}
            </button>
          ))}
        </div>

        {section.banks.length > 1 && (
          <div className="admin-subtabs">
            {section.banks.map((b, i) => (
              <button key={b.bank} className={`admin-subtab ${i === bankIndex ? 'active' : ''}`}
                onClick={() => { setBankIndex(i); setAdding(false); setSearch(''); }}>
                {b.title}
              </button>
            ))}
          </div>
        )}

        <div className="admin-stats">
          {isMath
            ? <>{customCount} שאלות שהוספת · בנוסף לשאלות שנוצרות אוטומטית</>
            : <>{activeCount} שאלות פעילות · {customCount} נוספו על ידך · {hiddenCount} מובנות מוסתרות</>}
          {sectionId === 'isAre' || sectionId === 'hasHave' || sectionId === 'canCant' || sectionId === 'becauseWhy'
            ? <span className="admin-hint"> (משמשות גם ב"מבחן מסכם")</span> : null}
        </div>

        {message && <div className="admin-message">{message}</div>}

        {adding ? (
          <AddForm key={bankDef.bank} bankDef={bankDef}
            onDone={(text) => { setAdding(false); if (text) flash(text); }} />
        ) : (
          <button className="admin-save" onClick={() => setAdding(true)}>➕ הוספת שאלה: {bankDef.title}</button>
        )}

        <div className="admin-row admin-filters">
          <input className="admin-input" placeholder="🔍 חיפוש" value={search} onChange={e => setSearch(e.target.value)} />
          {hiddenCount > 0 && (
            <label className="admin-option">
              <input type="checkbox" checked={showHidden} onChange={e => setShowHidden(e.target.checked)} />
              הצגת מוסתרות
            </label>
          )}
        </div>

        <ul className="admin-items">
          {visible.map(entry => (
            <li key={entry.id} className={`admin-item ${entry.hidden ? 'is-hidden' : ''}`}>
              <span className={`admin-badge ${entry.source}`}>
                {entry.source === 'custom' ? 'חדשה' : entry.hidden ? 'מוסתרת' : 'מובנית'}
              </span>
              <span className="admin-item-text" dir="auto">
                {isMath ? <MathText text={bankDef.summary(entry.item)} /> : bankDef.summary(entry.item)}
              </span>
              {entry.hidden ? (
                <button className="admin-small-btn" onClick={() => onRestore(entry)}>↩️ החזרה</button>
              ) : (
                <button className="admin-small-btn danger" onClick={() => onDelete(entry)}>
                  🗑️ {entry.source === 'custom' ? 'מחיקה' : 'הסתרה'}
                </button>
              )}
            </li>
          ))}
          {visible.length === 0 && (
            <li className="admin-empty">{isMath ? 'עוד לא הוספת שאלות לנושא הזה - התרגול משתמש בשאלות האוטומטיות' : 'אין שאלות להצגה'}</li>
          )}
        </ul>
      </div>
    </>
  );
};

// ---------- המסך הראשי ----------
const AdminPanel = ({ onBack, contentNote = null }) => {
  const [view, setView] = useState('questions'); // questions | users | usage | escape

  return (
    <div className="math-game english-game admin-panel">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>← חזרה</button>
        <h2 className="game-title">⚙️ ניהול</h2>
      </div>

      <div className="mode-tabs">
        <button className={`mode-tab ${view === 'questions' ? 'active' : ''}`} onClick={() => setView('questions')}>
          📝 שאלות
        </button>
        <button className={`mode-tab ${view === 'users' ? 'active' : ''}`} onClick={() => setView('users')}>
          📊 משתמשים
        </button>
        <button className={`mode-tab ${view === 'usage' ? 'active' : ''}`} onClick={() => setView('usage')}>
          📈 שימוש
        </button>
        <button className={`mode-tab ${view === 'escape' ? 'active' : ''}`} onClick={() => setView('escape')}>
          🔐 אתגרים
        </button>
      </div>

      {view === 'usage' && <div className="admin-card"><UsageDashboard /></div>}
      {view === 'escape' && <div className="admin-card"><EscapeDashboard /></div>}
      {view === 'users' && <div className="admin-card"><UsersDashboard /></div>}
      {view === 'questions' && <QuestionsEditor note={contentNote} />}
    </div>
  );
};

export default AdminPanel;
