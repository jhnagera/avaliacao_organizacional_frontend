import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Snackbar, Tooltip, Stepper, Step, StepLabel
} from '@mui/material';
import { Add, Edit, Delete, Business, PersonAdd } from '@mui/icons-material';
import api from '../services/api';

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  razao_social: string;
  endereco: string;
  telefone: string;
  email: string;
  ativo: boolean;
  criado_em: string;
}

const formEmpresaVazio = {
  nome: '',
  cnpj: '',
  razao_social: '',
  endereco: '',
  telefone: '',
  email: ''
};

const formAdminVazio = {
  nome: '',
  email: '',
  senha: ''
};

const Empresas: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Empresa | null>(null);
  const [etapaAtual, setEtapaAtual] = useState(0);
  
  const [formEmpresa, setFormEmpresa] = useState({ ...formEmpresaVazio });
  const [formAdmin, setFormAdmin] = useState({ ...formAdminVazio });
  
  const [carregando, setCarregando] = useState(false);
  const [snackbar, setSnackbar] = useState({ aberto: false, mensagem: '', tipo: 'success' as 'success' | 'error' });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const response = await api.get('/empresas');
      setEmpresas(response.data);
    } catch { mostrarSnackbar('Erro ao carregar empresas', 'error'); }
  };

  const mostrarSnackbar = (mensagem: string, tipo: 'success' | 'error') =>
    setSnackbar({ aberto: true, mensagem, tipo });

  const handleAbrir = (empresa?: Empresa) => {
    if (empresa) {
      setSelecionado(empresa);
      setFormEmpresa({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        razao_social: empresa.razao_social || '',
        endereco: empresa.endereco || '',
        telefone: empresa.telefone || '',
        email: empresa.email || ''
      });
      setFormAdmin({ ...formAdminVazio });
      setEtapaAtual(0);
    } else {
      setSelecionado(null);
      setFormEmpresa({ ...formEmpresaVazio });
      setFormAdmin({ ...formAdminVazio });
      setEtapaAtual(0);
    }
    setDialogAberto(true);
  };

  const handleProximaEtapa = () => {
    if (!formEmpresa.nome || !formEmpresa.cnpj) {
      mostrarSnackbar('Nome e CNPJ são obrigatórios', 'error');
      return;
    }
    setEtapaAtual(1);
  };

  const handleSalvar = async () => {
    if (selecionado) {
      setCarregando(true);
      try {
        await api.put(`/empresas/${selecionado.id}`, formEmpresa);
        mostrarSnackbar('Empresa atualizada com sucesso!', 'success');
        setDialogAberto(false);
        carregar();
      } catch (error: any) {
        mostrarSnackbar(error?.response?.data?.error || 'Erro ao atualizar empresa', 'error');
      } finally { setCarregando(false); }
      return;
    }

    if (!formAdmin.nome || !formAdmin.email || !formAdmin.senha) {
      mostrarSnackbar('Todos os campos do administrador são obrigatórios', 'error');
      return;
    }

    setCarregando(true);
    try {
      await api.post('/empresas', { ...formEmpresa, admin_inicial: formAdmin });
      mostrarSnackbar('Empresa e administrador criados com sucesso!', 'success');
      setDialogAberto(false);
      carregar();
    } catch (error: any) {
      mostrarSnackbar(error?.response?.data?.error || 'Erro ao criar empresa', 'error');
    } finally { setCarregando(false); }
  };

  const handleDesativar = async (empresa: Empresa) => {
    if (!window.confirm(`Deseja desativar "${empresa.nome}"? Usuários perderão acesso.`)) return;
    try {
      await api.delete(`/empresas/${empresa.id}`);
      mostrarSnackbar('Empresa desativada!', 'success');
      carregar();
    } catch { mostrarSnackbar('Erro ao desativar empresa', 'error'); }
  };

  const formatarCNPJ = (cnpj: string) => {
    const n = cnpj.replace(/\D/g, '');
    return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const etapas = selecionado ? ['Dados da Empresa'] : ['Dados da Empresa', 'Admin Inicial'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Empresas (Multi-Tenant)</Typography>
          <Typography variant="body2" color="text.secondary">
            {empresas.length} empresa(s) · Super Admin
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleAbrir()}>Nova Empresa</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Empresa</TableCell>
              <TableCell>CNPJ</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Criada em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {empresas.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                Nenhuma empresa cadastrada.
              </TableCell></TableRow>
            )}
            {empresas.map((e) => (
              <TableRow key={e.id} hover sx={{ opacity: e.ativo ? 1 : 0.5 }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Business color="primary" />
                    <Box>
                      <Typography fontWeight={600}>{e.nome}</Typography>
                      <Typography variant="caption" color="text.secondary">{e.razao_social || '—'}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="body2" fontFamily="monospace">{formatarCNPJ(e.cnpj)}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2">{e.email || '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{e.telefone || '—'}</Typography>
                </TableCell>
                <TableCell><Chip label={e.ativo ? 'Ativa' : 'Inativa'} color={e.ativo ? 'success' : 'default'} size="small" /></TableCell>
                <TableCell>{new Date(e.criado_em).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => handleAbrir(e)}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Desativar"><IconButton size="small" color="error" onClick={() => handleDesativar(e)} disabled={!e.ativo}><Delete fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selecionado ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        {!selecionado && <Box px={3} pt={2}><Stepper activeStep={etapaAtual}>{etapas.map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}</Stepper></Box>}
        <DialogContent dividers>
          {etapaAtual === 0 && (
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <Typography variant="subtitle2" color="primary" fontWeight={600}>Dados da Empresa</Typography>
              <TextField label="Nome *" fullWidth value={formEmpresa.nome} onChange={e => setFormEmpresa({...formEmpresa, nome: e.target.value})} autoFocus />
              <TextField label="CNPJ *" fullWidth value={formEmpresa.cnpj} onChange={e => setFormEmpresa({...formEmpresa, cnpj: e.target.value})} placeholder="00.000.000/0001-00" />
              <TextField label="Razão Social" fullWidth value={formEmpresa.razao_social} onChange={e => setFormEmpresa({...formEmpresa, razao_social: e.target.value})} />
              <TextField label="Endereço" fullWidth value={formEmpresa.endereco} onChange={e => setFormEmpresa({...formEmpresa, endereco: e.target.value})} />
              <Box display="flex" gap={2}>
                <TextField label="Telefone" fullWidth value={formEmpresa.telefone} onChange={e => setFormEmpresa({...formEmpresa, telefone: e.target.value})} placeholder="(11) 99999-9999" />
                <TextField label="Email" fullWidth value={formEmpresa.email} onChange={e => setFormEmpresa({...formEmpresa, email: e.target.value})} />
              </Box>
            </Box>
          )}
          {etapaAtual === 1 && !selecionado && (
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PersonAdd color="primary" />
                <Typography variant="subtitle2" color="primary" fontWeight={600}>Administrador Inicial</Typography>
              </Box>
              <Alert severity="info" sx={{mb:1}}>Este será o primeiro admin. Poderá criar outros usuários.</Alert>
              <TextField label="Nome *" fullWidth value={formAdmin.nome} onChange={e => setFormAdmin({...formAdmin, nome: e.target.value})} autoFocus />
              <TextField label="Email *" fullWidth value={formAdmin.email} onChange={e => setFormAdmin({...formAdmin, email: e.target.value})} />
              <TextField label="Senha *" type="password" fullWidth value={formAdmin.senha} onChange={e => setFormAdmin({...formAdmin, senha: e.target.value})} helperText="Mínimo 6 caracteres" />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{p:2, gap:1}}>
          <Button onClick={() => setDialogAberto(false)} disabled={carregando}>Cancelar</Button>
          {!selecionado && etapaAtual === 0 && <Button variant="contained" onClick={handleProximaEtapa}>Próximo</Button>}
          {!selecionado && etapaAtual === 1 && (
            <>
              <Button onClick={() => setEtapaAtual(0)} disabled={carregando}>Voltar</Button>
              <Button variant="contained" onClick={handleSalvar} disabled={carregando}>{carregando ? 'Criando...' : 'Criar'}</Button>
            </>
          )}
          {selecionado && <Button variant="contained" onClick={handleSalvar} disabled={carregando}>{carregando ? 'Salvando...' : 'Salvar'}</Button>}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.aberto} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, aberto: false})} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}>
        <Alert severity={snackbar.tipo}>{snackbar.mensagem}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Empresas;
