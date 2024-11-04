export const NotFound = () => (
    <div class="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div class="max-w-max mx-auto">
        <main class="sm:flex">
          <p class="text-4xl font-extrabold text-blue-600 sm:text-5xl">404</p>
          <div class="sm:ml-6">
            <div class="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                Страница не найдена
              </h1>
              <p class="mt-2 text-base text-gray-500">
                Проверьте правильность введенного адреса или вернитесь на главную.
              </p>
            </div>
            <div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <a
                href="/"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                На главную
              </a>
              <a
                href="/schedules"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                К расписаниям
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );