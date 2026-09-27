import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InventarioProvider } from './context/InventarioContext';
import { ToastProvider } from './context/ToastContext';
import { LoadingProvider } from './context/LoadingContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <InventarioProvider>
        <BrowserRouter>
          <ToastProvider>
            <LoadingProvider>
              <AppRoutes />
            </LoadingProvider>
          </ToastProvider>
        </BrowserRouter>
      </InventarioProvider>
    </AuthProvider>
  );
}