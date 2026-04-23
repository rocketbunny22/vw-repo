import Link from 'next/link';
import { generations } from '@/data/generations';

const systems = [
  { id: 'engine', name: 'Engine' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'brakes', name: 'Brakes' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'transmission', name: 'Transmission' },
  { id: 'body', name: 'Body' },
];

export default function Footer() {
  return (
    <footer className="bg-vw-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-vw-gold font-bold text-lg mb-4">VW Registry</h3>
            <p className="text-sm">
              The comprehensive resource for Volkswagen enthusiasts. 
              From air-cooled classics to modern performance.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/generation/mk1" className="hover:text-vw-gold">Mk1 Golf</Link></li>
              <li><Link href="/generation/mk2" className="hover:text-vw-gold">Mk2 Golf</Link></li>
              <li><Link href="/generation/mk3" className="hover:text-vw-gold">Mk3 Golf</Link></li>
              <li><Link href="/generation/mk4" className="hover:text-vw-gold">Mk4 Golf</Link></li>
              <li><Link href="/generation/type1" className="hover:text-vw-gold">Type 1 Beetle</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Systems</h3>
            <ul className="space-y-2 text-sm">
              {systems.map((sys) => (
                <li key={sys.id}>
                  <Link href={`/systems/${sys.id}`} className="hover:text-vw-gold">
                    {sys.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/guides" className="hover:text-vw-gold">DIY Guides</Link></li>
              <li><Link href="/library" className="hover:text-vw-gold">PDF Library</Link></li>
              <li><Link href="/search" className="hover:text-vw-gold">Search</Link></li>
              <li><Link href="/submit-guide" className="hover:text-vw-gold">Submit Guide</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>VW Registry - Built for enthusiasts, by enthusiasts.</p>
        </div>
      </div>
    </footer>
  );
}