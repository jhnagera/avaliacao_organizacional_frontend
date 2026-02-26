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
  Grid,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Add, Edit, Delete, Assessment } from '@mui/icons-material';
import api from '../services/api';

interface Questionario {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  tipo: string;
  destinatario_tipo: string;
  departamento_id?: string;
  usuario_id?: string;
  data_inicio: string;
  data_fim: string;
  criado_em: string;
  departamento?: { nome: string };
  usuario?: { nome: string };
  questoes?: Questao[];
}

interface Questao {
  id?: string;
  pergunta: string;
  tipo: string;
  obrigatoria: boolean;
  opcoes?: Opcao[];
}

interface Opcao {
  id?: string;
  texto: string;
  valor?: number;
}

interface Departamento {
  id: string;
  nome: string;
}

interface Usuario {
  id: string;
  nome: string;
}

const Questionarios: React.FC = () => {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState<Questionario | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'rascunho',
    tipo: 'pesquisa_clima',
    destinatario_tipo: 'todos',
    departamento_id: '',
    usuario_id: '',
    data_inicio: '',
    data_fim: '',
    anonimo: false,
    questoes: [] as Questao[],
  });

  useEffect(() => {
    carregarQuestionarios();
    carregarDepartamentos();
    carregarUsuarios();
  }, []);

  const carregarQuestionarios = async () => {
    try {
      const response = await api.get('/questionarios');
      setQuestionarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
    }
  };

  const carregarDepartamentos = async () => {
    try {
      const response = await api.get('/departamentos');
      setDepartamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleAbrirDialog = (questionario?: Questionario) => {
    if (questionario) {
      setQuestionarioSelecionado(questionario);
      setFormData({
        titulo: questionario.titulo,
        descricao: questionario.descricao,
        status: questionario.status,
        tipo: questionario.tipo || 'pesquisa_clima',
        destinatario_tipo: questionario.destinatario_tipo || 'todos',
        departamento_id: questionario.departamento_id || '',
        usuario_id: questionario.usuario_id || '',
        data_inicio: questionario.data_inicio ? questionario.data_inicio.split('T')[0] : '',
        data_fim: questionario.data_fim ? questionario.data_fim.split('T')[0] : '',
        anonimo: false,
        questoes: questionario.questoes || [],
      });
    } else {
      setQuestionarioSelecionado(null);
      setFormData({
        titulo: '',
        descricao: '',
        status: 'rascunho',
        tipo: 'pesquisa_clima',
        destinatario_tipo: 'todos',
        departamento_id: '',
        usuario_id: '',
        data_inicio: '',
        data_fim: '',
        anonimo: false,
        questoes: [],
      });
    }
    setDialogAberto(true);
  };

  const handleAdicionarQuestao = () => {
    setFormData({
      ...formData,
      questoes: [
        ...formData.questoes,
        { pergunta: '', tipo: 'multipla_escolha', obrigatoria: true, opcoes: [] }
      ]
    });
  };

  const handleRemoverQuestao = (index: number) => {
    const novasQuestoes = [...formData.questoes];
    novasQuestoes.splice(index, 1);
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const handleQuestaoChange = (index: number, field: string, value: any) => {
    const novasQuestoes = [...formData.questoes];
    (novasQuestoes[index] as any)[field] = value;

    // Se mudar o tipo para escala, limpa as opções
    if (field === 'tipo' && (value === 'escala' || value === 'texto_livre')) {
      novasQuestoes[index].opcoes = [];
    }

    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const handleAdicionarOpcao = (questaoIndex: number) => {
    const novasQuestoes = [...formData.questoes];
    const questao = novasQuestoes[questaoIndex];
    if (!questao.opcoes) questao.opcoes = [];
    questao.opcoes.push({ texto: '', valor: questao.opcoes.length + 1 });
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const handleRemoverOpcao = (questaoIndex: number, opcaoIndex: number) => {
    const novasQuestoes = [...formData.questoes];
    novasQuestoes[questaoIndex].opcoes?.splice(opcaoIndex, 1);
    setFormData({ ...formData, questoes: novasQuestoes });
  };

  const handleOpcaoChange = (questaoIndex: number, opcaoIndex: number, field: string, value: any) => {
    const novasQuestoes = [...formData.questoes];
    const opcao = novasQuestoes[questaoIndex].opcoes![opcaoIndex];
    (opcao as any)[field] = value;
    setFormData({ ...formData, questoes: novasQuestoes });
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
              <TableCell>Tipo</TableCell>
              <TableCell>Destinatário</TableCell>
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
                <TableCell>{questionario.tipo?.replace('_', ' ')}</TableCell>
                <TableCell>
                  {questionario.destinatario_tipo === 'todos' && 'Todos'}
                  {questionario.destinatario_tipo === 'departamento' && `Depto: ${questionario.departamento?.nome || '?'}`}
                  {questionario.destinatario_tipo === 'individual' && `Colab: ${questionario.usuario?.nome || '?'}`}
                </TableCell>
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

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="md" fullWidth>
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
            label="Tipo de Questionário"
            fullWidth
            margin="normal"
            select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          >
            <MenuItem value="pesquisa_clima">Pesquisa de Clima</MenuItem>
            <MenuItem value="avaliacao_desempenho">Avaliação de Desempenho</MenuItem>
            <MenuItem value="feedback">Feedback</MenuItem>
            <MenuItem value="saude_mental">Saúde Mental</MenuItem>
            <MenuItem value="outro">Outro</MenuItem>
          </TextField>

          <TextField
            label="Destinatário"
            fullWidth
            margin="normal"
            select
            value={formData.destinatario_tipo}
            onChange={(e) => setFormData({ ...formData, destinatario_tipo: e.target.value, departamento_id: '', usuario_id: '' })}
          >
            <MenuItem value="todos">Todos os Colaboradores</MenuItem>
            <MenuItem value="departamento">Departamento Específico</MenuItem>
            <MenuItem value="individual">Colaborador Individual</MenuItem>
          </TextField>

          {formData.destinatario_tipo === 'departamento' && (
            <TextField
              label="Selecionar Departamento"
              fullWidth
              margin="normal"
              select
              value={formData.departamento_id}
              onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
            >
              {departamentos.map((depto) => (
                <MenuItem key={depto.id} value={depto.id}>
                  {depto.nome}
                </MenuItem>
              ))}
            </TextField>
          )}

          {formData.destinatario_tipo === 'individual' && (
            <TextField
              label="Selecionar Colaborador"
              fullWidth
              margin="normal"
              select
              value={formData.usuario_id}
              onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
            >
              {usuarios.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.nome} ({user.id.substring(0, 8)})
                </MenuItem>
              ))}
            </TextField>
          )}

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

          <Box mt={3} mb={1} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Questões</Typography>
            <Button startIcon={<Add />} size="small" onClick={handleAdicionarQuestao}>
              Adicionar Questão
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {formData.questoes.map((questao, qIndex) => (
            <Box key={qIndex} sx={{ p: 2, mb: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="subtitle2" color="primary">Questão {qIndex + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => handleRemoverQuestao(qIndex)}>
                  <Delete />
                </IconButton>
              </Box>

              <TextField
                label="Pergunta"
                fullWidth
                margin="dense"
                value={questao.pergunta}
                onChange={(e) => handleQuestaoChange(qIndex, 'pergunta', e.target.value)}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Tipo de Questão"
                    fullWidth
                    margin="dense"
                    select
                    size="small"
                    value={questao.tipo}
                    onChange={(e) => handleQuestaoChange(qIndex, 'tipo', e.target.value)}
                  >
                    <MenuItem value="multipla_escolha">Múltipla Escolha</MenuItem>
                    <MenuItem value="escala">Escala (1 a 10)</MenuItem>
                    <MenuItem value="texto_livre">Texto Livre</MenuItem>
                    <MenuItem value="sim_nao">Sim / Não</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={questao.obrigatoria}
                        onChange={(e) => handleQuestaoChange(qIndex, 'obrigatoria', e.target.checked)}
                      />
                    }
                    label="Obrigatória"
                  />
                </Grid>
              </Grid>

              {questao.tipo === 'multipla_escolha' && (
                <Box mt={2} pl={2} sx={{ borderLeft: '2px solid #eee' }}>
                  <Typography variant="caption" display="block" gutterBottom>Opções de Resposta:</Typography>
                  {questao.opcoes?.map((opcao, oIndex) => (
                    <Box key={oIndex} display="flex" gap={1} mb={1}>
                      <TextField
                        placeholder={`Opção ${oIndex + 1}`}
                        fullWidth
                        size="small"
                        value={opcao.texto}
                        onChange={(e) => handleOpcaoChange(qIndex, oIndex, 'texto', e.target.value)}
                      />
                      <IconButton size="small" color="error" onClick={() => handleRemoverOpcao(qIndex, oIndex)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => handleAdicionarOpcao(qIndex)}>
                    Add Opção
                  </Button>
                </Box>
              )}

              {questao.tipo === 'escala' && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Será exibida uma escala de 1 a 10 para o colaborador.
                </Typography>
              )}

              {questao.tipo === 'texto_livre' && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  O colaborador terá um campo de texto aberto para resposta.
                </Typography>
              )}
            </Box>
          ))}
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
