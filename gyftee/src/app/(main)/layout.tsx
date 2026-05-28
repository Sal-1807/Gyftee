import { Providers } from '@/components/layout/Providers';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0 relative z-10">
            {children}
          </main>
          <BottomNav />
        </div>
      </ToastProvider>
    </Providers>
  );
}
