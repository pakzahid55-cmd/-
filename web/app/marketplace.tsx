'use client';
import { useEffect, useState } from 'react';
import Storefront from '../src/Storefront';
export default function Marketplace() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="container-kujuk py-16 font-bold text-deep" role="status">KUJUK – كجوك…</div>;
  return <Storefront />;
}
