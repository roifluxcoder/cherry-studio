import { Alert } from 'antd'
import type { FC } from 'react'
import { useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface PreviewPanelProps {
  file: string
  content: string
}

const PreviewPanel: FC<PreviewPanelProps> = ({ file, content }) => {
  const { t } = useTranslation()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const fileType = useMemo(() => {
    const ext = file.split('.').pop()?.toLowerCase()
    if (ext === 'html') return 'html'
    if (ext === 'jsx' || ext === 'tsx') return 'react'
    return 'unknown'
  }, [file])

  useEffect(() => {
    if (!iframeRef.current) return

    if (fileType === 'html') {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(content)
        doc.close()
      }
    }
  }, [content, fileType])

  if (fileType === 'unknown') {
    return (
      <Container>
        <Alert
          type="info"
          message={t('ide.preview_not_available')}
          description={t('ide.preview_not_available_desc')}
          showIcon
        />
      </Container>
    )
  }

  if (fileType === 'react') {
    return (
      <Container>
        <Alert
          type="info"
          message={t('ide.react_preview')}
          description={t('ide.react_preview_desc')}
          showIcon
        />
        <PreviewCode>{content}</PreviewCode>
      </Container>
    )
  }

  return (
    <Container>
      <PreviewHeader>{t('ide.preview')}</PreviewHeader>
      <IframeContainer>
        <PreviewIframe ref={iframeRef} title="Preview" sandbox="allow-scripts allow-same-origin" />
      </IframeContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  border-left: 1px solid var(--color-border);
  background: var(--color-background);
`

const PreviewHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-1);
`

const IframeContainer = styled.div`
  flex: 1;
  overflow: hidden;
  background: white;
`

const PreviewIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`

const PreviewCode = styled.pre`
  flex: 1;
  overflow: auto;
  padding: 16px;
  margin: 0;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--color-background-soft);
  color: var(--color-text-1);
`

export default PreviewPanel
