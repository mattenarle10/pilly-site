import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal';
import { site } from '@/config';

export const metadata: Metadata = {
  title: `Privacy · ${site.name}`,
  description: 'How Pilly handles local medicine data, optional Plus backup, and account data.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: `Privacy · ${site.name}`,
    description: 'How Pilly handles local medicine data, optional Plus backup, and account data.',
    url: '/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Your medicine data starts on your iPhone."
      intro="Pilly works without an account. Cloud backup is optional, and begins only when you connect Pilly Plus and choose to turn it on."
    >
      <section>
        <h2>What Pilly handles</h2>
        <h3>On your device</h3>
        <p>
          Medicine names, instructions, schedules, reminders, dose history, supply estimates,
          appearance choices, and local profile settings are stored on your iPhone. Pilly uses this
          information to show your routine, schedule private local notifications, and create exports
          you request.
        </p>

        <h3>If you use Pilly Plus</h3>
        <p>
          When you connect an Apple or Google account, Pilly receives an account identifier and
          basic account details such as your email address and display name. If you explicitly
          enable private backup, your medicines, schedules, dose and supply records, sync metadata,
          and any photos you choose are copied to Pilly&apos;s cloud service for backup and
          recovery.
        </p>

        <h3>Purchases</h3>
        <p>
          Apple processes App Store payments. RevenueCat processes subscription and entitlement
          status for Pilly. RevenueCat receives Pilly&apos;s account identifier and purchase state,
          but not your medicine records, instructions, or photos.
        </p>

        <h3>Service and support</h3>
        <p>
          Pilly&apos;s cloud service records limited security and reliability information, such as a
          request identifier, route, response status, time, latency, and source IP address. If you
          email support, Pilly also receives the address and information you include in that
          message. This website does not currently use advertising or behavioral analytics cookies;
          its hosting provider may process ordinary request information to deliver and secure the
          site.
        </p>
      </section>

      <section>
        <h2>How the data is used</h2>
        <ul>
          <li>Run the tracker, reminders, history, exports, backup, and recovery you request.</li>
          <li>Authenticate your optional account and enforce Pilly Plus access.</li>
          <li>Protect the service, investigate failures, and respond to support requests.</li>
          <li>Meet legal, security, and accounting obligations.</li>
        </ul>
        <p>
          Pilly does not sell medicine data and does not use it for advertising. The current app
          does not include third-party behavioral analytics.
        </p>
      </section>

      <section>
        <h2>Who processes data</h2>
        <p>Pilly uses a limited set of providers to deliver the features you choose:</p>
        <ul>
          <li>
            <strong>Apple and Google</strong> for optional account sign-in.
          </li>
          <li>
            <strong>Amazon Web Services</strong> for account, encrypted database, private image, and
            API infrastructure. Pilly&apos;s primary cloud region is Singapore.
          </li>
          <li>
            <strong>Apple and RevenueCat</strong> for purchases, subscription status, and restoring
            access.
          </li>
          <li>
            <strong>Email and website hosting providers</strong> when you contact support or visit
            this site.
          </li>
        </ul>
        <p>
          These providers may process data in other countries under their own terms and privacy
          practices. Pilly shares only the information needed for the relevant service or when
          required by law.
        </p>
      </section>

      <section>
        <h2>Photos and security</h2>
        <p>
          Photos are optional Pilly Plus data. Before upload, Pilly resizes the image, removes
          embedded metadata such as location details, and stores it in private cloud storage.
          Download and upload links expire quickly. Cloud databases and image storage are encrypted
          at rest, and network connections use encryption in transit.
        </p>
        <p>
          No system is perfectly secure. Keep your device and sign-in account protected, and contact
          support if you believe your account has been misused.
        </p>
      </section>

      <section>
        <h2>Retention and deletion</h2>
        <p>
          Local data remains on your device until you remove it or delete the app. Active Pilly Plus
          backup data remains while your account exists. Replaced photos and photos belonging to a
          deleted medicine are removed from active storage.
        </p>
        <p>
          You can delete your Pilly Plus account inside the app. This removes the active cloud
          account, backed-up records, and private images, then clears cloud account data from the
          device. Limited records may remain temporarily in security logs or encrypted service
          backups until their normal expiry. Production API logs are retained for up to 30 days.
          Apple and RevenueCat may retain transaction records under their own legal obligations.
        </p>
        <p>
          <strong>Deleting your Pilly account does not cancel an Apple subscription.</strong> Manage
          or cancel it separately in{' '}
          <a href={site.appleSubscriptionsUrl}>Apple subscription settings</a>.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>Use the free tracker without creating an account.</li>
          <li>Keep backup off, or sign out to stop synchronization.</li>
          <li>Choose whether to allow notifications, photos, or camera access in iOS Settings.</li>
          <li>Export a copy of your local data from Pilly.</li>
          <li>Delete individual medicines or your complete Pilly Plus account in the app.</li>
        </ul>
      </section>

      <section>
        <h2>Contact and updates</h2>
        <p>
          Questions or privacy requests can be sent to{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. If this policy changes,
          the effective date above will be updated. Material changes will be explained in the app or
          on this site when appropriate.
        </p>
      </section>
    </LegalPage>
  );
}
