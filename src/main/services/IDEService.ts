import fs from 'node:fs/promises'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { loggerService } from '@logger'
import { app } from 'electron'

const execAsync = promisify(exec)
const logger = loggerService.withContext('IDEService')

export interface FileNode {
  path: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
}

class IDEService {
  private workspacePath: string

  constructor() {
    // Initialize workspace in ~/.cherrystudio/workspace/
    const homeDir = app.getPath('home')
    this.workspacePath = path.join(homeDir, '.cherrystudio', 'workspace')
    this.ensureWorkspace()
  }

  private async ensureWorkspace(): Promise<void> {
    try {
      await fs.mkdir(this.workspacePath, { recursive: true })
      logger.info('Workspace initialized:', this.workspacePath)
    } catch (error) {
      logger.error('Failed to create workspace:', error as Error)
    }
  }

  async getWorkspacePath(): Promise<string> {
    return this.workspacePath
  }

  async listFiles(): Promise<FileNode[]> {
    try {
      return await this.readDirectory(this.workspacePath, '')
    } catch (error) {
      logger.error('Failed to list files:', error as Error)
      return []
    }
  }

  private async readDirectory(basePath: string, relativePath: string): Promise<FileNode[]> {
    const fullPath = path.join(basePath, relativePath)
    const entries = await fs.readdir(fullPath, { withFileTypes: true })
    const nodes: FileNode[] = []

    for (const entry of entries) {
      const entryPath = path.join(relativePath, entry.name)
      const node: FileNode = {
        path: entryPath,
        name: entry.name,
        type: entry.isDirectory() ? 'folder' : 'file'
      }

      if (entry.isDirectory()) {
        node.children = await this.readDirectory(basePath, entryPath)
      }

      nodes.push(node)
    }

    return nodes.sort((a, b) => {
      // Folders first, then alphabetically
      if (a.type === 'folder' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = path.join(this.workspacePath, filePath)
      const content = await fs.readFile(fullPath, 'utf-8')
      logger.info('File read:', filePath)
      return content
    } catch (error) {
      logger.error('Failed to read file:', error as Error)
      throw error
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const fullPath = path.join(this.workspacePath, filePath)
      await fs.writeFile(fullPath, content, 'utf-8')
      logger.info('File saved:', filePath)
    } catch (error) {
      logger.error('Failed to write file:', error as Error)
      throw error
    }
  }

  async createFile(folderPath: string, fileName: string): Promise<string> {
    try {
      const filePath = path.join(folderPath, fileName)
      const fullPath = path.join(this.workspacePath, filePath)

      // Ensure parent directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true })

      // Create empty file
      await fs.writeFile(fullPath, '', 'utf-8')
      logger.info('File created:', filePath)
      return filePath
    } catch (error) {
      logger.error('Failed to create file:', error as Error)
      throw error
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.workspacePath, filePath)
      await fs.unlink(fullPath)
      logger.info('File deleted:', filePath)
    } catch (error) {
      logger.error('Failed to delete file:', error as Error)
      throw error
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      const fullOldPath = path.join(this.workspacePath, oldPath)
      const fullNewPath = path.join(this.workspacePath, newPath)
      await fs.rename(fullOldPath, fullNewPath)
      logger.info('File renamed:', { oldPath, newPath })
    } catch (error) {
      logger.error('Failed to rename file:', error as Error)
      throw error
    }
  }

  async createFolder(parentPath: string, folderName: string): Promise<string> {
    try {
      const folderPath = path.join(parentPath, folderName)
      const fullPath = path.join(this.workspacePath, folderPath)
      await fs.mkdir(fullPath, { recursive: true })
      logger.info('Folder created:', folderPath)
      return folderPath
    } catch (error) {
      logger.error('Failed to create folder:', error as Error)
      throw error
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    try {
      const fullPath = path.join(this.workspacePath, folderPath)
      await fs.rm(fullPath, { recursive: true, force: true })
      logger.info('Folder deleted:', folderPath)
    } catch (error) {
      logger.error('Failed to delete folder:', error as Error)
      throw error
    }
  }

  async runCode(params: { filePath: string; language: string; content: string }): Promise<{ success: boolean; error?: string }> {
    const { filePath, language, content } = params

    try {
      const fullPath = path.join(this.workspacePath, filePath)

      // Save the file first
      await this.writeFile(filePath, content)

      let command: string
      switch (language) {
        case 'python':
          command = `python "${fullPath}"`
          break
        case 'javascript':
        case 'typescript':
          command = `node "${fullPath}"`
          break
        default:
          return {
            success: false,
            error: `Language ${language} is not supported for execution`
          }
      }

      logger.info('Executing code:', { language, command })

      // Execute the command (output will be sent via IPC)
      const { stdout, stderr } = await execAsync(command, {
        cwd: path.dirname(fullPath)
      })

      // Send output to terminal
      if (stdout) {
        this.sendTerminalOutput(stdout)
      }
      if (stderr) {
        this.sendTerminalOutput(stderr)
      }

      return { success: true }
    } catch (error: any) {
      logger.error('Failed to run code:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async executeCommand(command: string): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workspacePath
      })

      if (stdout) {
        this.sendTerminalOutput(stdout)
      }
      if (stderr) {
        this.sendTerminalOutput(stderr)
      }
    } catch (error: any) {
      this.sendTerminalOutput(`Error: ${error.message}`)
      throw error
    }
  }

  private sendTerminalOutput(data: string): void {
    // This will be implemented when we add the window communication
    logger.info('Terminal output:', data)
  }
}

export const ideService = new IDEService()
