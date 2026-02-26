import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  PeopleOutline,
  AssignmentOutlined,
  AnnouncementOutlined,
  FeedbackOutlined,
  PlayCircleOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface DashboardStats {
  total_usuarios: number;
  questionarios_ativos: number;
  avisos_ativos: number;
  reclamacoes_pendentes: number;
}

const Dashboard: React.FC = () => {
  const { usuario, isRH } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    total_usuarios: 0,
    questionarios_ativos: 0,
    avisos_ativos: 0,
    reclamacoes_pendentes: 0,
  });

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      // Busca dados dependendo do tipo de permissão
      const promises: Promise<any>[] = [
        api.get('/questionarios'),
        api.get('/avisos'),
      ];

      if (isRH) {
        promises.push(api.get('/usuarios'));
        promises.push(api.get('/reclamacoes'));
      }

      const results = await Promise.all(promises);
      const questionarios = results[0];
      const avisos = results[1];
      const usuarios = isRH ? results[2] : { data: [] };
      const reclamacoes = isRH ? results[3] : { data: [] };

      setStats({
        total_usuarios: usuarios.data.length,
        questionarios_ativos: questionarios.data.filter((q: any) => q.status === 'ativo').length,
        avisos_ativos: avisos.data.length,
        reclamacoes_pendentes: reclamacoes.data.filter((r: any) => r.status === 'pendente').length,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.lighter`,
              color: `${color}.main`,
              borderRadius: 2,
              p: 2,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bem-vindo(a), {usuario?.nome}!
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 4 }}>
        Visão geral da plataforma
      </Typography>

      <Grid container spacing={3}>
        {isRH && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Usuários Cadastrados"
              value={stats.total_usuarios}
              icon={<PeopleOutline fontSize="large" />}
              color="primary"
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Questionários Ativos"
            value={stats.questionarios_ativos}
            icon={<AssignmentOutlined fontSize="large" />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avisos Ativos"
            value={stats.avisos_ativos}
            icon={<AnnouncementOutlined fontSize="large" />}
            color="info"
          />
        </Grid>

        {isRH && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Reclamações Pendentes"
              value={stats.reclamacoes_pendentes}
              icon={<FeedbackOutlined fontSize="large" />}
              color="warning"
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Use o menu lateral para navegar entre os módulos da plataforma
              </Typography>
            </Box>

            {!isRH && (
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PlayCircleOutline />}
                  onClick={() => navigate('/questionarios')}
                >
                  Responder Questionários
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
