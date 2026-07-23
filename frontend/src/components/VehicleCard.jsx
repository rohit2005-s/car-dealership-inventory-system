// TODO (Phase 6): style fully per frontend-design skill; wire onPurchase to vehicleService.purchase.
export default function VehicleCard({ vehicle, onPurchase }) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2">
      <img
        src={vehicle.imageUrl || '/placeholder-car.png'}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="rounded-lg h-40 object-cover"
      />
      <h3 className="font-semibold">
        {vehicle.make} {vehicle.model}
      </h3>
      <p className="text-sm text-gray-500">{vehicle.category}</p>
      <p className="font-bold">${vehicle.price?.toLocaleString()}</p>
      <p className="text-sm">Stock: {vehicle.quantity}</p>
      <button
        disabled={outOfStock}
        onClick={() => onPurchase?.(vehicle.id)}
        className="mt-2 rounded-lg bg-brand-600 text-white py-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {outOfStock ? 'Out of Stock' : 'Purchase'}
      </button>
    </div>
  );
}
