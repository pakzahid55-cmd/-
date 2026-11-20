'use client';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
import { useAuth } from './store/auth';

export default function Storefront() {
  const initialize = useAuth((s) => s.initialize);
  useEffect(() => { void initialize(); }, [initialize]);
  return <I18nProvider><BrowserRouter><App /></BrowserRouter></I18nProvider>;
}
