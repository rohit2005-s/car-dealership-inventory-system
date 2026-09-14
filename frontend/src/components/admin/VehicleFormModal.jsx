import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vehicleService } from '../../services/vehicle.service';

const POPULAR_CATEGORIES = [
  'Sedan',
  'SUV',
  'Coupe',
  'Convertible',
  'Truck',
  'Electric',
  'Hatchback',
  'Luxury',
];

const URL_REGEX = /^https?:\/\/.+/i;

export default function VehicleFormModal({
  isOpen,
  onClose,
  vehicle = null,
  onSuccess,
}) {
  const isEdit = Boolean(vehicle && vehicle.id);

  const [form, setForm] = useState({
    make: '',
    model: '',
    category: 'Sedan',
    price: '',
    quantity: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setForm({
        make: vehicle.make || '',
        model: vehicle.model || '',
        category: vehicle.category || 'Sedan',
        price: vehicle.price !== undefined ? String(vehicle.price) : '',
        quantity: vehicle.quantity !== undefined ? String(vehicle.quantity) : '',
        imageUrl: vehicle.imageUrl || '',
      });
    } else {
      setForm({
        make: '',
        model: '',
        category: 'Sedan',
        price: '',
        quantity: '1',
        imageUrl: '',
      });
    }
    setErrors({});
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.make.trim()) {
      nextErrors.make = 'Manufacturer / Make is required';
    }

    if (!form.model.trim()) {
      nextErrors.model = 'Model is required';
    }

    if (!form.category.trim()) {
      nextErrors.category = 'Vehicle category is required';
    }

    const parsedPrice = Number(form.price);
    if (!form.price || isNaN(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = 'Price must be a number greater than $0';
    }

    const parsedQty = Number(form.quantity);
    if (
      form.quantity === '' ||
      isNaN(parsedQty) ||
      !Number.isInteger(parsedQty) ||
      parsedQty < 0
    ) {
      nextErrors.quantity = 'Quantity must be a non-negative whole integer';
    }

    if (form.imageUrl && form.imageUrl.trim() && !URL_REGEX.test(form.imageUrl.trim())) {
      nextErrors.imageUrl = 'Image URL must begin with http:// or https://';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    if (form.imageUrl && form.imageUrl.trim()) {
      payload.imageUrl = form.imageUrl.trim();
    }

    try {
      if (isEdit) {
        await vehicleService.update(vehicle.id, payload);
        toast.success(`${payload.make} ${payload.model} updated successfully.`);
      } else {
        await vehicleService.create(payload);
        toast.success(`${payload.make} ${payload.model} added to inventory.`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save vehicle details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="card my-8 w-full max-w-xl overflow-hidden p-6 sm:p-8 shadow-2xl relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Dealership Fleet Management
            </span>
            <h2
              id="vehicle-form-title"
              className="mt-0.5 text-xl font-bold tracking-tight text-neutral-900 dark:text-white"
            >
              {isEdit ? `Edit ${vehicle?.make} ${vehicle?.model}` : 'Add New Vehicle to Inventory'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Make */}
            <div>
              <label htmlFor="form-make" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Make / Manufacturer *
              </label>
              <input
                id="form-make"
                name="make"
                type="text"
                value={form.make}
                onChange={handleChange}
                placeholder="e.g. BMW, Porsche, Audi"
                className={`input mt-1.5 ${errors.make ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.make && (
                <p className="mt-1 text-xs text-red-500">{errors.make}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="form-model" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Model Name *
              </label>
              <input
                id="form-model"
                name="model"
                type="text"
                value={form.model}
                onChange={handleChange}
                placeholder="e.g. M3 Competition, 911 GT3"
                className={`input mt-1.5 ${errors.model ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.model && (
                <p className="mt-1 text-xs text-red-500">{errors.model}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Category */}
            <div>
              <label htmlFor="form-category" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Category *
              </label>
              <select
                id="form-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`input mt-1.5 ${errors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              >
                {POPULAR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="form-price" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Price (USD $) *
              </label>
              <input
                id="form-price"
                name="price"
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 74500"
                className={`input mt-1.5 ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="form-quantity" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Stock Units *
              </label>
              <input
                id="form-quantity"
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 5"
                className={`input mt-1.5 ${errors.quantity ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="form-imageUrl" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Vehicle Image URL <span className="font-normal normal-case text-neutral-400">(Optional)</span>
            </label>
            <input
              id="form-imageUrl"
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className={`input mt-1.5 ${errors.imageUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.imageUrl ? (
              <p className="mt-1 text-xs text-red-500">{errors.imageUrl}</p>
            ) : (
              <p className="mt-1 text-xs text-neutral-400">
                Leave blank to automatically use the AutoHaus automotive SVG fallback badge.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
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
                  Saving...
                </>
              ) : isEdit ? (
                'Update Vehicle'
              ) : (
                'Add Vehicle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
