import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
} from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (error: any) {
      setErro(error.message || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Anexo Tecnologia"
              sx={{
                width: '100%',
                maxWidth: '250px',
                height: 'auto',
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Avaliação Organizacional
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Faça login para acessar a plataforma
            </Typography>
          </Box>

          {erro && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erro}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Senha"
              type="password"
              fullWidth
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={carregando}
              sx={{ mb: 2 }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>

            <Divider sx={{ my: 2 }}>ou</Divider>

            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/denuncia-anonima')}
            >
              Fazer uma Denúncia Anônima
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
