import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/ProductCard';
import { EmptyState, Spinner } from '../components/ui';
import { useI18n } from '../i18n/I18nProvider';
import { api } from '../lib/api';
import type { Paged, Product, SellerProfile } from '../lib/types';

type Shop = Pick<SellerProfile, 'shopNameEn' | 'shopNameAr' | 'descriptionEn' | 'descriptionAr' | 'logo' | 'cover'> & { id: number };
export function ShopPage() {
  const { id } = useParams();
  const { pick, t } = useI18n();
  const [params, setParams] = useSearchParams();
  const p = Number(params.get('page')) || 1;
  const [response, setResponse] = useState<(Paged<Product> & { shop: Shop }) | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setResponse(null); setError(false);
    const controller = new AbortController();
    void api<Paged<Product> & { shop: Shop }>(`/shops/${encodeURIComponent(id ?? '')}?page=${p}`, { auth: false, signal: controller.signal })
      .then(setResponse).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [id, p]);
  if (error) return <div className="container-kujuk py-8"><EmptyState title={pick('Shop unavailable', 'المتجر غير متاح')} action={<Link className="btn-primary px-4 py-2" to="/products">{t('nav.products')}</Link>} /></div>;
  if (!response) return <Spinner />;
  const { shop, items, pages } = response;
  return <div className="container-kujuk py-8">
    <section className="mb-8 overflow-hidden rounded-lg border border-line bg-white"><div className="h-36 bg-deep sm:h-52">{shop.cover && <img src={shop.cover} alt="" className="h-full w-full object-cover" />}</div>
      <div className="flex items-start gap-4 p-5">{shop.logo && <img src={shop.logo} alt="" className="h-14 w-14 rounded-md border border-line object-cover" />}<div><h1 className="text-2xl font-extrabold">{pick(shop.shopNameEn, shop.shopNameAr)}</h1><p className="mt-2 text-sm text-slate-500">{pick(shop.descriptionEn || '', shop.descriptionAr || '')}</p></div></div></section>
    {items.length ? <ProductGrid products={items} /> : <EmptyState title={t('common.noResults')} />}
    {pages > 1 && <div className="mt-6 flex items-center justify-center gap-3"><button className="btn-secondary px-4 py-2" disabled={p <= 1} onClick={() => setParams({ page: String(p - 1) })}>{t('common.previous')}</button><span>{p} / {pages}</span><button className="btn-secondary px-4 py-2" disabled={p >= pages} onClick={() => setParams({ page: String(p + 1) })}>{t('common.next')}</button></div>}
  </div>;
}
