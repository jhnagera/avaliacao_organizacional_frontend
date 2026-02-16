import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, Snackbar, Tooltip, Tabs, Tab
} from '@mui/material';
import { Visibility, Edit } from '@mui/icons-material';
import api from '../services/api';

interface Reclamacao {
  id: string;
  tipo: 'reclamacao' | 'sugestao';
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_analise' | 'resolvido' | 'rejeitado';
  resposta_rh: string;
  anonimo: boolean;
  usuario?: { nome: string; email: string };
  criado_em: string;
}

const statusCor: Record<string, any> = {
  pendente: 'warning', em_analise: 'info', resolvido: 'success', rejeitado: 'error'
};
const statusLabel: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', resolvido: 'Resolvido', rejeitado: 'Rejeitado'
};

const Reclamacoes: React.FC = () => {
  const [itens, setItens] = useState<Reclamacao[]>([]);
  const [aba, setAba] = useState(0);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Reclamacao | null>(null);
  const [respostaRh, setRespostaRh] = useState('');
  const [novoStatus, setNovoStatus] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [snackbar, setSnackbar] = useState({ aberto: false, mensagem: '', tipo: 'success' as 'success' | 'error' });

  useEffect(() => { carregar(); }, [aba]);

  const carregar = async () => {
    try {
      const tipo = aba === 0 ? 'reclamacao' : 'sugestao';
      const r = await api.get(`/reclamacoes?tipo=${tipo}`);
      setItens(r.data);
    } catch { mostrarSnackbar('Erro ao carregar registros', 'error'); }
  };

  const mostrarSnackbar = (mensagem: string, tipo: 'success' | 'error') =>
    setSnackbar({ aberto: true, mensagem, tipo });

  const handleAbrir = (item: Reclamacao) => {
    setSelecionado(item);
    setRespostaRh(item.resposta_rh || '');
    setNovoStatus(item.status);
    setDialogAberto(true);
  };

  const handleSalvar = async () => {
    if (!selecionado) return;
    setCarregando(true);
    try {
      await api.put(`/reclamacoes/${selecionado.id}`, {
        status: novoStatus,
        resposta_rh: respostaRh
      });
      mostrarSnackbar('Atualizado com sucesso!', 'success');
      setDialogAberto(false);
      carregar();
    } catch { mostrarSnackbar('Erro ao atualizar', 'error'); }
    finally { setCarregando(false); }
  };

  const tipoAtual = aba === 0 ? 'reclamacao' : 'sugestao';
  const itensFiltrados = itens.filter(i => i.tipo === tipoAtual);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" mb={3}>Reclamações e Sugestões</Typography>

      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 2 }}>
        <Tab label="Reclamações" />
        <Tab label="Sugestões" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itensFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhuma {aba === 0 ? 'reclamação' : 'sugestão'} registrada.
                </TableCell>
              </TableRow>
            )}
            {itensFiltrados.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{item.titulo}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.descricao.length > 60 ? item.descricao.slice(0, 60) + '...' : item.descricao}
                  </Typography>
                </TableCell>
                <TableCell>
                  {item.anonimo ? (
                    <Chip label="Anônimo" size="small" variant="outlined" />
                  ) : (
                    <Typography variant="body2">{item.usuario?.nome || '—'}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={statusLabel[item.status]} color={statusCor[item.status]} size="small" />
                </TableCell>
                <TableCell>{new Date(item.criado_em).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver / Responder">
                    <IconButton size="small" color="primary" onClick={() => handleAbrir(item)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de detalhe + resposta */}
      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes / Resposta do RH</DialogTitle>
        <DialogContent dividers>
          {selecionado && (
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField label="Título" fullWidth value={selecionado.titulo} InputProps={{ readOnly: true }} />
              <TextField label="Descrição" fullWidth multiline rows={4} value={selecionado.descricao} InputProps={{ readOnly: true }} />
              <TextField label="Autor" fullWidth
                value={selecionado.anonimo ? 'Anônimo' : selecionado.usuario?.nome || '—'}
                InputProps={{ readOnly: true }} />
              <TextField label="Status" fullWidth select value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="em_analise">Em Análise</MenuItem>
                <MenuItem value="resolvido">Resolvido</MenuItem>
                <MenuItem value="rejeitado">Rejeitado</MenuItem>
              </TextField>
              <TextField label="Resposta do RH" fullWidth multiline rows={3}
                value={respostaRh} onChange={(e) => setRespostaRh(e.target.value)}
                placeholder="Digite a resposta ou observação do RH..." />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogAberto(false)} disabled={carregando}>Fechar</Button>
          <Button variant="contained" onClick={handleSalvar} disabled={carregando}>
            {carregando ? 'Salvando...' : 'Salvar Resposta'}
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

export default Reclamacoes;
