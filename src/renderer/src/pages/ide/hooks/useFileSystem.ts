import { useState, useEffect, useCallback } from 'react'
import type { FileNode } from '../components/FileExplorer'
import { loggerService } from '@renderer/services/LoggerService'

const logger = loggerService.withContext('useFileSystem')

export const useFileSystem = () => {
  const [files, setFiles] = useState<FileNode[]>([])
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [workspacePath, setWorkspacePath] = useState<string>('')

  // Initialize workspace
  useEffect(() => {
    const initWorkspace = async () => {
      try {
        const path = await window.api.ide.getWorkspacePath()
        setWorkspacePath(path)
        await loadFiles()
      } catch (error) {
        logger.error('Failed to initialize workspace:', error as Error)
      }
    }

    initWorkspace()
  }, [loadFiles])

  // Load file tree
  const loadFiles = useCallback(async () => {
    try {
      const fileTree = await window.api.ide.listFiles()
      setFiles(fileTree)
    } catch (error) {
      logger.error('Failed to load files:', error as Error)
      setFiles([])
    }
  }, [])

  // Load a specific file
  const loadFile = useCallback(async (filePath: string) => {
    try {
      const content = await window.api.ide.readFile(filePath)
      setCurrentFile(filePath)
      setFileContent(content)
    } catch (error) {
      logger.error('Failed to load file:', error as Error)
      throw error
    }
  }, [])

  // Save file
  const saveFile = useCallback(
    async (filePath: string, content: string) => {
      try {
        await window.api.ide.writeFile(filePath, content)
        setFileContent(content)
      } catch (error) {
        logger.error('Failed to save file:', error as Error)
        throw error
      }
    },
    []
  )

  // Create new file
  const createFile = useCallback(
    async (folderPath: string, fileName: string) => {
      try {
        const fullPath = await window.api.ide.createFile(folderPath, fileName)
        await loadFiles()
        return fullPath
      } catch (error) {
        logger.error('Failed to create file:', error as Error)
        throw error
      }
    },
    [loadFiles]
  )

  // Delete file
  const deleteFile = useCallback(
    async (filePath: string) => {
      try {
        await window.api.ide.deleteFile(filePath)
        if (currentFile === filePath) {
          setCurrentFile(null)
          setFileContent('')
        }
        await loadFiles()
      } catch (error) {
        logger.error('Failed to delete file:', error as Error)
        throw error
      }
    },
    [currentFile, loadFiles]
  )

  // Rename file
  const renameFile = useCallback(
    async (oldPath: string, newPath: string) => {
      try {
        await window.api.ide.renameFile(oldPath, newPath)
        if (currentFile === oldPath) {
          setCurrentFile(newPath)
        }
        await loadFiles()
      } catch (error) {
        logger.error('Failed to rename file:', error as Error)
        throw error
      }
    },
    [currentFile, loadFiles]
  )

  // Create new folder
  const createFolder = useCallback(
    async (parentPath: string, folderName: string) => {
      try {
        const fullPath = await window.api.ide.createFolder(parentPath, folderName)
        await loadFiles()
        return fullPath
      } catch (error) {
        logger.error('Failed to create folder:', error as Error)
        throw error
      }
    },
    [loadFiles]
  )

  // Delete folder
  const deleteFolder = useCallback(
    async (folderPath: string) => {
      try {
        await window.api.ide.deleteFolder(folderPath)
        await loadFiles()
      } catch (error) {
        logger.error('Failed to delete folder:', error as Error)
        throw error
      }
    },
    [loadFiles]
  )

  return {
    files,
    currentFile,
    fileContent,
    workspacePath,
    loadFiles,
    loadFile,
    saveFile,
    createFile,
    deleteFile,
    renameFile,
    createFolder,
    deleteFolder
  }
}
