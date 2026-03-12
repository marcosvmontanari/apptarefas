const express = require('express');
const router = express.Router();

const ResponsavelController = require('../controllers/ResponsavelController');

router.get('/', ResponsavelController.listar);
router.get('/:id', ResponsavelController.buscarPorId);
router.post('/', ResponsavelController.criar);
router.put('/:id', ResponsavelController.atualizar);
router.delete('/:id', ResponsavelController.excluir);

module.exports = router;