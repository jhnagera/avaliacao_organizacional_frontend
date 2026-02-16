import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, Snackbar, Tooltip
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import api from '../services/api';

interface Denuncia {
  id: string;
  categoria: string;
  descricao: string;
  status: 'pendente' | 'em_investigacao' | 'concluido' | 'arquivado';
  observacoes_internas: string;
  anonimo: boolean;
  usuario?: { nome: string };
  criado_em: string;
}

const categoriaLabel: Record<string, string> = {
  assedio: 'Assédio', discriminacao: 'Discriminação',
  corrupcao: 'Corrupção', violacao_codigo: 'Violação de Código', outro: 'Outro'
};
const statusCor: Record<string, any> = {
  pendente: 'warning', em_investigacao: 'info', concluido: 'success', arquivado: 'default'
};
const statusLabel: Record<string, string> = {
  pendente: 'Pendente', em_investigacao: 'Em Investigação', concluido: 'Concluído', arquivado: 'Arquivado'
};

const Denuncias: React.FC = () => {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Denuncia | null>(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [snackbar, setSnackbar] = useState({ aberto: false, mensagem: '', tipo: 'success' as 'success' | 'error' });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const r = await api.get('/denuncias');
      setDenuncias(r.data);
    } catch { mostrarSnackbar('Erro ao carregar denúncias', 'error'); }
  };

  const mostrarSnackbar = (mensagem: string, tipo: 'success' | 'error') =>
    setSnackbar({ aberto: true, mensagem, tipo });

  const handleAbrir = (denuncia: Denuncia) => {
    setSelecionado(denuncia);
    setNovoStatus(denuncia.status);
    setObservacoes(denuncia.observacoes_internas || '');
    setDialogAberto(true);
  };

  const handleSalvar = async () => {
    if (!selecionado) return;
    setCarregando(true);
    try {
      await api.put(`/denuncias/${selecionado.id}`, {
        status: novoStatus,
        observacoes_internas: observacoes
      });
      mostrarSnackbar('Denúncia atualizada com sucesso!', 'success');
      setDialogAberto(false);
      carregar();
    } catch { mostrarSnackbar('Erro ao atualizar denúncia', 'error'); }
    finally { setCarregando(false); }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Typography variant="h4">Canal de Denúncias</Typography>
        <Typography variant="body2" color="text.secondary">
          {denuncias.length} denúncia(s) registrada(s) — todas as denúncias são confidenciais
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Categoria</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {denuncias.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhuma denúncia registrada.
                </TableCell>
              </TableRow>
            )}
            {denuncias.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>
                  <Chip label={categoriaLabel[d.categoria] || d.categoria} size="small" color="default" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {d.descricao.length > 80 ? d.descricao.slice(0, 80) + '...' : d.descricao}
                  </Typography>
                </TableCell>
                <TableCell>
                  {d.anonimo
                    ? <Chip label="Anônimo" size="small" variant="outlined" />
                    : <Typography variant="body2">{d.usuario?.nome || '—'}</Typography>
                  }
                </TableCell>
                <TableCell>
                  <Chip label={statusLabel[d.status]} color={statusCor[d.status]} size="small" />
                </TableCell>
                <TableCell>{new Date(d.criado_em).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver / Atualizar">
                    <IconButton size="small" color="primary" onClick={() => handleAbrir(d)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes da Denúncia</DialogTitle>
        <DialogContent dividers>
          {selecionado && (
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField label="Categoria" fullWidth
                value={categoriaLabel[selecionado.categoria] || selecionado.categoria}
                InputProps={{ readOnly: true }} />
              <TextField label="Descrição" fullWidth multiline rows={5}
                value={selecionado.descricao} InputProps={{ readOnly: true }} />
              <TextField label="Identidade" fullWidth
                value={selecionado.anonimo ? 'Anônimo' : selecionado.usuario?.nome || '—'}
                InputProps={{ readOnly: true }} />
              <TextField label="Status" fullWidth select value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="em_investigacao">Em Investigação</MenuItem>
                <MenuItem value="concluido">Concluído</MenuItem>
                <MenuItem value="arquivado">Arquivado</MenuItem>
              </TextField>
              <TextField label="Observações Internas (confidencial)" fullWidth multiline rows={3}
                value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Anotações internas sobre a investigação..." />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogAberto(false)} disabled={carregando}>Fechar</Button>
          <Button variant="contained" onClick={handleSalvar} disabled={carregando}>
            {carregando ? 'Salvando...' : 'Atualizar'}
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

export default Denuncias;
