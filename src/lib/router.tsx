"use client";

import React from "react";
import NextLink from "next/link";
import {
  usePathname,
  useRouter,
  useParams as useNextParams
} from "next/navigation";

type NextLinkProps = Omit<
  React.ComponentProps<typeof NextLink>,
  "href"
> & { to: string };

export function Link({ to, ...rest }: NextLinkProps) {
  return <NextLink href={to as any} {...rest} />;
}

export function useNavigate() {
  const router = useRouter();
  return (to: string | number) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.back();
      } else if (typeof window !== 'undefined') {
        window.history.go(to);
      }
      return;
    }
    router.push(to as any);
  };
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname };
}

export function useParams() {
  return useNextParams();
}

// Simple placeholders so legacy routing code still compiles under Next.js
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Route({ element }: { element: React.ReactNode }) {
  return <>{element}</>;
}
