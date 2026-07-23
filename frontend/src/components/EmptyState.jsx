export default function EmptyState({ message = 'Nothing to show here yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
      <p>{message}</p>
    </div>
  );
}
