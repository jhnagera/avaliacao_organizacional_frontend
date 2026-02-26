import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    MenuItem,
    Alert,
    Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DenunciaAnonima: React.FC = () => {
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [empresaId, setEmpresaId] = useState('');
    const [categoria, setCategoria] = useState('');
    const [descricao, setDescricao] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await api.get('/empresas/public');
                setEmpresas(response.data);
            } catch (error) {
                console.error('Erro ao buscar empresas:', error);
            }
        };
        fetchEmpresas();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            await api.post('/denuncias/anonimas', {
                empresa_id: empresaId,
                categoria,
                descricao,
            });
            setSucesso(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            setErro(error.response?.data?.error || 'Erro ao enviar denúncia');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Button onClick={() => navigate('/login')}>Voltar para Login</Button>
            </Box>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Denúncia Anônima
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }} align="center" color="text.secondary">
                    Sua identidade será preservada. Esta denúncia é totalmente anônima e será tratada diretamente pela administração.
                </Typography>

                {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        select
                        label="Empresa"
                        fullWidth
                        required
                        value={empresaId}
                        onChange={(e) => setEmpresaId(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        {empresas.map((empresa) => (
                            <MenuItem key={empresa.id} value={empresa.id}>
                                {empresa.nome}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Categoria"
                        fullWidth
                        required
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="assedio">Assédio</MenuItem>
                        <MenuItem value="discriminacao">Discriminação</MenuItem>
                        <MenuItem value="corrupcao">Corrupção</MenuItem>
                        <MenuItem value="violacao_codigo">Violação do Código de Conduta</MenuItem>
                        <MenuItem value="outro">Outro</MenuItem>
                    </TextField>

                    <TextField
                        label="Descrição dos Fatos"
                        fullWidth
                        required
                        multiline
                        rows={6}
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        sx={{ mb: 3 }}
                        placeholder="Descreva o ocorrido com o máximo de detalhes possível..."
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={carregando}
                    >
                        {carregando ? 'Enviando...' : 'Enviar Denúncia'}
                    </Button>
                </form>
            </Paper>

            <Snackbar
                open={sucesso}
                autoHideDuration={6000}
                message="Denúncia enviada com sucesso! Você será redirecionado para o login."
            />
        </Container>
    );
};

export default DenunciaAnonima;
