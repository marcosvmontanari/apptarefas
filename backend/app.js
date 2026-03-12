const express = require('express');
const cors = require('cors');
const path = require('path');

const responsaveisRoutes = require('./routes/responsaveis');
const tarefasRoutes = require('./routes/tarefas');
const execucoesRoutes = require('./routes/execucoes');
const relatoriosRoutes = require('./routes/relatorios');

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   SERVIR FRONTEND
========================= */

app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/pages', express.static(path.join(__dirname, '../frontend/pages')));

/* Página inicial */

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

/* =========================
   ROTAS DA API
========================= */

app.use('/responsaveis', responsaveisRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/execucoes', execucoesRoutes);
app.use('/relatorios', relatoriosRoutes);

module.exports = app;