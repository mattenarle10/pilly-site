import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';

import { site } from '@/config';

type Props = Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'href'> & {
  direction?: 'right' | 'up-right';
};

export function EarlyAccessLink({ direction = 'right', ...props }: Props) {
  const href = `mailto:${site.supportEmail}?subject=Pilly%20early%20access`;
  const Icon = direction === 'up-right' ? ArrowUpRight : ArrowRight;

  return (
    <a {...props} href={href}>
      Join early access
      <Icon aria-hidden="true" size={18} strokeWidth={2} />
    </a>
  );
}
