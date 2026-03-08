const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const API_TIMEOUT = 25000
const MODEL = 'deepseek/deepseek-chat'

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number = API_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://learning-companion-nine.vercel.app',
    'X-Title': 'Learning Companion'
  }
}

export async function generateLearningPlan(topic: string, level: string, hoursPerWeek: number) {
  const prompt = `请用中文回答。你是一个专业的学习规划师。请为以下学习需求制定一个详细的学习计划：

学习主题：${topic}
当前水平：${level}
每周可用时间：${hoursPerWeek}小时

请生成一个包含以下内容的JSON格式学习计划：
{
  "totalWeeks": 总周数,
  "weeklySchedule": [
    {
      "week": 周数,
      "theme": "本周主题",
      "objectives": ["目标1", "目标2"],
      "resources": ["资源1", "资源2"],
      "exercises": ["练习1", "练习2"],
      "estimatedHours": 预计小时数
    }
  ],
  "milestones": [
    {
      "week": 周数,
      "description": "里程碑描述",
      "checkpoint": "检查点"
    }
  ]
}

只返回JSON，不要其他文字。`

  const response = await fetchWithTimeout(OPENROUTER_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  try {
    return JSON.parse(content)
  } catch {
    return {
      totalWeeks: Math.ceil(40 / hoursPerWeek),
      weeklySchedule: generateDefaultSchedule(topic, Math.ceil(40 / hoursPerWeek)),
      milestones: []
    }
  }
}

export async function explainConcept(concept: string, context: string, style: string) {
  const stylePrompts: Record<string, string> = {
    simple: '用简单易懂的语言解释，适合初学者理解。',
    detailed: '用详细专业的方式解释，包含技术细节和原理。',
    analogy: '用生动的类比和比喻来解释，帮助理解抽象概念。',
    code_focused: '用代码示例来解释，重点展示实际应用。'
  }

  const prompt = `请用中文回答。你是一个专业的知识讲解师。请${stylePrompts[style] || stylePrompts.simple}

概念：${concept}
背景：${context || '通用'}

请生成一个包含以下内容的JSON格式讲解：
{
  "concept": "概念名称",
  "definition": "简洁的定义",
  "explanation": "详细解释",
  "analogies": ["类比1", "类比2"],
  "examples": [
    {
      "title": "示例标题",
      "description": "示例描述",
      "code": "代码示例（如果有）"
    }
  ],
  "relatedConcepts": ["相关概念1", "相关概念2"],
  "commonMistakes": ["常见错误1", "常见错误2"],
  "furtherReading": ["延伸阅读1", "延伸阅读2"]
}

只返回JSON，不要其他文字。`

  const response = await fetchWithTimeout(OPENROUTER_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  try {
    return JSON.parse(content)
  } catch {
    return {
      concept,
      definition: `${concept}是一个重要的概念。`,
      explanation: content,
      analogies: [],
      examples: [],
      relatedConcepts: [],
      commonMistakes: [],
      furtherReading: []
    }
  }
}

export async function generateExercises(topic: string, difficulty: string, count: number) {
  const difficultyDesc: Record<string, string> = {
    easy: '基础概念理解，适合初学者',
    medium: '中等难度，需要一定理解和应用能力',
    hard: '高级难度，需要深入理解和综合应用'
  }

  const prompt = `请用中文回答。你是一个专业的练习题生成器。请生成${count}道关于"${topic}"的练习题。

难度：${difficultyDesc[difficulty] || difficultyDesc.medium}

请生成一个包含以下内容的JSON格式练习题：
{
  "exercises": [
    {
      "id": "ex_1",
      "type": "coding",
      "question": "题目内容",
      "correctAnswer": "正确答案",
      "explanation": "答案解析",
      "hints": ["提示1", "提示2"],
      "relatedConcepts": ["相关概念1"]
    }
  ]
}

只返回JSON，不要其他文字。`

  const response = await fetchWithTimeout(OPENROUTER_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  try {
    const result = JSON.parse(content)
    return result.exercises || []
  } catch {
    return generateDefaultExercises(topic, count)
  }
}

function generateDefaultSchedule(topic: string, weeks: number) {
  return Array.from({ length: weeks }, (_, i) => ({
    week: i + 1,
    theme: `${topic} - 第${i + 1}周`,
    objectives: [`掌握${topic}的基础知识`, `完成相关练习`],
    resources: ['官方文档', '在线教程'],
    exercises: ['实践练习', '项目实战'],
    estimatedHours: 10
  }))
}

function generateDefaultExercises(topic: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `ex_${i + 1}`,
    type: 'coding',
    question: `关于${topic}的第${i + 1}道练习题`,
    correctAnswer: '参考答案',
    explanation: '答案解析',
    hints: ['提示1', '提示2'],
    relatedConcepts: [topic]
  }))
}
