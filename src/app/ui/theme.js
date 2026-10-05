import { useCallback, useEffect, useState } from 'react';

const KEY = 'fixly_theme';

function readTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/** Light/dark toggle. The attribute is applied pre-paint in index.html. */
export function useTheme() {
  const [theme, setThemeState] = useState(readTheme);

  // Keep every hook instance in sync (sidebar + header + login all read this).
  useEffect(() => {
    const onChange = () => setThemeState(readTheme());
    window.addEventListener('fixly:theme', onChange);
    return () => window.removeEventListener('fixly:theme', onChange);
  }, []);

  const setTheme = useCallback((next) => {
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch { /* storage blocked — theme still applies for this session */ }
    window.dispatchEvent(new Event('fixly:theme'));
  }, []);

  const toggle = useCallback(() => setTheme(readTheme() === 'dark' ? 'light' : 'dark'), [setTheme]);

  return { theme, setTheme, toggle };
}
