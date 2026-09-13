import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { purchaseService } from '../services/purchase.service';
import EmptyState from '../components/EmptyState';

const PAGE_LIMIT = 10;

function formatPrice(price) {
  if (typeof price !== 'number') return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString) {
  if (!dateString) return 'Recent';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function PurchaseCardFallback({ make }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 p-4 text-neutral-400 dark:from-neutral-900 dark:to-neutral-850 dark:text-neutral-500">
      <svg
        className="h-8 w-8 opacity-70"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    </div>
  );
}

function PurchaseItem({ purchase }) {
  const [imgError, setImgError] = useState(false);
  const vehicle = purchase.vehicle || {};
  const orderRef = purchase.id ? purchase.id.slice(0, 8).toUpperCase() : 'ORD';

  return (
    <div className="card group overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Vehicle Thumbnail */}
        <div className="relative aspect-[16/10] sm:aspect-square sm:w-48 shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {vehicle.imageUrl && !imgError ? (
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.make || ''} ${vehicle.model || ''}`}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <PurchaseCardFallback make={vehicle.make} />
          )}

          {vehicle.category && (
            <span className="badge absolute left-2.5 top-2.5 bg-neutral-900/80 text-[11px] font-medium text-neutral-100 backdrop-blur-md dark:bg-neutral-900/90 dark:text-neutral-200">
              {vehicle.category}
            </span>
          )}
        </div>

        {/* Order & Vehicle Info */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Order #{orderRef}
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <time className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatDate(purchase.createdAt)}
                </time>
              </div>

              <span className="badge-success shadow-sm">
                Order Confirmed
              </span>
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {vehicle.make}
              </p>
              <h3 className="mt-0.5 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                {vehicle.model}
              </h3>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Total Paid
              </span>
              <p className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {formatPrice(vehicle.price)}
              </p>
            </div>

            {vehicle.id ? (
              <Link
                to={`/vehicles/${vehicle.id}`}
                className="btn-outline inline-flex items-center gap-1.5 text-xs font-medium"
              >
                View Vehicle
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="text-xs italic text-neutral-400">
                Vehicle archived
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="flex flex-col sm:flex-row items-stretch">
        <div className="aspect-[16/10] sm:aspect-square sm:w-48 bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex-1 p-5 sm:p-6 space-y-4">
          <div className="flex justify-between">
            <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-5 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="flex justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-8 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseHistory() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const loadPurchases = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await purchaseService.getHistory({ page, limit: PAGE_LIMIT });
      setPurchases(res.data?.data || []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(
        err.message || 'Unable to load your purchase history. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === pagination.page
    ) {
      return;
    }
    loadPurchases(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Customer Account
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              My Purchase History
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              View your confirmed vehicle acquisitions, order dates, and dealership reservation records.
            </p>
          </div>

          {!loading && !error && purchases.length > 0 && (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm sm:self-auto dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                {pagination.total} {pagination.total === 1 ? 'order' : 'orders'} confirmed
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="space-y-4">
          <PurchaseSkeleton />
          <PurchaseSkeleton />
          <PurchaseSkeleton />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="card p-8 text-center sm:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Failed to Load Purchases
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
            {error}
          </p>
          <button
            type="button"
            onClick={() => loadPurchases(pagination.page)}
            className="btn-primary mt-6 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && purchases.length === 0 && (
        <EmptyState
          title="No Purchases Yet"
          message="You haven't reserved or purchased any vehicles from AutoHaus yet. Explore our curated showroom inventory to find your next automobile."
          actionLabel="Browse Showroom Inventory"
          onAction={() => navigate('/inventory')}
          icon={
            <svg
              className="h-8 w-8 text-brand-600 dark:text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
        />
      )}

      {/* Purchase Cards List */}
      {!loading && !error && purchases.length > 0 && (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <PurchaseItem key={purchase.id} purchase={purchase} />
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <nav
              aria-label="Purchases pagination"
              className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800"
            >
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Page <span className="font-semibold text-neutral-800 dark:text-neutral-200">{pagination.page}</span> of{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{pagination.totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="btn-outline px-3.5 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="btn-outline px-3.5 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
