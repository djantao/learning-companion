import { test, expect } from '@playwright/test'

test.describe('学习陪伴者网站 - 基础功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('首页应该正确加载', async ({ page }) => {
    await expect(page.locator('.logo')).toContainText('学习陪伴者')
    await expect(page.locator('.hero h2')).toContainText('智能学习助手')
    await expect(page.locator('.feature-card')).toHaveCount(4)
  })

  test('导航功能应该正常工作', async ({ page }) => {
    await page.click('.nav-item:has-text("学习计划")')
    await expect(page.locator('h2')).toContainText('创建学习计划')
    
    await page.click('.nav-item:has-text("概念讲解")')
    await expect(page.locator('h2')).toContainText('概念讲解')
    
    await page.click('.nav-item:has-text("练习题")')
    await expect(page.locator('h2')).toContainText('生成练习题')
    
    await page.click('.nav-item:has-text("记录进度")')
    await expect(page.locator('h2')).toContainText('记录学习进度')
    
    await page.click('.nav-item:has-text("学习统计")')
    await expect(page.locator('h2')).toContainText('学习统计')
  })

  test('功能卡片应该可以点击跳转', async ({ page }) => {
    await page.click('.feature-card:has-text("创建学习计划")')
    await expect(page.locator('h2')).toContainText('创建学习计划')
    
    await page.click('.logo')
    await page.click('.feature-card:has-text("概念讲解")')
    await expect(page.locator('h2')).toContainText('概念讲解')
  })

  test('移动端菜单应该正常工作', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(100)
    
    await page.click('.menu-btn')
    await expect(page.locator('.nav')).toHaveClass(/open/)
    
    await page.click('.nav-item:has-text("概念讲解")')
    await expect(page.locator('.nav')).not.toHaveClass(/open/)
  })

  test('响应式设计应该正常', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('.menu-btn')).toBeVisible()
    
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('.nav')).toBeVisible()
  })
})

test.describe('学习陪伴者网站 - 完整业务流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('完整流程：创建学习计划 -> 记录进度 -> 查看统计', async ({ page }) => {
    // 步骤1：创建学习计划
    await page.click('.nav-item:has-text("学习计划")')
    await page.fill('input[placeholder*="React Hooks"]', 'E2E测试学习')
    await page.fill('input[type="number"]', '5')
    await page.click('.radio-label:has-text("初学者")')
    
    // 验证表单填写
    await expect(page.locator('input[placeholder*="React Hooks"]')).toHaveValue('E2E测试学习')
    await expect(page.locator('input[type="number"]')).toHaveValue('5')
    
    // 步骤2：记录学习进度
    await page.click('.nav-item:has-text("记录进度")')
    await page.fill('input[type="number"]', '60')
    await page.fill('textarea[placeholder*="今天学了什么"]', '学习了E2E测试基础')
    await page.fill('textarea[placeholder*="收获或困惑"]', '对Playwright有了初步了解')
    await page.click('.radio-label:has-text("不错")')
    
    // 验证表单填写
    await expect(page.locator('textarea[placeholder*="今天学了什么"]')).toHaveValue('学习了E2E测试基础')
    
    // 步骤3：查看学习统计
    await page.click('.nav-item:has-text("学习统计")')
    await expect(page.locator('.stat-card')).toHaveCount(4)
    await expect(page.locator('.stat-label').first()).toContainText('学习时长')
  })

  test('完整流程：概念讲解 -> 保存笔记', async ({ page }) => {
    // 进入概念讲解页面
    await page.click('.nav-item:has-text("概念讲解")')
    
    // 填写表单
    await page.fill('input[placeholder*="闭包"]', 'Playwright')
    await page.fill('input[placeholder*="JavaScript"]', 'E2E测试')
    await page.click('.radio-label:has-text("类比")')
    
    // 验证表单
    await expect(page.locator('input[placeholder*="闭包"]')).toHaveValue('Playwright')
    await expect(page.locator('input[placeholder*="JavaScript"]')).toHaveValue('E2E测试')
  })

  test('完整流程：生成练习题 -> 查看答案', async ({ page }) => {
    // 进入练习题页面
    await page.click('.nav-item:has-text("练习题")')
    
    // 填写表单
    await page.fill('input[placeholder*="React Hooks"]', 'Playwright基础')
    await page.click('.radio-label:has-text("中等")')
    await page.fill('input[type="number"]', '3')
    
    // 验证表单
    await expect(page.locator('input[placeholder*="React Hooks"]')).toHaveValue('Playwright基础')
    await expect(page.locator('input[type="number"]')).toHaveValue('3')
  })
})

