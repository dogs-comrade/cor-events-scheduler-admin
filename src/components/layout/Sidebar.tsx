import { h } from 'preact';
import { Link } from 'preact-router';
import { useState } from 'preact/hooks';

interface MenuItem {
  label: string;
  path: string;
  icon: () => h.JSX.Element;
  subItems?: MenuItem[];
}

export const Sidebar = () => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      label: 'Обзор',
      path: '/',
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      label: 'Расписания',
      path: '/schedules',
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      subItems: [
        { 
          label: 'Все расписания',
          path: '/schedules',
          icon: () => <span class="w-3 h-3 rounded-full bg-gray-400 mr-2" />
        },
        {
          label: 'Создать новое',
          path: '/schedules/new',
          icon: () => <span class="w-3 h-3 rounded-full bg-green-400 mr-2" />
        },
        {
          label: 'Архив',
          path: '/schedules/archive',
          icon: () => <span class="w-3 h-3 rounded-full bg-gray-300 mr-2" />
        }
      ]
    },
    {
      label: 'Анализ',
      path: '/analysis',
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      label: 'Настройки',
      path: '/settings',
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <aside class="w-64 bg-white shadow-lg min-h-screen flex flex-col">
      <div class="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">Event Scheduler</h1>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.path}>
            <Link
              href={item.subItems ? '#' : item.path}
              onClick={() => item.subItems && setActiveGroup(activeGroup === item.label ? null : item.label)}
              class={`
                group flex items-center px-3 py-2 text-base font-medium rounded-md
                ${window.location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                ${item.subItems ? 'justify-between' : ''}
              `}
            >
              <div class="flex items-center">
                <span class="mr-3">{item.icon()}</span>
                {item.label}
              </div>
              {item.subItems && (
                <svg
                  class={`h-5 w-5 transition-transform ${activeGroup === item.label ? 'transform rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              )}
            </Link>
            {item.subItems && activeGroup === item.label && (
              <div class="mt-1 ml-8 space-y-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.path}
                    href={subItem.path}
                    class={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${window.location.pathname === subItem.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    {subItem.icon && <span class="mr-2">{subItem.icon()}</span>}
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center">
          <img
            class="h-8 w-8 rounded-full"
            src="/api/placeholder/32/32"
            alt="User"
          />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-700">Администратор</p>
            <p class="text-xs text-gray-500">Онлайн</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
