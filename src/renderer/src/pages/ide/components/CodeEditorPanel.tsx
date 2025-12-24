import CodeEditor from '@renderer/components/CodeEditor'
import type { CodeEditorHandles } from '@renderer/components/CodeEditor'
import { Button, Space, Tabs } from 'antd'
import { Save, Play, Eye, Terminal } from 'lucide-react'
import type { FC } from 'react'
import { useRef, useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface CodeEditorPanelProps {
  currentFile: string | null
  fileContent: string
  onSave: (content: string) => void
  onTogglePreview: () => void
  onToggleTerminal: () => void
}

const CodeEditorPanel: FC<CodeEditorPanelProps> = ({
  currentFile,
  fileContent,
  onSave,
  onTogglePreview,
  onToggleTerminal
}) => {
  const { t } = useTranslation()
  const editorRef = useRef<CodeEditorHandles | null>(null)
  const [content, setContent] = useState(fileContent)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Update content when fileContent changes (e.g., switching files)
  useEffect(() => {
    setContent(fileContent)
    setHasUnsavedChanges(false)
  }, [fileContent, currentFile])

  // Detect language from file extension
  const language = useMemo(() => {
    if (!currentFile) return 'text'
    const ext = currentFile.split('.').pop()?.toLowerCase() || 'text'
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rs: 'rust',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      java: 'java',
      go: 'go',
      rb: 'ruby',
      php: 'php',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      sh: 'shell',
      yml: 'yaml',
      yaml: 'yaml',
      xml: 'xml',
      sql: 'sql'
    }
    return languageMap[ext] || ext
  }, [currentFile])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setHasUnsavedChanges(newContent !== fileContent)
  }

  const handleSave = () => {
    onSave(content)
    setHasUnsavedChanges(false)
  }

  const handleRunCode = async () => {
    if (!currentFile) return

    try {
      // Trigger code execution via IPC
      const result = await window.api.ide.runCode({
        filePath: currentFile,
        language,
        content
      })

      if (result.success) {
        window.toast.success(t('ide.code_running'))
        onToggleTerminal()
      } else {
        window.toast.error(result.error || t('ide.error.run_code'))
      }
    } catch (error) {
      window.toast.error(t('ide.error.run_code'))
    }
  }

  const canRun = useMemo(() => {
    return ['python', 'javascript', 'typescript'].includes(language)
  }, [language])

  if (!currentFile) {
    return (
      <Container>
        <EmptyState>
          <h3>{t('ide.no_file_open')}</h3>
          <p>{t('ide.select_or_create_file')}</p>
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container>
      <Toolbar>
        <FileName>
          {currentFile.split('/').pop()}
          {hasUnsavedChanges && <UnsavedIndicator>●</UnsavedIndicator>}
        </FileName>

        <ToolbarActions>
          <Space size="small">
            {canRun && (
              <Button type="text" icon={<Play size={16} />} onClick={handleRunCode} size="small">
                {t('ide.run')}
              </Button>
            )}
            {(language === 'html' || language === 'jsx' || language === 'tsx') && (
              <Button type="text" icon={<Eye size={16} />} onClick={onTogglePreview} size="small">
                {t('ide.preview')}
              </Button>
            )}
            <Button type="text" icon={<Terminal size={16} />} onClick={onToggleTerminal} size="small">
              {t('ide.terminal')}
            </Button>
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={handleSave}
              size="small"
              disabled={!hasUnsavedChanges}>
              {t('common.save')}
            </Button>
          </Space>
        </ToolbarActions>
      </Toolbar>

      <EditorWrapper>
        <CodeEditor
          ref={editorRef}
          value={content}
          language={language}
          onChange={handleContentChange}
          onSave={handleSave}
          expanded
          options={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            lint: true,
            keymap: true
          }}
          style={{
            height: '100%',
            fontSize: 14
          }}
        />
      </EditorWrapper>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
`

const FileName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
`

const UnsavedIndicator = styled.span`
  color: var(--color-primary);
  font-size: 18px;
`

const ToolbarActions = styled.div`
  display: flex;
  gap: 8px;
`

const EditorWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-3);

  h3 {
    margin-bottom: 8px;
    color: var(--color-text-2);
  }
`

export default CodeEditorPanel
