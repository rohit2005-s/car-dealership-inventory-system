import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vehicleService } from '../../services/vehicle.service';

export default function RestockModal({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}) {
  const [amount, setAmount] = useState(5);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAmount(5);
    setError(null);
  }, [vehicle, isOpen]);

  if (!isOpen || !vehicle) return null;

  const currentQty = vehicle.quantity || 0;
  const numAmount = Number(amount);
  const newTotal = !isNaN(numAmount) && numAmount > 0 ? currentQty + numAmount : currentQty;

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    setError(null);
  };

  const handlePreset = (preset) => {
    setAmount(preset);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!amount || isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
      setError('Restock amount must be a positive whole integer (at least 1)');
      return;
    }

    setIsSubmitting(true);
    try {
      await vehicleService.restock(vehicle.id, parsed);
      toast.success(
        `Successfully added ${parsed} units to ${vehicle.make} ${vehicle.model} stock.`
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to restock vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restock-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="card w-full max-w-md overflow-hidden p-6 sm:p-8 shadow-2xl relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Inventory Restock
            </span>
            <h2
              id="restock-modal-title"
              className="mt-0.5 text-xl font-bold tracking-tight text-neutral-900 dark:text-white"
            >
              Restock Vehicle
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Vehicle Info Card */}
        <div className="my-5 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {vehicle.category}
          </p>
          <h3 className="mt-0.5 text-base font-bold text-neutral-900 dark:text-white">
            {vehicle.make} {vehicle.model}
          </h3>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-neutral-200/60 pt-2.5 dark:border-neutral-800">
            <span className="text-neutral-500 dark:text-neutral-400">Current In-Stock:</span>
            <span className={`font-semibold ${currentQty === 0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-white'}`}>
              {currentQty} {currentQty === 1 ? 'unit' : 'units'}
            </span>
          </div>
        </div>

        {/* Restock Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="restock-amount"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
            >
              Units to Add *
            </label>
            <input
              id="restock-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={handleAmountChange}
              className={`input mt-1.5 text-lg font-bold ${
                error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Quick Increment:</span>
            <div className="mt-1.5 flex gap-2">
              {[1, 5, 10, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    Number(amount) === preset
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-neutral-200 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
                  }`}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* New Total Preview */}
          <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <div className="flex justify-between items-center">
              <span>Resulting Showroom Stock:</span>
              <strong className="text-sm font-bold">{newTotal} units</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-outline px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Updating...
                </>
              ) : (
                'Confirm Restock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
