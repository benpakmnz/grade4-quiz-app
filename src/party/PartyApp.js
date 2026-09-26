import React, { Suspense, lazy, useEffect } from 'react';
import { parsePartyRoute } from './routes';
import './party.css';

const HostApp = lazy(() => import('./host/HostApp'));
const PlayerApp = lazy(() => import('./player/PlayerApp'));

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&family=Varela+Round&display=swap';

const usePartyDocument = (view) => {
  useEffect(() => {
    const added = [];
    const addLink = (attrs) => {
      const link = document.createElement('link');
      Object.assign(link, attrs);
      document.head.appendChild(link);
      added.push(link);
    };
    addLink({ rel: 'preconnect', href: 'https://fonts.googleapis.com' });
    addLink({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' });
    addLink({ rel: 'stylesheet', href: FONTS_URL });

    // No pinch/double-tap zoom while tapping hearts like crazy.
    const viewport = document.querySelector('meta[name="viewport"]');
    const previousViewport = viewport && viewport.getAttribute('content');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    }
    const theme = document.querySelector('meta[name="theme-color"]');
    const previousTheme = theme && theme.getAttribute('content');
    if (theme) theme.setAttribute('content', '#FFE4EC');

    const previousTitle = document.title;
    document.title = view === 'host' ? 'בנק הלבבות - מסך הטלוויזיה 💖' : 'בנק הלבבות 💖';
    document.body.classList.add('hb-body');

    return () => {
      added.forEach((el) => el.remove());
      if (viewport && previousViewport) viewport.setAttribute('content', previousViewport);
      if (theme && previousTheme) theme.setAttribute('content', previousTheme);
      document.title = previousTitle;
      document.body.classList.remove('hb-body');
    };
  }, [view]);
};

const PartyApp = () => {
  const route = parsePartyRoute(window.location.pathname);
  usePartyDocument(route.view);
  return (
    <div className="hb-root">
      <Suspense fallback={<div className="hb-boot" />}>
        {route.view === 'host' ? <HostApp /> : <PlayerApp initialCode={route.code} />}
      </Suspense>
    </div>
  );
};

export default PartyApp;
