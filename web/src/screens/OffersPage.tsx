import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '../components/ProductCard';
import { EmptyState, PageHeader, Spinner } from '../components/ui';
import { useI18n } from '../i18n/I18nProvider';
import { api } from '../lib/api';
import type { Product } from '../lib/types';

export function OffersPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setProducts(null); setError(false);
    void api<{ items: Product[] }>('/products?offers=true&sort=discount&limit=24', { auth: false, signal: abort.signal })
      .then(({ items }) => { if (!abort.signal.aborted) setProducts(items); })
      .catch(() => { if (!abort.signal.aborted) setError(true); });
    return () => abort.abort();
  }, [attempt]);
  return <div className="container-kujuk py-8">
    <PageHeader title={t('offers.title')} subtitle={t('offers.subtitle')} />
    {error ? <EmptyState title={t('common.error')} action={<button className="btn-primary px-4 py-2" onClick={() => setAttempt(v => v + 1)}>{t('common.retry')}</button>} /> :
      products ? (products.length ? <ProductGrid products={products} /> : <EmptyState title={t('common.noResults')} action={<Link className="btn-primary px-4 py-2" to="/products">{t('nav.products')}</Link>} />) : <Spinner />}
  </div>;
}
