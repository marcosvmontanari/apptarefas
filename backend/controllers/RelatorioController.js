const RelatorioModel = require('../models/RelatorioModel');

class RelatorioController {
    static async resumoGeral(req, res) {
        try {
            const { inicio, fim } = req.query;

            if (!inicio || !fim) {
                return res.status(400).json({
                    erro: 'As datas de início e fim são obrigatórias.'
                });
            }

            const resumo = await RelatorioModel.buscarResumoGeral(inicio, fim);

            const total = Number(resumo.total_tarefas || 0);
            const concluidas = Number(resumo.concluidas || 0);
            const pendentes = Number(resumo.pendentes || 0);
            const em_andamento = Number(resumo.em_andamento || 0);

            const percentual_conclusao =
                total > 0 ? ((concluidas / total) * 100).toFixed(2) : '0.00';

            res.status(200).json({
                inicio,
                fim,
                total_tarefas: total,
                concluidas,
                pendentes,
                em_andamento,
                percentual_conclusao
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao gerar resumo geral.',
                detalhes: error.message
            });
        }
    }

    static async rankingResponsaveis(req, res) {
        try {
            const { inicio, fim } = req.query;

            if (!inicio || !fim) {
                return res.status(400).json({
                    erro: 'As datas são obrigatórias'
                });
            }

            const ranking = await RelatorioModel.buscarRankingResponsaveis(inicio, fim);

            const totalParticipacoes = ranking.reduce(
                (soma, r) => soma + Number(r.total_tarefas),
                0
            );

            const rankingComPercentual = ranking.map((r) => {
                const percentual =
                    totalParticipacoes > 0
                        ? ((Number(r.total_tarefas) / totalParticipacoes) * 100).toFixed(2)
                        : '0.00';

                return {
                    id: r.id,
                    nome: r.nome,
                    total_tarefas: Number(r.total_tarefas),
                    percentual
                };
            });

            res.status(200).json({
                inicio,
                fim,
                total_participacoes: totalParticipacoes,
                ranking: rankingComPercentual
            });
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao gerar ranking',
                detalhes: error.message
            });
        }
    }
}

module.exports = RelatorioController;