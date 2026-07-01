import { BrowserRouter } from 'react-router-dom';
import { AppDataProvider } from '@/hooks/useAppData';
import { AuthProvider } from '@/hooks/useAuth';
import { AppRoutes } from '@/routes';

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppDataProvider>
    </AuthProvider>
  );
}
