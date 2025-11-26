import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { extractRouterConfig } from 'uploadthing/server';
import { uploadRouter } from './api/uploadthing/core';

export const metadata: Metadata = {
  title: 'Barcelo Biagi Storefront',
  description: 'Modern e-commerce experience for Barcelo Biagi with admin controls.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
