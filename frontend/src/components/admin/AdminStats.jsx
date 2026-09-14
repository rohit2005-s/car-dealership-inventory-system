function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);
}

export default function AdminStats({ vehicles = [], totalModels = 0 }) {
  const modelsCount = totalModels || vehicles.length;
  const totalUnits = vehicles.reduce((acc, v) => acc + (v.quantity || 0), 0);
  const lowStockCount = vehicles.filter(
    (v) => v.quantity > 0 && v.quantity <= 5
  ).length;
  const outOfStockCount = vehicles.filter((v) => v.quantity === 0).length;
  const totalValue = vehicles.reduce(
    (acc, v) => acc + (v.price || 0) * (v.quantity || 0),
    0
  );

  const stats = [
    {
      name: 'Total Vehicle Models',
      value: modelsCount,
      subtext: 'Catalog listings',
      icon: (
        <svg
          className="h-6 w-6 text-brand-600 dark:text-brand-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2m0 0a2 2 0 104 0m10 0a2 2 0 104 0M9 17h6"
          />
        </svg>
      ),
      badgeColor: 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300',
    },
    {
      name: 'Total Units in Stock',
      value: totalUnits,
      subtext: 'Available for purchase',
      icon: (
        <svg
          className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      name: 'Low Stock Alerts',
      value: lowStockCount,
      subtext: '5 or fewer units remaining',
      icon: (
        <svg
          className="h-6 w-6 text-amber-600 dark:text-amber-400"
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
      ),
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
    {
      name: 'Out of Stock',
      value: outOfStockCount,
      subtext: 'Immediate restock recommended',
      icon: (
        <svg
          className="h-6 w-6 text-rose-600 dark:text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      ),
      badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    },
    {
      name: 'Total Fleet Valuation',
      value: formatCurrency(totalValue),
      subtext: 'Combined asset value',
      icon: (
        <svg
          className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
  ];

  return (
    <section aria-labelledby="inventory-stats-heading" className="mb-8">
      <h2 id="inventory-stats-heading" className="sr-only">
        Inventory Overview Statistics
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="card flex flex-col justify-between p-5 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {stat.name}
              </span>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.badgeColor}`}
              >
                {stat.icon}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {stat.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
