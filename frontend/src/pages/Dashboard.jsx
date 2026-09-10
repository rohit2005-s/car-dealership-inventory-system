import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vehicleService } from '../services/vehicle.service';
import VehicleCard, { VehicleCardSkeleton } from '../components/VehicleCard';
import EmptyState from '../components/EmptyState';

const PAGE_LIMIT = 12;

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    make: '',
    model: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({});

  useEffect(() => {
    loadBrowseVehicles(1);
  }, []);

  const loadBrowseVehicles = async (page) => {
    setLoading(true);
    setError(null);

    try {
      const res = await vehicleService.getAll({ page, limit: PAGE_LIMIT });
      setVehicles(res.data.data || []);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
      setIsFiltered(false);
    } catch (err) {
      setError(
        err.message || 'Unable to load vehicle inventory. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSearchVehicles = async (activeParams) => {
    setLoading(true);
    setError(null);

    try {
      const res = await vehicleService.search(activeParams);
      setVehicles(res.data.data || []);
      setIsFiltered(true);
      setAppliedFilters(activeParams);
    } catch (err) {
      setError(
        err.message || 'Unable to find matching vehicles. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cleanFilters = (raw) => {
    const params = {};

    if (raw.make && raw.make.trim()) {
      params.make = raw.make.trim();
    }

    if (raw.model && raw.model.trim()) {
      params.model = raw.model.trim();
    }

    if (raw.category && raw.category.trim()) {
      params.category = raw.category.trim();
    }

    if (raw.minPrice !== '' && !isNaN(raw.minPrice)) {
      const min = Number(raw.minPrice);
      if (min >= 0) params.minPrice = min;
    }

    if (raw.maxPrice !== '' && !isNaN(raw.maxPrice)) {
      const max = Number(raw.maxPrice);
      if (max > 0) params.maxPrice = max;
    }

    return params;
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const cleaned = cleanFilters(filters);

    if (
      cleaned.minPrice !== undefined &&
      cleaned.maxPrice !== undefined &&
      cleaned.minPrice > cleaned.maxPrice
    ) {
      toast.error('Minimum price cannot exceed maximum price.');
      return;
    }

    if (Object.keys(cleaned).length === 0) {
      handleClearFilters();
      return;
    }

    loadSearchVehicles(cleaned);
  };

  const handleClearFilters = () => {
    setFilters({
      make: '',
      model: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    });
    setAppliedFilters({});
    loadBrowseVehicles(1);
  };

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === pagination.page
    ) {
      return;
    }
    loadBrowseVehicles(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    if (isFiltered) {
      loadSearchVehicles(appliedFilters);
    } else {
      loadBrowseVehicles(pagination.page);
    }
  };

  const hasActiveFormFilters = Boolean(
    filters.make ||
      filters.model ||
      filters.category ||
      filters.minPrice !== '' ||
      filters.maxPrice !== ''
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Header / Hero */}
      <section className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              AutoHaus Showroom
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              Find your next vehicle.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
              Browse our curated inventory of hand-inspected, precision-engineered
              automobiles. Filter by make, model, category, or price to find your match.
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm md:self-auto dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {isFiltered ? (
                <span>
                  {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} found
                </span>
              ) : (
                <span>
                  {pagination.total}{' '}
                  {pagination.total === 1 ? 'vehicle' : 'vehicles'} in inventory
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Search and Filters Panel */}
      <section
        aria-labelledby="filter-heading"
        className="card mb-8 p-5 sm:p-6"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <h2
            id="filter-heading"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200"
          >
            <svg
              className="h-4 w-4 text-brand-600 dark:text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search & Filters
          </h2>

          {isFiltered && (
            <span className="badge bg-brand-50 font-medium text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
              Filtered Mode
            </span>
          )}
        </div>

        <form onSubmit={handleApplyFilters} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Make */}
            <div>
              <label
                htmlFor="filter-make"
                className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                Make
              </label>
              <input
                id="filter-make"
                name="make"
                type="text"
                value={filters.make}
                onChange={handleFilterChange}
                placeholder="e.g. Porsche, BMW"
                className="input"
              />
            </div>

            {/* Model */}
            <div>
              <label
                htmlFor="filter-model"
                className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                Model
              </label>
              <input
                id="filter-model"
                name="model"
                type="text"
                value={filters.model}
                onChange={handleFilterChange}
                placeholder="e.g. 911, M3"
                className="input"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="filter-category"
                className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                Category
              </label>
              <select
                id="filter-category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Categories</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Wagon">Wagon</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label
                htmlFor="filter-minPrice"
                className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                Min Price ($)
              </label>
              <input
                id="filter-minPrice"
                name="minPrice"
                type="number"
                min="0"
                step="1000"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                className="input"
              />
            </div>

            {/* Max Price */}
            <div>
              <label
                htmlFor="filter-maxPrice"
                className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                Max Price ($)
              </label>
              <input
                id="filter-maxPrice"
                name="maxPrice"
                type="number"
                min="0"
                step="1000"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="No limit"
                className="input"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {(hasActiveFormFilters || isFiltered) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn-outline text-xs"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Searching…' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Active Filter Tags */}
      {isFiltered && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm dark:border-brand-900/50 dark:bg-brand-950/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-800 dark:text-brand-300">
              Active Filters:
            </span>
            {appliedFilters.make && (
              <span className="badge border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                Make: {appliedFilters.make}
              </span>
            )}
            {appliedFilters.model && (
              <span className="badge border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                Model: {appliedFilters.model}
              </span>
            )}
            {appliedFilters.category && (
              <span className="badge border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                Category: {appliedFilters.category}
              </span>
            )}
            {appliedFilters.minPrice !== undefined && (
              <span className="badge border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                Min: ${appliedFilters.minPrice.toLocaleString()}
              </span>
            )}
            {appliedFilters.maxPrice !== undefined && (
              <span className="badge border border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                Max: ${appliedFilters.maxPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-medium text-brand-700 underline hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Reset all
          </button>
        </div>
      )}

      {/* 3. Error State */}
      {error && !loading && (
        <div className="card my-8 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            Unable to display inventory
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="btn-primary mt-5"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Loading State (Skeletons) */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <VehicleCardSkeleton key={idx} />
          ))}
        </div>
      )}

      {/* 5. Empty State */}
      {!loading && !error && vehicles.length === 0 && (
        <EmptyState
          title={isFiltered ? 'No vehicles found' : 'Showroom is currently empty'}
          message={
            isFiltered
              ? 'No vehicles match your current search and filter criteria. Try adjusting price bounds or clearing some filters.'
              : 'There are currently no vehicles listed in our showroom. Please check back soon.'
          }
          actionLabel={isFiltered ? 'Clear Filters' : undefined}
          onAction={isFiltered ? handleClearFilters : undefined}
        />
      )}

      {/* 6. Vehicle Grid */}
      {!loading && !error && vehicles.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}

      {/* 7. Pagination (Normal Browse Mode Only) */}
      {!loading && !error && !isFiltered && pagination.totalPages > 1 && (
        <nav
          aria-label="Vehicle inventory pagination"
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 sm:flex-row dark:border-neutral-800"
        >
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Page <span className="font-semibold text-neutral-900 dark:text-white">{pagination.page}</span> of{' '}
            <span className="font-semibold text-neutral-900 dark:text-white">{pagination.totalPages}</span>{' '}
            ({pagination.total} total)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="btn-outline text-sm"
              aria-label="Go to previous page"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="btn-outline text-sm"
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        </nav>
      )}

      {/* Filtered Mode Count (No Fake Pagination) */}
      {!loading && !error && isFiltered && vehicles.length > 0 && (
        <div className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Showing all {vehicles.length} matching {vehicles.length === 1 ? 'vehicle' : 'vehicles'}. Filtered search results are unpaginated.
        </div>
      )}
    </div>
  );
}
