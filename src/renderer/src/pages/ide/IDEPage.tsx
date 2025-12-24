import { Navbar, NavbarCenter } from '@renderer/components/app/Navbar'
import { loggerService } from '@renderer/services/LoggerService'
import { Alert } from 'antd'
import { Code } from 'lucide-react'
import type { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AIAssistantPanel from './components/AIAssistantPanel'
import CodeEditorPanel from './components/CodeEditorPanel'
import FileExplorer from './components/FileExplorer'
import PreviewPanel from './components/PreviewPanel'
import TerminalPanel from './components/TerminalPanel'
import { useFileSystem } from './hooks/useFileSystem'

const logger = loggerService.withContext('IDEPage')

const IDEPage: FC = () => {
  const { t } = useTranslation()
  const {
    currentFile,
    files,
    fileContent,
    loadFile,
    saveFile,
    createFile,
    deleteFile,
    renameFile,
    createFolder,
    deleteFolder
  } = useFileSystem()

  const [showPreview, setShowPreview] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(true)

  const handleFileSelect = async (filePath: string) => {
    try {
      await loadFile(filePath)
    } catch (error) {
      logger.error('Failed to load file:', error as Error)
      window.toast.error(t('ide.error.load_file'))
    }
  }

  const handleFileSave = async (content: string) => {
    if (!currentFile) return
    try {
      await saveFile(currentFile, content)
      window.toast.success(t('ide.file_saved'))
    } catch (error) {
      logger.error('Failed to save file:', error as Error)
      window.toast.error(t('ide.error.save_file'))
    }
  }

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>
          <Code size={18} style={{ marginRight: 8 }} />
          {t('ide.title')}
        </NavbarCenter>
      </Navbar>

      <Alert
        type="info"
        banner
        showIcon={false}
        message={t('ide.welcome_message')}
        style={{
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none'
        }}
      />

      <MainContent>
        <FileExplorer
          files={files}
          onFileSelect={handleFileSelect}
          onCreateFile={createFile}
          onDeleteFile={deleteFile}
          onRenameFile={renameFile}
          onCreateFolder={createFolder}
          onDeleteFolder={deleteFolder}
        />

        <EditorContainer>
          <CodeEditorPanel
            currentFile={currentFile}
            fileContent={fileContent}
            onSave={handleFileSave}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onToggleTerminal={() => setShowTerminal(!showTerminal)}
          />

          {showPreview && currentFile && <PreviewPanel file={currentFile} content={fileContent} />}

          {showTerminal && <TerminalPanel />}
        </EditorContainer>

        {showAIAssistant && (
          <AIAssistantPanel currentFile={currentFile} fileContent={fileContent} onClose={() => setShowAIAssistant(false)} />
        )}
      </MainContent>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100vh;
`

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

const EditorContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`

export default IDEPage
