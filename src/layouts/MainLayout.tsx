import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  return (
    <div className="relative min-h-screen bg-[#0b1120]">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0b1120 0%, #0f172a 30%, #1e3a5f 70%, #0f172a 100%)',
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          top: -80,
          right: -60,
          width: 280,
          height: 280,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          bottom: 80,
          left: 200,
          width: 200,
          height: 200,
          backgroundColor: 'rgba(250, 204, 21, 0.06)',
        }}
      />
      <div className="relative z-10">
        <Sidebar />
        <div className="pl-64">
          <Navbar />
          <main className="p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
