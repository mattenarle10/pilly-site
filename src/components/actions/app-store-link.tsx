import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';

import { site } from '@/config';

type Props = Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'href'> & {
  direction?: 'right' | 'up-right';
};

export function AppStoreLink({ direction = 'right', ...props }: Props) {
  const Icon = direction === 'up-right' ? ArrowUpRight : ArrowRight;

  return (
    <a {...props} href={site.appStoreUrl}>
      Download on the App Store
      <Icon aria-hidden="true" size={18} strokeWidth={2} />
    </a>
  );
}
