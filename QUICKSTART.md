# DevGear Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd devgear
npm install
```

### 2. Configure Settings
1. Open VS Code Settings (Ctrl+,)
2. Search for "DevGear"
3. Configure:
   - **GitHub Token**: Your GitHub Personal Access Token
   - **Vercel Token**: Your Vercel API Token (optional)
   - **Docker Host**: Leave empty for local Docker

### 3. Launch Extension
1. Open VS Code
2. Press `F5` to launch Extension Development Host
3. In the new window, open a workspace folder
4. Access DevGear via:
   - Command Palette: `Ctrl+Shift+P` → "DevGear"
   - Explorer Sidebar: "DevGear" section
   - Command: "DevGear: Open DevGear Panel"

## 🔧 Quick Operations

### Clone a Repository
1. Command Palette → "DevGear: Clone Repository"
2. Enter GitHub repository URL
3. Select target directory

### Docker Operations
1. Command Palette → "DevGear: Generate Dockerfile"
2. Or use Docker MCP for container management
3. Deploy with "DevGear: Deploy Docker Compose"

### Deploy to Vercel
1. Open project folder
2. Command Palette → "DevGear: Deploy to Vercel"
3. Follow deployment prompts

### Setup CI/CD
1. Command Palette → "DevGear: Setup CI/CD Pipeline"
2. Select GitHub Actions template
3. Customize workflow as needed

## 🐛 Troubleshooting

### MCP Server Issues
- Check Docker is running for GitHub MCP
- Verify tokens are configured correctly
- Check DevGear Control Panel for server status

### Extension Debug
- Check VS Code Developer Console (Help → Toggle Developer Tools)
- Look for DevGear-related errors
- Restart Extension Development Host if needed

## 📱 Interface Overview

### Tree View (Explorer Sidebar)
- **GitHub**: Repository operations, issues, cloning
- **Docker**: Container management, compose deployment
- **Vercel**: Deployment management
- **CI/CD**: Pipeline setup and monitoring

### Control Panel (Webview)
- Visual interface for all operations
- Server status monitoring
- Quick action buttons
- Settings access

## 🔗 Next Steps
1. Test basic operations in Extension Development Host
2. Package extension: `npm install -g vsce && vsce package`
3. Install locally: `code --install-extension devgear-0.1.0.vsix`
4. Configure production MCP servers
5. Customize for your workflow needs

Happy coding with DevGear! 🚀
