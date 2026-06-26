import { writable, derived, get } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'system';
type ThemeMode = 'light' | 'dark';

function createThemeStore() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
  const initial: Theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  
  const { subscribe, set } = writable<Theme>(initial);
  
  const getSystemTheme = (): ThemeMode => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };
  
  const applyTheme = (theme: Theme) => {
    if (typeof document === 'undefined') return;
    
    const mode: ThemeMode = theme === 'system' ? getSystemTheme() : theme;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);
    document.documentElement.style.colorScheme = mode;
  };
  
  if (typeof document !== 'undefined') {
    applyTheme(initial);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const current = get({ subscribe });
      if (current === 'system') {
        applyTheme('system');
      }
    });
  }
  
  return {
    subscribe,
    set: (value: Theme) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', value);
      }
      applyTheme(value);
      set(value);
    },
    toggle: () => {
      const current = get({ subscribe });
      const next: Theme = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', next);
      }
      applyTheme(next);
      set(next);
    }
  };
}

export const theme = createThemeStore();

export const effectiveTheme = derived(theme, ($theme): ThemeMode => {
  if ($theme === 'system') {
    return typeof window !== 'undefined' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : 'light';
  }
  return $theme;
});

export const isDark = derived(effectiveTheme, ($theme) => $theme === 'dark');
export const isLight = derived(effectiveTheme, ($theme) => $theme === 'light');