import { Button, Input, Space, Spin } from 'antd'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import type { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface AIAssistantPanelProps {
  currentFile: string | null
  fileContent: string
  onClose: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const AIAssistantPanel: FC<AIAssistantPanelProps> = ({ currentFile, fileContent, onClose }) => {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call AI service with context
      const response = await window.api.ide.askAI({
        message: input,
        fileContent: currentFile ? fileContent : undefined,
        fileName: currentFile || undefined,
        conversationHistory: messages
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      window.toast.error(t('ide.error.ai_request'))
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: t('ide.ai.explain_code'), prompt: t('ide.ai.explain_prompt') },
    { label: t('ide.ai.fix_errors'), prompt: t('ide.ai.fix_prompt') },
    { label: t('ide.ai.improve'), prompt: t('ide.ai.improve_prompt') },
    { label: t('ide.ai.add_comments'), prompt: t('ide.ai.comments_prompt') }
  ]

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <Container>
      <Header>
        <Title>
          <Bot size={18} />
          {t('ide.ai_assistant')}
        </Title>
        <Button type="text" size="small" icon={<X size={16} />} onClick={onClose} />
      </Header>

      {messages.length === 0 && (
        <QuickActions>
          <QuickActionsTitle>
            <Sparkles size={14} />
            {t('ide.ai.quick_actions')}
          </QuickActionsTitle>
          <Space direction="vertical" style={{ width: '100%' }}>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                block
                size="small"
                onClick={() => handleQuickAction(action.prompt)}
                disabled={!currentFile}>
                {action.label}
              </Button>
            ))}
          </Space>
        </QuickActions>
      )}

      <MessagesArea>
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.role === 'user'}>
            <MessageRole>{message.role === 'user' ? t('common.you') : 'AI'}</MessageRole>
            <MessageContent>{message.content}</MessageContent>
          </MessageBubble>
        ))}
        {loading && (
          <LoadingIndicator>
            <Spin size="small" />
            <span>{t('ide.ai.thinking')}</span>
          </LoadingIndicator>
        )}
      </MessagesArea>

      <InputArea>
        <Input.TextArea
          placeholder={t('ide.ai.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          autoSize={{ minRows: 2, maxRows: 4 }}
          disabled={loading}
        />
        <Button type="primary" icon={<Send size={16} />} onClick={sendMessage} disabled={loading || !input.trim()}>
          {t('common.send')}
        </Button>
      </InputArea>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  border-left: 1px solid var(--color-border);
  background: var(--color-background);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
`

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
`

const QuickActions = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
`

const QuickActionsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-2);
`

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const MessageBubble = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  max-width: 85%;
`

const MessageRole = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-3);
  text-transform: uppercase;
`

const MessageContent = styled.div`
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--color-background-soft);
  color: var(--color-text-1);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
`

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  color: var(--color-text-3);
  font-size: 13px;
`

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--color-border);
`

export default AIAssistantPanel
