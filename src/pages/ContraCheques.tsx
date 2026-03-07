import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, Snackbar, Tooltip, FormControl, InputLabel, Select
} from '@mui/material';
import { Download, CloudUpload, FilterAlt, Visibility } from '@mui/icons-material';
import { contrachequeService } from '../services/contrachequeService';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface ContraCheque {
  id: string;
  mes: number;
  ano: number;
  arquivo_url: string;
  criado_em: string;
  usuario?: {
    nome: string;
  };
}

interface Usuario {
  id: string;
  nome: string;
}

const meses = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
];

const ContraCheques: React.FC = () => {
  const { isRH, isAdmin } = useAuth();
  const [contracheques, setContracheques] = useState<ContraCheque[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState({ mes: '', ano: new Date().getFullYear(), usuario_id: '' });
  const [dialogUpload, setDialogUpload] = useState(false);
  const [dialogPreview, setDialogPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [uploadData, setUploadData] = useState({ usuario_id: '', mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), arquivo: null as File | null });
  const [snackbar, setSnackbar] = useState({ aberto: false, mensagem: '', tipo: 'success' as 'success' | 'error' });

  useEffect(() => {
    carregar();
    if (isRH || isAdmin) {
      carregarUsuarios();
    }
  }, []);

  const carregar = async () => {
    try {
      const r = await contrachequeService.listar(
        filtro.mes ? parseInt(filtro.mes) : undefined,
        filtro.ano ? filtro.ano : undefined,
        filtro.usuario_id || undefined
      );
      setContracheques(r.data);
    } catch { mostrarSnackbar('Erro ao carregar contracheques', 'error'); }
  };

  const carregarUsuarios = async () => {
    try {
      const r = await api.get('/usuarios');
      setUsuarios(r.data);
    } catch { console.error('Erro ao carregar usuários'); }
  };

  const mostrarSnackbar = (mensagem: string, tipo: 'success' | 'error') =>
    setSnackbar({ aberto: true, mensagem, tipo });

  const handleDownload = async (cc: ContraCheque) => {
    try {
      const res = await contrachequeService.download(cc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contracheque_${cc.mes}_${cc.ano}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { mostrarSnackbar('Erro ao baixar arquivo', 'error'); }
  };

  const handlePreview = async (cc: ContraCheque) => {
    try {
      const res = await contrachequeService.visualizar(cc.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      setPreviewUrl(url);
      setDialogPreview(true);
    } catch { mostrarSnackbar('Erro ao abrir visualização', 'error'); }
  };

  const handleFecharPreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setDialogPreview(false);
  };

  const handleUpload = async () => {
    if (!uploadData.usuario_id || !uploadData.arquivo) {
      mostrarSnackbar('Preencha todos os campos e selecione um arquivo', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('usuario_id', uploadData.usuario_id);
    formData.append('mes', uploadData.mes.toString());
    formData.append('ano', uploadData.ano.toString());
    formData.append('arquivo', uploadData.arquivo);

    setCarregando(true);
    try {
      await contrachequeService.upload(formData);
      mostrarSnackbar('Contracheque enviado com sucesso!', 'success');
      setDialogUpload(false);
      carregar();
    } catch (error: any) {
      mostrarSnackbar(error?.response?.data?.error || 'Erro ao enviar contracheque', 'error');
    } finally { setCarregando(false); }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Contra Cheques</Typography>
          <Typography variant="body2" color="text.secondary">Visualize e baixe seus contracheques mensais</Typography>
        </Box>
        {(isRH || isAdmin) && (
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setDialogUpload(true)}>
            Upload de Contracheque
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {(isRH || isAdmin) && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Colaborador</InputLabel>
            <Select
              value={filtro.usuario_id}
              label="Colaborador"
              onChange={(e) => setFiltro({ ...filtro, usuario_id: e.target.value as string })}
            >
              <MenuItem value="">Todos os Colaboradores</MenuItem>
              {usuarios.map(u => <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Mês</InputLabel>
          <Select
            value={filtro.mes}
            label="Mês"
            onChange={(e) => setFiltro({ ...filtro, mes: e.target.value as string })}
          >
            <MenuItem value="">Todos</MenuItem>
            {meses.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          label="Ano"
          type="number"
          size="small"
          value={filtro.ano}
          onChange={(e) => setFiltro({ ...filtro, ano: parseInt(e.target.value) })}
          sx={{ width: 100 }}
        />
        <Button variant="outlined" startIcon={<FilterAlt />} onClick={carregar}>Filtrar</Button>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {(isRH || isAdmin) && <TableCell>Colaborador</TableCell>}
              <TableCell>Referência</TableCell>
              <TableCell>Data de Upload</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracheques.length === 0 && (
              <TableRow>
                <TableCell colSpan={(isRH || isAdmin) ? 4 : 3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhum contracheque encontrado para o período selecionado.
                </TableCell>
              </TableRow>
            )}
            {contracheques.map((cc) => (
              <TableRow key={cc.id} hover>
                {(isRH || isAdmin) && (
                  <TableCell>
                    <Typography fontWeight={600}>{cc.usuario?.nome || '—'}</Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Typography fontWeight={isRH || isAdmin ? 400 : 600}>
                    {meses.find(m => m.value === cc.mes)?.label} / {cc.ano}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(cc.criado_em).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Visualizar">
                    <IconButton color="secondary" onClick={() => handlePreview(cc)} sx={{ mr: 1 }}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Baixar PDF">
                    <IconButton color="primary" onClick={() => handleDownload(cc)}>
                      <Download />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Visualização */}
      <Dialog open={dialogPreview} onClose={handleFecharPreview} maxWidth="lg" fullWidth>
        <DialogTitle>Visualização de Contracheque</DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '80vh', display: 'flex' }}>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title="Contracheque"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" width="100%">
              <Typography>Carregando visualização...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleFecharPreview}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogUpload} onClose={() => setDialogUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Upload de Contracheque</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <FormControl fullWidth>
              <InputLabel>Colaborador *</InputLabel>
              <Select
                value={uploadData.usuario_id}
                label="Colaborador *"
                onChange={(e) => setUploadData({ ...uploadData, usuario_id: e.target.value as string })}
              >
                {usuarios.map(u => <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>)}
              </Select>
            </FormControl>
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Mês</InputLabel>
                <Select
                  value={uploadData.mes}
                  label="Mês"
                  onChange={(e) => setUploadData({ ...uploadData, mes: e.target.value as number })}
                >
                  {meses.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Ano"
                type="number"
                fullWidth
                value={uploadData.ano}
                onChange={(e) => setUploadData({ ...uploadData, ano: parseInt(e.target.value) })}
              />
            </Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ py: 2, borderStyle: 'dashed' }}
            >
              {uploadData.arquivo ? uploadData.arquivo.name : 'Selecionar Arquivo PDF *'}
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => setUploadData({ ...uploadData, arquivo: e.target.files?.[0] || null })}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogUpload(false)} disabled={carregando}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpload} disabled={carregando}>
            {carregando ? 'Enviando...' : 'Enviar'}
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

export default ContraCheques;
