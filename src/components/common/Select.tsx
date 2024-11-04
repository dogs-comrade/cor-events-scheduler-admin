import { h } from 'preact';
import { JSX } from 'preact/jsx-runtime';

interface Option {
  value: string;
  label: string;
}

interface Props extends JSX.HTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export const Select = ({ label, options, error, class: className, ...props }: Props) => {
  return (
    <div class="flex flex-col">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        class={`
          rounded-md border border-gray-300 px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500' : ''}
          ${className || ''}
        `}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p class="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};