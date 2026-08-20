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
    <footer className="bg-vw-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <h3 className="text-vw-gold font-bold text-lg mb-4">VW Repo</h3>
            <p className="text-sm">
              {spanish
                ? 'Recursos técnicos para entusiastas de Volkswagen, desde clásicos enfriados por aire hasta modelos modernos.'
                : 'The comprehensive resource for Volkswagen enthusiasts. From air-cooled classics to modern performance.'}
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">{spanish ? 'Enlaces rápidos' : 'Quick Links'}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={href('/generation/mk1')} className="hover:text-vw-gold">Mk1 Golf</Link></li>
              <li><Link href={href('/generation/mk2')} className="hover:text-vw-gold">Mk2 Golf</Link></li>
              <li><Link href={href('/generation/mk3')} className="hover:text-vw-gold">Mk3 Golf</Link></li>
              <li><Link href={href('/generation/mk4')} className="hover:text-vw-gold">Mk4 Golf</Link></li>
              <li><Link href={href('/generation/type1')} className="hover:text-vw-gold">{spanish ? 'Volkswagen Sedán / Vocho' : 'Type 1 Beetle'}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">{spanish ? 'Sistemas' : 'Systems'}</h3>
            <ul className="space-y-2 text-sm">
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
            <h3 className="text-white font-bold mb-4">{spanish ? 'Recursos' : 'Resources'}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={href('/guides')} className="hover:text-vw-gold">{labels.guides}</Link></li>
              <li><Link href={href('/library')} className="hover:text-vw-gold">{spanish ? 'Biblioteca PDF' : 'PDF Library'}</Link></li>
              <li><Link href={href('/search')} className="hover:text-vw-gold">{labels.search}</Link></li>
              <li><Link href={href('/submit-guide')} className="hover:text-vw-gold">{labels.submitGuide}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={href('/privacy-policy')} className="hover:text-vw-gold">{spanish ? 'Política de privacidad' : 'Privacy Policy'}</Link></li>
              <li><Link href={href('/terms-of-use')} className="hover:text-vw-gold">{spanish ? 'Términos de uso' : 'Terms of Use'}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>{spanish ? 'VW Repo - Hecho para entusiastas, por entusiastas.' : 'VW Repo - Built for enthusiasts, by enthusiasts.'}</p>
        </div>

        <section
          aria-labelledby="footer-legal-notice"
          className="mt-6 border-t border-gray-700 pt-6 text-xs leading-relaxed text-gray-400"
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
