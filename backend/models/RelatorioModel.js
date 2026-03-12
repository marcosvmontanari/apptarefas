const db = require('../config/db');

class RelatorioModel {

    static async buscarResumoGeral(inicio, fim) {

        const [rows] = await db.query(
            `
SELECT
COUNT(*) AS total_tarefas,
SUM(CASE WHEN status = 'CONCLUIDA' THEN 1 ELSE 0 END) AS concluidas,
SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) AS pendentes,
SUM(CASE WHEN status = 'EM_ANDAMENTO' THEN 1 ELSE 0 END) AS em_andamento
FROM execucoes
WHERE data_execucao BETWEEN ? AND ?
`,
            [inicio, fim]
        );

        return rows[0];

    }

    static async buscarRankingResponsaveis(inicio, fim) {

        const [rows] = await db.query(
            `
SELECT
r.id,
r.nome,
COUNT(er.responsavel_id) AS total_tarefas
FROM execucao_responsaveis er
JOIN execucoes e ON e.id = er.execucao_id
JOIN responsaveis r ON r.id = er.responsavel_id
WHERE e.data_execucao BETWEEN ? AND ?
GROUP BY r.id, r.nome
ORDER BY total_tarefas DESC
`,
            [inicio, fim]
        );

        return rows;

    }

}

module.exports = RelatorioModel;