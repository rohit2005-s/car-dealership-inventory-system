import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { vehicleService } from '../services/vehicle.service';
import AdminStats from '../components/admin/AdminStats';
import VehicleFormModal from '../components/admin/VehicleFormModal';
import RestockModal from '../components/admin/RestockModal';
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal';
import EmptyState from '../components/EmptyState';

function formatPrice(price) {
  if (typeof price !== 'number') return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function StockBadge({ quantity }) {
  if (quantity === 0) {
    return (
      <span className="badge-danger font-medium shadow-sm">
        Out of Stock (0)
      </span>
    );
  }
  if (quantity <= 5) {
    return (
      <span className="badge bg-amber-100 font-medium text-amber-900 shadow-sm dark:border dark:border-amber-800/50 dark:bg-amber-950/80 dark:text-amber-300">
        Low Stock ({quantity})
      </span>
    );
  }
  return (
    <span className="badge-success font-medium shadow-sm">
      In Stock ({quantity})
    </span>
  );
}

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i}>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-16 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
          </td>
          <td className="px-6 py-4">
            <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
          </td>
          <td className="px-6 py-4 text-right">
            <div className="inline-flex gap-2">
              <div className="h-8 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-8 w-14 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [deleteVehicle, setDeleteVehicle] = useState(null);

  const fetchInventory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      // Fetch up to 100 vehicles for full admin oversight
      const res = await vehicleService.getAll({ page: 1, limit: 100 });
      setVehicles(res.data?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dealership inventory.');
      toast.error('Unable to refresh inventory.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.category).filter(Boolean));
    return Array.from(set);
  }, [vehicles]);

  // Filtered dataset
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.make?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === 'in_stock') {
        matchesStatus = v.quantity > 5;
      } else if (statusFilter === 'low_stock') {
        matchesStatus = v.quantity > 0 && v.quantity <= 5;
      } else if (statusFilter === 'out_of_stock') {
        matchesStatus = v.quantity === 0;
      }

      let matchesCategory = true;
      if (categoryFilter !== 'all') {
        matchesCategory = v.category?.toLowerCase() === categoryFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [vehicles, searchQuery, statusFilter, categoryFilter]);

  const handleOpenCreateModal = () => {
    setEditingVehicle(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormModalOpen(true);
  };

  const handleOpenRestockModal = (vehicle) => {
    setRestockVehicle(vehicle);
  };

  const handleOpenDeleteModal = (vehicle) => {
    setDeleteVehicle(vehicle);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Header / Toolbar */}
      <section className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-950/70 dark:text-brand-300">
                Dealer Management Portal
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Admin Console
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              Inventory & Fleet Management
            </h1>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              Oversee live vehicle quantities, adjust pricing, restock showroom allocations, and manage listings.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => fetchInventory(true)}
              disabled={isRefreshing || loading}
              className="btn-outline inline-flex items-center gap-1.5 text-xs font-medium"
              title="Refresh inventory from server"
            >
              <svg
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRefreshing ? 'Syncing...' : 'Sync'}
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="btn-primary inline-flex items-center gap-2 shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Vehicle
            </button>
          </div>
        </div>
      </section>

      {/* 2. KPI Metrics Overview */}
      <AdminStats vehicles={vehicles} />

      {/* 3. Filter & Search Controls Panel */}
      <section aria-labelledby="fleet-search-heading" className="card mb-6 p-4 sm:p-5">
        <h2 id="fleet-search-heading" className="sr-only">
          Inventory Search and Filters
        </h2>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by make, model, or category..."
              className="input pl-9 text-sm"
            />
          </div>

          {/* Filter Pills / Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50/70 p-1 dark:border-neutral-800 dark:bg-neutral-900/50">
              {[
                { id: 'all', label: 'All' },
                { id: 'in_stock', label: 'In Stock' },
                { id: 'low_stock', label: 'Low Stock' },
                { id: 'out_of_stock', label: 'Out of Stock' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    statusFilter === pill.id
                      ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            {uniqueCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input py-1.5 text-xs font-medium w-auto"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Active filter counter / Reset */}
            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. Inventory Fleet Table & Mobile List */}
      <section aria-labelledby="fleet-table-heading" className="card overflow-hidden">
        <h2 id="fleet-table-heading" className="sr-only">
          Vehicle Inventory List
        </h2>

        {/* Error State */}
        {!loading && error && (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Unable to Display Inventory
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{error}</p>
            <button
              type="button"
              onClick={() => fetchInventory()}
              className="btn-primary mt-4 text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVehicles.length === 0 && (
          <div className="p-6">
            <EmptyState
              title={vehicles.length === 0 ? 'Inventory Fleet Empty' : 'No Matching Vehicles'}
              message={
                vehicles.length === 0
                  ? 'Your dealership inventory currently has no vehicles listed. Add your first vehicle to launch your showroom.'
                  : 'No vehicles match your active search and status filters. Try clearing your filters.'
              }
              actionLabel={vehicles.length === 0 ? 'Add First Vehicle' : 'Clear Filters'}
              onAction={vehicles.length === 0 ? handleOpenCreateModal : handleClearFilters}
            />
          </div>
        )}

        {/* Desktop Table */}
        {!error && (loading || filteredVehicles.length > 0) && (
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Vehicle</th>
                  <th scope="col" className="px-6 py-3.5">Category</th>
                  <th scope="col" className="px-6 py-3.5">Price</th>
                  <th scope="col" className="px-6 py-3.5">Status & Stock</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              {loading ? (
                <TableSkeleton />
              ) : (
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-850/50"
                    >
                      {/* Vehicle Thumbnail & Names */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            {vehicle.imageUrl ? (
                              <img
                                src={vehicle.imageUrl}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-neutral-400">
                                {vehicle.make.slice(0, 3)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/vehicles/${vehicle.id}`}
                                className="font-bold text-neutral-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                              >
                                {vehicle.make} {vehicle.model}
                              </Link>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              ID: #{vehicle.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="badge bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          {vehicle.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                        {formatPrice(vehicle.price)}
                      </td>

                      {/* Stock Status */}
                      <td className="px-6 py-4">
                        <StockBadge quantity={vehicle.quantity} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenRestockModal(vehicle)}
                            className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                            title="Add stock units"
                          >
                            + Restock
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(vehicle)}
                            className="btn-outline px-2.5 py-1 text-xs"
                            title="Edit vehicle specifications"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(vehicle)}
                            className="rounded-lg p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                            title="Delete vehicle"
                            aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        )}

        {/* Mobile Cards View (displayed only on small screens) */}
        {!error && !loading && filteredVehicles.length > 0 && (
          <div className="divide-y divide-neutral-100 sm:hidden dark:divide-neutral-800">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {vehicle.category}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      ID: #{vehicle.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <StockBadge quantity={vehicle.quantity} />
                </div>

                <div className="flex items-center justify-between text-sm font-semibold border-t border-neutral-100 pt-2 dark:border-neutral-800">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Listing Price:</span>
                  <span className="text-neutral-900 dark:text-white">{formatPrice(vehicle.price)}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenRestockModal(vehicle)}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  >
                    + Restock
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(vehicle)}
                    className="btn-outline px-3 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteModal(vehicle)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                    aria-label="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Modals */}
      <VehicleFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        vehicle={editingVehicle}
        onSuccess={() => fetchInventory(true)}
      />

      <RestockModal
        isOpen={Boolean(restockVehicle)}
        onClose={() => setRestockVehicle(null)}
        vehicle={restockVehicle}
        onSuccess={() => fetchInventory(true)}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteVehicle)}
        onClose={() => setDeleteVehicle(null)}
        vehicle={deleteVehicle}
        onSuccess={() => fetchInventory(true)}
      />
    </div>
  );
}
