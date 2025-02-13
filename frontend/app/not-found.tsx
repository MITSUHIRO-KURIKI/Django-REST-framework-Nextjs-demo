'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center select-none'>
      <p className='mb-3 text-center text-7xl font-bold text-primary/80'>404</p>
      <p className='text-center text-xl font-semibold text-primary/80'>Page Not Found</p>
      <p className='mt-4 text-center text-base text-primary/50'>お探しのページが見つかりませんでした。</p>
      <Link href='/'
            className='mt-6 rounded-md bg-primary/60 px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90'>
        トップページへ戻る
      </Link>
    </div>
  );
};