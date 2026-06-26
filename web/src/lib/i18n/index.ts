import { writable, derived, get } from 'svelte/store';
import en from './en.json';
import zh from './zh.json';

export type Locale = 'en' | 'zh';

const translations: Record<Locale, typeof en> = { en, zh };

function createLocaleStore() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null;
  const initial: Locale = stored === 'en' || stored === 'zh' ? stored : 'en';
  
  const { subscribe, set } = writable<Locale>(initial);
  
  return {
    subscribe,
    set: (value: Locale) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('locale', value);
      }
      set(value);
    },
    toggle: () => {
      const current = get({ subscribe });
      const next = current === 'en' ? 'zh' : 'en';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('locale', next);
      }
      set(next);
    }
  };
}

export const locale = createLocaleStore();

export const t = derived(locale, ($locale) => translations[$locale]);

export function translate(key: string, params?: Record<string, string | number>): string {
  const current = get(t);
  const keys = key.split('.');
  let value: unknown = current;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, param) => 
      params[param]?.toString() ?? `{${param}}`
    );
  }
  
  return value;
}

export function createTranslator() {
  return derived(t, ($t) => {
    return (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: unknown = $t;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }
      
      if (typeof value !== 'string') {
        return key;
      }
      
      if (params) {
        return value.replace(/\{(\w+)\}/g, (_, param) => 
          params[param]?.toString() ?? `{${param}}`
        );
      }
      
      return value;
    };
  });
}

export const _ = createTranslator();
