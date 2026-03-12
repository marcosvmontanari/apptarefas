const express = require('express');
const cors = require('cors');

const responsaveisRoutes = require('./routes/responsaveis');
const tarefasRoutes = require('./routes/tarefas');
const execucoesRoutes = require('./routes/execucoes');
const relatoriosRoutes = require('./routes/relatorios');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensagem: 'API do app-tarefas funcionando!' });
});

app.use('/responsaveis', responsaveisRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/execucoes', execucoesRoutes);
app.use('/relatorios', relatoriosRoutes);

module.exports = app;