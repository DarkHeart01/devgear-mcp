# DevGear VS Code Extension

## 🚀 Overview

DevGear is an AI-powered development toolkit that integrates GitHub, Docker, and Vercel operations directly into VS Code through Model Context Protocol (MCP) servers. It provides a unified interface for managing development workflows, from cloning repositories to deploying applications.

## ✨ Features

### 🐙 GitHub Integration
- Clone repositories with natural language commands
- Create and manage issues
- Pull request operations
- Repository browsing and management
- Seamless GitHub API integration via MCP

### 🐳 Docker Operations  
- Create and manage Docker containers
- Deploy Docker Compose stacks
- View container logs and status
- Build and run containerized applications
- Real-time container monitoring

### ☁️ Vercel Deployment
- Deploy projects to Vercel with one click
- Monitor deployment status
- Manage deployment history
- Environment variable configuration

### ⚙️ CI/CD Pipeline
- Setup GitHub Actions workflows
- Template-based pipeline generation
- Workflow monitoring and management
- Automated deployment pipelines

## 🛠️ Installation

### Prerequisites
1. **VS Code** 1.74.0 or higher
2. **Node.js** 16.x or higher
3. **Docker** (for Docker operations)
4. **Git** (for repository operations)

### Setup
1. Clone this repository or download the extension
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```
4. Install the extension in VS Code (for development):
   ```bash
   code --install-extension .
   ```

## 🔧 Configuration

### GitHub Setup
1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens)
2. Add the token to VS Code settings:
   - Open Settings (Ctrl+,)
   - Search for "DevGear"
   - Enter your GitHub token in "DevGear: Github Token"

### Vercel Setup  
1. Get your [Vercel API Token](https://vercel.com/account/tokens)
2. Add the token to VS Code settings:
   - Search for "DevGear" in settings
   - Enter your Vercel token in "DevGear: Vercel Token"

### Docker Setup
- Ensure Docker is running on your system
- For remote Docker hosts, configure the Docker Host URL in settings

## 📖 Usage

### Command Palette
Access DevGear commands through the Command Palette (Ctrl+Shift+P):
- `DevGear: Open DevGear Panel` - Open the main control panel
- `DevGear: Clone Repository` - Clone a GitHub repository
- `DevGear: Generate Dockerfile` - Create Docker configuration
- `DevGear: Deploy to Vercel` - Deploy current project
- `DevGear: Setup CI/CD Pipeline` - Create GitHub Actions workflow

### Side Panel
1. Open the Explorer panel
2. Find the "DevGear" section
3. Use the tree view to access:
   - GitHub repositories and operations
   - Docker containers and management
   - Vercel deployments
   - CI/CD pipeline tools

### Control Panel Webview
- Click "Open DevGear Panel" for a visual interface
- Use buttons for common operations
- Monitor MCP server status
- Quick access to all features

## 🏗️ Architecture

DevGear uses Model Context Protocol (MCP) servers for backend operations:

### MCP Servers
- **GitHub MCP**: Handles all GitHub API operations
- **Docker MCP**: Manages Docker containers and compose stacks  
- **Vercel MCP**: Manages Vercel deployments (planned)

### Components
- **Extension Host**: Main VS Code extension entry point
- **MCP Orchestrator**: Manages communication with MCP servers
- **DevGear Provider**: High-level API for operations
- **Tree Provider**: Sidebar navigation interface
- **Webview Provider**: Visual control panel interface

## 🔌 MCP Integration

### Supported MCP Servers
1. **GitHub MCP Server**: `ghcr.io/github/github-mcp-server`
2. **Docker MCP Server**: Custom Python-based server (included)
3. **Vercel MCP Server**: Custom implementation (in development)

### Server Configuration
The extension automatically starts and manages MCP servers:
- GitHub MCP runs in Docker container
- Docker MCP runs as Python process
- Communication via JSON-RPC over stdio

## 🚀 Development

### Project Structure
```
devgear/
├── src/
│   ├── core/
│   │   └── mcp-orchestrator.ts    # MCP server management
│   ├── providers/
│   │   ├── devgear-provider.ts    # Main operations API
│   │   └── tree-provider.ts       # Sidebar tree view
│   ├── webview/
│   │   └── webview-provider.ts    # Control panel interface
│   ├── types/
│   │   └── index.ts               # TypeScript definitions
│   └── extension.ts               # Extension entry point
├── media/                         # Webview assets (CSS/JS)
├── package.json                   # Extension manifest
└── tsconfig.json                  # TypeScript configuration
```

### Build Commands
```bash
# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Lint code
npm run lint

# Run tests
npm run test
```

### Debugging
1. Open the project in VS Code
2. Press F5 to launch Extension Development Host
3. Test commands and functionality
4. Check Debug Console for logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the docs/ folder for detailed guides
- **VS Code Marketplace**: Rate and review the extension

## 🛣️ Roadmap

- [ ] Enhanced Vercel MCP server
- [ ] Kubernetes support via MCP
- [ ] AWS deployment integration
- [ ] Enhanced CI/CD templates
- [ ] Team collaboration features
- [ ] Project templates and scaffolding
- [ ] Advanced monitoring and analytics

---

**Made with ❤️ for the VS Code community**
"# devgear-mcp" 
