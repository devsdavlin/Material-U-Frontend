import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InventarioProvider } from './context/InventarioContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <InventarioProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </InventarioProvider>
    </AuthProvider>
  );
}