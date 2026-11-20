import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/noto-sans-arabic';
import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: { default: 'KUJUK – كجوك | Your Order. Your Way.', template: '%s | KUJUK' },
  description: 'Shop across independent sellers on KUJUK – كجوك, with cash on delivery.',
  robots: process.env.NEXT_PUBLIC_KUJUK_HOSTED_PREVIEW === "1" ? { index: false, follow: false } : undefined,
  icons: '/favicon.svg',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" dir="ltr" suppressHydrationWarning><body>{children}</body></html>;
}
