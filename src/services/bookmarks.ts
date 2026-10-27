import { useEffect, useState } from 'react';
export function useSyncedBookmarks(kind: 'catalog' | 'documents') {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    fetch('/api/platform/bookmarks')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data[kind])) setIds(data[kind]);
      })
      .catch(() => {});
  }, [kind]);
  const save = (next: string[]) => {
    setIds(next);
    void fetch('/api/platform/bookmarks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, ids: next }),
    });
  };
  return [ids, save] as const;
}
