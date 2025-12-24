import { Button, Input } from 'antd'
import { Terminal as TerminalIcon, X } from 'lucide-react'
import type { FC } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const TerminalPanel: FC = () => {
  const { t } = useTranslation()
  const [output, setOutput] = useState<string[]>([])
  const [command, setCommand] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Listen for terminal output from main process
    const unsubscribe = window.api.ide.onTerminalOutput((data: string) => {
      setOutput((prev) => [...prev, data])
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const handleCommand = async () => {
    if (!command.trim()) return

    setOutput((prev) => [...prev, `$ ${command}`])

    try {
      await window.api.ide.executeCommand(command)
      setCommand('')
    } catch (error) {
      setOutput((prev) => [...prev, `Error: ${error}`])
    }
  }

  const handleClear = () => {
    setOutput([])
  }

  return (
    <Container>
      <Header>
        <Title>
          <TerminalIcon size={16} />
          {t('ide.terminal')}
        </Title>
        <Button type="text" size="small" onClick={handleClear}>
          {t('ide.clear')}
        </Button>
      </Header>

      <OutputArea ref={outputRef}>
        {output.length === 0 ? (
          <EmptyMessage>{t('ide.terminal_empty')}</EmptyMessage>
        ) : (
          output.map((line, index) => <OutputLine key={index}>{line}</OutputLine>)
        )}
      </OutputArea>

      <CommandInput>
        <Input
          placeholder={t('ide.terminal_placeholder')}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onPressEnter={handleCommand}
          prefix="$"
          style={{ fontFamily: 'monospace' }}
        />
        <Button type="primary" onClick={handleCommand} disabled={!command.trim()}>
          {t('ide.run')}
        </Button>
      </CommandInput>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 250px;
  border-top: 1px solid var(--color-border);
  background: var(--color-background);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
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

const OutputArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--color-background-soft);
  color: var(--color-text-1);
`

const OutputLine = styled.div`
  margin-bottom: 4px;
  white-space: pre-wrap;
  word-break: break-all;
`

const EmptyMessage = styled.div`
  color: var(--color-text-3);
  font-style: italic;
`

const CommandInput = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--color-border);
`

export default TerminalPanel
