const express = require('express');
const router = express.Router();

// GET /api/tasks - Lister toutes les tâches
router.get('/', async (req, res) => {
  res.status(200).json({ message: "Liste des tâches" });
});

// GET /api/tasks/:id - Obtenir une tâche
router.get('/:id', async (req, res) => {
  res.status(200).json({ message: `Tâche ${req.params.id}` });
});

// POST /api/tasks - Créer une tâche
router.post('/', async (req, res) => {
  res.status(201).json({ message: "Tâche créée" });
});

// PUT /api/tasks/:id - Modifier une tâche
router.put('/:id', async (req, res) => {
  res.status(200).json({ message: `Tâche ${req.params.id} modifiée` });
});

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', async (req, res) => {
  res.status(200).json({ message: `Tâche ${req.params.id} supprimée` });
});

module.exports = router;