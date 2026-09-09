import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal';
import { site } from '@/config';

export const metadata: Metadata = {
  title: `Terms · ${site.name}`,
  description: 'Terms for using the Pilly iPhone app and Pilly Plus.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: `Terms · ${site.name}`,
    description: 'Terms for using the Pilly iPhone app and Pilly Plus.',
    url: '/terms',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="A calm tracker, not medical advice."
      intro="These terms cover the Pilly iPhone app, Pilly Plus, and this website. By using Pilly, you agree to them."
    >
      <section>
        <h2>What Pilly does</h2>
        <p>
          Pilly records medicine information and actions you enter. It can organize schedules,
          create local reminders, track taken or skipped doses, estimate supply, and create exports.
          Pilly Plus adds optional account-based backup, recovery, synchronization, and private
          photos.
        </p>
        <p>
          Pilly does not diagnose, prescribe, identify pills, check interactions, recommend doses,
          or tell you what to do after a missed dose. Supply dates are estimates. Always verify
          medicine instructions with the label and a qualified clinician or pharmacist. Contact
          local emergency services for an emergency.
        </p>
      </section>

      <section>
        <h2>Your information and account</h2>
        <p>
          You are responsible for the accuracy of information you enter and for protecting your
          device and optional sign-in account. Do not use Pilly to store information you do not have
          the right to use. The free tracker remains available without an account; Pilly Plus
          features require an eligible account and active entitlement.
        </p>
      </section>

      <section>
        <h2>Pilly Plus subscriptions</h2>
        <p>
          Available plans, prices, billing periods, renewal terms, and any trial eligibility are
          shown by Apple in the app before purchase. Payment is charged through your Apple account.
          Subscriptions renew according to the terms presented at purchase unless you cancel them in
          <a href={site.appleSubscriptionsUrl}> Apple subscription settings</a>. You can restore an
          eligible purchase in Pilly.
        </p>
        <p>
          Deleting your Pilly Plus account removes the associated Pilly cloud data, but does not
          cancel the Apple subscription. Pilly may change future plan availability or pricing as
          permitted by Apple, without changing a completed billing period.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Do not misuse Pilly, interfere with its service, attempt unauthorized access, bypass paid
          feature controls, upload unlawful content, or use the app in a way that harms another
          person or the service. Access may be limited or ended when necessary to protect Pilly,
          other users, or comply with law.
        </p>
      </section>

      <section>
        <h2>Availability and responsibility</h2>
        <p>
          Pilly is provided on an as-available basis. Device settings, operating-system behavior,
          connectivity, and third-party services can affect notifications, purchases, and backup.
          You remain responsible for following your prescribed plan and maintaining another reliable
          source of your medicine instructions.
        </p>
        <p>
          To the extent permitted by law, Pilly is not liable for indirect, incidental, special, or
          consequential loss arising from use of the app. Nothing in these terms excludes rights or
          remedies that cannot lawfully be excluded.
        </p>
      </section>

      <section>
        <h2>App license and changes</h2>
        <p>
          Your license to use the iOS app is governed by{' '}
          <a href={site.appleStandardEulaUrl}>Apple&apos;s Standard EULA</a> unless another license
          is presented with the app. Pilly&apos;s name, interface, artwork, and software remain
          protected by applicable intellectual-property law.
        </p>
        <p>
          These terms may be updated as Pilly changes. The effective date above identifies the
          current version. Continued use after an update means you accept the revised terms where
          permitted by law.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
