export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { concept, context, style } = req.body
    
    const explanations = {
      simple: `${concept}是一个重要的概念。简单来说，它是一种用于解决问题的方法或工具。`,
      detailed: `${concept}是一个核心概念，在${context || '计算机科学'}领域有广泛应用。它包含了多个层面的含义：首先，从定义上来说...其次，从实践角度来看...最后，从发展趋势来看...`,
      analogy: `${concept}可以类比为：想象一个${context || '系统'}，就像一个智能助手，能够自动完成任务。`
    }

    res.json({
      success: true,
      concept,
      definition: `${concept}的定义：这是一个核心概念，用于描述特定的功能或特性。`,
      explanation: explanations[style] || explanations.simple,
      analogies: style === 'analogy' ? [
        '就像一个智能助手，能够自动完成任务',
        '类似于图书馆的索引系统，帮助快速定位信息'
      ] : [],
      notionUrl: `https://www.notion.so/31c3af348d5781cca3ceee7efdb58209`
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}
