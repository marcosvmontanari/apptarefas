const crypto = require('crypto');
const TarefaModel = require('../models/TarefaModel');

class TarefaController {
    static normalizarDias(dias_semana_ids) {
        if (!Array.isArray(dias_semana_ids)) {
            return [];
        }

        const diasValidos = dias_semana_ids
            .map((dia) => Number(dia))
            .filter((dia) => Number.isInteger(dia) && dia >= 1 && dia <= 7);

        return [...new Set(diasValidos)].sort((a, b) => a - b);
    }

    static formatarTarefa(tarefa) {
        return {
            ...tarefa,
            dias_semana_ids: tarefa.dias_semana_ids
                ? tarefa.dias_semana_ids.split(',').map((dia) => Number(dia))
                : []
        };
    }

    static async listar(req, res) {
        try {
            const tarefas = await TarefaModel.listarTodas();

            res.status(200).json(
                tarefas.map((tarefa) => TarefaController.formatarTarefa(tarefa))
            );
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao listar tarefas.',
                detalhes: error.message
            });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const tarefa = await TarefaModel.buscarPorGrupoId(id);

            if (!tarefa) {
                return res.status(404).json({
                    erro: 'Tarefa não encontrada.'
                });
            }

            res.status(200).json(TarefaController.formatarTarefa(tarefa));
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao buscar tarefa.',
                detalhes: error.message
            });
        }
    }

    static async criar(req, res) {
        try {
            const { nome, dias_semana_ids } = req.body;

            if (!nome || !nome.trim()) {
                return res.status(400).json({
                    erro: 'O nome da tarefa é obrigatório.'
                });
            }

            const diasNormalizados = TarefaController.normalizarDias(dias_semana_ids);

            if (diasNormalizados.length === 0) {
                return res.status(400).json({
                    erro: 'Selecione pelo menos um dia da semana.'
                });
            }

            const grupo_id = crypto.randomUUID();

            const novaTarefa = await TarefaModel.criar(
                grupo_id,
                nome.trim(),
                diasNormalizados
            );

            res.status(201).json({
                mensagem: 'Tarefa cadastrada com sucesso.',
                tarefa: novaTarefa
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao cadastrar tarefa.',
                detalhes: error.message
            });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, dias_semana_ids } = req.body;

            if (!nome || !nome.trim()) {
                return res.status(400).json({
                    erro: 'O nome da tarefa é obrigatório.'
                });
            }

            const diasNormalizados = TarefaController.normalizarDias(dias_semana_ids);

            if (diasNormalizados.length === 0) {
                return res.status(400).json({
                    erro: 'Selecione pelo menos um dia da semana.'
                });
            }

            const tarefaExistente = await TarefaModel.buscarPorGrupoId(id);

            if (!tarefaExistente) {
                return res.status(404).json({
                    erro: 'Tarefa não encontrada.'
                });
            }

            const totalExecucoes = await TarefaModel.contarExecucoesDoGrupo(id);

            if (totalExecucoes > 0) {
                return res.status(400).json({
                    erro: 'Não é possível editar esta tarefa porque ela já possui execuções registradas.'
                });
            }

            await TarefaModel.atualizar(id, nome.trim(), diasNormalizados);

            res.status(200).json({
                mensagem: 'Tarefa atualizada com sucesso.'
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao atualizar tarefa.',
                detalhes: error.message
            });
        }
    }

    static async excluir(req, res) {
        try {
            const { id } = req.params;

            const tarefaExistente = await TarefaModel.buscarPorGrupoId(id);

            if (!tarefaExistente) {
                return res.status(404).json({
                    erro: 'Tarefa não encontrada.'
                });
            }

            const totalExecucoes = await TarefaModel.contarExecucoesDoGrupo(id);

            if (totalExecucoes > 0) {
                return res.status(400).json({
                    erro: 'Não é possível excluir esta tarefa porque ela já possui execuções registradas.'
                });
            }

            await TarefaModel.excluir(id);

            res.status(200).json({
                mensagem: 'Tarefa excluída com sucesso.'
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao excluir tarefa.',
                detalhes: error.message
            });
        }
    }
}

module.exports = TarefaController;