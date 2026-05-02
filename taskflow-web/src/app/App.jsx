// src/app/App.jsx

import { AuthProvider } from '../features/auth/useAuth';
import { ThemeProvider } from '../contexts/ThemeContext';
import AppRouter from './Router';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;