# Cherry Studio Mini IDE

A complete integrated development environment built into Cherry Studio with AI assistance.

## Features

### 📝 Code Editor
- **Multi-language Support**: Syntax highlighting for JavaScript, TypeScript, Python, Rust, HTML, CSS, Java, and more
- **Smart Editing**: Code folding, minimap, line numbers
- **Auto-completion**: Built-in CodeMirror features
- **Theme Support**: Automatically adapts to Cherry Studio's dark/light mode

### 📁 File Management
- **File Explorer**: Tree view with intuitive navigation
- **CRUD Operations**: Create, rename, and delete files and folders
- **Workspace**: Files stored in `~/.cherrystudio/workspace/`
- **File Icons**: Visual indicators for different file types

### ▶️ Code Execution
- **Python Support**: Run Python scripts directly
- **JavaScript/Node.js**: Execute JavaScript and TypeScript code
- **Terminal Integration**: View execution output in built-in terminal

### 👁️ Live Preview
- **HTML Preview**: Real-time rendering of HTML files
- **CSS Support**: Preview styles in action
- **React Components**: View React/JSX/TSX code (build process required for full preview)

### 🤖 AI Assistant
- **Code Generation**: Ask AI to generate code snippets
- **Code Explanation**: Understand complex code with AI help
- **Error Debugging**: Get suggestions to fix errors
- **Code Improvement**: Receive suggestions for better code
- **Quick Actions**:
  - Explain code
  - Fix errors
  - Improve code
  - Add comments

### 💻 Terminal
- **Command Execution**: Run shell commands
- **Output Display**: View command results
- **Working Directory**: Commands run in workspace context

## How to Use

### Accessing the IDE
1. Click the IDE icon in the sidebar (usually a code icon)
2. Or navigate to `/ide` route

### Creating Your First File
1. Click the "+" button in the file explorer
2. Choose "New File"
3. Enter filename (e.g., `main.py`, `index.html`)
4. Start coding!

### Running Code
1. Open a Python (`.py`) or JavaScript (`.js`, `.ts`) file
2. Click the "Run" button in the toolbar
3. View output in the terminal panel

### Using AI Assistant
1. Select code or open a file
2. Use quick action buttons or type a custom question
3. AI will provide contextual help

### Preview HTML
1. Create or open an HTML file
2. Click the "Preview" button
3. View rendered output in the preview panel

## Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save current file
- `Ctrl/Cmd + F`: Search in code (CodeMirror built-in)
- `Ctrl/Cmd + /`: Toggle comment (CodeMirror built-in)

## Technical Details

### Architecture
- **Frontend**: React + TypeScript + styled-components
- **Editor**: CodeMirror (lightweight, extensible)
- **State Management**: Custom hooks + React state
- **IPC**: Electron IPC for file system operations
- **Backend**: Node.js (Electron main process)

### File Structure
```
src/renderer/src/pages/ide/
├── IDEPage.tsx              # Main IDE page
├── components/
│   ├── AIAssistantPanel.tsx  # AI chat interface
│   ├── CodeEditorPanel.tsx   # Code editor wrapper
│   ├── FileExplorer.tsx      # File tree navigation
│   ├── PreviewPanel.tsx      # HTML/React preview
│   └── TerminalPanel.tsx     # Terminal output
├── hooks/
│   └── useFileSystem.ts      # File operations hook
└── index.ts

src/main/services/
└── IDEService.ts             # File system & execution
```

### Supported Languages
| Language | Extension | Execute | Preview |
|----------|-----------|---------|---------|
| Python | `.py` | ✅ | ❌ |
| JavaScript | `.js` | ✅ | ❌ |
| TypeScript | `.ts` | ✅ | ❌ |
| HTML | `.html` | ❌ | ✅ |
| CSS | `.css` | ❌ | ✅* |
| React | `.jsx`, `.tsx` | ❌ | ⚠️** |
| Java | `.java` | ❌ | ❌ |
| Rust | `.rs` | ❌ | ❌ |
| Go | `.go` | ❌ | ❌ |

\* CSS preview works when included in HTML  
\*\* React preview shows code (requires build process for full preview)

## Future Enhancements

### Planned Features
- [ ] Auto-save functionality
- [ ] Git integration
- [ ] Debugger integration
- [ ] LSP (Language Server Protocol) support
- [ ] Extensions/plugins system
- [ ] Multiple file tabs
- [ ] Split editor view
- [ ] File search across workspace
- [ ] Code snippets library
- [ ] Integrated test runner

### AI Integration Improvements
- [ ] Context-aware code completion
- [ ] Inline code suggestions
- [ ] Automated refactoring
- [ ] Code review assistance
- [ ] Documentation generation

## Troubleshooting

### Files not showing up?
- Check workspace path: `~/.cherrystudio/workspace/`
- Ensure you have write permissions
- Refresh the file explorer

### Code execution fails?
- Python: Ensure Python is installed and in PATH
- JavaScript: Ensure Node.js is installed
- Check terminal output for error messages

### Preview not working?
- Only HTML, JSX, and TSX files support preview
- For React components, full preview requires build process
- Check browser console for errors

## Contributing

When contributing to the IDE feature:
1. Follow existing code patterns
2. Add i18n translations for new features
3. Test file operations thoroughly
4. Ensure cross-platform compatibility (Windows, macOS, Linux)
5. Update this documentation

## License

Part of Cherry Studio - see main LICENSE file.
