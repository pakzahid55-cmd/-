import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../lib/price';
import { useI18n } from '../i18n/I18nContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { t } = useI18n();
  const { currency } = useCurrency();
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); return; }
    setLoading(true);
    api<{ products: Product[] }>(`/products?ids=${ids.join(',')}&limit=50&currency=${currency}`)
      .then(d => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids.join(','), currency]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5">
      <h1 className="text-xl sm:text-2xl font-black text-kajok-deep flex items-center gap-2"><Heart size={24} className="text-red-500 fill-red-500" />{t('wishlistTitle')}<span className="text-kajok-muted text-base font-bold">({ids.length})</span></h1>
      {ids.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto text-kajok-accent" strokeWidth={1.3} />
          <p className="mt-4 text-xl font-black text-kajok-deep">{t('wishlistEmpty')}</p>
          <p className="mt-1 text-sm text-kajok-muted">{t('wishlistEmptySub')}</p>
          <Link to="/" className="mt-6 inline-block h-12 px-8 leading-[3rem] rounded-xl bg-kajok-royal text-white font-bold hover:bg-kajok-deep">{t('browseProducts')}</Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">{Array.from({ length: ids.length }).map((_, i) => <div key={i} className="skeleton aspect-[3/5]" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}
