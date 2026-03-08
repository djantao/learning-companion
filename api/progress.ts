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
    const { duration, content, notes, mood } = req.body
    
    await notion.pages.create({
      parent: { database_id: DATABASES.progress },
      properties: {
        '标题': { title: [{ text: { content: `学习记录 - ${new Date().toLocaleDateString()}` } }] },
        '日期': { date: { start: new Date().toISOString().split('T')[0] } },
        '学习时长': { number: duration },
        '学习内容': { rich_text: [{ text: { content: content || '' } }] },
        '心得笔记': { rich_text: [{ text: { content: notes || '' } }] },
        '学习状态': { select: { name: mood || 'good' } }
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}
