import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    TextField,
    Slider,
    CircularProgress,
    Divider,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import api from '../services/api';

interface Opcao {
    id: string;
    texto: string;
    valor: number;
}

interface Questao {
    id: string;
    pergunta: string;
    tipo: string;
    obrigatoria: boolean;
    opcoes?: Opcao[];
}

interface Questionario {
    id: string;
    titulo: string;
    descricao: string;
    questoes: Questao[];
}

export default function ResponderQuestionario() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [questionario, setQuestionario] = useState<Questionario | null>(null);
    const [loading, setLoading] = useState(true);
    const [respostas, setRespostas] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestionario = async () => {
            try {
                const response = await api.get(`/questionarios/${id}`);
                setQuestionario(response.data);
            } catch (err: any) {
                console.error('Erro ao buscar questionário:', err);
                setError(err.response?.data?.error || 'Erro ao carregar o questionário. Pode não existir ou você não tem acesso.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestionario();
    }, [id]);

    const handleRespostaChange = (questaoId: string, value: any, tipo: string) => {
        setRespostas((prev) => ({
            ...prev,
            [questaoId]: { value, tipo },
        }));
    };

    const isFormValid = () => {
        if (!questionario) return false;
        for (const q of questionario.questoes) {
            if (q.obrigatoria && !respostas[q.id]?.value && respostas[q.id]?.value !== 0) {
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) {
            alert('Por favor, responda todas as questões obrigatórias.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                respostas: Object.entries(respostas).map(([questao_id, data]) => {
                    const res: any = { questao_id };
                    const { tipo, value } = data;

                    if (tipo === 'multipla_escolha' || tipo === 'sim_nao') {
                        res.opcao_id = value;
                    } else if (tipo === 'escala') {
                        res.resposta_valor = Number(value);
                    } else if (tipo === 'texto_livre') {
                        res.resposta_texto = value;
                    }
                    return res;
                }),
            };

            await api.post(`/questionarios/${id}/responder`, payload);
            alert('Respostas salvas com sucesso!');
            navigate('/questionarios');
        } catch (err: any) {
            console.error('Erro ao enviar respostas:', err);
            alert(err.response?.data?.error || 'Erro ao enviar respostas.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !questionario) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography color="error" variant="h6">
                    {error || 'Questionário não encontrado.'}
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/questionarios')} sx={{ mt: 2 }}>
                    Voltar
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/questionarios')} sx={{ mb: 2 }}>
                Voltar para Questionários
            </Button>

            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {questionario.titulo}
                </Typography>
                {questionario.descricao && (
                    <Typography variant="body1" color="textSecondary" paragraph>
                        {questionario.descricao}
                    </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                <form onSubmit={handleSubmit}>
                    {questionario.questoes.map((questao, index) => (
                        <Box key={questao.id} sx={{ mb: 4 }}>
                            <FormControl component="fieldset" fullWidth error={questao.obrigatoria && !respostas[questao.id]?.value && respostas[questao.id]?.value !== 0}>
                                <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                                    {index + 1}. {questao.pergunta} {questao.obrigatoria && <span style={{ color: 'red' }}>*</span>}
                                </FormLabel>

                                {(questao.tipo === 'multipla_escolha' || questao.tipo === 'sim_nao') && (
                                    <RadioGroup
                                        value={respostas[questao.id]?.value || ''}
                                        onChange={(e) => handleRespostaChange(questao.id, e.target.value, questao.tipo)}
                                    >
                                        {questao.opcoes?.map((opcao) => (
                                            <FormControlLabel
                                                key={opcao.id}
                                                value={opcao.id}
                                                control={<Radio />}
                                                label={opcao.texto}
                                            />
                                        ))}
                                    </RadioGroup>
                                )}

                                {questao.tipo === 'texto_livre' && (
                                    <TextField
                                        multiline
                                        rows={4}
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Sua resposta..."
                                        value={respostas[questao.id]?.value || ''}
                                        onChange={(e) => handleRespostaChange(questao.id, e.target.value, questao.tipo)}
                                    />
                                )}

                                {questao.tipo === 'escala' && (
                                    <Box sx={{ px: 2, pt: 2 }}>
                                        <Slider
                                            value={respostas[questao.id]?.value || 5}
                                            onChange={(_, newValue) => handleRespostaChange(questao.id, newValue, questao.tipo)}
                                            min={1}
                                            max={10}
                                            step={1}
                                            marks
                                            valueLabelDisplay="auto"
                                        />
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="caption">1</Typography>
                                            <Typography variant="caption">10</Typography>
                                        </Box>
                                    </Box>
                                )}
                            </FormControl>
                        </Box>
                    ))}

                    <Box mt={4} display="flex" justifyContent="flex-end">
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<Save />}
                            disabled={submitting}
                        >
                            {submitting ? 'Enviando...' : 'Enviar Respostas'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}
