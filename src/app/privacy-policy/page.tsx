import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Privacy Policy',
  description: 'Privacy policy for VW Repo, including account, submitted content, usage, and security information.',
  path: '/privacy-policy',
});

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-vw-dark mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Account information (username, email) when you register</li>
            <li>Vehicle and garage details you choose to save</li>
            <li>Content you submit (guides, feedback, comments)</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Improve and personalize your experience</li>
            <li>Send you important updates and communications</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">3. Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell or share your personal information with third parties except:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>With service providers who assist our operations</li>
            <li>When required by law or to protect rights</li>
            <li>With your explicit consent</li>
          </ul>
          <p className="mt-4 text-gray-700">
            Garage details are private by default. They appear on your public profile only when you explicitly
            enable vehicle visibility in your profile settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">4. Data Security</h2>
          <p className="text-gray-700">
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">5. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Access and update your account information</li>
            <li>Request deletion of your personal data</li>
            <li>Opt out of certain data collection</li>
          </ul>
          <p className="mt-4 text-gray-700">
            When you delete your account, private account and profile data and pending submissions are removed.
            Approved community resources and comments may remain to avoid breaking public documentation, but their
            account attribution is replaced with “Deleted user.” Feedback retained for operational history is
            stripped of its name and email address.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-vw-dark mb-4">6. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us through our feedback form.
          </p>
        </section>
      </div>
    </div>
  );
}
