import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Snackbar, Tooltip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';

interface Departamento {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  criado_em: string;
}

const formVazio = { nome: '', descricao: '' };

const Departamentos: React.FC = () => {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Departamento | null>(null);
  const [formData, setFormData] = useState({ ...formVazio });
  const [carregando, setCarregando] = useState(false);
  const [snackbar, setSnackbar] = useState({ aberto: false, mensagem: '', tipo: 'success' as 'success' | 'error' });

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const response = await api.get('/departamentos');
      setDepartamentos(response.data);
    } catch {
      mostrarSnackbar('Erro ao carregar departamentos', 'error');
    }
  };

  const mostrarSnackbar = (mensagem: string, tipo: 'success' | 'error') => {
    setSnackbar({ aberto: true, mensagem, tipo });
  };

  const handleAbrir = (dep?: Departamento) => {
    if (dep) {
      setSelecionado(dep);
      setFormData({ nome: dep.nome, descricao: dep.descricao || '' });
    } else {
      setSelecionado(null);
      setFormData({ ...formVazio });
    }
    setDialogAberto(true);
  };

  const handleSalvar = async () => {
    if (!formData.nome.trim()) {
      mostrarSnackbar('O nome do departamento é obrigatório', 'error');
      return;
    }
    setCarregando(true);
    try {
      if (selecionado) {
        await api.put(`/departamentos/${selecionado.id}`, formData);
        mostrarSnackbar('Departamento atualizado com sucesso!', 'success');
      } else {
        await api.post('/departamentos', formData);
        mostrarSnackbar('Departamento criado com sucesso!', 'success');
      }
      setDialogAberto(false);
      carregar();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao salvar departamento';
      mostrarSnackbar(msg, 'error');
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletar = async (dep: Departamento) => {
    if (!window.confirm(`Deseja desativar o departamento "${dep.nome}"?`)) return;
    try {
      await api.delete(`/departamentos/${dep.id}`);
      mostrarSnackbar('Departamento desativado com sucesso!', 'success');
      carregar();
    } catch {
      mostrarSnackbar('Erro ao desativar departamento', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Departamentos</Typography>
          <Typography variant="body2" color="text.secondary">
            {departamentos.length} departamento(s) cadastrado(s)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleAbrir()}>
          Novo Departamento
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departamentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhum departamento cadastrado. Clique em "Novo Departamento" para começar.
                </TableCell>
              </TableRow>
            )}
            {departamentos.map((dep) => (
              <TableRow key={dep.id} hover sx={{ opacity: dep.ativo ? 1 : 0.5 }}>
                <TableCell>
                  <Typography fontWeight={600}>{dep.nome}</Typography>
                </TableCell>
                <TableCell>{dep.descricao || '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={dep.ativo ? 'Ativo' : 'Inativo'}
                    color={dep.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(dep.criado_em).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" color="primary" onClick={() => handleAbrir(dep)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Desativar">
                    <IconButton size="small" color="error" onClick={() => handleDeletar(dep)} disabled={!dep.ativo}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selecionado ? 'Editar Departamento' : 'Novo Departamento'}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Nome do Departamento *"
              fullWidth
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Recursos Humanos, TI, Financeiro..."
              autoFocus
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva as responsabilidades deste departamento..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogAberto(false)} disabled={carregando}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSalvar} disabled={carregando}>
            {carregando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.aberto}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, aberto: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.tipo} onClose={() => setSnackbar({ ...snackbar, aberto: false })}>
          {snackbar.mensagem}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Departamentos;
