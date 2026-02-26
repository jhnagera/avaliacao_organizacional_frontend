import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Questionarios from './pages/Questionarios';
import Usuarios from './pages/Usuarios';
import Departamentos from './pages/Departamentos';
import Avisos from './pages/Avisos';
import Reclamacoes from './pages/Reclamacoes';
import Denuncias from './pages/Denuncias';
import Empresas from './pages/Empresas';
import ResponderQuestionario from './pages/ResponderQuestionario';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/empresas" element={<Empresas />} />
                <Route path="/questionarios" element={<Questionarios />} />
                <Route path="/questionarios/:id/responder" element={<ResponderQuestionario />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/departamentos" element={<Departamentos />} />
                <Route path="/avisos" element={<Avisos />} />
                <Route path="/reclamacoes" element={<Reclamacoes />} />
                <Route path="/denuncias" element={<Denuncias />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
