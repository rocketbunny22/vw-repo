import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Terms of Use',
  description: 'Terms of use for VW Repo, including site access, submitted content, user conduct, and limitations.',
  path: '/terms-of-use',
});

export default function TermsOfUse() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-vw-dark mb-8">Terms of Use</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing and using VW Repo, you accept and agree to be bound by the terms and provisions of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">2. Use License</h2>
          <p className="text-gray-700 mb-4">
            Permission is granted to temporarily use VW Repo for personal, non-commercial use only. This is the grant of a license, not a transfer of title.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">3. User Conduct</h2>
          <p className="text-gray-700 mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Use the site for any unlawful purpose</li>
            <li>Submit false or misleading information</li>
            <li>Upload or transmit viruses or harmful code</li>
            <li>Attempt to gain unauthorized access to the site</li>
            <li>Interfere with the proper working of the site</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">4. User Content</h2>
          <p className="text-gray-700 mb-4">
            By submitting content to VW Repo, you grant us a worldwide, royalty-free license to use, display, and distribute your content. You represent that you own or have the rights to any content you submit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">5. Disclaimer</h2>
          <p className="text-gray-700 mb-4">
            VW Repo is provided &quot;as is&quot; without any representations or warranties, express or implied. The content on this site is for informational purposes only.
          </p>
          <p className="text-gray-700">
            We make no warranties about the completeness, reliability, or accuracy of this site. Any action you take based upon the information from this site is strictly at your own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">6. Limitation of Liability</h2>
          <p className="text-gray-700">
            VW Repo will not be liable to you in relation to the contents of, or use of, or otherwise in connection with, this website for any indirect, special, or consequential loss.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">7. Governing Law</h2>
          <p className="text-gray-700">
            These terms and conditions are governed by and construed in accordance with the laws of applicable jurisdictions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">8. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about these Terms of Use, please contact us through our feedback form.
          </p>
        </section>
      </div>
    </div>
  );
}
