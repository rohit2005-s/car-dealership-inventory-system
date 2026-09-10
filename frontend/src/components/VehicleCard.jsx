import { useState } from 'react';
import { Link } from 'react-router-dom';

function AutomotiveFallback({ make }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-neutral-100 to-neutral-200/90 p-6 text-neutral-400 dark:from-neutral-900 dark:to-neutral-850 dark:text-neutral-500">
      <svg
        className="h-12 w-12 opacity-80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {make ? `${make}` : 'AutoHaus Showcase'}
      </span>
    </div>
  );
}

function StockBadge({ quantity }) {
  if (quantity <= 0) {
    return (
      <span className="badge-danger shadow-sm">
        Out of Stock
      </span>
    );
  }

  if (quantity <= 2) {
    return (
      <span className="badge bg-amber-100 font-medium text-amber-900 shadow-sm dark:border dark:border-amber-800/50 dark:bg-amber-950/80 dark:text-amber-300">
        Low Stock ({quantity} left)
      </span>
    );
  }

  return (
    <span className="badge-success shadow-sm">
      In Stock
    </span>
  );
}

function formatPrice(price) {
  if (typeof price !== 'number') return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function VehicleCard({ vehicle }) {
  const [imgError, setImgError] = useState(false);
  const isOutOfStock = vehicle.quantity === 0;

  return (
    <article
      className={`card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isOutOfStock ? 'opacity-90' : ''
      }`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {vehicle.imageUrl && !imgError ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isOutOfStock ? 'grayscale-[35%]' : ''
            }`}
            loading="lazy"
          />
        ) : (
          <AutomotiveFallback make={vehicle.make} />
        )}

        {/* Category badge */}
        <span className="badge absolute left-3 top-3 bg-neutral-900/80 font-medium text-neutral-100 backdrop-blur-md dark:bg-neutral-900/90 dark:text-neutral-200">
          {vehicle.category}
        </span>

        {/* Stock status badge */}
        <div className="absolute right-3 top-3">
          <StockBadge quantity={vehicle.quantity} />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {vehicle.make}
          </p>
          <h3 className="mt-1 text-lg font-bold text-neutral-900 line-clamp-1 dark:text-white">
            {vehicle.model}
          </h3>

          <div className="mt-4 flex items-baseline justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Price
            </span>
            <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {formatPrice(vehicle.price)}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <Link
            to={`/vehicles/${vehicle.id}`}
            className="btn-outline w-full justify-center text-center transition-colors group-hover:border-brand-500 group-hover:text-brand-600 dark:group-hover:border-brand-500 dark:group-hover:text-brand-400"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-[16/10] w-full bg-neutral-200 dark:bg-neutral-800" />
      <div className="p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800 flex items-baseline justify-between">
          <div className="h-3 w-10 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-6 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="h-10 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}
