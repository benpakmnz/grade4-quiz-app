import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { isPartyPath } from './party/routes';

// "/party" (TV) and "/join/<code>" (phones) run the birthday game,
// everything else is the grade-4 quiz app.
const QuizRoot = lazy(() => import('./QuizRoot'));
const PartyApp = lazy(() => import('./party/PartyApp'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={null}>
      {isPartyPath(window.location.pathname) ? <PartyApp /> : <QuizRoot />}
    </Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
