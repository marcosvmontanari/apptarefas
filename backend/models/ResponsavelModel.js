const db = require('../config/db');

class ResponsavelModel {
    static async listarTodos() {
        const [rows] = await db.query(
            'SELECT id, nome, ativo, created_at, updated_at FROM responsaveis ORDER BY nome ASC'
        );
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await db.query(
            'SELECT id, nome, ativo, created_at, updated_at FROM responsaveis WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    static async criar(nome) {
        const [result] = await db.query(
            'INSERT INTO responsaveis (nome) VALUES (?)',
            [nome]
        );

        return {
            id: result.insertId,
            nome
        };
    }

    static async atualizar(id, nome) {
        await db.query(
            'UPDATE responsaveis SET nome = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [nome, id]
        );
    }

    static async contarVinculosEmExecucoes(id) {
        const [rows] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM execucao_responsaveis
            WHERE responsavel_id = ?
            `,
            [id]
        );

        return rows[0]?.total || 0;
    }

    static async excluir(id) {
        await db.query('DELETE FROM responsaveis WHERE id = ?', [id]);
    }
}

module.exports = ResponsavelModel;