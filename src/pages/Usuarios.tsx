import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, Snackbar, Tooltip, Avatar
} from '@mui/material';
import { Add, Edit, Delete, PersonOff, Person } from '@mui/icons-material';
import api from '../services/api';

interface Departamento {
  id: string;
  nome: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cargo: string;
  tipo: 'admin' | 'rh' | 'colaborador';
  ativo: boolean;
  departamento?: Departamento;
  criado_em: string;
}

const tipoLabel: Record<string, string> = {
  admin: 'Administrador',
  rh: 'RH',
  colaborador: 'Colaborador',
};

const tipoColor: Record<string, 'error' | 'warning' | 'info'> = {
  admin: 'error',
  rh: 'warning',
  colaborador: 'info',
};

const formVazio = {
  nome: '',
  email: '',
  senha: '',
  cpf: '',
  telefone: '',
  cargo: '',
  tipo: 'colaborador',
  departamento_id: '',
  ativo: true,
};

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({ ...formVazio });
  const [snackbar, setSnackbar] = useState({ aberto: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
    carregarDepartamentos();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch {
      mostrarSnackbar('Erro ao carregar usuários', 'error');
    }
  };

  const carregarDepartamentos = async () => {
    try {
      const response = await api.get('/departamentos');
      setDepartamentos(response.data);
    } catch {
      console.error('Erro ao carregar departamentos');
    }
  };

  const mostrarSnackbar = (mensagem: string, tipo: 'success' | 'error') => {
    setSnackbar({ aberto: true, mensagem, tipo });
  };

  const handleAbrirDialog = (usuario?: Usuario) => {
    if (usuario) {
      setUsuarioSelecionado(usuario);
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        senha: '',
        cpf: usuario.cpf || '',
        telefone: usuario.telefone || '',
        cargo: usuario.cargo || '',
        tipo: usuario.tipo,
        departamento_id: usuario.departamento?.id || '',
        ativo: usuario.ativo,
      });
    } else {
      setUsuarioSelecionado(null);
      setFormData({ ...formVazio });
    }
    setDialogAberto(true);
  };

  const handleSalvar = async () => {
    if (!formData.nome || !formData.email) {
      mostrarSnackbar('Nome e email são obrigatórios', 'error');
      return;
    }
    if (!usuarioSelecionado && !formData.senha) {
      mostrarSnackbar('Senha é obrigatória para novos usuários', 'error');
      return;
    }

    setCarregando(true);
    try {
      const payload: any = { ...formData };
      if (!payload.senha) delete payload.senha; // não enviar senha vazia na edição

      if (usuarioSelecionado) {
        await api.put(`/usuarios/${usuarioSelecionado.id}`, payload);
        mostrarSnackbar('Usuário atualizado com sucesso!', 'success');
      } else {
        await api.post('/usuarios', payload);
        mostrarSnackbar('Usuário criado com sucesso!', 'success');
      }
      setDialogAberto(false);
      carregarUsuarios();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao salvar usuário';
      mostrarSnackbar(msg, 'error');
    } finally {
      setCarregando(false);
    }
  };

  const handleToggleAtivo = async (usuario: Usuario) => {
    const acao = usuario.ativo ? 'desativar' : 'reativar';
    if (!window.confirm(`Deseja ${acao} o usuário ${usuario.nome}?`)) return;
    try {
      if (usuario.ativo) {
        await api.delete(`/usuarios/${usuario.id}`);
      } else {
        await api.put(`/usuarios/${usuario.id}`, { ativo: true });
      }
      mostrarSnackbar(`Usuário ${usuario.ativo ? 'desativado' : 'reativado'} com sucesso!`, 'success');
      carregarUsuarios();
    } catch {
      mostrarSnackbar('Erro ao alterar status do usuário', 'error');
    }
  };

  const iniciais = (nome: string) =>
    nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Usuários</Typography>
          <Typography variant="body2" color="text.secondary">
            {usuarios.length} usuário(s) cadastrado(s)
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleAbrirDialog()}>
          Novo Usuário
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Perfil</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhum usuário cadastrado. Clique em "Novo Usuário" para começar.
                </TableCell>
              </TableRow>
            )}
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id} hover sx={{ opacity: usuario.ativo ? 1 : 0.5 }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
                      {iniciais(usuario.nome)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{usuario.nome}</Typography>
                      <Typography variant="caption" color="text.secondary">{usuario.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{usuario.cargo || '—'}</TableCell>
                <TableCell>{usuario.departamento?.nome || '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={tipoLabel[usuario.tipo]}
                    color={tipoColor[usuario.tipo]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={usuario.ativo ? 'Ativo' : 'Inativo'}
                    color={usuario.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" color="primary" onClick={() => handleAbrirDialog(usuario)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={usuario.ativo ? 'Desativar' : 'Reativar'}>
                    <IconButton
                      size="small"
                      color={usuario.ativo ? 'error' : 'success'}
                      onClick={() => handleToggleAtivo(usuario)}
                    >
                      {usuario.ativo ? <PersonOff fontSize="small" /> : <Person fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Criar/Editar */}
      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {usuarioSelecionado ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Nome completo *"
              fullWidth
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            <TextField
              label="Email *"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!usuarioSelecionado}
              helperText={usuarioSelecionado ? 'Email não pode ser alterado' : ''}
            />
            <TextField
              label={usuarioSelecionado ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}
              type="password"
              fullWidth
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              helperText={!usuarioSelecionado ? 'Mínimo 6 caracteres' : ''}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="CPF"
                fullWidth
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
              <TextField
                label="Telefone"
                fullWidth
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </Box>
            <TextField
              label="Cargo"
              fullWidth
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              placeholder="Ex: Analista, Gerente..."
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Perfil de Acesso *"
                fullWidth
                select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <MenuItem value="colaborador">Colaborador</MenuItem>
                <MenuItem value="rh">RH</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </TextField>
              <TextField
                label="Departamento"
                fullWidth
                select
                value={formData.departamento_id}
                onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
              >
                <MenuItem value="">— Nenhum —</MenuItem>
                {departamentos.map((dep) => (
                  <MenuItem key={dep.id} value={dep.id}>{dep.nome}</MenuItem>
                ))}
              </TextField>
            </Box>
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

export default Usuarios;
