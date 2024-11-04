import { h } from 'preact';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface Props {
  children: any;
}

export const Layout = ({ children }: Props) => {
  return (
    <div class="min-h-screen bg-gray-100">
      <Header />
      <div class="flex">
        <Sidebar />
        <main class="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};