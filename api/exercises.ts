export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { topic, difficulty, count } = req.body
    
    const exercises = Array.from({ length: count || 5 }, (_, i) => ({
      id: `ex_${i + 1}`,
      question: `关于${topic}的第${i + 1}道练习题：请描述${topic}的核心概念和应用场景。`,
      correct_answer: `${topic}的核心概念是...应用场景包括...`,
      explanation: `这道题考察对${topic}基础知识的理解。`,
      hints: ['提示1：从定义出发', '提示2：结合实际案例'],
      difficulty: difficulty || 'medium'
    }))

    res.json({
      success: true,
      exercises,
      notionUrl: `https://www.notion.so/31c3af348d5781cca3ceee7efdb58209`
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}
