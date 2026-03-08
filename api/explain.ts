import { Client } from '@notionhq/client'
import { explainConcept } from './deepseek.js'

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
    const { concept, context, style } = req.body
    
    let explanation
    try {
      explanation = await explainConcept(concept, context, style)
    } catch (error) {
      console.error('DeepSeek API error:', error)
      explanation = {
        concept,
        definition: `${concept}是一个重要的概念。`,
        explanation: `关于${concept}的详细解释...`,
        analogies: [],
        examples: [],
        relatedConcepts: [],
        commonMistakes: [],
        furtherReading: []
      }
    }
    
    const response = await notion.pages.create({
      parent: { database_id: DATABASES.notes },
      properties: {
        '标题': { title: [{ text: { content: `${concept} - 概念讲解` } }] },
        '类型': { select: { name: '概念讲解' } },
        '创建日期': { date: { start: new Date().toISOString().split('T')[0] } },
        '标签': { multi_select: [{ name: concept }, { name: context || '通用' }] }
      }
    })

    res.json({
      success: true,
      concept: explanation.concept,
      definition: explanation.definition,
      explanation: explanation.explanation,
      analogies: explanation.analogies || [],
      examples: explanation.examples || [],
      relatedConcepts: explanation.relatedConcepts || [],
      notionUrl: `https://www.notion.so/${response.id.replace(/-/g, '')}`
    })
  } catch (error) {
    console.error('Explain error:', error)
    res.status(500).json({ error: error.message })
  }
}
