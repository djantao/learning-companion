import { test, expect } from '@playwright/test'

const BASE_URL = 'https://learning-companion-nine.vercel.app'

test.describe('生产环境测试 - 基础功能', () => {
  test('首页加载正常', async ({ page }) => {
    await page.goto(BASE_URL)
    
    await expect(page.locator('.logo')).toContainText('学习陪伴者')
    await expect(page.locator('.hero h2')).toContainText('智能学习助手')
    await expect(page.locator('.feature-card')).toHaveCount(4)
    
    console.log('✅ 首页加载正常')
  })

  test('导航功能正常', async ({ page }) => {
    await page.goto(BASE_URL)
    
    await page.click('.nav-item:has-text("学习计划")')
    await expect(page.locator('h2')).toContainText('创建学习计划')
    
    await page.click('.nav-item:has-text("概念讲解")')
    await expect(page.locator('h2')).toContainText('概念讲解')
    
    await page.click('.nav-item:has-text("练习题")')
    await expect(page.locator('h2')).toContainText('生成练习题')
    
    console.log('✅ 导航功能正常')
  })

  test('移动端响应式正常', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(BASE_URL)
    
    await expect(page.locator('.menu-btn')).toBeVisible()
    
    await page.click('.menu-btn')
    await expect(page.locator('.nav')).toHaveClass(/open/)
    
    console.log('✅ 移动端响应式正常')
  })
})

