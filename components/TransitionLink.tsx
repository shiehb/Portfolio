// components/TransitionLink.tsx
'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { triggerPageTransition } from '@/lib/transitionEvents';

interface TransitionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
}

export default function TransitionLink({
  href,
  children,
  className,
  onClick,
  title,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (e.defaultPrevented) return;

    // Ignore external or protocol links
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return;
    }

    // Ignore anchor jumps on same page
    if (href.startsWith('#')) {
      return;
    }

    // If clicking same page, prevent reload
    if (href === pathname) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    e.preventDefault();
    triggerPageTransition(
      () => {
        router.push(href);
      },
      href,
      title
    );
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
