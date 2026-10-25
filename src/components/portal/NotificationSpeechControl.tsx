import React, { useEffect, useState } from 'react';

/** Accessible optional browser text-to-speech for non-sensitive notification content. */
export function NotificationSpeechControl({ message }: { message: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => { setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window); return () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel(); }; }, []);
  if (!supported) return <span role="status">Speech playback unavailable in this browser.</span>;
  return <button type="button" aria-label={speaking ? 'Stop reading notification' : 'Read notification aloud'} onClick={() => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true); window.speechSynthesis.speak(utterance);
  }}>{speaking ? 'Stop reading' : 'Read aloud'}</button>;
}
