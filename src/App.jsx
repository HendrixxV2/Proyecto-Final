import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/Routes/AppRoutes';
import { AuthProvider } from '@/Context/AuthContext';
import { ThemeProvider } from '@/Context/ThemeContext';
import { LanguageProvider } from '@/Context/LanguageContext';
import { A11yProvider } from '@/Context/A11yContext';
import { ToastProvider } from '@/Context/ToastContext';
import ErrorBoundary from '@/Components/Common/ErrorBoundary';
import AppIntro from '@/Components/Common/AppIntro';
import Toaster from '@/Components/UI/Toaster';

export default function App() {
  return (
    <ErrorBoundary>
      <AppIntro />
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <A11yProvider>
              <ToastProvider>
                <AuthProvider>
                  <AppRoutes />
                  <Toaster />
                </AuthProvider>
              </ToastProvider>
            </A11yProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}