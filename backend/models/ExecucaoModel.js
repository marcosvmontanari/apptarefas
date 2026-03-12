const db = require('../config/db');

class ExecucaoModel {
    static async buscarPainelPorDiaSemana(dia_semana_id) {
        const [rows] = await db.query(
            `
      SELECT
        tarefas.id AS tarefa_id,
        tarefas.nome AS tarefa_nome,
        tarefas.dia_semana_id,
        dias_semana.nome AS dia_semana
      FROM tarefas
      INNER JOIN dias_semana ON tarefas.dia_semana_id = dias_semana.id
      WHERE tarefas.dia_semana_id = ?
        AND tarefas.ativa = TRUE
      ORDER BY tarefas.nome ASC
      `,
            [dia_semana_id]
        );

        return rows;
    }

    static async buscarExecucaoPorTarefaEData(tarefa_id, data_execucao) {
        const [rows] = await db.query(
            `
      SELECT id, tarefa_id, data_execucao, status, observacao
      FROM execucoes
      WHERE tarefa_id = ? AND data_execucao = ?
      LIMIT 1
      `,
            [tarefa_id, data_execucao]
        );

        return rows[0] || null;
    }

    static async buscarResponsaveisDaExecucao(execucao_id) {
        const [rows] = await db.query(
            `
      SELECT responsavel_id
      FROM execucao_responsaveis
      WHERE execucao_id = ?
      `,
            [execucao_id]
        );

        return rows.map((row) => row.responsavel_id);
    }

    static async criarExecucao(tarefa_id, data_execucao, status, observacao) {
        const [result] = await db.query(
            `
      INSERT INTO execucoes (tarefa_id, data_execucao, status, observacao)
      VALUES (?, ?, ?, ?)
      `,
            [tarefa_id, data_execucao, status, observacao]
        );

        return result.insertId;
    }

    static async atualizarExecucao(execucao_id, status, observacao) {
        await db.query(
            `
      UPDATE execucoes
      SET status = ?, observacao = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
            [status, observacao, execucao_id]
        );
    }

    static async removerResponsaveisDaExecucao(execucao_id) {
        await db.query(
            `
      DELETE FROM execucao_responsaveis
      WHERE execucao_id = ?
      `,
            [execucao_id]
        );
    }

    static async vincularResponsaveis(execucao_id, responsaveis) {
        for (const responsavel_id of responsaveis) {
            await db.query(
                `
        INSERT INTO execucao_responsaveis (execucao_id, responsavel_id)
        VALUES (?, ?)
        `,
                [execucao_id, responsavel_id]
            );
        }
    }
}

module.exports = ExecucaoModel;