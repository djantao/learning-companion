import { useState } from 'react'
import { BookOpen, Lightbulb, PenTool, BarChart3, Menu, X } from 'lucide-react'

type Page = 'home' | 'plan' | 'explain' | 'exercise' | 'progress' | 'stats'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { id: 'home' as Page, label: '首页', icon: BookOpen },
    { id: 'plan' as Page, label: '学习计划', icon: BookOpen },
    { id: 'explain' as Page, label: '概念讲解', icon: Lightbulb },
    { id: 'exercise' as Page, label: '练习题', icon: PenTool },
    { id: 'progress' as Page, label: '记录进度', icon: BarChart3 },
    { id: 'stats' as Page, label: '学习统计', icon: BarChart3 },
  ]

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="logo" onClick={() => setCurrentPage('home')}>
            📚 学习陪伴者
          </h1>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <nav className={`nav ${menuOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage(item.id)
              setMenuOpen(false)
            }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="main">
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === 'plan' && <PlanPage />}
        {currentPage === 'explain' && <ExplainPage />}
        {currentPage === 'exercise' && <ExercisePage />}
        {currentPage === 'progress' && <ProgressPage />}
        {currentPage === 'stats' && <StatsPage />}
      </main>

      <footer className="footer">
        <p>数据存储在 Notion · 支持手机访问</p>
      </footer>
    </div>
  )
}

function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const features = [
    { icon: BookOpen, title: '创建学习计划', desc: '输入学习目标，AI生成个性化计划', page: 'plan' as Page },
    { icon: Lightbulb, title: '概念讲解', desc: '不懂就问，AI详细讲解知识点', page: 'explain' as Page },
    { icon: PenTool, title: '生成练习题', desc: '针对性练习，巩固学习成果', page: 'exercise' as Page },
    { icon: BarChart3, title: '记录进度', desc: '记录学习时长和心得', page: 'progress' as Page },
  ]

  return (
    <div className="page home-page">
      <div className="hero">
        <h2>你的智能学习助手</h2>
        <p>AI驱动的个性化学习，数据存储在Notion，手机电脑都能访问</p>
      </div>

      <div className="features">
        {features.map((feature, index) => (
          <div key={index} className="feature-card" onClick={() => onNavigate(feature.page)}>
            <feature.icon size={32} className="feature-icon" />
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="quick-start">
        <h3>快速开始</h3>
        <p>告诉我你想学什么，我来帮你制定学习计划</p>
        <button className="btn-primary" onClick={() => onNavigate('plan')}>
          开始学习
        </button>
      </div>
    </div>
  )
}

function PlanPage() {
  const [topic, setTopic] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleCreatePlan = async () => {
    if (!topic.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/create-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, hoursPerWeek, level })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2>创建学习计划</h2>
      
      <div className="form-group">
        <label>学习主题</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：React Hooks、Python数据分析"
        />
      </div>

      <div className="form-group">
        <label>每周学习时长（小时）</label>
        <input
          type="number"
          value={hoursPerWeek}
          onChange={(e) => setHoursPerWeek(Number(e.target.value))}
          min={1}
          max={40}
        />
      </div>

      <div className="form-group">
        <label>当前水平</label>
        <div className="radio-group">
          {[
            { value: 'beginner', label: '初学者' },
            { value: 'intermediate', label: '中级' },
            { value: 'advanced', label: '高级' },
          ].map(item => (
            <label key={item.value} className="radio-label">
              <input
                type="radio"
                name="level"
                value={item.value}
                checked={level === item.value}
                onChange={() => setLevel(item.value as any)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <button 
        className="btn-primary" 
        onClick={handleCreatePlan}
        disabled={loading || !topic.trim()}
      >
        {loading ? '生成中...' : '生成学习计划'}
      </button>

      {result && (
        <div className="result-card">
          <h3>学习计划已创建！</h3>
          <p><strong>主题：</strong>{result.topic}</p>
          <p><strong>周期：</strong>{result.totalWeeks}周</p>
          {result.notionUrl && (
            <a href={result.notionUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              在Notion中查看
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function ExplainPage() {
  const [concept, setConcept] = useState('')
  const [context, setContext] = useState('')
  const [style, setStyle] = useState<'simple' | 'detailed' | 'analogy'>('simple')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleExplain = async () => {
    if (!concept.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, context, style })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2>概念讲解</h2>
      
      <div className="form-group">
        <label>想了解的概念</label>
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="例如：闭包、LSM Tree、React Hooks"
        />
      </div>

      <div className="form-group">
        <label>背景上下文（可选）</label>
        <input
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="例如：JavaScript、数据结构"
        />
      </div>

      <div className="form-group">
        <label>讲解风格</label>
        <div className="radio-group">
          {[
            { value: 'simple', label: '简洁' },
            { value: 'detailed', label: '详细' },
            { value: 'analogy', label: '类比' },
          ].map(item => (
            <label key={item.value} className="radio-label">
              <input
                type="radio"
                name="style"
                value={item.value}
                checked={style === item.value}
                onChange={() => setStyle(item.value as any)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <button 
        className="btn-primary" 
        onClick={handleExplain}
        disabled={loading || !concept.trim()}
      >
        {loading ? '讲解中...' : '开始讲解'}
      </button>

      {result && (
        <div className="result-card explanation">
          <h3>{result.concept}</h3>
          <div className="explanation-content">
            <p>{result.definition}</p>
            <p>{result.explanation}</p>
            {result.analogies?.length > 0 && (
              <>
                <h4>类比理解</h4>
                <ul>
                  {result.analogies.map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          {result.notionUrl && (
            <a href={result.notionUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              保存到Notion
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function ExercisePage() {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [exercises, setExercises] = useState<any[]>([])

  const handleGenerate = async () => {
    if (!topic.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count })
      })
      const data = await response.json()
      setExercises(data.exercises || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2>生成练习题</h2>
      
      <div className="form-group">
        <label>练习主题</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：React Hooks、SQL查询"
        />
      </div>

      <div className="form-group">
        <label>难度</label>
        <div className="radio-group">
          {[
            { value: 'easy', label: '简单' },
            { value: 'medium', label: '中等' },
            { value: 'hard', label: '困难' },
          ].map(item => (
            <label key={item.value} className="radio-label">
              <input
                type="radio"
                name="difficulty"
                value={item.value}
                checked={difficulty === item.value}
                onChange={() => setDifficulty(item.value as any)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>题目数量</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          min={1}
          max={20}
        />
      </div>

      <button 
        className="btn-primary" 
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
      >
        {loading ? '生成中...' : '生成练习题'}
      </button>

      {exercises.length > 0 && (
        <div className="exercises-list">
          {exercises.map((ex, i) => (
            <div key={i} className="exercise-card">
              <h4>题目 {i + 1}</h4>
              <p>{ex.question}</p>
              {ex.hints?.length > 0 && (
                <div className="hints">
                  <strong>提示：</strong>
                  <ul>
                    {ex.hints.map((h: string, j: number) => (
                      <li key={j}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
              <details>
                <summary>查看答案</summary>
                <div className="answer">
                  <p>{ex.correct_answer}</p>
                  <p className="explanation">{ex.explanation}</p>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProgressPage() {
  const [duration, setDuration] = useState(60)
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState('')
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'struggling'>('good')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, content, notes, mood })
      })
      const data = await response.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2>记录学习进度</h2>
      
      <div className="form-group">
        <label>学习时长（分钟）</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min={1}
        />
      </div>

      <div className="form-group">
        <label>学习内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今天学了什么？"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>学习心得（可选）</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="有什么收获或困惑？"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>学习状态</label>
        <div className="radio-group">
          {[
            { value: 'great', label: '很棒' },
            { value: 'good', label: '不错' },
            { value: 'okay', label: '一般' },
            { value: 'struggling', label: '有点难' },
          ].map(item => (
            <label key={item.value} className="radio-label">
              <input
                type="radio"
                name="mood"
                value={item.value}
                checked={mood === item.value}
                onChange={() => setMood(item.value as any)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <button 
        className="btn-primary" 
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? '保存中...' : '保存进度'}
      </button>

      {saved && (
        <div className="success-message">
          进度已保存到Notion！
        </div>
      )}
    </div>
  )
}

function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useState(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  })

  if (loading) {
    return (
      <div className="page">
        <h2>学习统计</h2>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>学习统计</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalTime || 0}</div>
          <div className="stat-label">总学习时长（分钟）</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.days || 0}</div>
          <div className="stat-label">学习天数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.exercises || 0}</div>
          <div className="stat-label">完成练习</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.streak || 0}</div>
          <div className="stat-label">连续学习（天）</div>
        </div>
      </div>

      <div className="stats-actions">
        <a 
          href="https://www.notion.so/31c3af348d5781cca3ceee7efdb58209" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          在Notion中查看详情
        </a>
      </div>
    </div>
  )
}

export default App
