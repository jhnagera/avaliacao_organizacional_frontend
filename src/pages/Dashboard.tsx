import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  PeopleOutline,
  AssignmentOutlined,
  AnnouncementOutlined,
  FeedbackOutlined,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface DashboardStats {
  total_usuarios: number;
  questionarios_ativos: number;
  avisos_ativos: number;
  reclamacoes_pendentes: number;
}

const Dashboard: React.FC = () => {
  const { usuario } = useAuth();
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
      // Simulação de carregamento - você pode implementar endpoints específicos
      const [usuarios, questionarios, avisos, reclamacoes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/questionarios'),
        api.get('/avisos'),
        api.get('/reclamacoes'),
      ]);

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
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuários Cadastrados"
            value={stats.total_usuarios}
            icon={<PeopleOutline fontSize="large" />}
            color="primary"
          />
        </Grid>

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

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Reclamações Pendentes"
            value={stats.reclamacoes_pendentes}
            icon={<FeedbackOutlined fontSize="large" />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ações Rápidas
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Use o menu lateral para navegar entre os módulos da plataforma
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
