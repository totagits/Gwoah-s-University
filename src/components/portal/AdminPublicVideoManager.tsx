import { mediaAdminHeaders } from '../../services/mediaAuthClient';
import React, { useEffect, useState } from 'react';
import { DEFAULT_PUBLIC_VIDEOS, type PublicVideo } from '../../data/publicMedia';

const categories: PublicVideo['category'][] = ['campus', 'academics', 'events', 'student-life', 'other'];
export function AdminPublicVideoManager() {
  const [videos, setVideos] = useState<PublicVideo[]>(DEFAULT_PUBLIC_VIDEOS);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PublicVideo['category']>('campus');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch('/api/admin/public-media/videos', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Administrator access is not enabled')))
      .then(data => { if (Array.isArray(data.videos)) setVideos(data.videos); })
      .catch(() => setNotice('Sign in as an authorized website administrator to manage videos.'));
  }, []);

  async function execute(url: string, options: RequestInit) {
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch(url, { ...options, credentials: 'same-origin', headers: mediaAdminHeaders(options.headers) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.error || 'Change was not saved');
      if (Array.isArray(result.videos)) setVideos(result.videos);
      setNotice('Media library updated.');
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Request failed');
      return false;
    } finally { setBusy(false); }
  }

  const patch = (video: PublicVideo, changes: Partial<PublicVideo>) =>
    execute('/api/admin/public-media/videos/' + encodeURIComponent(video.id), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
  const change = (id: string, changes: Partial<PublicVideo>) =>
    setVideos(items => items.map(item => item.id === id ? { ...item, ...changes } : item));

  const create = async () => {
    if (!title.trim()) { setNotice('Enter a title for the new video.'); return; }
    const saved = await execute('/api/admin/public-media/videos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), category }),
    });
    if (saved) setTitle('');
  };

  const upload = async (video: PublicVideo, file?: File) => {
    if (!file) return;
    if (file.size < 12 || file.size > 50 * 1024 * 1024 ||
        !(file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4'))) {
      setNotice('Choose an MP4 video of 50 MB or less.'); return;
    }
    await execute('/api/admin/public-media/videos/' + encodeURIComponent(video.id) + '/upload', {
      method: 'POST', headers: { 'Content-Type': 'video/mp4' }, body: file,
    });
  };

  const remove = async (video: PublicVideo) => {
    if (!window.confirm('Remove "' + video.title + '" from the media library? The underlying file is retained for review.')) return;
    await execute('/api/admin/public-media/videos/' + encodeURIComponent(video.id), { method: 'DELETE' });
  };

  const move = async (index: number, step: number) => {
    const sorted = [...videos].sort((a,b) => a.order - b.order);
    const destination = index + step;
    if (destination < 0 || destination >= sorted.length) return;
    [sorted[index], sorted[destination]] = [sorted[destination], sorted[index]];
    await execute('/api/admin/public-media/videos/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: sorted.map(item => item.id) }),
    });
  };

  const ordered = [...videos].sort((a,b) => a.order - b.order);
  return <section className="bg-white border border-purple-200 rounded-xl p-5 my-6 space-y-5">
    <h2 className="text-xl font-bold text-[#4A1249]">Website Video Library</h2>
    <p className="text-sm text-slate-600">
      Add new videos, edit existing entries, publish or unpublish, choose homepage features, reorder and remove entries.
      Publishing requires an authenticated website administrator session.
    </p>
    <div className="border border-purple-200 rounded-lg p-4 bg-[#FAF8FB] space-y-2">
      <h3 className="font-semibold">Add new video</h3>
      <input aria-label="New video title" value={title} onChange={e => setTitle(e.target.value)}
        maxLength={160} placeholder="Video title" className="border p-2 rounded w-full" />
      <select aria-label="New video category" value={category}
        onChange={e => setCategory(e.target.value as PublicVideo['category'])}
        className="border rounded p-2 w-full">
        {categories.map(item => <option key={item} value={item}>{item}</option>)}
      </select>
      <button disabled={busy} onClick={() => void create()} className="bg-[#4A1249] text-white rounded px-4 py-2 disabled:opacity-50">
        Add video as draft
      </button>
    </div>
    {notice && <p role="status" className="text-sm text-[#4A1249]">{notice}</p>}
    <div className="grid gap-5 lg:grid-cols-2">
      {ordered.map((video,index) => <article key={video.id} className="border border-purple-200 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-[#4A1249]">{video.title}</h3>
        {video.src ? <video className="w-full aspect-video bg-black rounded" controls playsInline preload="metadata"
          src={video.src} poster={video.poster || undefined} /> : <div className="bg-slate-100 p-4 text-sm">Upload an MP4 to this draft.</div>}
        <label className="block text-sm">Title
          <input value={video.title} maxLength={160} className="block border rounded p-2 w-full"
            onChange={e => change(video.id,{title:e.target.value})} />
        </label>
        <label className="block text-sm">Description
          <textarea value={video.subtitle} maxLength={240} className="block border rounded p-2 w-full"
            onChange={e => change(video.id,{subtitle:e.target.value})}/>
        </label>
        <label className="block text-sm">Poster image URL (uploaded or bundled local image)
          <input value={video.poster} className="block border rounded p-2 w-full"
            onChange={e => change(video.id,{poster:e.target.value})}/>
        </label>
        <label className="block text-sm">Category
          <select value={video.category} className="block border rounded p-2 w-full"
            onChange={e => change(video.id,{category:e.target.value as PublicVideo['category']})}>
            {categories.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="block text-sm">Publication
          <select value={video.status} className="block border rounded p-2 w-full"
            onChange={e => change(video.id,{status:e.target.value as PublicVideo['status']})}>
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={video.featured}
            onChange={e => change(video.id,{featured:e.target.checked})}/> Featured on homepage
        </label>
        <div className="flex flex-wrap gap-2">
          <button disabled={busy} className="bg-[#4A1249] text-white rounded px-3 py-2 disabled:opacity-50"
            onClick={() => void patch(video,video)}>Save changes</button>
          <button disabled={busy || index === 0} className="border rounded px-3 py-2 disabled:opacity-40"
            onClick={() => void move(index,-1)}>Move up</button>
          <button disabled={busy || index === ordered.length - 1} className="border rounded px-3 py-2 disabled:opacity-40"
            onClick={() => void move(index,1)}>Move down</button>
          <button disabled={busy} className="border border-red-300 text-red-700 rounded px-3 py-2 disabled:opacity-50"
            onClick={() => void remove(video)}>Remove</button>
        </div>
        <label className="block text-sm font-semibold">Upload or replace MP4 (up to 50 MB)
          <input type="file" accept="video/mp4,.mp4" className="block w-full mt-1" disabled={busy}
            onChange={e => {void upload(video,e.target.files?.[0]);e.currentTarget.value='';}}/>
        </label>
      </article>)}
    </div>
  </section>;
}
