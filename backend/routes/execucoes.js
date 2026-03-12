const express = require('express');
const router = express.Router();

const ExecucaoController = require('../controllers/ExecucaoController');

router.get('/painel/:data', ExecucaoController.buscarPainelPorData);
router.post('/', ExecucaoController.criar);

module.exports = router;