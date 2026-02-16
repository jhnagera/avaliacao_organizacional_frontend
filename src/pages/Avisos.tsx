import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, Snackbar, Tooltip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';

interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  criado_em: string;
}

const prioridadeCor: Record<string, 'success' | 'warning' | 'error'> = {
  baixa: 'success', media: 'warning', alta: 'error'
};
const prioridadeLabel: Record<string, string> = {
  baixa: 'Baixa', media: 'Média', alta: 'Alta'
};

const formVazio = { titulo: '', conteudo: '', prioridade: 'media', data_inicio: '', data_fim: '' };

const Avisos: React.FC = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Aviso | null>(null);
  const [formData, setFormData] = useState({ ...formVazio });
  const [carregando, setCarregando] = useState(false);
  const [snackbar, setSnackbar] = useState({ aberto: false, mensagem: '', tipo: 'success' as 'success' | 'error' });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const r = await api.get('/avisos');
      setAvisos(r.data);
    } catch { mostrarSnackbar('Erro ao carregar avisos', 'error'); }
  };

  const mostrarSnackbar = (mensagem: string, tipo: 'success' | 'error') =>
    setSnackbar({ aberto: true, mensagem, tipo });

  const handleAbrir = (aviso?: Aviso) => {
    if (aviso) {
      setSelecionado(aviso);
      setFormData({
        titulo: aviso.titulo,
        conteudo: aviso.conteudo,
        prioridade: aviso.prioridade,
        data_inicio: aviso.data_inicio?.slice(0, 10) || '',
        data_fim: aviso.data_fim?.slice(0, 10) || '',
      });
    } else {
      setSelecionado(null);
      setFormData({ ...formVazio });
    }
    setDialogAberto(true);
  };

  const handleSalvar = async () => {
    if (!formData.titulo.trim() || !formData.conteudo.trim()) {
      mostrarSnackbar('Título e conteúdo são obrigatórios', 'error');
      return;
    }
    setCarregando(true);
    try {
      if (selecionado) {
        await api.put(`/avisos/${selecionado.id}`, formData);
        mostrarSnackbar('Aviso atualizado com sucesso!', 'success');
      } else {
        await api.post('/avisos', formData);
        mostrarSnackbar('Aviso criado com sucesso!', 'success');
      }
      setDialogAberto(false);
      carregar();
    } catch (error: any) {
      mostrarSnackbar(error?.response?.data?.error || 'Erro ao salvar aviso', 'error');
    } finally { setCarregando(false); }
  };

  const handleDeletar = async (aviso: Aviso) => {
    if (!window.confirm(`Deseja excluir o aviso "${aviso.titulo}"?`)) return;
    try {
      await api.delete(`/avisos/${aviso.id}`);
      mostrarSnackbar('Aviso excluído com sucesso!', 'success');
      carregar();
    } catch { mostrarSnackbar('Erro ao excluir aviso', 'error'); }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Avisos</Typography>
          <Typography variant="body2" color="text.secondary">{avisos.length} aviso(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleAbrir()}>Novo Aviso</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {avisos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhum aviso cadastrado. Clique em "Novo Aviso" para começar.
                </TableCell>
              </TableRow>
            )}
            {avisos.map((aviso) => (
              <TableRow key={aviso.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{aviso.titulo}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {aviso.conteudo.length > 60 ? aviso.conteudo.slice(0, 60) + '...' : aviso.conteudo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={prioridadeLabel[aviso.prioridade]} color={prioridadeCor[aviso.prioridade]} size="small" />
                </TableCell>
                <TableCell>{aviso.data_inicio ? new Date(aviso.data_inicio).toLocaleDateString('pt-BR') : '—'}</TableCell>
                <TableCell>{aviso.data_fim ? new Date(aviso.data_fim).toLocaleDateString('pt-BR') : '—'}</TableCell>
                <TableCell>
                  <Chip label={aviso.ativo ? 'Ativo' : 'Inativo'} color={aviso.ativo ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" color="primary" onClick={() => handleAbrir(aviso)}><Edit fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => handleDeletar(aviso)}><Delete fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selecionado ? 'Editar Aviso' : 'Novo Aviso'}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField label="Título *" fullWidth value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} autoFocus />
            <TextField label="Conteúdo *" fullWidth multiline rows={4} value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })} />
            <TextField label="Prioridade" fullWidth select value={formData.prioridade}
              onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}>
              <MenuItem value="baixa">Baixa</MenuItem>
              <MenuItem value="media">Média</MenuItem>
              <MenuItem value="alta">Alta</MenuItem>
            </TextField>
            <Box display="flex" gap={2}>
              <TextField label="Data Início" type="date" fullWidth InputLabelProps={{ shrink: true }}
                value={formData.data_inicio} onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} />
              <TextField label="Data Fim" type="date" fullWidth InputLabelProps={{ shrink: true }}
                value={formData.data_fim} onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogAberto(false)} disabled={carregando}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvar} disabled={carregando}>
            {carregando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.aberto} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, aberto: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.tipo} onClose={() => setSnackbar({ ...snackbar, aberto: false })}>
          {snackbar.mensagem}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Avisos;
