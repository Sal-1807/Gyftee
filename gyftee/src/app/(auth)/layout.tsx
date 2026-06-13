import { Providers } from '@/components/layout/Providers';
import { ToastProvider } from '@/components/ui/Toast';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ToastProvider>
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </ToastProvider>
    </Providers>
  );
}
