import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PUBLIC_VIDEOS,
  featuredPublicVideos,
  publishedPublicVideos,
  type PublicVideo,
} from '../src/data/publicMedia';

const newVideo: PublicVideo = {
  id: 'graduation-2026',
  title: 'University Graduation',
  subtitle: 'Graduation ceremony',
  category: 'events',
  status: 'draft',
  featured: true,
  order: 2,
  src: '/assets/graduation.mp4',
  poster: '',
  badge: 'Graduation',
  label: 'Graduation',
};

test('default campus and classroom videos are retained', () => {
  assert.equal(DEFAULT_PUBLIC_VIDEOS.length, 2);
  assert.deepEqual(DEFAULT_PUBLIC_VIDEOS.map(v => v.id), ['campus','classroom']);
});
test('newly created draft videos never appear publicly', () => {
  const videos = [...DEFAULT_PUBLIC_VIDEOS, newVideo];
  assert.equal(publishedPublicVideos(videos).length,2);
  assert.equal(featuredPublicVideos(videos).length,2);
});
test('published additional videos are selectable and sorted by saved order', () => {
  const videos = [...DEFAULT_PUBLIC_VIDEOS, {...newVideo, status: 'published' as const, order: 0}];
  const results = featuredPublicVideos(videos);
  assert.equal(results.length,3);
  assert.equal(results[0].id, 'graduation-2026');
});
test('unfeatured published videos remain in library, not homepage', () => {
  const videos = [...DEFAULT_PUBLIC_VIDEOS,
    {...newVideo, status: 'published' as const, featured: false}];
  assert.equal(publishedPublicVideos(videos).length,3);
  assert.equal(featuredPublicVideos(videos).length,2);
});
test('public media list supports no published entries', () => {
  const results = featuredPublicVideos(DEFAULT_PUBLIC_VIDEOS.map(v => ({...v, status:'draft'})));
  assert.equal(results.length,0);
});
