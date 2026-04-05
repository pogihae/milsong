import type { Metadata } from 'next';
import { Noto_Sans_KR, Geist_Mono } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['400', '500', '700', '800', '900'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '밀송 - 내 입대곡 찾기',
  description: '입대일로 그 시절 나의 군생활 테마곡을 찾아보세요.',
  openGraph: {
    title: '밀송 - 내 입대곡 찾기',
    description: '입대일로 그 시절 나의 군생활 테마곡을 찾아보세요.',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
