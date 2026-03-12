const express = require('express');
const router = express.Router();

const TarefaController = require('../controllers/TarefaController');

router.get('/', TarefaController.listar);
router.get('/:id', TarefaController.buscarPorId);
router.post('/', TarefaController.criar);
router.put('/:id', TarefaController.atualizar);
router.delete('/:id', TarefaController.excluir);

module.exports = router;