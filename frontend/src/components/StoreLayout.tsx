'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import FloatingAction from './FloatingAction';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') || false;

  return (
    <>
      {!isAdmin && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdmin && <FloatingAction />}
    </>
  );
}
