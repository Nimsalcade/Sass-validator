import { TRPCProvider } from '@/client/trpc-provider';
import { AuthProvider } from '@/client/auth-provider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}