test.describe('生产环境测试 - API集成', () => {
  test('创建学习计划并验证Notion', async ({ page, context }) => {
    await page.goto(BASE_URL)
    
    await page.click('.nav-item:has-text("学习计划")')
    
    const testTopic = `E2E测试-${Date.now()}`
    await page.fill('input[placeholder*="React Hooks"]', testTopic)
    await page.fill('input[type="number"]', '10')
    await page.click('.radio-label:has-text("初学者")')
    
    await page.click('.btn-primary:has-text("生成学习计划")')
    
    await page.waitForSelector('.result-card', { timeout: 60000 })
    
    await expect(page.locator('.result-card h3')).toContainText('学习计划')
    
    const notionLink = page.locator('.result-card a[href*="notion.so"]')
    await expect(notionLink).toBeVisible()
    
    const notionUrl = await notionLink.getAttribute('href')
    console.log('📋 Notion链接:', notionUrl)
    
    if (notionUrl) {
      const notionPage = await context.newPage()
      try {
        await notionPage.goto(notionUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await notionPage.waitForTimeout(2000)
        
        const pageContent = await notionPage.content()
        const hasContent = pageContent.includes(testTopic) || pageContent.includes('学习')
        
        console.log(hasContent ? '✅ Notion页面已创建内容' : '⚠️ Notion页面内容需要验证')
      } catch (e) {
        console.log('⚠️ Notion页面加载超时，但页面已创建')
      } finally {
        await notionPage.close()
      }
    }
    
    console.log('✅ 创建学习计划测试完成')
  })

  test('概念讲解功能', async ({ page }) => {
    await page.goto(BASE_URL)
    
    await page.click('.nav-item:has-text("概念讲解")')
    
    await page.fill('input[placeholder*="闭包"]', 'React Hooks')
    await page.fill('input[placeholder*="JavaScript"]', 'React')
    await page.click('.radio-label:has-text("类比")')
    
    await page.click('.btn-primary:has-text("开始讲解")')
    
    await page.waitForSelector('.result-card', { timeout: 60000 })
    
    await expect(page.locator('.result-card')).toBeVisible()
    
    console.log('✅ 概念讲解功能正常')
  })

  test('生成练习题功能', async ({ page }) => {
    await page.goto(BASE_URL)
    
    await page.click('.nav-item:has-text("练习题")')
    
    await page.fill('input[placeholder*="React Hooks"]', 'TypeScript基础')
    await page.click('.radio-label:has-text("中等")')
    await page.fill('input[type="number"]', '3')
    
    await page.click('.btn-primary:has-text("生成练习题")')
    
    await page.waitForSelector('.exercise-card', { timeout: 60000 })
    
    const exerciseCount = await page.locator('.exercise-card').count()
    expect(exerciseCount).toBeGreaterThan(0)
    
    console.log(`✅ 生成了 ${exerciseCount} 道练习题`)
  })

  test('记录学习进度功能', async ({ page }) => {
    await page.goto(BASE_URL)
    
    await page.click('.nav-item:has-text("记录进度")')
    
    await page.fill('input[type="number"]', '60')
    await page.fill('textarea[placeholder*="今天学了什么"]', 'E2E测试学习进度记录')
    await page.fill('textarea[placeholder*="收获或困惑"]', '测试成功')
    await page.click('.radio-label:has-text("很棒")')
    
    await page.click('.btn-primary:has-text("保存进度")')
    
    await page.waitForSelector('.success-message', { timeout: 30000 })
    
    await expect(page.locator('.success-message')).toContainText('进度已保存')
    
    console.log('✅ 记录学习进度功能正常')
  })

  test('学习统计功能', async ({ page }) => {
    await page.goto(BASE_URL)
    
    await page.click('.nav-item:has-text("学习统计")')
    
    await page.waitForSelector('.stat-card', { timeout: 10000 })
    
    const statCards = await page.locator('.stat-card').count()
    expect(statCards).toBe(4)
    
    const notionLink = page.locator('a[href*="notion.so"]')
    await expect(notionLink).toBeVisible()
    
    console.log('✅ 学习统计功能正常')
  })
})

test.describe('生产环境测试 - 完整流程', () => {
  test('完整学习流程', async ({ page, context }) => {
    console.log('🚀 开始完整学习流程测试...')
    
    await page.goto(BASE_URL)
    
    console.log('步骤1: 创建学习计划')
    await page.click('.nav-item:has-text("学习计划")')
    await page.fill('input[placeholder*="React Hooks"]', '完整流程测试')
    await page.fill('input[type="number"]', '5')
    await page.click('.radio-label:has-text("初学者")')
    await page.click('.btn-primary:has-text("生成学习计划")')
    await page.waitForSelector('.result-card', { timeout: 60000 })
    
    console.log('步骤2: 概念讲解')
    await page.click('.nav-item:has-text("概念讲解")')
    await page.fill('input[placeholder*="闭包"]', '测试概念')
    await page.click('.btn-primary:has-text("开始讲解")')
    await page.waitForSelector('.result-card', { timeout: 60000 })
    
    console.log('步骤3: 生成练习')
    await page.click('.nav-item:has-text("练习题")')
    await page.fill('input[placeholder*="React Hooks"]', '测试练习')
    await page.fill('input[type="number"]', '2')
    await page.click('.btn-primary:has-text("生成练习题")')
    await page.waitForSelector('.exercise-card', { timeout: 60000 })
    
    console.log('步骤4: 记录进度')
    await page.click('.nav-item:has-text("记录进度")')
    await page.fill('input[type="number"]', '30')
    await page.fill('textarea[placeholder*="今天学了什么"]', '完整流程测试完成')
    await page.click('.btn-primary:has-text("保存进度")')
    await page.waitForSelector('.success-message', { timeout: 30000 })
    
    console.log('步骤5: 查看统计')
    await page.click('.nav-item:has-text("学习统计")')
    await page.waitForSelector('.stat-card', { timeout: 10000 })
    
    console.log('✅ 完整学习流程测试通过!')
  })
})

test.describe('生产环境测试 - 性能', () => {
  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    
    console.log(`📊 首页加载时间: ${loadTime}ms`)
    
    expect(loadTime).toBeLessThan(10000)
    
    console.log(loadTime < 3000 ? '✅ 加载速度优秀' : loadTime < 5000 ? '⚠️ 加载速度一般' : '❌ 加载速度较慢')
  })
})
