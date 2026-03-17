import { useState, useEffect } from 'react'

const API = 'http://localhost:3000'

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all')
  const [openDetail, setOpenDetail] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  useEffect(() => { fetchTodos() }, [])

  async function fetchTodos() {
    const res = await fetch(`${API}/todos`)
    setTodos(await res.json())
  }

  async function addTodo() {
    if (!newTodo.trim()) return
    await fetch(`${API}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newTodo })
    })
    setNewTodo('')
    fetchTodos()
  }

  async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, { method: 'DELETE' })
    fetchTodos()
  }

  async function toggleDone(todo) {
    await fetch(`${API}/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !todo.done })
    })
    fetchTodos()
  }

  async function saveEdit(id) {
    if (!editText.trim()) return
    await fetch(`${API}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText })
    })
    setEditingId(null)
    fetchTodos()
  }

  async function saveComment(id, comment) {
    await fetch(`${API}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment })
    })
  }

  const filtered = todos.filter(t => {
    if (filter === 'done') return t.done
    if (filter === 'active') return !t.done
    return true
  })

  const total = todos.length
  const done = todos.filter(t => t.done).length
  const active = total - done
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="flex min-h-screen" style={{background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)'}}>

      {/* SIDEBAR */}
      <aside className="w-64 fixed h-screen flex flex-col p-6 gap-6 z-10"
        style={{background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.1)'}}>

        {/* Logo */}
        <div className="flex items-center gap-3 mt-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg text-white text-lg"
            style={{background: 'linear-gradient(135deg, #7C3AED, #4F46E5)'}}>
            ✓
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">ZZ Todo</h2>
            <p className="text-xs text-purple-300">Task Manager</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Statistiques</p>
          {[
            { label: 'Total', value: total, icon: '📋', color: 'rgba(124,58,237,0.2)', text: '#a78bfa' },
            { label: 'Terminées', value: done, icon: '✅', color: 'rgba(6,182,212,0.2)', text: '#67e8f9' },
            { label: 'En cours', value: active, icon: '⏳', color: 'rgba(249,115,22,0.2)', text: '#fdba74' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 flex items-center gap-4"
              style={{background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{background: s.color}}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="rounded-2xl p-4"
          style={{background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-gray-400 font-semibold">Progression</p>
            <p className="text-sm font-bold text-purple-400">{percent}%</p>
          </div>
          <div className="w-full rounded-full h-2" style={{background: 'rgba(255,255,255,0.1)'}}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{width: `${percent}%`, background: 'linear-gradient(90deg, #7C3AED, #06B6D4)'}}></div>
          </div>
        </div>

        {/* User */}
        <div className="mt-auto rounded-2xl p-4 flex items-center gap-3"
          style={{background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)'}}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
            style={{background: 'linear-gradient(135deg, #7C3AED, #4F46E5)'}}>AZ</div>
          <div>
            <p className="font-semibold text-sm text-white">Mohamed Aziz</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{background: '#4ade80'}}></span>
              En ligne
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-64 flex-1 p-8 max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-1">Mes Tâches 📋</h1>
          <p className="text-gray-400 text-sm capitalize">{today}</p>
        </div>

        {/* Form */}
        <div className="flex gap-2 mb-6 rounded-2xl p-2 shadow-xl"
          style={{background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)'}}>
          <div className="flex-1 flex items-center gap-3 px-4">
            <span className="text-purple-400">+</span>
            <input
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="Ajouter une nouvelle tâche..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm py-3 focus:outline-none"
            />
          </div>
          <button onClick={addTodo}
            className="text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95"
            style={{background: 'linear-gradient(135deg, #7C3AED, #4F46E5)'}}>
            + Ajouter
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'active', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={filter === f
                ? {background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: 'white'}
                : {background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)'}
              }>
              {f === 'all' ? 'Toutes' : f === 'active' ? 'En cours' : 'Terminées'}
            </button>
          ))}
        </div>

        {/* Todos */}
        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-6xl mb-4">📭</p>
              <p className="text-lg">Aucune tâche ici !</p>
            </div>
          ) : filtered.map(todo => (
            <div key={todo.id}
              className="rounded-2xl p-5 mb-3 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: `1px solid ${todo.done ? 'rgba(6,182,212,0.3)' : 'rgba(124,58,237,0.3)'}`,
                borderLeft: `4px solid ${todo.done ? '#06B6D4' : '#7C3AED'}`,
                opacity: todo.done ? 0.75 : 1
              }}>

              {/* Card Header */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1">
                  {/* Checkbox */}
                  <button onClick={() => toggleDone(todo)}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 text-xs text-white"
                    style={todo.done
                      ? {background: '#06B6D4', borderColor: '#06B6D4'}
                      : {background: 'transparent', borderColor: '#7C3AED'}}>
                    {todo.done && '✓'}
                  </button>

                  {/* Text or Edit */}
                  {editingId === todo.id ? (
                    <input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={() => saveEdit(todo.id)}
                      onKeyDown={e => e.key === 'Enter' && saveEdit(todo.id)}
                      autoFocus
                      className="bg-white/10 text-white text-sm px-3 py-1 rounded-lg border border-purple-400 focus:outline-none flex-1"
                    />
                  ) : (
                    <span className="text-sm font-medium text-white"
                      style={todo.done ? {textDecoration: 'line-through', opacity: 0.5} : {}}>
                      {todo.text}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">📅 {todo.date}</span>

                  <button onClick={() => setOpenDetail(openDetail === todo.id ? null : todo.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all hover:text-white"
                    style={{background: 'rgba(124,58,237,0.15)', color: '#a78bfa'}}>
                    {openDetail === todo.id ? '▲' : '▼'}
                  </button>

                  <button onClick={() => { setEditingId(todo.id); setEditText(todo.text) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all hover:text-white"
                    style={{background: 'rgba(245,158,11,0.15)', color: '#fbbf24'}}>
                    ✏️
                  </button>

                  <button onClick={() => deleteTodo(todo.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all hover:text-white"
                    style={{background: 'rgba(239,68,68,0.15)', color: '#f87171'}}>
                    🗑️
                  </button>
                </div>
              </div>

              {/* Detail Panel */}
              {openDetail === todo.id && (
                <div className="mt-4 pt-4" style={{borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                  <label className="text-xs text-gray-400 mb-2 block">💬 Commentaire</label>
                  <textarea
                    defaultValue={todo.comment || ''}
                    onBlur={e => saveComment(todo.id, e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="w-full text-white text-sm p-3 rounded-xl resize-none focus:outline-none placeholder-gray-600 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      minHeight: '80px'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App