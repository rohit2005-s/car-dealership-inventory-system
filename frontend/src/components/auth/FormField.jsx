/**
 * Labeled input with an inline validation message. Wraps the existing
 * `.input` primitive rather than redefining input styling, and wires up
 * aria-invalid/aria-describedby so screen readers announce errors.
 */
export default function FormField({
  id,
  label,
  type = 'text',
  error,
  ...inputProps
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        className={`input ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        }`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}