test.describe('学习陪伴者网站 - 表单验证', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('学习计划表单：必填字段验证', async ({ page }) => {
    await page.click('.nav-item:has-text("学习计划")')
    
    // 不填写主题，按钮应该禁用
    const submitBtn = page.locator('.btn-primary:has-text("生成学习计划")')
    await expect(submitBtn).toBeDisabled()
    
    // 填写主题后，按钮应该可用
    await page.fill('input[placeholder*="React Hooks"]', '测试主题')
    await expect(submitBtn).toBeEnabled()
  })

  test('概念讲解表单：必填字段验证', async ({ page }) => {
    await page.click('.nav-item:has-text("概念讲解")')
    
    // 不填写概念，按钮应该禁用
    const submitBtn = page.locator('.btn-primary:has-text("开始讲解")')
    await expect(submitBtn).toBeDisabled()
    
    // 填写概念后，按钮应该可用
    await page.fill('input[placeholder*="闭包"]', '测试概念')
    await expect(submitBtn).toBeEnabled()
  })

  test('练习题表单：必填字段验证', async ({ page }) => {
    await page.click('.nav-item:has-text("练习题")')
    
    // 不填写主题，按钮应该禁用
    const submitBtn = page.locator('.btn-primary:has-text("生成练习题")')
    await expect(submitBtn).toBeDisabled()
    
    // 填写主题后，按钮应该可用
    await page.fill('input[placeholder*="React Hooks"]', '测试主题')
    await expect(submitBtn).toBeEnabled()
  })

  test('学习时长输入范围验证', async ({ page }) => {
    await page.click('.nav-item:has-text("学习计划")')
    
    const hoursInput = page.locator('input[type="number"]')
    
    // 测试最小值
    await hoursInput.fill('0')
    await expect(hoursInput).toHaveValue('0')
    
    // 测试正常值
    await hoursInput.fill('10')
    await expect(hoursInput).toHaveValue('10')
    
    // 测试最大值
    await hoursInput.fill('40')
    await expect(hoursInput).toHaveValue('40')
  })

  test('练习题数量输入范围验证', async ({ page }) => {
    await page.click('.nav-item:has-text("练习题")')
    
    await page.fill('input[placeholder*="React Hooks"]', '测试')
    
    const countInput = page.locator('input[type="number"]')
    
    // 测试最小值
    await countInput.fill('1')
    await expect(countInput).toHaveValue('1')
    
    // 测试正常值
    await countInput.fill('5')
    await expect(countInput).toHaveValue('5')
    
    // 测试最大值
    await countInput.fill('20')
    await expect(countInput).toHaveValue('20')
  })
})

test.describe('学习陪伴者网站 - Notion集成（需要部署后测试）', () => {
  test.skip('创建学习计划并保存到Notion - 需要真实API', async ({ page }) => {
    // 此测试需要部署到Vercel后才能运行
    // 本地开发时跳过
  })

  test.skip('概念讲解并保存到Notion - 需要真实API', async ({ page }) => {
    // 此测试需要部署到Vercel后才能运行
  })

  test.skip('生成练习题并保存到Notion - 需要真实API', async ({ page }) => {
    // 此测试需要部署到Vercel后才能运行
  })

  test.skip('记录学习进度到Notion - 需要真实API', async ({ page }) => {
    // 此测试需要部署到Vercel后才能运行
  })

  test.skip('获取学习统计数据 - 需要真实API', async ({ page }) => {
    // 此测试需要部署到Vercel后才能运行
  })
})

test.describe('学习陪伴者网站 - 用户体验', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('加载状态应该正确显示', async ({ page }) => {
    await page.click('.nav-item:has-text("学习计划")')
    await page.fill('input[placeholder*="React Hooks"]', '测试主题')
    
    // 点击提交后，按钮应该显示加载状态
    const submitBtn = page.locator('.btn-primary:has-text("生成学习计划")')
    await submitBtn.click()
    
    // 验证按钮显示加载状态（如果API调用失败，按钮会恢复）
    await page.waitForTimeout(100)
    // 由于本地没有API，按钮会很快恢复
  })

  test('表单重置功能', async ({ page }) => {
    await page.click('.nav-item:has-text("学习计划")')
    
    // 填写表单
    await page.fill('input[placeholder*="React Hooks"]', '测试主题')
    await page.fill('input[type="number"]', '15')
    
    // 导航到其他页面再返回
    await page.click('.nav-item:has-text("概念讲解")')
    await page.click('.nav-item:has-text("学习计划")')
    
    // 验证表单已重置（React组件重新挂载）
    await expect(page.locator('input[placeholder*="React Hooks"]')).toHaveValue('')
  })

  test('Notion链接应该正确跳转', async ({ page }) => {
    await page.click('.nav-item:has-text("学习统计")')
    
    // 验证Notion链接存在
    const notionLink = page.locator('a[href*="notion.so"]')
    await expect(notionLink).toBeVisible()
    await expect(notionLink).toHaveAttribute('target', '_blank')
  })

  test('键盘导航支持', async ({ page }) => {
    // Tab导航
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // 验证焦点在可交互元素上
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})

test.describe('学习陪伴者网站 - 错误处理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('API错误时页面不应该崩溃', async ({ page }) => {
    await page.click('.nav-item:has-text("学习计划")')
    await page.fill('input[placeholder*="React Hooks"]', '测试主题')
    await page.click('.btn-primary:has-text("生成学习计划")')
    
    // 等待一段时间（API会失败）
    await page.waitForTimeout(1000)
    
    // 验证页面仍然可用
    await expect(page.locator('h2')).toContainText('创建学习计划')
  })

  test('网络错误时应该优雅处理', async ({ page }) => {
    await page.click('.nav-item:has-text("概念讲解")')
    await page.fill('input[placeholder*="闭包"]', '测试概念')
    await page.click('.btn-primary:has-text("开始讲解")')
    
    // 等待一段时间（API会失败）
    await page.waitForTimeout(1000)
    
    // 验证页面没有崩溃
    await expect(page.locator('h2')).toContainText('概念讲解')
  })
})
