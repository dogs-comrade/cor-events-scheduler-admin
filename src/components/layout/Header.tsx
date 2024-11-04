import { h } from 'preact';

export const Header = () => {
  return (
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">
          Event Scheduler Admin
        </h1>
      </div>
    </header>
  );
};