import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Assessment } from '@mui/icons-material';
import api from '../services/api';

interface Questionario {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  criado_em: string;
}

const Questionarios: React.FC = () => {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState<Questionario | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'rascunho',
    data_inicio: '',
    data_fim: '',
    anonimo: false,
  });

  useEffect(() => {
    carregarQuestionarios();
  }, []);

  const carregarQuestionarios = async () => {
    try {
      const response = await api.get('/questionarios');
      setQuestionarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
    }
  };

  const handleAbrirDialog = (questionario?: Questionario) => {
    if (questionario) {
      setQuestionarioSelecionado(questionario);
      setFormData({
        titulo: questionario.titulo,
        descricao: questionario.descricao,
        status: questionario.status,
        data_inicio: questionario.data_inicio,
        data_fim: questionario.data_fim,
        anonimo: false,
      });
    } else {
      setQuestionarioSelecionado(null);
      setFormData({
        titulo: '',
        descricao: '',
        status: 'rascunho',
        data_inicio: '',
        data_fim: '',
        anonimo: false,
      });
    }
    setDialogAberto(true);
  };

  const handleSalvar = async () => {
    try {
      if (questionarioSelecionado) {
        await api.put(`/questionarios/${questionarioSelecionado.id}`, formData);
      } else {
        await api.post('/questionarios', formData);
      }
      setDialogAberto(false);
      carregarQuestionarios();
    } catch (error) {
      console.error('Erro ao salvar questionário:', error);
    }
  };

  const handleDeletar = async (id: string) => {
    if (window.confirm('Deseja realmente deletar este questionário?')) {
      try {
        await api.delete(`/questionarios/${id}`);
        carregarQuestionarios();
      } catch (error) {
        console.error('Erro ao deletar questionário:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'success';
      case 'encerrado':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Questionários</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleAbrirDialog()}
        >
          Novo Questionário
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data Início</TableCell>
              <TableCell>Data Fim</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questionarios.map((questionario) => (
              <TableRow key={questionario.id}>
                <TableCell>{questionario.titulo}</TableCell>
                <TableCell>
                  <Chip
                    label={questionario.status}
                    color={getStatusColor(questionario.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {questionario.data_inicio
                    ? new Date(questionario.data_inicio).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  {questionario.data_fim
                    ? new Date(questionario.data_fim).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => window.location.href = `/questionarios/${questionario.id}/resultados`}
                  >
                    <Assessment />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleAbrirDialog(questionario)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeletar(questionario.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {questionarioSelecionado ? 'Editar Questionário' : 'Novo Questionário'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Título"
            fullWidth
            margin="normal"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />
          <TextField
            label="Descrição"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
          <TextField
            label="Status"
            fullWidth
            margin="normal"
            select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <MenuItem value="rascunho">Rascunho</MenuItem>
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="encerrado">Encerrado</MenuItem>
          </TextField>
          <TextField
            label="Data Início"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formData.data_inicio}
            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
          />
          <TextField
            label="Data Fim"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formData.data_fim}
            onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvar}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Questionarios;
