import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
const CampusContext = createContext<any>(null);
export function CampusProvider({ children, user }: { children: React.ReactNode; user: string }) {
  const [state, setState] = useState<any>(null); const [error, setError] = useState(''); const [toast, setToast] = useState('');
  const reload = useCallback(async () => { try { const r = await fetch('/api/campus'); if (!r.ok) throw Error('Campus services are unavailable.'); setState(await r.json()); setError(''); } catch(e) { setError(String(e)); } }, []);
  useEffect(() => { reload(); const events = new EventSource('/api/campus/events'); events.addEventListener('refresh', reload); events.addEventListener('notification', (e: MessageEvent) => setToast(JSON.parse(e.data).title)); return () => events.close(); }, [reload]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 7000); return () => clearTimeout(timer); } }, [toast]);
  const act = async (action: string, data: any = {}) => {
    const response = await fetch('/api/campus/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, data, user }) });
    const body = await response.json(); if (!response.ok) throw Error(body.error || 'Unable to save.'); await reload(); return body.result;
  };
  return <CampusContext.Provider value={{ state, act, reload, user }}>{children}{error && <div role="alert" className="campus-toast">{error}</div>}{toast && <div role="status" className="campus-toast">{toast}</div>}</CampusContext.Provider>;
}
export const useCampus = () => useContext(CampusContext);
