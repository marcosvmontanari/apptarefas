const express = require('express');
const router = express.Router();

const RelatorioController = require('../controllers/RelatorioController');

router.get('/geral', RelatorioController.resumoGeral);
router.get('/responsaveis', RelatorioController.rankingResponsaveis);

module.exports = router;