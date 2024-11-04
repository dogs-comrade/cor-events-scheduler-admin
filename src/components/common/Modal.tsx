import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: Props) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setIsShowing(false), 200);
    }
  }, [isOpen]);

  if (!isShowing) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div
      class={`
        fixed inset-0 z-50 overflow-y-auto
        ${isOpen ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-200 ease-in-out
      `}
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          class="fixed inset-0 transition-opacity"
          onClick={onClose}
        >
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Center modal */}
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          class={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl
            transform transition-all sm:my-8 sm:align-middle w-full
            ${sizeClasses[size]}
            ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* Header */}
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 sm:px-6">
            <div class="flex items-center justify-between">
              <h3
                class="text-lg leading-6 font-medium text-gray-900"
                id="modal-headline"
              >
                {title}
              </h3>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span class="sr-only">Close</span>
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};