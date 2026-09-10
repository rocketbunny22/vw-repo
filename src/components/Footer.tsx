'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { localizedPath, navigationLabels, systemNamesEs } from '@/lib/localization';

const systems = [
  { id: 'engine', name: 'Engine' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'brakes', name: 'Brakes' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'body', name: 'Body' },
];

export default function Footer() {
  const { locale } = useLanguage();
  const labels = navigationLabels[locale];
  const href = (path: string) => localizedPath(path, locale);
  const spanish = locale === 'es-MX';

  return (
    <footer className="border-t-4 border-vw-gold bg-vw-dark text-[#d9d2c8]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 lg:pr-10">
            <div className="mb-5 flex items-center gap-3">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full border border-vw-gold/50 bg-vw-gold/10 text-sm font-bold text-vw-gold-light">VW</span>
              <h3 className="text-2xl font-bold text-white [font-family:var(--font-display)]">VW Repo</h3>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#cfc7bc]">
              {spanish
                ? 'Recursos técnicos para entusiastas de Volkswagen, desde clásicos enfriados por aire hasta modelos modernos.'
                : 'A practical archive of manuals, repair knowledge, and technical context for Volkswagen owners.'}
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-vw-gold-light">
              {spanish ? 'Hecho para entusiastas' : 'Built for enthusiasts'}
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-vw-gold-light">{spanish ? 'Enlaces rápidos' : 'Quick Links'}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href={href('/generation/mk1')} className="hover:text-vw-gold">Mk1 Golf</Link></li>
              <li><Link href={href('/generation/mk2')} className="hover:text-vw-gold">Mk2 Golf</Link></li>
              <li><Link href={href('/generation/mk3')} className="hover:text-vw-gold">Mk3 Golf</Link></li>
              <li><Link href={href('/generation/mk4')} className="hover:text-vw-gold">Mk4 Golf</Link></li>
              <li><Link href={href('/generation/type1')} className="hover:text-vw-gold">{spanish ? 'Volkswagen Sedán / Vocho' : 'Type 1 Beetle'}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-vw-gold-light">{spanish ? 'Sistemas' : 'Systems'}</h3>
            <ul className="space-y-2.5 text-sm">
              {systems.map((sys) => (
                <li key={sys.id}>
                  <Link href={href(`/systems/${sys.id}`)} className="hover:text-vw-gold">
                    {spanish ? systemNamesEs[sys.id] : sys.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-vw-gold-light">{spanish ? 'Recursos' : 'Resources'}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href={href('/guides')} className="hover:text-vw-gold">{labels.guides}</Link></li>
              <li><Link href={href('/library')} className="hover:text-vw-gold">{spanish ? 'Biblioteca PDF' : 'PDF Library'}</Link></li>
              <li><Link href={href('/search')} className="hover:text-vw-gold">{labels.search}</Link></li>
              <li><Link href={href('/submit-guide')} className="hover:text-vw-gold">{labels.submitGuide}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-vw-gold-light">Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href={href('/privacy-policy')} className="hover:text-vw-gold">{spanish ? 'Política de privacidad' : 'Privacy Policy'}</Link></li>
              <li><Link href={href('/terms-of-use')} className="hover:text-vw-gold">{spanish ? 'Términos de uso' : 'Terms of Use'}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-7 text-sm text-[#aaa299] sm:flex-row sm:items-center sm:justify-between">
          <p>© VW Repo</p>
          <p>{spanish ? 'Conservando el conocimiento Volkswagen.' : 'Keeping Volkswagen knowledge in motion.'}</p>
        </div>

        <section
          aria-labelledby="footer-legal-notice"
          className="mt-6 border-t border-white/10 pt-6 text-xs leading-relaxed text-[#938b82]"
        >
          <h2 id="footer-legal-notice" className="sr-only">Legal notice</h2>
          <p>
            The information contained in this site is for entertainment and informational purposes only. The site creator is not responsible for you, your car, your errors, or your economic losses resulting from your use of this information. Additionally, this site and its content are not affiliated with Volkswagen of America nor Volkswagen AG. &quot;VW&quot; and &quot;Volkswagen&quot; are registered trademarks of Volkswagen AG and are used on this site for descriptive purposes only.
          </p>
          <p className="mt-3">
            No text on this site may be copied to or used on other web sites without written permission of the site administrator; the only exception to this is if proper credit is given to this site when quoting copied text.
          </p>
        </section>
      </div>
    </footer>
  );
}
