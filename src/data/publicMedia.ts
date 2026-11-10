export interface PublicVideo {
  id: string;
  category: 'campus' | 'academics' | 'events' | 'student-life' | 'other';
  status: 'draft' | 'published';
  featured: boolean;
  order: number;
  title: string;
  subtitle: string;
  src: string;
  poster: string;
  badge: string;
  label: string;
}

export const DEFAULT_PUBLIC_VIDEOS: PublicVideo[] = [
  {
    id: 'campus',
    category: 'campus', status: 'published', featured: true, order: 0,
    title: 'HIAU Main Academic Campus',
    subtitle: 'Exterior complex, 2nd-floor lecture halls & palm quadrangle',
    src: '/assets/aistudio/image_20261105_121706_f720baa0.mp4',
    poster: '/assets/aistudio/image_29eb5504.png',
    badge: 'Video 1 • Campus First',
    label: '01 Campus Tour',
  },
  {
    id: 'classroom',
    category: 'academics', status: 'published', featured: true, order: 1,
    title: 'Interactive Laptop Lab & Smart Classroom',
    subtitle: 'Individual wooden carrels, dedicated laptops & interactive projection',
    src: '/assets/aistudio/image_20261105_102657_b174d32f.mp4',
    poster: '/assets/aistudio/image_51d124f3.png',
    badge: 'Video 2 • Classroom Second',
    label: '02 Smart Lab',
  },
];

export function featuredPublicVideos(videos: PublicVideo[]): PublicVideo[] {
  return videos.filter(video => video.status === 'published' && video.featured && video.src)
    .sort((a, b) => a.order - b.order);
}
export function publishedPublicVideos(videos: PublicVideo[]): PublicVideo[] {
  return videos.filter(video => video.status === 'published' && video.src)
    .sort((a, b) => a.order - b.order);
}
