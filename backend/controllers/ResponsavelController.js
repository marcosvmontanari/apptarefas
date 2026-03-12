const ResponsavelModel = require('../models/ResponsavelModel');

class ResponsavelController {
    static async listar(req, res) {
        try {
            const responsaveis = await ResponsavelModel.listarTodos();
            res.status(200).json(responsaveis);
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao listar responsáveis.',
                detalhes: error.message
            });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const responsavel = await ResponsavelModel.buscarPorId(id);

            if (!responsavel) {
                return res.status(404).json({
                    erro: 'Responsável não encontrado.'
                });
            }

            res.status(200).json(responsavel);
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao buscar responsável.',
                detalhes: error.message
            });
        }
    }

    static async criar(req, res) {
        try {
            const { nome } = req.body;

            if (!nome || !nome.trim()) {
                return res.status(400).json({
                    erro: 'O nome do responsável é obrigatório.'
                });
            }

            const novoResponsavel = await ResponsavelModel.criar(nome.trim());

            res.status(201).json({
                mensagem: 'Responsável cadastrado com sucesso.',
                responsavel: novoResponsavel
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao cadastrar responsável.',
                detalhes: error.message
            });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome } = req.body;

            if (!nome || !nome.trim()) {
                return res.status(400).json({
                    erro: 'O nome do responsável é obrigatório.'
                });
            }

            const responsavelExistente = await ResponsavelModel.buscarPorId(id);

            if (!responsavelExistente) {
                return res.status(404).json({
                    erro: 'Responsável não encontrado.'
                });
            }

            await ResponsavelModel.atualizar(id, nome.trim());

            res.status(200).json({
                mensagem: 'Responsável atualizado com sucesso.'
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao atualizar responsável.',
                detalhes: error.message
            });
        }
    }

    static async excluir(req, res) {
        try {
            const { id } = req.params;

            const responsavelExistente = await ResponsavelModel.buscarPorId(id);

            if (!responsavelExistente) {
                return res.status(404).json({
                    erro: 'Responsável não encontrado.'
                });
            }

            const totalVinculos = await ResponsavelModel.contarVinculosEmExecucoes(id);

            if (totalVinculos > 0) {
                return res.status(400).json({
                    erro: 'Este responsável não pode ser excluído porque já está vinculado a execuções cadastradas.'
                });
            }

            await ResponsavelModel.excluir(id);

            res.status(200).json({
                mensagem: 'Responsável excluído com sucesso.'
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao excluir responsável.',
                detalhes: error.message
            });
        }
    }
}

module.exports = ResponsavelController;