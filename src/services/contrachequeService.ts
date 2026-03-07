import api from './api';

export const contrachequeService = {
  async listar(mes?: number, ano?: number, usuario_id?: string) {
    const params: any = {};
    if (mes) params.mes = mes;
    if (ano) params.ano = ano;
    if (usuario_id) params.usuario_id = usuario_id;
    return api.get('/contracheques', { params });
  },

  async upload(formData: FormData) {
    return api.post('/contracheques/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async download(id: string) {
    return api.get(`/contracheques/${id}/download`, {
      responseType: 'blob'
    });
  },

  async visualizar(id: string) {
    return api.get(`/contracheques/${id}/visualizar`, {
      responseType: 'blob'
    });
  }
};
