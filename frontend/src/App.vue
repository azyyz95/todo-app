<template>
  <div class="app-wrapper">

    <!-- SIDEBAR -->
    <div class="sidebar">
      <div class="sidebar-logo">
        <i class="fas fa-check-double"></i>
        <span>AZIZ TDOD  </span>
      </div>
      <div class="sidebar-stats">
        <div class="stat-card">
          <span class="stat-number">{{ todos.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ todos.filter(t => t.done).length }}</span>
          <span class="stat-label">Terminées</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ todos.filter(t => !t.done).length }}</span>
          <span class="stat-label">En cours</span>
        </div>
      </div>
      <div class="sidebar-footer">
        <i class="fas fa-user-circle"></i>
        <span>Aziz</span>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main-content">

      <!-- HEADER -->
      <div class="top-header">
        <div>
          <h1 class="page-title">Mes Tâches</h1>
          <p class="page-subtitle">{{ today }}</p>
        </div>
        <div class="progress-wrap">
          <span class="progress-label">Progression</span>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="progress-percent">{{ progressPercent }}%</span>
        </div>
      </div>

      <!-- FORM -->
      <div class="add-form">
        <div class="input-wrap">
          <i class="fas fa-plus-circle input-icon"></i>
          <input
            v-model="newTodo"
            class="todo-input"
            placeholder="Ajouter une nouvelle tâche..."
            @keyup.enter="addTodo"
          />
        </div>
        <button class="btn-add" @click="addTodo">
          <i class="fas fa-plus"></i> Ajouter
        </button>
      </div>

      <!-- FILTERS -->
      <div class="filters">
        <button :class="['filter-btn', filter === 'all' ? 'active' : '']" @click="filter = 'all'">
          Toutes
        </button>
        <button :class="['filter-btn', filter === 'active' ? 'active' : '']" @click="filter = 'active'">
          En cours
        </button>
        <button :class="['filter-btn', filter === 'done' ? 'active' : '']" @click="filter = 'done'">
          Terminées
        </button>
      </div>

      <!-- TODOS -->
      <div class="todos-list">
        <div
          v-for="todo in filteredTodos"
          :key="todo.id"
          :class="['todo-card', todo.done ? 'todo-done' : '']"
        >
          <!-- Card Header -->
          <div class="card-header-row">
            <div class="card-left">
              <div class="custom-check" @click="toggleDone(todo)">
                <i v-if="todo.done" class="fas fa-check"></i>
              </div>
              <input v-if="todo.editing" v-model="todo.text" class="edit-input" />
              <span v-else class="todo-text">{{ todo.text }}</span>
            </div>
            <div class="card-right">
              <span class="todo-date">
                <i class="fas fa-calendar-alt"></i> {{ todo.date }}
              </span>
              <button class="action-btn btn-detail" @click="toggleDetail(todo)" title="Détails">
                <i :class="todo.showDetail ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              </button>
              <button class="action-btn btn-edit" @click="toggleEdit(todo)" title="Modifier">
                <i :class="todo.editing ? 'fas fa-save' : 'fas fa-pen'"></i>
              </button>
              <button class="action-btn btn-delete" @click="deleteTodo(todo.id)" title="Supprimer">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- Card Detail -->
          <div v-if="todo.showDetail" class="card-detail">
            <label><i class="fas fa-comment-dots"></i> Commentaire</label>
            <textarea
              v-model="todo.comment"
              placeholder="Ajouter un commentaire..."
              @blur="saveComment(todo)"
            ></textarea>
          </div>

        </div>

        <!-- Empty State -->
        <div v-if="filteredTodos.length === 0" class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <p>Aucune tâche ici !</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      todos: [],
      newTodo: '',
      filter: 'all',
      today: new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    }
  },
  computed: {
    filteredTodos() {
      if (this.filter === 'done') return this.todos.filter(t => t.done)
      if (this.filter === 'active') return this.todos.filter(t => !t.done)
      return this.todos
    },
    progressPercent() {
      if (!this.todos.length) return 0
      return Math.round((this.todos.filter(t => t.done).length / this.todos.length) * 100)
    }
  },
  mounted() {
    this.fetchTodos()
  },
  methods: {
    async fetchTodos() {
      const res = await fetch('http://localhost:3000/todos')
      const data = await res.json()
      this.todos = data.map(t => ({ ...t, showDetail: false, editing: false }))
    },
    async addTodo() {
      if (!this.newTodo.trim()) return
      await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: this.newTodo })
      })
      this.newTodo = ''
      this.fetchTodos()
    },
    async deleteTodo(id) {
      await fetch(`http://localhost:3000/todos/${id}`, { method: 'DELETE' })
      this.fetchTodos()
    },
    async toggleEdit(todo) {
      if (todo.editing) {
        await fetch(`http://localhost:3000/todos/${todo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: todo.text })
        })
        todo.editing = false
      } else {
        todo.editing = true
      }
    },
    async toggleDone(todo) {
      todo.done = !todo.done
      await fetch(`http://localhost:3000/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: todo.done })
      })
    },
    async saveComment(todo) {
      await fetch(`http://localhost:3000/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: todo.comment })
      })
    },
    toggleDetail(todo) {
      todo.showDetail = !todo.showDetail
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Poppins', sans-serif;
  background: #f0f2f8;
  min-height: 100vh;
}

/* APP LAYOUT */
.app-wrapper {
  display: flex;
  min-height: 100vh;
}

/* SIDEBAR */
.sidebar {
  width: 240px;
  background: linear-gradient(160deg, #6c63ff, #3b3296);
  padding: 36px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  height: 100vh;
  box-shadow: 4px 0 20px rgba(108,99,255,0.3);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 40px;
}

.sidebar-logo i { font-size: 28px; }

.sidebar-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card {
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(4px);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255,255,255,0.8);
  font-size: 15px;
}

.sidebar-footer i { font-size: 26px; }

/* MAIN */
.main-content {
  margin-left: 240px;
  flex: 1;
  padding: 40px;
  max-width: 860px;
}

/* HEADER */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.page-subtitle {
  color: #888;
  font-size: 14px;
  text-transform: capitalize;
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-label {
  font-size: 13px;
  color: #888;
}

.progress-bar-wrap {
  width: 120px;
  height: 8px;
  background: #ddd;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6c63ff, #00d4aa);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-percent {
  font-size: 13px;
  font-weight: 600;
  color: #6c63ff;
}

/* FORM */
.add-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.input-wrap {
  flex: 1;
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c63ff;
  font-size: 18px;
}

.todo-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border-radius: 12px;
  border: 2px solid #e0e0f0;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
  background: white;
  color: #1a1a2e;
  transition: border 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.todo-input:focus {
  outline: none;
  border-color: #6c63ff;
}

.btn-add {
  padding: 14px 24px;
  background: linear-gradient(135deg, #6c63ff, #3b3296);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(108,99,255,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108,99,255,0.5);
}

/* FILTERS */
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.filter-btn {
  padding: 8px 20px;
  border-radius: 30px;
  border: 2px solid #e0e0f0;
  background: white;
  color: #888;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: linear-gradient(135deg, #6c63ff, #3b3296);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(108,99,255,0.3);
}

/* TODO CARD */
.todo-card {
  background: white;
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 14px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #6c63ff;
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.todo-card.todo-done {
  border-left-color: #00d4aa;
  opacity: 0.75;
}

.todo-card.todo-done .todo-text {
  text-decoration: line-through;
  color: #aaa;
}

/* Card Header Row */
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

/* Custom Checkbox */
.custom-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #6c63ff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  flex-shrink: 0;
}

.todo-done .custom-check {
  background: #00d4aa;
  border-color: #00d4aa;
  color: white;
}

.todo-text {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a2e;
}

.edit-input {
  border: 2px solid #6c63ff;
  border-radius: 8px;
  padding: 6px 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
  color: #1a1a2e;
  flex: 1;
}

.edit-input:focus { outline: none; }

/* Card Right */
.card-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-date {
  font-size: 12px;
  color: #aaa;
  white-space: nowrap;
}

.todo-date i { margin-right: 4px; }

/* Action Buttons */
.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-detail { background: #f0eeff; color: #6c63ff; }
.btn-detail:hover { background: #6c63ff; color: white; }

.btn-edit { background: #fff8e6; color: #f7a600; }
.btn-edit:hover { background: #f7a600; color: white; }

.btn-delete { background: #fff0f0; color: #ff4d4d; }
.btn-delete:hover { background: #ff4d4d; color: white; }

/* Card Detail */
.card-detail {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.card-detail label {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
  display: block;
}

.card-detail label i { margin-right: 6px; color: #6c63ff; }

.card-detail textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0f0;
  border-radius: 10px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #1a1a2e;
  resize: vertical;
  min-height: 80px;
  transition: border 0.3s;
}

.card-detail textarea:focus {
  outline: none;
  border-color: #6c63ff;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #ccc;
}

.empty-state i {
  font-size: 60px;
  margin-bottom: 16px;
  display: block;
}

.empty-state p {
  font-size: 16px;
}
</style>