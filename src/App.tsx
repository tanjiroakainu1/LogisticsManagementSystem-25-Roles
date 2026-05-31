import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { FloatingChatbot } from '@/components/chat/FloatingChatbot';
import AppRoutes from '@/routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <AppRoutes />
          <FloatingChatbot />
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  );
}
