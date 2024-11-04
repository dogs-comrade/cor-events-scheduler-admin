// src/components/common/Input.tsx
import { h } from 'preact';
import { JSX } from 'preact/jsx-runtime';

interface Props extends Omit<JSX.HTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size'> {
  label: string;
  error?: string;
  type?: string;
}

export const Input = ({ 
  label, 
  error, 
  type = 'text',
  class: className,
  ...props 
}: Props) => {
  const baseInputClasses = `
    w-full rounded-md border border-gray-300 px-3 py-2 text-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500
    ${error ? 'border-red-500' : ''}
    ${className || ''}
  `;

  return (
    <div class="flex flex-col">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {props.required && <span class="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          {...props}
          class={`${baseInputClasses} min-h-[100px]`}
        />
      ) : (
        <input
          type={type}
          {...props}
          class={baseInputClasses}
        />
      )}
      
      {error && (
        <p class="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {props.placeholder && !error && (
        <p class="mt-1 text-sm text-gray-500">{props.placeholder}</p>
      )}
    </div>
  );
};