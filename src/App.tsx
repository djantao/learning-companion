import { useState, useEffect } from 'react'
import { BookOpen, PenTool, BarChart3, Menu, X, ChevronRight, Clock, Target, GraduationCap, MessageCircle, CheckCircle } from 'lucide-react'

type Page = 'home' | 'plan' | 'feynman' | 'exercise' | 'progress' | 'stats'

interface WeeklySchedule {
  week: number
  theme: string
  objectives: string[]
  resources: string[]
  exercises: string[]
  estimatedHours: number
}

interface LearningPlan {
  planId: string
  topic: string
  totalWeeks: number
  weeklySchedule: WeeklySchedule[]
  milestones: any[]
  notionUrl: string
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<LearningPlan | null>(null)

  useEffect(() => {
    const savedPlan = localStorage.getItem('currentPlan')
    if (savedPlan) {
      setCurrentPlan(JSON.parse(savedPlan))
    }
  }, [])

  const savePlan = (plan: LearningPlan) => {
    setCurrentPlan(plan)
    localStorage.setItem('currentPlan', JSON.stringify(plan))
  }

  const navItems = [
    { id: 'home' as Page, label: '首页', icon: BookOpen },
    { id: 'plan' as Page, label: '学习计划', icon: BookOpen },
    { id: 'feynman' as Page, label: '费曼学习', icon: GraduationCap },
    { id: 'exercise' as Page, label: '练习题', icon: PenTool },
    { id: 'progress' as Page, label: '记录进度', icon: BarChart3 },
    { id: 'stats' as Page, label: '学习库', icon: BarChart3 },
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
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} currentPlan={currentPlan} />}
        {currentPage === 'plan' && <PlanPage onSavePlan={savePlan} currentPlan={currentPlan} />}
        {currentPage === 'feynman' && <FeynmanPage currentPlan={currentPlan} />}
        {currentPage === 'exercise' && <ExercisePage currentPlan={currentPlan} />}
        {currentPage === 'progress' && <ProgressPage />}
        {currentPage === 'stats' && <StatsPage />}
      </main>

      <footer className="footer">
        <p>数据存储在 Notion · 支持手机访问</p>
      </footer>
    </div>
  )
}

