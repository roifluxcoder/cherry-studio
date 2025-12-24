import { Button, Dropdown, Input, Modal, Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { FileCode, Folder, FolderOpen, FolderPlus, FilePlus, Trash2, Edit } from 'lucide-react'
import type { FC } from 'react'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface FileExplorerProps {
  files: FileNode[]
  onFileSelect: (filePath: string) => void
  onCreateFile: (folderPath: string, fileName: string) => Promise<void>
  onDeleteFile: (filePath: string) => Promise<void>
  onRenameFile: (oldPath: string, newPath: string) => Promise<void>
  onCreateFolder: (parentPath: string, folderName: string) => Promise<void>
  onDeleteFolder: (folderPath: string) => Promise<void>
}

export interface FileNode {
  path: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
}

const FileExplorer: FC<FileExplorerProps> = ({
  files,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onCreateFolder,
  onDeleteFolder
}) => {
  const { t } = useTranslation()
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [contextMenuPath, setContextMenuPath] = useState('')

  const convertToTreeData = (nodes: FileNode[]): DataNode[] => {
    return nodes.map((node) => ({
      key: node.path,
      title: node.name,
      icon: node.type === 'folder' ? <Folder size={16} /> : <FileCode size={16} />,
      children: node.children ? convertToTreeData(node.children) : undefined,
      isLeaf: node.type === 'file'
    }))
  }

  const treeData = useMemo(() => convertToTreeData(files), [files])

  const handleSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0] as string
    setSelectedKey(key)
    const node = findNode(files, key)
    if (node?.type === 'file') {
      onFileSelect(key)
    }
  }

  const findNode = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node
      if (node.children) {
        const found = findNode(node.children, path)
        if (found) return found
      }
    }
    return null
  }

  const handleCreateFile = async () => {
    if (!newItemName.trim()) return
    try {
      const folderPath = selectedKey || ''
      await onCreateFile(folderPath, newItemName)
      setIsCreateFileModalOpen(false)
      setNewItemName('')
      window.toast.success(t('ide.file_created'))
    } catch (error) {
      window.toast.error(t('ide.error.create_file'))
    }
  }

  const handleCreateFolder = async () => {
    if (!newItemName.trim()) return
    try {
      const parentPath = selectedKey || ''
      await onCreateFolder(parentPath, newItemName)
      setIsCreateFolderModalOpen(false)
      setNewItemName('')
      window.toast.success(t('ide.folder_created'))
    } catch (error) {
      window.toast.error(t('ide.error.create_folder'))
    }
  }

  const menuItems = [
    {
      key: 'newFile',
      label: t('ide.new_file'),
      icon: <FilePlus size={14} />,
      onClick: () => setIsCreateFileModalOpen(true)
    },
    {
      key: 'newFolder',
      label: t('ide.new_folder'),
      icon: <FolderPlus size={14} />,
      onClick: () => setIsCreateFolderModalOpen(true)
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      label: t('ide.delete'),
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: async () => {
        if (!selectedKey) return
        const node = findNode(files, selectedKey)
        if (!node) return

        Modal.confirm({
          title: t('ide.confirm_delete'),
          content: t('ide.confirm_delete_message', { name: node.name }),
          onOk: async () => {
            try {
              if (node.type === 'file') {
                await onDeleteFile(selectedKey)
              } else {
                await onDeleteFolder(selectedKey)
              }
              window.toast.success(t('ide.deleted'))
            } catch (error) {
              window.toast.error(t('ide.error.delete'))
            }
          }
        })
      }
    }
  ]

  return (
    <Container>
      <Header>
        <Title>{t('ide.files')}</Title>
        <ActionButtons>
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" size="small" icon={<FilePlus size={16} />} />
          </Dropdown>
        </ActionButtons>
      </Header>

      <TreeContainer>
        {treeData.length === 0 ? (
          <EmptyState>
            <p>{t('ide.no_files')}</p>
            <Button type="primary" icon={<FilePlus size={16} />} onClick={() => setIsCreateFileModalOpen(true)}>
              {t('ide.create_first_file')}
            </Button>
          </EmptyState>
        ) : (
          <Tree
            showIcon
            expandedKeys={expandedKeys}
            selectedKeys={[selectedKey]}
            onExpand={(keys) => setExpandedKeys(keys as string[])}
            onSelect={handleSelect}
            treeData={treeData}
            switcherIcon={<FolderOpen size={14} />}
          />
        )}
      </TreeContainer>

      <Modal
        title={t('ide.new_file')}
        open={isCreateFileModalOpen}
        onOk={handleCreateFile}
        onCancel={() => {
          setIsCreateFileModalOpen(false)
          setNewItemName('')
        }}
        okText={t('common.create')}
        cancelText={t('common.cancel')}>
        <Input
          placeholder={t('ide.file_name_placeholder')}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onPressEnter={handleCreateFile}
        />
      </Modal>

      <Modal
        title={t('ide.new_folder')}
        open={isCreateFolderModalOpen}
        onOk={handleCreateFolder}
        onCancel={() => {
          setIsCreateFolderModalOpen(false)
          setNewItemName('')
        }}
        okText={t('common.create')}
        cancelText={t('common.cancel')}>
        <Input
          placeholder={t('ide.folder_name_placeholder')}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onPressEnter={handleCreateFolder}
        />
      </Modal>
    </Container>
  )
}

const Container = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
  background: var(--color-background);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
`

const Title = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
`

const ActionButtons = styled.div`
  display: flex;
  gap: 4px;
`

const TreeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: var(--color-text-3);

  p {
    margin-bottom: 16px;
  }
`

export default FileExplorer
