const db = require('../config/db');

class TarefaModel {
    static async listarTodas() {
        const [rows] = await db.query(`
            SELECT
                tarefas.grupo_id AS id,
                tarefas.nome,
                GROUP_CONCAT(tarefas.dia_semana_id ORDER BY tarefas.dia_semana_id) AS dias_semana_ids,
                GROUP_CONCAT(dias_semana.nome ORDER BY tarefas.dia_semana_id SEPARATOR ', ') AS dias_semana
            FROM tarefas
            INNER JOIN dias_semana ON tarefas.dia_semana_id = dias_semana.id
            WHERE tarefas.ativa = TRUE
            GROUP BY tarefas.grupo_id, tarefas.nome
            ORDER BY tarefas.nome ASC, MIN(tarefas.dia_semana_id) ASC
        `);

        return rows;
    }

    static async buscarPorGrupoId(grupo_id) {
        const [rows] = await db.query(
            `
            SELECT
                tarefas.grupo_id AS id,
                tarefas.nome,
                GROUP_CONCAT(tarefas.dia_semana_id ORDER BY tarefas.dia_semana_id) AS dias_semana_ids,
                GROUP_CONCAT(dias_semana.nome ORDER BY tarefas.dia_semana_id SEPARATOR ', ') AS dias_semana
            FROM tarefas
            INNER JOIN dias_semana ON tarefas.dia_semana_id = dias_semana.id
            WHERE tarefas.grupo_id = ?
              AND tarefas.ativa = TRUE
            GROUP BY tarefas.grupo_id, tarefas.nome
            `,
            [grupo_id]
        );

        return rows[0] || null;
    }

    static async contarExecucoesDoGrupo(grupo_id) {
        const [rows] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM execucoes
            INNER JOIN tarefas ON execucoes.tarefa_id = tarefas.id
            WHERE tarefas.grupo_id = ?
            `,
            [grupo_id]
        );

        return rows[0]?.total || 0;
    }

    static async criar(grupo_id, nome, dias_semana_ids) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            for (const dia_semana_id of dias_semana_ids) {
                await connection.query(
                    `
                    INSERT INTO tarefas (grupo_id, nome, dia_semana_id)
                    VALUES (?, ?, ?)
                    `,
                    [grupo_id, nome, dia_semana_id]
                );
            }

            await connection.commit();

            return {
                id: grupo_id,
                nome,
                dias_semana_ids
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async atualizar(grupo_id, nome, dias_semana_ids) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            await connection.query(
                'DELETE FROM tarefas WHERE grupo_id = ?',
                [grupo_id]
            );

            for (const dia_semana_id of dias_semana_ids) {
                await connection.query(
                    `
                    INSERT INTO tarefas (grupo_id, nome, dia_semana_id)
                    VALUES (?, ?, ?)
                    `,
                    [grupo_id, nome, dia_semana_id]
                );
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async excluir(grupo_id) {
        await db.query(
            'DELETE FROM tarefas WHERE grupo_id = ?',
            [grupo_id]
        );
    }
}

module.exports = TarefaModel;