function HomePage({ onNavigate, currentPlan }: { onNavigate: (page: Page) => void; currentPlan: LearningPlan | null }) {
  const features = [
    { icon: BookOpen, title: '创建学习计划', desc: '输入学习目标，AI生成个性化计划', page: 'plan' as Page },
    { icon: GraduationCap, title: '费曼学习法', desc: '用教别人的方式学习，深度理解', page: 'feynman' as Page },
    { icon: PenTool, title: '生成练习题', desc: '针对性练习，巩固学习成果', page: 'exercise' as Page },
    { icon: BarChart3, title: '我的知识库', desc: '查看学习记录和知识总结', page: 'stats' as Page },
  ]

  return (
    <div className="page home-page">
      <div className="hero">
        <h2>你的智能学习助手</h2>
        <p>AI驱动的个性化学习，数据存储在Notion，手机电脑都能访问</p>
      </div>

      {currentPlan && (
        <div className="current-plan-card">
          <h3>📋 当前学习计划</h3>
          <div className="plan-summary">
            <div className="plan-topic">{currentPlan.topic}</div>
            <div className="plan-meta">
              <span><Clock size={16} /> {currentPlan.totalWeeks}周</span>
              <span><Target size={16} /> {currentPlan.weeklySchedule?.length || 0}个学习单元</span>
            </div>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('plan')}>
            查看完整计划 <ChevronRight size={16} />
          </button>
        </div>
      )}

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

function PlanPage({ onSavePlan, currentPlan }: { onSavePlan: (plan: LearningPlan) => void; currentPlan: LearningPlan | null }) {
  const [topic, setTopic] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LearningPlan | null>(currentPlan)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

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
      const plan: LearningPlan = {
        planId: data.planId,
        topic: data.topic,
        totalWeeks: data.totalWeeks,
        weeklySchedule: data.weeklySchedule || [],
        milestones: data.milestones || [],
        notionUrl: data.notionUrl
      }
      setResult(plan)
      onSavePlan(plan)
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
        <div className="result-card plan-result">
          <h3>📚 {result.topic} 学习计划</h3>
          <div className="plan-overview">
            <div className="overview-item">
              <span className="overview-value">{result.totalWeeks}</span>
              <span className="overview-label">周</span>
            </div>
            <div className="overview-item">
              <span className="overview-value">{result.weeklySchedule?.length || 0}</span>
              <span className="overview-label">学习单元</span>
            </div>
          </div>

          {result.weeklySchedule && result.weeklySchedule.length > 0 && (
            <div className="weekly-schedule">
              <h4>📅 学习安排</h4>
              {result.weeklySchedule.map((week, index) => (
                <div key={index} className="week-item">
                  <div 
                    className="week-header"
                    onClick={() => setExpandedWeek(expandedWeek === index ? null : index)}
                  >
                    <span className="week-number">第{week.week}周</span>
                    <span className="week-theme">{week.theme}</span>
                    <span className="week-hours">{week.estimatedHours}小时</span>
                    <ChevronRight 
                      size={20} 
                      className={expandedWeek === index ? 'expanded' : ''} 
                    />
                  </div>
                  {expandedWeek === index && (
                    <div className="week-details">
                      <div className="detail-section">
                        <strong>🎯 学习目标</strong>
                        <ul>
                          {week.objectives?.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="detail-section">
                        <strong>📖 学习资源</strong>
                        <ul>
                          {week.resources?.map((res, i) => (
                            <li key={i}>{res}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="detail-section">
                        <strong>✏️ 练习任务</strong>
                        <ul>
                          {week.exercises?.map((ex, i) => (
                            <li key={i}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

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

function FeynmanPage({ currentPlan }: { currentPlan: LearningPlan | null }) {
  const [concept, setConcept] = useState('')
  const [stage, setStage] = useState<'input' | 'explain' | 'analyze' | 'complete'>('input')
  const [loading, setLoading] = useState(false)
  const [guidance, setGuidance] = useState('')
  const [userExplanation, setUserExplanation] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [round, setRound] = useState(0)

  const suggestedConcepts = currentPlan?.weeklySchedule?.flatMap(week => 
    week.objectives?.slice(0, 2) || []
  ).slice(0, 5) || []

  const handleStart = async (conceptToLearn?: string) => {
    const targetConcept = conceptToLearn || concept
    if (!targetConcept.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/feynman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: targetConcept, mode: 'start' })
      })
      const data = await response.json()
      if (data.success) {
        setConcept(targetConcept)
        setGuidance(data.guidance)
        setStage('explain')
        setRound(1)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!userExplanation.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/feynman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          concept, 
          userExplanation, 
          mode: 'analyze' 
        })
      })
      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
        setStage('analyze')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    setUserExplanation('')
    setAnalysis(null)
    setStage('explain')
    setRound(r => r + 1)
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/feynman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          concept, 
          userExplanation, 
          mode: 'summary' 
        })
      })
      const data = await response.json()
      if (data.success) {
        setSummary(data.summary)
        setStage('complete')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setConcept('')
    setStage('input')
    setGuidance('')
    setUserExplanation('')
    setAnalysis(null)
    setSummary(null)
    setRound(0)
  }

  return (
    <div className="page">
      <h2>🎓 费曼学习法</h2>
      <p className="page-desc">用教别人的方式学习，真正理解知识</p>

      {stage === 'input' && (
        <>
          {currentPlan && suggestedConcepts.length > 0 && (
            <div className="suggested-section">
              <h4>📌 根据你的学习计划推荐</h4>
              <div className="suggested-concepts">
                {suggestedConcepts.map((c, i) => (
                  <button 
                    key={i} 
                    className="concept-chip"
                    onClick={() => handleStart(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>想学习的概念</label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="例如：闭包、LSM Tree、React Hooks"
            />
          </div>

          <button 
            className="btn-primary" 
            onClick={() => handleStart()}
            disabled={loading || !concept.trim()}
          >
            {loading ? '准备中...' : '开始学习'}
          </button>

          <div className="feynman-steps">
            <h4>费曼学习法四步</h4>
            <div className="steps-list">
              <div className="step-item">
                <span className="step-num">1</span>
                <span>选择概念</span>
              </div>
              <div className="step-item">
                <span className="step-num">2</span>
                <span>用自己的话解释</span>
              </div>
              <div className="step-item">
                <span className="step-num">3</span>
                <span>发现理解漏洞</span>
              </div>
              <div className="step-item">
                <span className="step-num">4</span>
                <span>回顾并简化</span>
              </div>
            </div>
          </div>
        </>
      )}

      {stage === 'explain' && (
        <div className="feynman-explain">
          <div className="concept-badge">
            <GraduationCap size={20} />
            <span>正在学习：{concept}</span>
            <span className="round-badge">第{round}轮</span>
          </div>

          <div className="guidance-card">
            <MessageCircle size={24} className="guidance-icon" />
            <p>{guidance}</p>
          </div>

          <div className="form-group">
            <label>用你自己的话解释这个概念：</label>
            <textarea
              value={userExplanation}
              onChange={(e) => setUserExplanation(e.target.value)}
              placeholder="想象你在向一个完全不懂这个领域的人解释..."
              rows={6}
            />
          </div>

          <div className="btn-group">
            <button 
              className="btn-primary" 
              onClick={handleAnalyze}
              disabled={loading || !userExplanation.trim()}
            >
              {loading ? '分析中...' : '提交解释'}
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              重新开始
            </button>
          </div>
        </div>
      )}

      {stage === 'analyze' && analysis && (
        <div className="feynman-analyze">
          <div className="concept-badge">
            <GraduationCap size={20} />
            <span>正在学习：{concept}</span>
            <span className="round-badge">第{round}轮</span>
          </div>

          {analysis.strengths?.length > 0 && (
            <div className="analysis-section strengths">
              <h4><CheckCircle size={18} /> 理解得好的地方</h4>
              <ul>
                {analysis.strengths.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.gaps?.length > 0 && (
            <div className="analysis-section gaps">
              <h4>🤔 可能需要深入的地方</h4>
              <ul>
                {analysis.gaps.map((g: string, i: number) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.questions?.length > 0 && (
            <div className="analysis-section questions">
              <h4>💡 思考这些问题</h4>
              <ul>
                {analysis.questions.map((q: string, i: number) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="encouragement">
            <p>{analysis.encouragement}</p>
          </div>

          <div className="btn-group">
            <button className="btn-primary" onClick={handleContinue}>
              继续完善解释
            </button>
            <button className="btn-secondary" onClick={handleComplete}>
              完成学习
            </button>
          </div>
        </div>
      )}

      {stage === 'complete' && summary && (
        <div className="feynman-complete">
          <div className="complete-header">
            <CheckCircle size={48} className="complete-icon" />
            <h3>🎉 学习完成！</h3>
            <p>你已掌握了「{concept}」</p>
          </div>

          <div className="summary-card">
            <h4>📝 知识总结</h4>
            
            <div className="summary-section">
              <strong>核心要点</strong>
              <ul>
                {summary.corePoints?.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {summary.simpleExplanation && (
              <div className="summary-section">
                <strong>简单解释</strong>
                <p>{summary.simpleExplanation}</p>
              </div>
            )}

            {summary.analogy && (
              <div className="summary-section">
                <strong>生动类比</strong>
                <p>{summary.analogy}</p>
              </div>
            )}

            {summary.relatedConcepts?.length > 0 && (
              <div className="summary-section">
                <strong>相关概念</strong>
                <div className="related-tags">
                  {summary.relatedConcepts.map((c: string, i: number) => (
                    <span key={i} className="tag">{c}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mastery-level">
              <span>掌握程度：</span>
              <span className={`level ${summary.masteryLevel}`}>
                {summary.masteryLevel === 'beginner' ? '初学' : 
                 summary.masteryLevel === 'intermediate' ? '理解' : '掌握'}
              </span>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn-primary" onClick={handleReset}>
              学习新概念
            </button>
            {summary.notionUrl && (
              <a href={summary.notionUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                在Notion中查看
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ExercisePage({ currentPlan }: { currentPlan: LearningPlan | null }) {
  const [topic, setTopic] = useState(currentPlan?.topic || '')
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

      {currentPlan && (
        <div className="current-plan-hint">
          <p>📖 当前学习：<strong>{currentPlan.topic}</strong></p>
        </div>
      )}
      
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
                  <p>{ex.correct_answer || ex.correctAnswer}</p>
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

  useEffect(() => {
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
  }, [])

  if (loading) {
    return (
      <div className="page">
        <h2>我的知识库</h2>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>我的知识库</h2>
      
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
