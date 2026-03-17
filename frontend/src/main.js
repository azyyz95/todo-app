const API = 'http://localhost:3000'
let todos = []
let currentFilter = 'all'

// DATE
document.getElementById('today-date').textContent =
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

// FETCH TODOS
async function fetchTodos() {
  const res = await fetch(`${API}/todos`)
  todos = await res.json()
  renderTodos()
  updateStats()
}

// RENDER
function renderTodos() {
  const list = document.getElementById('todos-list')
  let filtered = todos
  if (currentFilter === 'done') filtered = todos.filter(t => t.done)
  if (currentFilter === 'active') filtered = todos.filter(t => !t.done)

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="text-center py-20 text-gray-500">
        <i class="fas fa-clipboard-list text-6xl mb-4 block opacity-30"></i>
        <p class="text-lg">Aucune tâche ici !</p>
      </div>`
    return
  }

  list.innerHTML = filtered.map(todo => `
    <div class="todo-card glass rounded-2xl p-5 mb-3 card-hover animate-slide border border-white/5 ${todo.done ? 'todo-done' : ''}" data-id="${todo.id}">
      
      <div class="flex items-center justify-between gap-4 flex-wrap">
        
        <!-- Left -->
        <div class="flex items-center gap-4 flex-1">
          <button onclick="toggleDone(${todo.id})"
            class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
            ${todo.done ? 'bg-cyan-400 border-cyan-400 text-white' : 'border-purple-400 hover:border-cyan-400'}">
            ${todo.done ? '<i class="fas fa-check text-xs"></i>' : ''}
          </button>
          <span class="todo-text text-sm font-medium text-white">${todo.text}</span>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 flex items-center gap-1">
            <i class="fas fa-calendar-alt"></i> ${todo.date}
          </span>
          <button onclick="toggleDetail(${todo.id})"
            class="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center text-xs">
            <i class="fas fa-chevron-down"></i>
          </button>
          <button onclick="startEdit(${todo.id})"
            class="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-white transition-all flex items-center justify-center text-xs">
            <i class="fas fa-pen"></i>
          </button>
          <button onclick="deleteTodo(${todo.id})"
            class="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-xs">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Detail Panel -->
      <div class="detail-panel mt-4 pt-4 border-t border-white/10" id="detail-${todo.id}">
        <label class="text-xs text-gray-400 mb-2 block flex items-center gap-2">
          <i class="fas fa-comment-dots text-purple-400"></i> Commentaire
        </label>
        <textarea
          onblur="saveComment(${todo.id}, this.value)"
          placeholder="Ajouter un commentaire..."
          class="w-full bg-white/5 text-white text-sm p-3 rounded-xl border border-white/10 focus:border-purple-400 resize-none min-h-20 placeholder-gray-600 transition-all"
        >${todo.comment || ''}</textarea>
      </div>

    </div>
  `).join('')
}

// STATS
function updateStats() {
  const total = todos.length
  const done = todos.filter(t => t.done).length
  const active = total - done
  const percent = total ? Math.round((done / total) * 100) : 0

  document.getElementById('stat-total').textContent = total
  document.getElementById('stat-done').textContent = done
  document.getElementById('stat-active').textContent = active
  document.getElementById('progress-bar').style.width = percent + '%'
  document.getElementById('progress-percent').textContent = percent + '%'
}

// ADD TODO
async function addTodo() {
  const input = document.getElementById('todo-input')
  const text = input.value.trim()
  if (!text) return
  await fetch(`${API}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  input.value = ''
  fetchTodos()
}

// DELETE
async function deleteTodo(id) {
  await fetch(`${API}/todos/${id}`, { method: 'DELETE' })
  fetchTodos()
}

// TOGGLE DONE
async function toggleDone(id) {
  const todo = todos.find(t => t.id === id)
  await fetch(`${API}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: !todo.done })
  })
  fetchTodos()
}

// EDIT
function startEdit(id) {
  const todo = todos.find(t => t.id === id)
  const card = document.querySelector(`[data-id="${id}"]`)
  const textSpan = card.querySelector('.todo-text')
  textSpan.innerHTML = `
    <input type="text" value="${todo.text}"
      class="bg-white/10 text-white text-sm px-3 py-1 rounded-lg border border-purple-400 focus:outline-none w-64"
      onblur="saveEdit(${id}, this.value)"
      onkeydown="if(event.key==='Enter') this.blur()"
    />`
  card.querySelector('input[type=text]').focus()
}

async function saveEdit(id, text) {
  if (!text.trim()) return
  await fetch(`${API}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  fetchTodos()
}

// COMMENT
async function saveComment(id, comment) {
  await fetch(`${API}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment })
  })
}

// TOGGLE DETAIL
function toggleDetail(id) {
  const panel = document.getElementById(`detail-${id}`)
  panel.classList.toggle('open')
}

// FILTERS
document.getElementById('filters').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn')
  if (!btn) return
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active', 'btn-gradient', 'text-white', 'shadow')
    b.classList.add('glass', 'text-gray-300')
  })
  btn.classList.add('active', 'btn-gradient', 'text-white', 'shadow')
  btn.classList.remove('glass', 'text-gray-300')
  currentFilter = btn.dataset.filter
  renderTodos()
})

// ADD BUTTON & ENTER KEY
document.getElementById('btn-add').addEventListener('click', addTodo)
document.getElementById('todo-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo()
})

// EXPOSE FUNCTIONS
window.toggleDone = toggleDone
window.deleteTodo = deleteTodo
window.toggleDetail = toggleDetail
window.startEdit = startEdit
window.saveEdit = saveEdit
window.saveComment = saveComment

// INIT
fetchTodos()