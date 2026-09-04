import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal';
import { site } from '@/config';

export const metadata: Metadata = {
  title: `Support · ${site.name}`,
  description: 'Get help with Pilly, Pilly Plus, subscriptions, backup, or account deletion.',
  alternates: { canonical: '/support' },
};

export default function SupportPage() {
  return (
    <LegalPage
      eyebrow="Support"
      title="How can we help?"
      intro="Send a note about Pilly, an account, a purchase, or something that did not work as expected."
    >
      <section>
        <h2>Contact</h2>
        <p>
          Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. Include your iPhone
          model, iOS version, Pilly version, and the steps that led to the problem when relevant.
          Please do not email medicine names, photos, prescriptions, or other sensitive health
          information.
        </p>
      </section>

      <section>
        <h2>Subscriptions and purchases</h2>
        <p>
          Use Restore Purchases inside Pilly if an eligible subscription is not recognized. To view,
          change, or cancel a subscription, open{' '}
          <a href={site.appleSubscriptionsUrl}>Apple subscription settings</a>. Pilly cannot issue
          or manage App Store refunds directly.
        </p>
      </section>

      <section>
        <h2>Backup and account deletion</h2>
        <p>
          Pilly works without an account. If you use Pilly Plus, backup begins only after you choose
          to enable it. Account controls are available from Profile, then Account. Deleting the
          Pilly Plus account removes active cloud records and private images, but does not cancel an
          Apple subscription.
        </p>
      </section>

      <section>
        <h2>Medicine or safety questions</h2>
        <p>
          Pilly support can help with the app, but cannot provide medical advice. For questions
          about a medicine, dose, interaction, side effect, or missed dose, contact a qualified
          clinician or pharmacist. For an emergency, contact local emergency services.
        </p>
      </section>
    </LegalPage>
  );
}
