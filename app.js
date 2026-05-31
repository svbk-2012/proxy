// Web IDE Application
let editor;
let currentFile = 'index.html';
let openFiles = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello World</h1>
    <p>Welcome to my website!</p>
    <script src="script.js"></script>
</body>
</html>`,
    'style.css': `/* Main Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    color: #333;
}

h1 {
    color: #0066cc;
    margin-bottom: 1rem;
}

p {
    line-height: 1.6;
}`,
    'script.js': `// Main JavaScript
console.log('Hello World!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Add your JavaScript code here
});`,
    'README.md': `# My Project

## Description
This is a sample project created with Web IDE.

## Features
- HTML5 structure
- CSS styling
- JavaScript functionality

## Usage
Open index.html in a web browser to view the project.`
};

// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: openFiles[currentFile],
        language: getLanguage(currentFile),
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        tabSize: 4,
        insertSpaces: true
    });

    // Save content when file changes
    editor.onDidChangeModelContent(function() {
        openFiles[currentFile] = editor.getValue();
    });

    // Update cursor position in status bar
    editor.onDidChangeCursorPosition(function(e) {
        const position = e.position;
        document.querySelector('.status-bar div:nth-child(2)').textContent = 
            `Ln ${position.lineNumber}, Col ${position.column}`;
    });
});

// Get language based on file extension
function getLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const languages = {
        'html': 'html',
        'css': 'css',
        'js': 'javascript',
        'json': 'json',
        'md': 'markdown',
        'py': 'python',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'vue': 'html',
        'xml': 'xml',
        'yaml': 'yaml',
        'yml': 'yaml'
    };
    return languages[ext] || 'plaintext';
}

// File tree click handler
document.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', function() {
        const filename = this.dataset.file;
        openFile(filename);
        
        // Update active state
        document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Open file in editor
function openFile(filename) {
    if (!openFiles[filename]) {
        openFiles[filename] = '';
    }
    
    currentFile = filename;
    
    if (editor) {
        editor.setValue(openFiles[filename]);
        monaco.editor.setModelLanguage(editor.getModel(), getLanguage(filename));
    }
    
    // Update tabs
    updateTabs(filename);
    
    // Update status bar
    document.querySelector('.status-bar div:nth-child(4)').textContent = 
        getLanguage(filename).toUpperCase();
}

// Update tabs
function updateTabs(filename) {
    const tabsContainer = document.getElementById('tabs');
    const existingTab = tabsContainer.querySelector(`[data-file="${filename}"]`);
    
    if (!existingTab) {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.file = filename;
        tab.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="${getFileColor(filename)}">
                <path d="M1 1h14l-1.5 13L8 15 2.5 14 1 1zm2.5 3l.5 4h6l.5-4H3.5z"/>
            </svg>
            ${filename}
            <span class="tab-close">×</span>
        `;
        
        tab.querySelector('.tab-close').addEventListener('click', function(e) {
            e.stopPropagation();
            closeTab(filename);
        });
        
        tab.addEventListener('click', function() {
            openFile(filename);
        });
        
        tabsContainer.appendChild(tab);
    }
    
    // Set active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tabsContainer.querySelector(`[data-file="${filename}"]`).classList.add('active');
}

// Get file color based on extension
function getFileColor(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const colors = {
        'html': '#e44d26',
        'css': '#264de4',
        'js': '#f7df1e',
        'json': '#cbcb41',
        'md': '#088fa1',
        'py': '#3776ab',
        'ts': '#3178c6'
    };
    return colors[ext] || '#cccccc';
}

// Close tab
function closeTab(filename) {
    const tab = document.querySelector(`.tab[data-file="${filename}"]`);
    if (tab) {
        tab.remove();
        
        // If closing current file, switch to another
        if (filename === currentFile) {
            const remainingTabs = document.querySelectorAll('.tab');
            if (remainingTabs.length > 0) {
                openFile(remainingTabs[0].dataset.file);
            }
        }
    }
}

// Panel tab switching
document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const panel = this.dataset.panel;
        
        // Update active tab
        document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding panel
        document.querySelectorAll('.panel-content').forEach(p => p.classList.add('hidden'));
        document.getElementById(`${panel}-panel`).classList.remove('hidden');
    });
});

// Sidebar panel switching
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function() {
        const panel = this.dataset.panel;
        
        // Update active state
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        // For now, just log - can be expanded
        console.log(`Switched to ${panel} panel`);
    });
});

// Terminal functionality
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');

terminalInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const command = this.value.trim();
        if (command) {
            executeCommand(command);
            this.value = '';
        }
    }
});

function executeCommand(command) {
    const outputDiv = document.createElement('div');
    outputDiv.innerHTML = `<span class="text-green-400">$</span> ${command}`;
    terminalOutput.appendChild(outputDiv);
    
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    let response = '';
    
    switch(cmd) {
        case 'help':
            response = `Available commands:
  help     - Show this help message
  clear    - Clear terminal
  ls       - List files
  cat      - View file content (usage: cat filename)
  echo     - Print text (usage: echo text)
  date     - Show current date and time
  whoami   - Show current user
  pwd      - Show current directory`;
            break;
        case 'clear':
            terminalOutput.innerHTML = '';
            return;
        case 'ls':
            response = Object.keys(openFiles).join('  ');
            break;
        case 'cat':
            if (args.length > 0) {
                const filename = args[0];
                if (openFiles[filename]) {
                    response = openFiles[filename];
                } else {
                    response = `File not found: ${filename}`;
                }
            } else {
                response = 'Usage: cat filename';
            }
            break;
        case 'echo':
            response = args.join(' ');
            break;
        case 'date':
            response = new Date().toString();
            break;
        case 'whoami':
            response = 'web-ide-user';
            break;
        case 'pwd':
            response = '/home/web-ide-user/project';
            break;
        default:
            response = `Command not found: ${cmd}. Type 'help' for available commands.`;
    }
    
    if (response) {
        const responseDiv = document.createElement('div');
        responseDiv.innerHTML = response.replace(/\n/g, '<br>');
        terminalOutput.appendChild(responseDiv);
    }
    
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Chat functionality
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.textContent = message;
    chatMessages.appendChild(userMessage);
    
    chatInput.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const assistantMessage = document.createElement('div');
        assistantMessage.className = 'chat-message assistant';
        assistantMessage.textContent = generateAIResponse(message);
        chatMessages.appendChild(assistantMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
}

function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return 'Hello! How can I help you with your coding project today?';
    } else if (lowerMessage.includes('help')) {
        return 'I can help you with:\n- Writing code\n- Debugging issues\n- Explaining concepts\n- Refactoring code\n- Adding new features\n\nJust ask me anything!';
    } else if (lowerMessage.includes('html')) {
        return 'HTML is the standard markup language for creating web pages. It describes the structure of a web page and consists of a series of elements that tell the browser how to display content.';
    } else if (lowerMessage.includes('css')) {
        return 'CSS (Cascading Style Sheets) is used to style and layout web pages. It allows you to control colors, fonts, spacing, positioning, and much more.';
    } else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
        return 'JavaScript is a programming language that enables interactive web pages. It can update and change both HTML and CSS, and can calculate, manipulate and validate data.';
    } else if (lowerMessage.includes('github')) {
        return 'GitHub is a web-based platform for version control and collaboration. It allows you to host and review code, manage projects, and build software with other developers.';
    } else {
        return 'I understand you\'re asking about: "' + message + '". As an AI assistant, I can help you with coding questions, debugging, and more. Could you provide more details about what you need help with?';
    }
}

// GitHub integration
const githubConnectBtn = document.getElementById('github-connect-btn');
const githubRepoInput = document.getElementById('github-repo-input');

githubConnectBtn.addEventListener('click', function() {
    const repo = githubRepoInput.value.trim();
    if (repo) {
        connectToGitHub(repo);
    } else {
        alert('Please enter a repository in the format: owner/repo');
    }
});

function connectToGitHub(repo) {
    // This would normally connect to GitHub API
    // For demo purposes, we'll simulate the connection
    console.log(`Connecting to GitHub repository: ${repo}`);
    
    // Simulate loading files from GitHub
    const [owner, repoName] = repo.split('/');
    
    // Update UI to show connected state
    githubConnectBtn.textContent = 'Connected ✓';
    githubConnectBtn.style.backgroundColor = '#28a745';
    githubConnectBtn.disabled = true;
    
    // Show success message in terminal
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `<span class="text-green-400">✓</span> Connected to GitHub: ${repo}`;
    successDiv.style.color = '#28a745';
    terminalOutput.appendChild(successDiv);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    
    // In a real implementation, you would:
    // 1. Use GitHub API to fetch repository contents
    // 2. Load files into the editor
    // 3. Enable commit/push functionality
    // 4. Show branch information
}

// Panel resize functionality
const resizeHandle = document.getElementById('resize-handle');
const panel = document.querySelector('.panel');
let isResizing = false;

resizeHandle.addEventListener('mousedown', function(e) {
    isResizing = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;
    
    const containerRect = document.querySelector('.editor-container').getBoundingClientRect();
    const newHeight = containerRect.bottom - e.clientY;
    
    if (newHeight >= 100 && newHeight <= 500) {
        panel.style.height = newHeight + 'px';
    }
});

document.addEventListener('mouseup', function() {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFile();
    }
    
    // Ctrl+B to toggle sidebar
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
    }
    
    // Ctrl+` to toggle terminal
    if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
    }
});

function saveFile() {
    // In a real implementation, this would save to GitHub or local storage
    console.log(`Saving ${currentFile}...`);
    
    // Show save notification
    const notification = document.createElement('div');
    notification.textContent = `Saved ${currentFile}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 40px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 1000;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('hidden');
}

function toggleTerminal() {
    const panel = document.querySelector('.panel');
    panel.classList.toggle('hidden');
}

// Initialize
console.log('Web IDE initialized successfully');
