import { useParams } from 'react-router-dom';

// TODO (Phase 6): fetch vehicle by :id via vehicleService, show full details
// and a disabled-when-out-of-stock Purchase button.
export default function VehicleDetails() {
  const { id } = useParams();
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-xl font-semibold">Vehicle Details (placeholder) — id: {id}</h1>
    </div>
  );
}
