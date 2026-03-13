const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

let todos = [
  { 
    id: 1, 
    text: "Apprendre Vue.js", 
    done: false, 
    date: new Date().toLocaleDateString('fr-FR'),
    comment: ""
  },
  { 
    id: 2, 
    text: "Apprendre Express", 
    done: false, 
    date: new Date().toLocaleDateString('fr-FR'),
    comment: ""
  }
]

// GET - Récupérer tous les todos
app.get('/todos', (req, res) => {
  res.json(todos)
})

// GET - Récupérer UN todo (Read détail)
app.get('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id))
  if (!todo) return res.status(404).json({ message: 'Todo non trouvé' })
  res.json(todo)
})

// POST - Ajouter un todo
app.post('/todos', (req, res) => {
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    done: false,
    date: new Date().toLocaleDateString('fr-FR'),
    comment: ""
  }
  todos.push(newTodo)
  res.json(newTodo)
})

// PUT - Modifier un todo (Update)
app.put('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id))
  if (!todo) return res.status(404).json({ message: 'Todo non trouvé' })
  if (req.body.text !== undefined) todo.text = req.body.text
  if (req.body.comment !== undefined) todo.comment = req.body.comment
  if (req.body.done !== undefined) todo.done = req.body.done
  res.json(todo)
})

// DELETE - Supprimer un todo
app.delete('/todos/:id', (req, res) => {
  todos = todos.filter(t => t.id !== parseInt(req.params.id))
  res.json({ message: 'Supprimé !' })
})

app.listen(3000, () => {
  console.log('✅ Serveur démarré sur http://localhost:3000')
})