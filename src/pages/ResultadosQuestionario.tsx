import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    CircularProgress,
    Divider,
    Grid,
} from '@mui/material';
import { ArrowBack, Assessment } from '@mui/icons-material';
import api from '../services/api';

interface EstatisticasMultiplaEscolhaSimNao {
    opcoes: Record<string, { texto: string; quantidade: number }>;
}

interface EstatisticasEscala {
    media: string;
    total_respostas: number;
}

interface RespostaTexto {
    texto: string;
    data: string;
}

interface EstatisticasTextoLivre {
    respostas_texto: RespostaTexto[];
}

type EstatisticasBase = EstatisticasMultiplaEscolhaSimNao | EstatisticasEscala | EstatisticasTextoLivre | {};

interface ResultadoQuestao {
    questao_id: string;
    pergunta: string;
    tipo: string;
    total_respostas: number;
    estatisticas: EstatisticasBase;
}

interface ResultadosData {
    questionario: {
        id: string;
        titulo: string;
        total_participantes: number;
    };
    resultados: ResultadoQuestao[];
}

export default function ResultadosQuestionario() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<ResultadosData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResultados = async () => {
            try {
                const response = await api.get(`/questionarios/${id}/resultados`);
                setData(response.data);
            } catch (err: any) {
                console.error('Erro ao buscar resultados:', err);
                setError(err.response?.data?.error || 'Erro ao carregar os resultados.');
            } finally {
                setLoading(false);
            }
        };
        fetchResultados();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !data) {
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/questionarios')} sx={{ mb: 2 }}>
                Voltar para Questionários
            </Button>

            <Paper elevation={3} sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Assessment color="primary" fontSize="large" />
                    <Box>
                        <Typography variant="h4">{data.questionario.titulo} - Resultados</Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            Total de Participantes: {data.questionario.total_participantes}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {data.resultados.length === 0 ? (
                    <Typography variant="body1">Nenhuma resposta registrada até o momento.</Typography>
                ) : (
                    data.resultados.map((resultado, index) => (
                        <Paper key={resultado.questao_id} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                {index + 1}. {resultado.pergunta}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                                Tipo: {resultado.tipo.replace('_', ' ')} | Respostas: {resultado.total_respostas}
                            </Typography>

                            {/* Múltipla Escolha ou Sim/Não */}
                            {(resultado.tipo === 'multipla_escolha' || resultado.tipo === 'sim_nao') && (
                                <Grid container spacing={2}>
                                    {Object.entries((resultado.estatisticas as EstatisticasMultiplaEscolhaSimNao).opcoes || {}).map(([opcaoId, info]) => {
                                        const porcentagem = resultado.total_respostas > 0
                                            ? ((info.quantidade / resultado.total_respostas) * 100).toFixed(1)
                                            : 0;

                                        return (
                                            <Grid item xs={12} sm={6} key={opcaoId}>
                                                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                                    <Typography variant="body1" fontWeight={500}>{info.texto}</Typography>
                                                    <Box display="flex" justifyContent="space-between" mt={1}>
                                                        <Typography variant="body2">{info.quantidade} votos</Typography>
                                                        <Typography variant="body2" fontWeight="bold">{porcentagem}%</Typography>
                                                    </Box>

                                                    {/* Barra de progresso visual simples */}
                                                    <Box sx={{ width: '100%', height: 8, bgcolor: '#e0e0e0', borderRadius: 4, mt: 1, overflow: 'hidden' }}>
                                                        <Box sx={{ width: `${porcentagem}%`, height: '100%', bgcolor: 'primary.main' }} />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            )}

                            {/* Escala */}
                            {resultado.tipo === 'escala' && (
                                <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, display: 'inline-block' }}>
                                    <Typography variant="body2" color="primary.dark" gutterBottom>Média Geral</Typography>
                                    <Typography variant="h3" color="primary.main">
                                        {(resultado.estatisticas as EstatisticasEscala).media || '0'}
                                        <Typography component="span" variant="h5" color="textSecondary">/10</Typography>
                                    </Typography>
                                </Box>
                            )}

                            {/* Texto Livre */}
                            {resultado.tipo === 'texto_livre' && (
                                <Box sx={{ maxHeight: 300, overflowY: 'auto', p: 1 }}>
                                    {((resultado.estatisticas as EstatisticasTextoLivre).respostas_texto || []).map((resp, i) => (
                                        <Box key={i} sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9', borderLeft: '4px solid #ccc' }}>
                                            <Typography variant="body1">"{resp.texto}"</Typography>
                                        </Box>
                                    ))}
                                    {((resultado.estatisticas as EstatisticasTextoLivre).respostas_texto?.length || 0) === 0 && (
                                        <Typography variant="body2" color="textSecondary">Sem respostas em texto.</Typography>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    ))
                )}
            </Paper>
        </Container>
    );
}
