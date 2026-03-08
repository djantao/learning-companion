import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN }) as any

const DATABASES = {
  plans: '31c3af34-8d57-8189-b341-f97043757be2',
  progress: '31c3af34-8d57-8139-b6ed-e40b348d051b',
  exercises: '31c3af34-8d57-8195-b1a6-d60a89616d49',
  notes: '31c3af34-8d57-8131-8017-d5cc628f473d'
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'stepfun/step-3.5-flash:free'
const API_TIMEOUT = 30000

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { concept, userExplanation, mode } = req.body
    
    if (mode === 'start') {
      const prompt = `请用中文回答。你是一位耐心的学习导师，正在使用费曼学习法帮助学生理解概念。

学生想要学习的概念是：${concept}

请引导学生用自己的话解释这个概念。你的回复应该：
1. 简单介绍这个概念是什么（1-2句话）
2. 鼓励学生用自己的话解释
3. 提示学生想象自己在向一个完全不懂这个领域的人解释

请用友好、鼓励的语气，不要超过100字。`

      const response = await fetchWithTimeout(OPENROUTER_API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500
        })
      })

      const data = await response.json()
      const guidance = data.choices[0].message.content

      res.json({
        success: true,
        stage: 'explain',
        guidance,
        concept
      })
    } else if (mode === 'analyze') {
      const prompt = `请用中文回答。你是一位耐心的学习导师，正在使用费曼学习法帮助学生理解概念。

学生正在学习的概念是：${concept}

学生用自己的话解释如下：
"""
${userExplanation}
"""

请分析学生的解释，并按以下JSON格式返回：
{
  "strengths": ["学生理解得好的地方1", "学生理解得好的地方2"],
  "gaps": ["可能存在的理解漏洞1", "可能存在的理解漏洞2"],
  "questions": ["引导学生深入思考的问题1", "引导学生深入思考的问题2"],
  "encouragement": "鼓励的话语",
  "nextStep": "下一步建议"
}

注意：
1. 如果学生的解释很好，要真诚地肯定
2. 如果有漏洞，用启发式问题引导而不是直接指出
3. 问题要能帮助学生自己发现漏洞
4. 语气要鼓励和支持`

      const response = await fetchWithTimeout(OPENROUTER_API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const data = await response.json()
      const content = data.choices[0].message.content
      
      let analysis
      try {
        analysis = JSON.parse(content)
      } catch {
        analysis = {
          strengths: ['你已经开始用自己的语言理解这个概念了'],
          gaps: [],
          questions: ['你能再详细解释一下吗？'],
          encouragement: '继续加油！',
          nextStep: '尝试更详细地解释',
          rawContent: content
        }
      }

      res.json({
        success: true,
        stage: 'analyze',
        analysis,
        concept
      })
    } else if (mode === 'summary') {
      const prompt = `请用中文回答。你是一位耐心的学习导师，正在使用费曼学习法帮助学生理解概念。

学生正在学习的概念是：${concept}

学生经过多轮解释后的最终理解：
"""
${userExplanation}
"""

请生成一个简洁的知识总结，按以下JSON格式返回：
{
  "concept": "概念名称",
  "corePoints": ["核心要点1", "核心要点2", "核心要点3"],
  "simpleExplanation": "用最简单的语言解释这个概念（不超过50字）",
  "analogy": "一个生动的类比",
  "relatedConcepts": ["相关概念1", "相关概念2"],
  "masteryLevel": "beginner/intermediate/advanced"
}`

      const response = await fetchWithTimeout(OPENROUTER_API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const data = await response.json()
      const content = data.choices[0].message.content
      
      let summary
      try {
        summary = JSON.parse(content)
      } catch {
        summary = {
          concept,
          corePoints: ['理解了基本概念'],
          simpleExplanation: content.slice(0, 100),
          analogy: '',
          relatedConcepts: [],
          masteryLevel: 'beginner',
          rawContent: content
        }
      }

      const notionResponse = await notion.pages.create({
        parent: { database_id: DATABASES.notes },
        properties: {
          '标题': { title: [{ text: { content: `费曼学习 - ${concept}` } }] },
          '类型': { select: { name: '知识总结' } },
          '创建日期': { date: { start: new Date().toISOString().split('T')[0] } },
          '标签': { multi_select: [{ name: concept }, { name: '费曼学习法' }] }
        }
      } as any)

      res.json({
        success: true,
        stage: 'complete',
        summary,
        concept,
        notionUrl: `https://www.notion.so/${notionResponse.id.replace(/-/g, '')}`
      })
    } else {
      res.status(400).json({ error: 'Invalid mode' })
    }
  } catch (error) {
    console.error('Feynman learning error:', error)
    res.status(500).json({ error: error.message })
  }
}
