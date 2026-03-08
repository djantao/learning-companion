import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const DATABASES = {
  plans: '31c3af34-8d57-8189-b341-f97043757be2',
  progress: '31c3af34-8d57-8139-b6ed-e40b348d051b',
  exercises: '31c3af34-8d57-8195-b1a6-d60a89616d49',
  notes: '31c3af34-8d57-8131-8017-d5cc628f473d'
}

export default async function handler(req, res) {
  try {
    const progressResponse = await notion.databases.query({
      database_id: DATABASES.progress
    } as any)

    const exercisesResponse = await notion.databases.query({
      database_id: DATABASES.exercises
    } as any)

    let totalTime = 0
    const uniqueDays = new Set()

    progressResponse.results.forEach((page: any) => {
      const duration = page.properties['学习时长']?.number || 0
      totalTime += duration
      
      const date = page.properties['日期']?.date?.start
      if (date) uniqueDays.add(date)
    })

    res.json({
      totalTime,
      days: uniqueDays.size,
      exercises: exercisesResponse.results.length,
      streak: uniqueDays.size > 0 ? 1 : 0
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}
