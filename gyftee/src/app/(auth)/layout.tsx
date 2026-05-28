import { Providers } from '@/components/layout/Providers';
import { ToastProvider } from '@/components/ui/Toast';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ToastProvider>
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          {children}
        </div>
      </ToastProvider>
    </Providers>
  );
}
