import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Star, Flame } from 'lucide-react';
import type { Product } from '../lib/price';
import { useI18n } from '../i18n/I18nContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useI18n();
  const { fmt } = useCurrency();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();

  const wished = has(product.id);
  const name = lang === 'ar' ? product.name_ar : product.name_en;
  const oldPrice = product.discount_percent > 0 ? product.base_price : null;

  const open = () => {
    // Recently viewed tracking
    try {
      const rv: number[] = JSON.parse(localStorage.getItem('kajok_recent') || '[]');
      localStorage.setItem('kajok_recent', JSON.stringify([product.id, ...rv.filter(i => i !== product.id)].slice(0, 12)));
    } catch { /* ignore */ }
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="group bg-white rounded-card border border-kajok-soft shadow-card hover:shadow-lift transition-shadow duration-200 flex flex-col overflow-hidden relative">
      {product.discount_percent > 0 && (
        <span className="absolute top-2 start-2 z-10 bg-red-600 text-white text-[11px] font-extrabold px-2 py-1 rounded-md tracking-wide">
          {t('off', { n: product.discount_percent })}
        </span>
      )}
      <button
        onClick={() => toggle(product.id)}
        aria-label={t('wishlist')}
        aria-pressed={wished}
        className="absolute top-2 end-2 z-10 w-9 h-9 grid place-items-center rounded-full bg-white/90 backdrop-blur border border-kajok-soft shadow-card hover:scale-110 transition-transform"
      >
        <Heart size={17} className={wished ? 'fill-red-500 text-red-500' : 'text-kajok-deep'} />
      </button>

      <button onClick={open} className="block w-full aspect-square overflow-hidden bg-kajok-bg" aria-label={name}>
        <img
          src={product.image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
        />
      </button>

      <div className="flex flex-col gap-1 p-3 pt-2 flex-1">
        {product.brand_name && <span className="text-[11px] font-semibold text-kajok-muted uppercase tracking-wide">{product.brand_name}</span>}
        <button onClick={open} className="text-start">
          <h3 className="clamp-2 text-[13px] leading-5 font-bold text-kajok-text min-h-[40px]">{name}</h3>
        </button>
        <div className="flex items-center gap-1 text-[11px] text-kajok-muted">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-kajok-text">{product.rating.toFixed(1)}</span>
          <span>({product.review_count})</span>
          {product.bestseller && <Flame size={12} className="text-orange-500 ms-1" />}
          {product.sold_count > 300 && <span className="ms-1 hidden sm:inline">· {t('soldCount', { n: product.sold_count })}</span>}
        </div>

        <div className="mt-auto pt-1.5 flex items-end justify-between gap-2">
          <div>
            {oldPrice !== null && <div className="text-[11px] text-kajok-muted line-through leading-none">{fmt(oldPrice)}</div>}
            <div className="text-base sm:text-lg font-extrabold text-kajok-deep leading-tight">{fmt(product.price)}</div>
          </div>
          <button
            onClick={() => { add(product.id); toast('success', t('addedToCart')); }}
            disabled={product.stock === 0}
            aria-label={t('addToCart')}
            className="w-9 h-9 sm:w-10 sm:h-10 grid place-items-center rounded-xl bg-kajok-royal text-white hover:bg-kajok-deep disabled:bg-kajok-muted disabled:cursor-not-allowed transition-colors shadow-card"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
