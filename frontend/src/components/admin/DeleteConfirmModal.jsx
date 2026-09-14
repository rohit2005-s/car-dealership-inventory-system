import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vehicleService } from '../../services/vehicle.service';

function formatPrice(price) {
  if (typeof price !== 'number') return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !vehicle) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await vehicleService.remove(vehicle.id);
      toast.success(`${vehicle.make} ${vehicle.model} removed from inventory.`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete vehicle.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="card w-full max-w-md overflow-hidden p-6 sm:p-8 shadow-2xl relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Confirm Removal
          </span>
          <h2
            id="delete-modal-title"
            className="mt-1 text-xl font-bold tracking-tight text-neutral-900 dark:text-white"
          >
            Delete Vehicle?
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Are you sure you want to permanently remove this vehicle from the dealership inventory?
          </p>
        </div>

        {/* Vehicle Summary Card */}
        <div className="my-5 rounded-xl border border-red-100 bg-red-50/40 p-4 text-left dark:border-red-900/30 dark:bg-red-950/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {vehicle.category}
          </p>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {vehicle.make} {vehicle.model}
          </h3>
          <div className="mt-2 flex justify-between text-xs text-neutral-600 dark:text-neutral-300">
            <span>Listing Price: <strong>{formatPrice(vehicle.price)}</strong></span>
            <span>Stock: <strong>{vehicle.quantity} units</strong></span>
          </div>
        </div>

        <p className="mb-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          This operation is permanent. This listing will immediately disappear from the public showroom.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="btn-outline px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete Vehicle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
