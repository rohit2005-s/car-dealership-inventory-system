import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { vehicleService } from '../services/vehicle.service';

function AutomotiveFallback({ make, model }) {
  return (
    <div className="flex h-full w-full min-h-[340px] flex-col items-center justify-center bg-gradient-to-b from-neutral-100 to-neutral-200/90 p-8 text-neutral-400 dark:from-neutral-900 dark:to-neutral-850 dark:text-neutral-500">
      <svg
        className="h-20 w-20 opacity-75 sm:h-28 sm:w-28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
      <div className="mt-4 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          AutoHaus Studio Preview
        </span>
        {make && (
          <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {make} {model}
          </p>
        )}
      </div>
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

function VehicleDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-6 h-5 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[16/10] w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-28 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="h-24 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-48 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-12 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

export default function VehicleDetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchVehicle() {
      setLoading(true);
      setError(null);
      setIsNotFound(false);
      setImgError(false);

      try {
        const res = await vehicleService.getById(id);
        const data = res.data?.data?.vehicle || res.data?.data;

        if (!data) {
          throw new Error('Vehicle not found');
        }

        if (isMounted) {
          setVehicle(data);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err.message || 'Unable to load vehicle details. Please try again.';
          setError(message);
          if (
            message.toLowerCase().includes('not found') ||
            message.includes('404')
          ) {
            setIsNotFound(true);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchVehicle();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handlePurchaseClick = () => {
    toast('Purchase functionality will be available in the next step.', {
      icon: 'ℹ️',
      duration: 4000,
    });
  };

  if (loading) {
    return <VehicleDetailsSkeleton />;
  }

  if (error || !vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
        <div className="card p-8 sm:p-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {isNotFound ? 'Vehicle Not Found' : 'Unable to Display Vehicle'}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
            {isNotFound
              ? 'The vehicle you are looking for does not exist or may have been removed from the AutoHaus showroom.'
              : error}
          </p>

          <div className="mt-6">
            <Link to="/inventory" className="btn-primary inline-flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Return to Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = vehicle.quantity === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Back Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Inventory
        </Link>
      </nav>

      {/* 2. Responsive Two-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
        {/* Left Column: Media & Highlights */}
        <section className="lg:col-span-7 space-y-6">
          <div className="card relative overflow-hidden rounded-2xl">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-850">
              {vehicle.imageUrl && !imgError ? (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  onError={() => setImgError(true)}
                  className={`h-full w-full object-cover ${
                    isOutOfStock ? 'grayscale-[35%]' : ''
                  }`}
                />
              ) : (
                <AutomotiveFallback
                  make={vehicle.make}
                  model={vehicle.model}
                />
              )}

              {/* Category pill */}
              <span className="badge absolute left-4 top-4 bg-neutral-900/80 text-neutral-100 backdrop-blur-md dark:bg-neutral-900/90 dark:text-neutral-200">
                {vehicle.category}
              </span>

              {/* Stock status pill */}
              <div className="absolute right-4 top-4">
                <StockBadge quantity={vehicle.quantity} />
              </div>
            </div>
          </div>

          {/* AutoHaus Guarantees */}
          <div className="card p-5 sm:p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              The AutoHaus Standard
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    150-Point Certified
                  </h4>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Inspected by master mechanics
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Clean Title
                  </h4>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Verified accident-free history
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    30-Day Warranty
                  </h4>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Comprehensive limited coverage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Pricing, Specs & Purchase Action */}
        <section className="lg:col-span-5 space-y-6">
          {/* Header & Title */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              {vehicle.category} Showcase
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </h1>
          </div>

          {/* Pricing & Availability Card */}
          <div className="card p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Listing Price
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {formatPrice(vehicle.price)}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Availability
              </span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                {vehicle.quantity === 0
                  ? 'Out of Stock'
                  : `${vehicle.quantity} ${
                      vehicle.quantity === 1 ? 'unit' : 'units'
                    } in showroom`}
              </span>
            </div>
          </div>

          {/* Specifications Breakdown */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Vehicle Specifications
            </h2>

            <dl className="mt-4 divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
              <div className="flex justify-between py-2.5">
                <dt className="text-neutral-500 dark:text-neutral-400">Make</dt>
                <dd className="font-medium text-neutral-900 dark:text-white">
                  {vehicle.make}
                </dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-neutral-500 dark:text-neutral-400">Model</dt>
                <dd className="font-medium text-neutral-900 dark:text-white">
                  {vehicle.model}
                </dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Category
                </dt>
                <dd className="font-medium text-neutral-900 dark:text-white">
                  {vehicle.category}
                </dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Inventory Units
                </dt>
                <dd className="font-medium text-neutral-900 dark:text-white">
                  {vehicle.quantity}
                </dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Listing Status
                </dt>
                <dd>
                  <StockBadge quantity={vehicle.quantity} />
                </dd>
              </div>
            </dl>
          </div>

          {/* Primary Action Area: Purchase Button */}
          <div className="card p-6">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handlePurchaseClick}
              className="btn-primary w-full py-3.5 text-base font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={
                isOutOfStock
                  ? 'Vehicle is out of stock'
                  : `Purchase ${vehicle.make} ${vehicle.model}`
              }
            >
              {isOutOfStock ? 'Out of Stock' : 'Purchase Vehicle'}
            </button>

            <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
              {isOutOfStock
                ? 'This vehicle is currently unavailable. Check back soon for restock updates.'
                : 'Secure reservation prepared. Click to review purchase confirmation.'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
