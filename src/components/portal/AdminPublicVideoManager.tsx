import React, { useEffect, useState } from 'react';
import { DEFAULT_PUBLIC_VIDEOS, type PublicVideo } from '../../data/publicMedia';

/**
 * This editor is visible only to an authenticated administrator in the ERP UI.
 * Its API routes are independently blocked by the server security hold until
 * server-side identity verification and RBAC are implemented.
 */
export function AdminPublicVideoManager() {
  const [videos, setVideos] = useState<PublicVideo[]>(DEFAULT_PUBLIC_VIDEOS);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('/api/public-media/videos')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Unable to load media')))
      .then(d => { if (Array.isArray(d.videos) && d.videos.length === 2) setVideos(d.videos); })
      .catch(() => setMessage('Default video entries shown. Changes are not yet saved.'));
  }, []);
  const update = (id: PublicVideo['id'], key: 'title' | 'subtitle' | 'poster', value: string) =>
    setVideos(previous => previous.map(video => video.id === id ? { ...video, [key]: value } : video));

  async function request(url: string, options: RequestInit) {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result.error || 'Unable to save changes');
    if (Array.isArray(result.videos)) setVideos(result.videos);
    setMessage('Changes saved to website media configuration.');
  }
  async function saveDetails(video: PublicVideo) {
    setBusy(video.id);
    setMessage('');
    try {
      await request(`/api/admin/public-media/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: video.title, subtitle: video.subtitle, poster: video.poster }),
      });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Save failed'); }
    finally { setBusy(null); }
  }
  async function uploadVideo(video: PublicVideo, file: File | undefined) {
    if (!file) return;
    if (file.type !== 'video/mp4' || file.size > 50 * 1024 * 1024 || file.size === 0) {
      setMessage('Please select a nonempty MP4 file no larger than 50 MB.');
      return;
    }
    setBusy(video.id);
    setMessage('');
    try {
      await request(`/api/admin/public-media/videos/${video.id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'video/mp4' },
        body: file,
      });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed'); }
    finally { setBusy(null); }
  }

  return (
    <section className="bg-white rounded-xl p-5 border border-purple-200 my-6" aria-label="Public website video management">
      <h2 className="font-bold text-xl text-[#4A1249]">Public Website Video Management</h2>
      <p className="text-sm text-slate-600 mt-2">
        Manage the campus and classroom videos shown on the public homepage.
        Publishing requires verified administrator authorization and persistent storage.
      </p>
      {message && <p role="status" className="mt-3 text-sm text-[#4A1249]">{message}</p>}
      <div className="grid gap-5 mt-5 lg:grid-cols-2">
        {videos.map(video => (
          <div key={video.id} className="border border-purple-100 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-[#4A1249]">{video.label}</h3>
            <video className="w-full aspect-video bg-black rounded" controls playsInline preload="metadata" src={video.src} poster={video.poster} />
            <label className="block text-sm">Video title
              <input className="block w-full border rounded p-2" maxLength={160} value={video.title}
                onChange={e => update(video.id, 'title', e.target.value)} />
            </label>
            <label className="block text-sm">Subtitle
              <textarea className="block w-full border rounded p-2" maxLength={240} value={video.subtitle}
                onChange={e => update(video.id, 'subtitle', e.target.value)} />
            </label>
            <label className="block text-sm">Poster image path (existing /assets/ or /uploads/ file)
              <input className="block w-full border rounded p-2" value={video.poster}
                onChange={e => update(video.id, 'poster', e.target.value)} />
            </label>
            <button type="button" disabled={busy !== null} onClick={() => saveDetails(video)}
              className="bg-[#4A1249] text-white px-4 py-2 rounded disabled:opacity-50">Save details</button>
            <label className="block text-sm font-semibold mt-3">Replace video (MP4, maximum 50 MB)
              <input className="block w-full mt-1" type="file" accept="video/mp4,.mp4" disabled={busy !== null}
                onChange={e => {
                  void uploadVideo(video, e.target.files?.[0]);
                  e.currentTarget.value = '';
                }} />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
