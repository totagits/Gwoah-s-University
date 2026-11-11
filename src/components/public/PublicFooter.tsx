import React, {useState} from 'react';
import { ArrowRight, GraduationCap, Mail, MapPin, Phone, ShieldCheck, Globe } from 'lucide-react';

interface PublicFooterProps {
  onOpenPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenProfile?: (profileId: string) => void;
}

const offices = [
  { title: 'Main academic campus', address: 'Old Road, Chugbor, Monrovia, Montserrado County, Liberia' },
  { title: 'Administrative office', address: 'Tubman Boulevard, 6th Street, Sinkor, Monrovia, Liberia' },
  { title: 'United States liaison office', address: 'Olney, Maryland, USA' },
];

const phones = [
  { label: '(+231) 888-655-544', href: 'tel:+231888655544' },
  { label: '(+231) 770-458-547', href: 'tel:+231770458547' },
  { label: '(+231) 886-259-509', href: 'tel:+231886259509' },
  { label: '(+231) 770-413-069', href: 'tel:+231770413069' },
];

const academicLinks = [
  { label: 'Colleges and degree programs', target: 'colleges' },
  { label: 'Vocational and certificate programs', target: 'colleges' },
  { label: 'Admissions', target: 'admissions' },
  { label: 'Campus and classroom tour', target: 'tour' },
  { label: 'Student life and fellowship', target: 'dei' },
];

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onNavigateSection,
  onOpenProfile,
}) => {
  const [sealUnavailable,setSealUnavailable]=useState(false);
  return (
  <footer className="hiau-public-footer border-t-[3px] border-[#C39A53] bg-[#4A1249] text-white"
    aria-label="Harvest Intercontinental American University footer">
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-14">
      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-[1.25fr_1.15fr_1fr_1fr]">
        <section aria-label="About HIAU" className="min-w-0">
          <div className="flex items-center gap-3">
            {sealUnavailable ? (
              <span role="img" aria-label="HIAU university identity"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#F0CE8D] bg-white text-lg font-black text-[#4A1249]">
                H
              </span>
            ) : (
              <img src="/assets/aistudio/image_bfcc4a11.png"
                alt="HIAU university seal" loading="lazy" decoding="async"
                onError={() => setSealUnavailable(true)}
                className="h-14 w-14 shrink-0 rounded-full bg-white p-1 object-contain" />
            )}
            <div className="min-w-0">
              <p className="text-base font-bold leading-snug tracking-tight text-white">
                Harvest Intercontinental
              </p>
              <p className="text-sm font-semibold text-[#F0CE8D]">American University</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#EEE6EE]">
            A Christ-centered university in Liberia dedicated to academic excellence,
            leadership, entrepreneurship and service.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <p className="flex items-start gap-2 text-[#EEE6EE]">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#F0CE8D]" />
              <span>Institutional charter and licensure information</span>
            </p>
            <p className="flex items-start gap-2 text-[#EEE6EE]">
              <GraduationCap aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#F0CE8D]" />
              <span>Academic and institutional partnerships</span>
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
            <button type="button" onClick={() => onOpenProfile?.('chancellor')}
              className="inline-flex items-center gap-1.5 rounded-sm font-semibold text-[#F0CE8D] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0CE8D]">
              Chancellor <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onOpenProfile?.('president')}
              className="inline-flex items-center gap-1.5 font-semibold text-[#F0CE8D] underline-offset-4 hover:underline">
              President <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section aria-labelledby="hiau-footer-locations" className="min-w-0">
          <h2 id="hiau-footer-locations" className="text-sm font-bold uppercase tracking-[0.08em] text-white">
            Campus and offices
          </h2>
          <div className="mt-5 space-y-5">
            {offices.map(office => (
              <div key={office.title}>
                <p className="text-sm font-semibold text-[#F0CE8D]">{office.title}</p>
                <p className="mt-1.5 flex items-start gap-2 text-sm leading-6 text-[#EEE6EE]">
                  {office.title.includes('United States')
                    ? <Globe aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#F0CE8D]" />
                    : <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#F0CE8D]" />}
                  <span>{office.address}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="hiau-footer-contact" className="min-w-0">
          <h2 id="hiau-footer-contact" className="text-sm font-bold uppercase tracking-[0.08em] text-white">
            Contact
          </h2>
          <p className="mt-5 text-sm font-semibold text-[#F0CE8D]">Telephone</p>
          <ul className="mt-2 space-y-2">
            {phones.map(phone => (
              <li key={phone.href}>
                <a href={phone.href}
                  className="inline-flex items-center gap-2 rounded-sm text-sm leading-6 text-[#EEE6EE] underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0CE8D]">
                  <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-[#F0CE8D]" />
                  {phone.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-semibold text-[#F0CE8D]">Email inquiries</p>
          <ul className="mt-2 space-y-2">
            {['info@hiau.org.lr', 'info@hiauniversity.org'].map(email => (
              <li key={email}>
                <a href={`mailto:${email}`} className="inline-flex min-w-0 items-start gap-2 break-all rounded-sm text-sm leading-6 text-[#EEE6EE] underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0CE8D]">
                  <Mail aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#F0CE8D]" />
                  {email}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <nav aria-labelledby="hiau-footer-academics" className="min-w-0">
          <h2 id="hiau-footer-academics" className="text-sm font-bold uppercase tracking-[0.08em] text-white">
            Explore HIAU
          </h2>
          <ul className="mt-5 space-y-3">
            {academicLinks.map(item => (
              <li key={item.label}>
                <button type="button" onClick={() => onNavigateSection(item.target)}
                  className="rounded-sm text-left text-sm leading-6 text-[#EEE6EE] underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0CE8D]">
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-white/25 pt-6 text-sm text-[#EEE6EE] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Harvest Intercontinental American University. All rights reserved.</p>
        <button type="button" onClick={() => onNavigateSection('about')}
          className="self-start rounded-sm font-semibold text-[#F0CE8D] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0CE8D]">
          About HIAU
        </button>
      </div>
    </div>
  </footer>
  );
};
