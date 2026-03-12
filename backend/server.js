require('dotenv').config();

const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        const connection = await db.getConnection();
        console.log('Conexão com o MySQL realizada com sucesso!');
        connection.release();

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao conectar com o MySQL:', error.message);
    }
}

iniciarServidor();