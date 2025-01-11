import type { Metadata } from 'next';
// metadata ▽
const PAGE_NAME:string = 'dashboard';
const PAGE_PATH:string = '/dashboard';

export const metadataConfig: Metadata = {
  title: PAGE_NAME,
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}${PAGE_PATH}`,
  },
  openGraph: {
    title: `${PAGE_NAME} | ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
  },
  twitter: {
    title: `${PAGE_NAME} | ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
  },
};
// metadata △