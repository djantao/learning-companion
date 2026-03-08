import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

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
    const { topic, hoursPerWeek, level } = req.body
    
    const totalWeeks = Math.ceil(40 / hoursPerWeek) * 2
    
    const response = await notion.pages.create({
      parent: { database_id: DATABASES.plans },
      properties: {
        '主题': { title: [{ text: { content: topic } }] },
        '当前水平': { select: { name: level || 'beginner' } },
        '状态': { select: { name: '进行中' } },
        '开始日期': { date: { start: new Date().toISOString().split('T')[0] } },
        '每周时长': { number: hoursPerWeek },
        '学习风格': { select: { name: 'practice' } }
      }
    })

    res.json({
      success: true,
      planId: response.id,
      topic,
      totalWeeks,
      notionUrl: `https://www.notion.so/${response.id.replace(/-/g, '')}`
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}
