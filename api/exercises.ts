import { Client } from '@notionhq/client'
import { generateExercises } from './deepseek.js'

const notion = new Client({ auth: process.env.NOTION_TOKEN }) as any

const DATABASES = {
  plans: '31c3af34-8d57-8189-b341-f97043757be2',
  progress: '31c3af34-8d57-8139-b6ed-e40b348d051b',
  exercises: '31c3af34-8d57-8195-b1a6-d60a89616d49',
  notes: '31c3af34-8d57-8131-8017-d5cc628f473d'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { topic, difficulty, count } = req.body
    
    let exercises
    try {
      exercises = await generateExercises(topic, difficulty, count)
    } catch (error) {
      console.error('DeepSeek API error:', error)
      exercises = Array.from({ length: count }, (_, i) => ({
        id: `ex_${i + 1}`,
        type: 'coding',
        question: `关于${topic}的第${i + 1}道练习题`,
        correct_answer: '参考答案',
        explanation: '答案解析',
        hints: ['提示1', '提示2'],
        difficulty
      }))
    }
    
    const response = await notion.pages.create({
      parent: { database_id: DATABASES.exercises },
      properties: {
        '练习主题': { title: [{ text: { content: `${topic} - 练习题` } }] },
        '难度': { select: { name: difficulty || 'medium' } },
        '创建日期': { date: { start: new Date().toISOString().split('T')[0] } },
        '完成状态': { select: { name: '未开始' } }
      }
    })

    res.json({
      success: true,
      exercises,
      notionUrl: `https://www.notion.so/${response.id.replace(/-/g, '')}`
    })
  } catch (error) {
    console.error('Exercises error:', error)
    res.status(500).json({ error: error.message })
  }
}
