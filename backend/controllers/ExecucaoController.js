const ExecucaoModel = require('../models/ExecucaoModel');

class ExecucaoController {
    static async buscarPainelPorData(req, res) {
        try {
            const { data } = req.params;

            if (!data) {
                return res.status(400).json({
                    erro: 'A data é obrigatória.'
                });
            }

            const dataObj = new Date(`${data}T00:00:00`);

            if (isNaN(dataObj.getTime())) {
                return res.status(400).json({
                    erro: 'Data inválida.'
                });
            }

            const diaSemanaJS = dataObj.getDay();

            const mapaDias = {
                0: 7,
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6
            };

            const dia_semana_id = mapaDias[diaSemanaJS];

            const tarefasBase = await ExecucaoModel.buscarPainelPorDiaSemana(dia_semana_id);

            const tarefas = await Promise.all(
                tarefasBase.map(async (tarefa) => {
                    const execucao = await ExecucaoModel.buscarExecucaoPorTarefaEData(
                        tarefa.tarefa_id,
                        data
                    );

                    if (!execucao) {
                        return {
                            ...tarefa,
                            execucao_id: null,
                            status: 'PENDENTE',
                            observacao: '',
                            responsaveis: []
                        };
                    }

                    const responsaveis = await ExecucaoModel.buscarResponsaveisDaExecucao(execucao.id);

                    return {
                        ...tarefa,
                        execucao_id: execucao.id,
                        status: execucao.status,
                        observacao: execucao.observacao || '',
                        responsaveis
                    };
                })
            );

            res.status(200).json({
                data,
                dia_semana_id,
                tarefas
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao buscar painel diário.',
                detalhes: error.message
            });
        }
    }

    static async criar(req, res) {
        try {
            const {
                tarefa_id,
                data_execucao,
                status,
                observacao,
                responsaveis
            } = req.body;

            if (!tarefa_id) {
                return res.status(400).json({
                    erro: 'O ID da tarefa é obrigatório.'
                });
            }

            if (!data_execucao) {
                return res.status(400).json({
                    erro: 'A data de execução é obrigatória.'
                });
            }

            if (!status) {
                return res.status(400).json({
                    erro: 'O status é obrigatório.'
                });
            }

            const statusPermitidos = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'];

            if (!statusPermitidos.includes(status)) {
                return res.status(400).json({
                    erro: 'Status inválido.'
                });
            }

            if (status === 'CONCLUIDA' && (!responsaveis || responsaveis.length === 0)) {
                return res.status(400).json({
                    erro: 'Uma tarefa concluída precisa ter pelo menos um responsável.'
                });
            }

            const execucaoExistente = await ExecucaoModel.buscarExecucaoPorTarefaEData(
                tarefa_id,
                data_execucao
            );

            let execucao_id;

            if (execucaoExistente) {
                execucao_id = execucaoExistente.id;

                await ExecucaoModel.atualizarExecucao(
                    execucao_id,
                    status,
                    observacao || null
                );

                await ExecucaoModel.removerResponsaveisDaExecucao(execucao_id);
            } else {
                execucao_id = await ExecucaoModel.criarExecucao(
                    tarefa_id,
                    data_execucao,
                    status,
                    observacao || null
                );
            }

            if (responsaveis && responsaveis.length > 0) {
                await ExecucaoModel.vincularResponsaveis(execucao_id, responsaveis);
            }

            res.status(200).json({
                mensagem: execucaoExistente
                    ? 'Execução atualizada com sucesso.'
                    : 'Execução registrada com sucesso.',
                execucao_id
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao registrar execução.',
                detalhes: error.message
            });
        }
    }
}

module.exports = ExecucaoController;