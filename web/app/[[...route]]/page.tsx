import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Storefront from '../marketplace';
import type { Product } from '../../src/lib/types';

type Params = { params: Promise<{ route?: string[] }> };
const loadProduct = cache(async (slug: string): Promise<Product | undefined | null> => {
  try {
    const origin = process.env.KUJUK_API_ORIGIN || 'http://127.0.0.1:4000';
    const res = await fetch(`${origin}/api/products/${encodeURIComponent(slug)}`, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (res.status === 404) return null;
    if (res.ok) return (await res.json()).product;
  } catch { /* storefront surfaces API errors and allows retry */ }
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const route = (await params).route ?? [];
  if (route[0] === 'product' && route.length === 2) {
    const product = await loadProduct(route[1]);
    if (product) return { title: product.nameEn, description: product.descriptionEn.slice(0, 160), openGraph: { title: `${product.nameEn} | KUJUK`, description: product.descriptionEn.slice(0, 160) } };
    return { robots: { index: false } };
  }
  if (['admin', 'seller', 'account', 'notifications', 'checkout', 'cart', 'orders', 'login', 'register', 'wishlist'].includes(route[0])) return { robots: { index: false, follow: false } };
  return {};
}

export default async function Page({ params }: Params) {
  const route = (await params).route ?? [];
  const product = route[0] === 'product' && route.length === 2 ? await loadProduct(route[1]) : undefined;
  if (product === null) notFound();
  const data = product ? {
    '@context': 'https://schema.org', '@type': 'Product', name: product.nameEn,
    description: product.descriptionEn, image: product.images,
    offers: { '@type': 'Offer', priceCurrency: 'EGP', price: product.discountPrice ?? product.price,
      availability: `https://schema.org/${product.stock > 0 ? 'InStock' : 'OutOfStock'}` },
  } : null;
  return <>
    {data && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />}
    {product && <noscript><main><h1>{product.nameEn}</h1><p>{product.descriptionEn}</p><p>EGP {product.discountPrice ?? product.price}</p><a href="/products">KUJUK</a></main></noscript>}
    <Storefront />
  </>;
}
