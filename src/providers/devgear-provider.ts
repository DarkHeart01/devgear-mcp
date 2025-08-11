import * as vscode from 'vscode';
import { MCPOrchestrator } from '../core/mcp-orchestrator';
import { GitHubProvider } from './github-provider';
import * as path from 'path';

export class DevGearProvider {
    private orchestrator: MCPOrchestrator;
    private githubProvider: GitHubProvider;

    constructor(orchestrator: MCPOrchestrator) {
        this.orchestrator = orchestrator;
        this.githubProvider = new GitHubProvider(orchestrator);
    }

    async cloneRepository(repoUrl?: string, targetPath?: string): Promise<void> {
        try {
            if (!repoUrl) {
                repoUrl = await vscode.window.showInputBox({
                    prompt: 'Enter GitHub repository URL',
                    placeHolder: 'https://github.com/owner/repo.git'
                });
                
                if (!repoUrl) {
                    return;
                }
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Cloning repository...",
                cancellable: false
            }, async (progress) => {
                progress.report({ message: "Fetching repository details..." });
                
                const repoInfo = this.githubProvider.parseRepositoryUrl(repoUrl!);
                if (!repoInfo) {
                    throw new Error('Invalid GitHub repository URL');
                }
                
                const hasGitHub = await this.githubProvider.isGitHubAvailable();
                if (hasGitHub) {
                    progress.report({ message: "Getting repository information..." });
                    
                    try {
                        const repoDetails = await this.githubProvider.getFileContents(
                            repoInfo.owner,
                            repoInfo.repo,
                            'README.md'
                        );
                        
                        vscode.window.showInformationMessage(
                            `Found repository: ${repoInfo.owner}/${repoInfo.repo}`
                        );
                    } catch (error) {
                        console.log('Could not fetch repository details via API, proceeding with clone');
                    }
                }
                
                progress.report({ message: "Cloning repository..." });
                
                // Use git clone (this would need terminal integration)
                const terminal = vscode.window.createTerminal('DevGear Clone');
                if (targetPath) {
                    terminal.sendText(`git clone "${repoUrl}" "${targetPath}"`);
                } else {
                    terminal.sendText(`git clone "${repoUrl}"`);
                }
                terminal.show();
                
                vscode.window.showInformationMessage('Repository cloning started in terminal');
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to clone repository: ${error}`);
        }
    }

    async createGitHubRepository(): Promise<void> {
        try {
            const hasGitHub = await this.githubProvider.isGitHubAvailable();
            if (!hasGitHub) {
                vscode.window.showErrorMessage('GitHub token not configured. Please set up GitHub authentication first.');
                return;
            }

            console.log('[DevGearProvider] Listing available GitHub MCP tools...');
            await this.githubProvider.listAvailableTools();

            const name = await vscode.window.showInputBox({
                prompt: 'Repository name',
                placeHolder: 'my-awesome-project'
            });

            if (!name) return;

            const description = await vscode.window.showInputBox({
                prompt: 'Repository description (optional)',
                placeHolder: 'A brief description of your project'
            });

            const isPrivate = await vscode.window.showQuickPick(
                ['Public', 'Private'],
                { placeHolder: 'Repository visibility' }
            );

            if (!isPrivate) return;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Creating GitHub repository...",
                cancellable: false
            }, async () => {
                console.log(`[DevGearProvider] Creating repository: ${name}, ${description}, ${isPrivate}`);
                const result = await this.githubProvider.createRepository(
                    name,
                    description,
                    isPrivate === 'Private'
                );

                vscode.window.showInformationMessage(
                    `✅ Repository created: ${result.full_name}`,
                    'Open in Browser'
                ).then(selection => {
                    if (selection === 'Open in Browser') {
                        vscode.env.openExternal(vscode.Uri.parse(result.html_url));
                    }
                });
            });

        } catch (error) {
            console.error('[DevGearProvider] Repository creation error:', error);
            vscode.window.showErrorMessage(`Failed to create repository: ${error}`);
        }
    }

    async createGitHubIssue(): Promise<void> {
        try {
            const hasGitHub = await this.githubProvider.isGitHubAvailable();
            if (!hasGitHub) {
                vscode.window.showErrorMessage('GitHub token not configured. Please set up GitHub authentication first.');
                return;
            }

            const repoInfo = await this.getRepositoryInfo();
            if (!repoInfo) return;

            const title = await vscode.window.showInputBox({
                prompt: 'Issue title',
                placeHolder: 'Brief description of the issue'
            });

            if (!title) return;

            const body = await vscode.window.showInputBox({
                prompt: 'Issue description (optional)',
                placeHolder: 'Detailed description of the issue'
            });

            const labels = await vscode.window.showInputBox({
                prompt: 'Labels (optional, comma-separated)',
                placeHolder: 'bug, enhancement, help wanted'
            });

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Creating GitHub issue...",
                cancellable: false
            }, async () => {
                const result = await this.githubProvider.createIssue(
                    repoInfo.owner,
                    repoInfo.repo,
                    title,
                    body,
                    labels ? labels.split(',').map(l => l.trim()) : undefined
                );

                vscode.window.showInformationMessage(
                    `✅ Issue created: #${result.number}`,
                    'Open in Browser'
                ).then(selection => {
                    if (selection === 'Open in Browser') {
                        vscode.env.openExternal(vscode.Uri.parse(result.html_url));
                    }
                });
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create issue: ${error}`);
        }
    }

    async createGitHubPullRequest(): Promise<void> {
        try {
            const hasGitHub = await this.githubProvider.isGitHubAvailable();
            if (!hasGitHub) {
                vscode.window.showErrorMessage('GitHub token not configured. Please set up GitHub authentication first.');
                return;
            }

            const repoInfo = await this.getRepositoryInfo();
            if (!repoInfo) return;

            const title = await vscode.window.showInputBox({
                prompt: 'Pull request title',
                placeHolder: 'Brief description of changes'
            });

            if (!title) return;

            const head = await vscode.window.showInputBox({
                prompt: 'Head branch (your changes)',
                placeHolder: 'feature/my-feature'
            });

            if (!head) return;

            const base = await vscode.window.showInputBox({
                prompt: 'Base branch (target)',
                placeHolder: 'main',
                value: 'main'
            });

            if (!base) return;

            const body = await vscode.window.showInputBox({
                prompt: 'Pull request description (optional)',
                placeHolder: 'Detailed description of changes'
            });

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Creating pull request...",
                cancellable: false
            }, async () => {
                const result = await this.githubProvider.createPullRequest(
                    repoInfo.owner,
                    repoInfo.repo,
                    title,
                    head,
                    base,
                    body
                );

                vscode.window.showInformationMessage(
                    `✅ Pull request created: #${result.number}`,
                    'Open in Browser',
                    'Request Copilot Review'
                ).then(async selection => {
                    if (selection === 'Open in Browser') {
                        vscode.env.openExternal(vscode.Uri.parse(result.html_url));
                    } else if (selection === 'Request Copilot Review') {
                        try {
                            await this.githubProvider.requestCopilotReview(repoInfo.owner, repoInfo.repo, result.number);
                            vscode.window.showInformationMessage('✅ Copilot review requested');
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to request Copilot review: ${error}`);
                        }
                    }
                });
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create pull request: ${error}`);
        }
    }

    async viewGitHubActions(): Promise<void> {
        try {
            const hasGitHub = await this.githubProvider.isGitHubAvailable();
            if (!hasGitHub) {
                vscode.window.showErrorMessage('GitHub token not configured. Please set up GitHub authentication first.');
                return;
            }

            const repoInfo = await this.getRepositoryInfo();
            if (!repoInfo) return;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Fetching GitHub Actions...",
                cancellable: false
            }, async () => {
                const workflows = await this.githubProvider.listWorkflows(repoInfo.owner, repoInfo.repo);
                const runs = await this.githubProvider.listWorkflowRuns(repoInfo.owner, repoInfo.repo);

                const panel = vscode.window.createWebviewPanel(
                    'gitHubActions',
                    'GitHub Actions',
                    vscode.ViewColumn.One,
                    { enableScripts: true }
                );

                panel.webview.html = this.generateActionsWebview(workflows, runs, repoInfo);
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch GitHub Actions: ${error}`);
        }
    }

    async viewSecurityAlerts(): Promise<void> {
        try {
            const hasGitHub = await this.githubProvider.isGitHubAvailable();
            if (!hasGitHub) {
                vscode.window.showErrorMessage('GitHub token not configured. Please set up GitHub authentication first.');
                return;
            }

            const repoInfo = await this.getRepositoryInfo();
            if (!repoInfo) return;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Fetching security alerts...",
                cancellable: false
            }, async () => {
                const [codeScanning, secretScanning, dependabot] = await Promise.all([
                    this.githubProvider.listCodeScanningAlerts(repoInfo.owner, repoInfo.repo).catch(() => []),
                    this.githubProvider.listSecretScanningAlerts(repoInfo.owner, repoInfo.repo).catch(() => []),
                    this.githubProvider.listDependabotAlerts(repoInfo.owner, repoInfo.repo).catch(() => [])
                ]);

                const panel = vscode.window.createWebviewPanel(
                    'securityAlerts',
                    'Security Alerts',
                    vscode.ViewColumn.One,
                    { enableScripts: true }
                );

                panel.webview.html = this.generateSecurityWebview(codeScanning, secretScanning, dependabot, repoInfo);
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch security alerts: ${error}`);
        }
    }

    async createGist(): Promise<void> {
        try {
            const hasGitHub = await this.githubProvider.isGitHubAvailable();
            if (!hasGitHub) {
                vscode.window.showErrorMessage('GitHub token not configured. Please set up GitHub authentication first.');
                return;
            }

            // Get active editor content or prompt for content
            const editor = vscode.window.activeTextEditor;
            let content = '';
            let filename = 'snippet.txt';

            if (editor && editor.selection && !editor.selection.isEmpty) {
                content = editor.document.getText(editor.selection);
                filename = `snippet.${editor.document.languageId}`;
            } else if (editor) {
                content = editor.document.getText();
                filename = path.basename(editor.document.fileName);
            }

            if (!content) {
                content = await vscode.window.showInputBox({
                    prompt: 'Gist content',
                    placeHolder: 'Enter the content for your gist'
                }) || '';
            }

            if (!content) return;

            const gistFilename = await vscode.window.showInputBox({
                prompt: 'Filename',
                placeHolder: filename,
                value: filename
            });

            if (!gistFilename) return;

            const description = await vscode.window.showInputBox({
                prompt: 'Description (optional)',
                placeHolder: 'Brief description of your gist'
            });

            const isPublic = await vscode.window.showQuickPick(
                ['Public', 'Secret'],
                { placeHolder: 'Gist visibility' }
            );

            if (!isPublic) return;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Creating gist...",
                cancellable: false
            }, async () => {
                const result = await this.githubProvider.createGist(
                    gistFilename,
                    content,
                    description,
                    isPublic === 'Public'
                );

                vscode.window.showInformationMessage(
                    `✅ Gist created successfully`,
                    'Open in Browser',
                    'Copy URL'
                ).then(selection => {
                    if (selection === 'Open in Browser') {
                        vscode.env.openExternal(vscode.Uri.parse(result.html_url));
                    } else if (selection === 'Copy URL') {
                        vscode.env.clipboard.writeText(result.html_url);
                        vscode.window.showInformationMessage('URL copied to clipboard');
                    }
                });
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create gist: ${error}`);
        }
    }

    private async getRepositoryInfo(): Promise<{owner: string, repo: string} | null> {
        // Try to get from workspace first
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            // In a real implementation, we'd check git remotes
            // For now, prompt the user
        }

        // Prompt user for repository
        const repoInput = await vscode.window.showInputBox({
            prompt: 'Enter repository (owner/repo)',
            placeHolder: 'microsoft/vscode'
        });

        if (!repoInput) return null;

        const parts = repoInput.split('/');
        if (parts.length !== 2) {
            vscode.window.showErrorMessage('Invalid repository format. Use: owner/repo');
            return null;
        }

        return {
            owner: parts[0],
            repo: parts[1]
        };
    }

    private generateActionsWebview(workflows: any, runs: any, repoInfo: {owner: string, repo: string}): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>GitHub Actions - ${repoInfo.owner}/${repoInfo.repo}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
                .workflow { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .status-success { color: #28a745; }
                .status-failure { color: #dc3545; }
                .status-pending { color: #ffc107; }
                .run { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>GitHub Actions for ${repoInfo.owner}/${repoInfo.repo}</h1>
            
            <h2>Workflows</h2>
            ${workflows.workflows?.map((workflow: any) => `
                <div class="workflow">
                    <h3>${workflow.name}</h3>
                    <p>State: ${workflow.state}</p>
                    <p>Path: ${workflow.path}</p>
                </div>
            `).join('') || '<p>No workflows found</p>'}
            
            <h2>Recent Runs</h2>
            ${runs.workflow_runs?.slice(0, 10).map((run: any) => `
                <div class="run">
                    <h4>${run.name}</h4>
                    <p class="status-${run.status}">${run.status} - ${run.conclusion || 'in progress'}</p>
                    <p>Branch: ${run.head_branch}</p>
                    <p>Triggered: ${new Date(run.created_at).toLocaleString()}</p>
                </div>
            `).join('') || '<p>No recent runs found</p>'}
        </body>
        </html>
        `;
    }

    private generateSecurityWebview(codeScanning: any[], secretScanning: any[], dependabot: any[], repoInfo: {owner: string, repo: string}): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Security Alerts - ${repoInfo.owner}/${repoInfo.repo}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
                .alert { margin: 10px 0; padding: 15px; border-radius: 8px; }
                .alert-high { background: #ffe6e6; border-left: 4px solid #dc3545; }
                .alert-medium { background: #fff3cd; border-left: 4px solid #ffc107; }
                .alert-low { background: #e7f3ff; border-left: 4px solid #007bff; }
                .summary { display: flex; gap: 20px; margin: 20px 0; }
                .summary-card { padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; }
            </style>
        </head>
        <body>
            <h1>Security Overview for ${repoInfo.owner}/${repoInfo.repo}</h1>
            
            <div class="summary">
                <div class="summary-card">
                    <h3>${codeScanning.length}</h3>
                    <p>Code Scanning Alerts</p>
                </div>
                <div class="summary-card">
                    <h3>${secretScanning.length}</h3>
                    <p>Secret Scanning Alerts</p>
                </div>
                <div class="summary-card">
                    <h3>${dependabot.length}</h3>
                    <p>Dependabot Alerts</p>
                </div>
            </div>
            
            <h2>Code Scanning Alerts</h2>
            ${codeScanning.slice(0, 10).map((alert: any) => `
                <div class="alert alert-${alert.rule?.security_severity_level || 'medium'}">
                    <h4>${alert.rule?.description || 'Security Alert'}</h4>
                    <p>Severity: ${alert.rule?.security_severity_level || 'Unknown'}</p>
                    <p>State: ${alert.state}</p>
                </div>
            `).join('') || '<p>No code scanning alerts</p>'}
            
            <h2>Secret Scanning Alerts</h2>
            ${secretScanning.slice(0, 10).map((alert: any) => `
                <div class="alert alert-high">
                    <h4>Secret Detected</h4>
                    <p>Type: ${alert.secret_type}</p>
                    <p>State: ${alert.state}</p>
                </div>
            `).join('') || '<p>No secret scanning alerts</p>'}
            
            <h2>Dependabot Alerts</h2>
            ${dependabot.slice(0, 10).map((alert: any) => `
                <div class="alert alert-${alert.security_advisory?.severity || 'medium'}">
                    <h4>${alert.security_advisory?.summary || 'Dependency Alert'}</h4>
                    <p>Package: ${alert.dependency?.package?.name}</p>
                    <p>Severity: ${alert.security_advisory?.severity}</p>
                    <p>State: ${alert.state}</p>
                </div>
            `).join('') || '<p>No dependabot alerts</p>'}
        </body>
        </html>
        `;
    }

    async createDockerContainer(imageName: string, containerName?: string): Promise<void> {
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Creating Docker container...",
                cancellable: false
            }, async (progress) => {
                progress.report({ message: "Starting container creation..." });
                
                const result = await this.orchestrator.callTool('docker', 'create-container', {
                    image: imageName,
                    name: containerName || `devgear-${Date.now()}`,
                    ports: { '3000': '3000' },
                    environment: {}
                });
                
                progress.report({ message: "Container created successfully" });
                
                vscode.window.showInformationMessage(`Container created: ${result.container_id}`);
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create container: ${error}`);
        }
    }

    async deployWithDockerCompose(composePath: string): Promise<void> {
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Deploying with Docker Compose...",
                cancellable: false
            }, async (progress) => {
                progress.report({ message: "Starting deployment..." });
                
                const result = await this.orchestrator.callTool('docker', 'deploy-compose', {
                    compose_file: composePath,
                    project_name: 'devgear-project'
                });
                
                progress.report({ message: "Deployment completed" });
                
                vscode.window.showInformationMessage(`Docker Compose deployed successfully`);
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to deploy: ${error}`);
        }
    }

    async listDockerContainers(): Promise<any[]> {
        try {
            const containers = await this.orchestrator.callTool('docker', 'list-containers', {
                all: true
            });
            return containers || [];
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to list containers: ${error}`);
            return [];
        }
    }

    async getContainerLogs(containerId: string): Promise<string> {
        try {
            const logs = await this.orchestrator.callTool('docker', 'get-logs', {
                container_id: containerId,
                lines: 100
            });
            return logs || '';
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to get logs: ${error}`);
            return '';
        }
    }

    async listGitHubRepositories(username?: string): Promise<any[]> {
        try {
            // Check if GitHub MCP is available
            const hasGitHub = await this.githubProvider.isGitHubAvailable();
            if (!hasGitHub) {
                return [];
            }

            // Use the GitHub provider's search method which handles tool name mapping
            const query = username ? `user:${username}` : 'user:@me';
            const repos = await this.githubProvider.searchRepositories(query, undefined, undefined);
            return repos?.items || [];
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to list repositories: ${error}`);
            return [];
        }
    }

    async setupCIPipeline(repoPath: string): Promise<void> {
        try {
            // Create a basic GitHub Actions workflow
            const workflowContent = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      if: github.ref == 'refs/heads/main'
      run: echo "Deploy to production"
`;

            // For now, show the workflow content - in a full implementation,
            // you'd use GitHub API to create the file
            const uri = vscode.Uri.file(`${repoPath}/.github/workflows/ci.yml`);
            const doc = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(doc);
            
            await editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), workflowContent);
            });
            
            vscode.window.showInformationMessage('CI/CD pipeline template created');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to setup CI pipeline: ${error}`);
        }
    }

    async deployToVercel(projectPath: string): Promise<void> {
        try {
            vscode.window.showInformationMessage('🚀 Starting Vercel deployment...');

            // Check for Vercel token configuration
            const config = vscode.workspace.getConfiguration('devgear');
            let vercelToken = config.get<string>('vercelToken');

            // If no token configured, offer multiple authentication options
            if (!vercelToken) {
                const authMethod = await vscode.window.showErrorMessage(
                    'Vercel authentication required. Choose your preferred method:',
                    'Use CLI Login',
                    'Enter Token',
                    'Get Token from Vercel'
                );

                if (authMethod === 'Use CLI Login') {
                    await this.vercelCLILogin(projectPath);
                    return;
                } else if (authMethod === 'Enter Token') {
                    vercelToken = await vscode.window.showInputBox({
                        prompt: 'Enter your Vercel API Token',
                        placeHolder: 'vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                        password: true,
                        ignoreFocusOut: true,
                        validateInput: (value) => {
                            if (!value) return 'Token is required';
                            if (!value.startsWith('vercel_')) return 'Token should start with "vercel_"';
                            if (value.length < 30) return 'Token appears to be too short';
                            return null;
                        }
                    });

                    if (vercelToken) {
                        await config.update('vercelToken', vercelToken, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage('✅ Vercel token saved to VS Code settings');
                    }
                } else if (authMethod === 'Get Token from Vercel') {
                    vscode.env.openExternal(vscode.Uri.parse('https://vercel.com/account/tokens'));
                    vscode.window.showInformationMessage('📖 Opened Vercel tokens page. Create a token and come back to set it up.');
                    return;
                }

                if (!vercelToken) {
                    vscode.window.showWarningMessage('❌ Deployment cancelled - no authentication provided');
                    return;
                }
            }

            // Validate token format
            if (!this.isValidVercelToken(vercelToken)) {
                const resetToken = await vscode.window.showErrorMessage(
                    'Invalid Vercel token format. The token should start with "vercel_".',
                    'Enter New Token',
                    'Use CLI Login'
                );

                if (resetToken === 'Enter New Token') {
                    await config.update('vercelToken', '', vscode.ConfigurationTarget.Global);
                    await this.deployToVercel(projectPath); // Retry with fresh token
                    return;
                } else if (resetToken === 'Use CLI Login') {
                    await this.vercelCLILogin(projectPath);
                    return;
                }

                return;
            }

            // Verify project structure and create vercel.json if needed
            await this.prepareVercelProject(projectPath);

            // Deploy with token authentication
            await this.executeVercelDeployment(projectPath, vercelToken);

        } catch (error) {
            vscode.window.showErrorMessage(`❌ Failed to deploy to Vercel: ${error}`);
        }
    }

    private isValidVercelToken(token: string): boolean {
        return token.startsWith('vercel_') && token.length >= 30;
    }

    private async vercelCLILogin(projectPath: string): Promise<void> {
        const terminal = vscode.window.createTerminal('DevGear Vercel Login');
        terminal.sendText(`cd "${projectPath}"`);
        terminal.sendText('npx vercel login');
        terminal.show();
        
        const result = await vscode.window.showInformationMessage(
            '🔐 Please complete the Vercel login process in the terminal, then choose your next action:',
            'Deploy Now',
            'Deploy Later',
            'Cancel'
        );

        if (result === 'Deploy Now') {
            // Deploy using CLI authentication instead of token
            await this.executeVercelCLIDeployment(projectPath);
        } else if (result === 'Deploy Later') {
            vscode.window.showInformationMessage(
                '✅ Vercel login completed. You can now deploy anytime using DevGear commands.'
            );
        }
    }

    private async executeVercelCLIDeployment(projectPath: string): Promise<void> {
        const terminal = vscode.window.createTerminal('DevGear Vercel Deploy (CLI Auth)');
        terminal.sendText(`cd "${projectPath}"`);
        terminal.sendText('npx vercel --prod --yes');
        terminal.show();
        
        vscode.window.showInformationMessage(
            '🚀 Vercel deployment started using CLI authentication!'
        );

        // Show follow-up actions
        setTimeout(() => {
            vscode.window.showInformationMessage(
                'Deployment in progress... You can check status at vercel.com/dashboard',
                'Open Dashboard'
            ).then(selection => {
                if (selection === 'Open Dashboard') {
                    vscode.env.openExternal(vscode.Uri.parse('https://vercel.com/dashboard'));
                }
            });
        }, 3000);
    }

    private async prepareVercelProject(projectPath: string): Promise<void> {
        try {
            // Check if vercel.json exists
            const vercelConfigPath = vscode.Uri.file(`${projectPath}/vercel.json`);
            
            try {
                await vscode.workspace.fs.stat(vercelConfigPath);
                // vercel.json already exists
                return;
            } catch {
                // vercel.json doesn't exist, let's create a basic one
            }

            // Analyze project type
            const packageJsonPath = vscode.Uri.file(`${projectPath}/package.json`);
            let projectType = 'static';
            let buildCommand = '';
            let outputDirectory = '';

            try {
                const packageJsonData = await vscode.workspace.fs.readFile(packageJsonPath);
                const packageJson = JSON.parse(new TextDecoder().decode(packageJsonData));
                
                // Detect project type and build configuration
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                const scripts = packageJson.scripts || {};

                if (deps.next || deps['@next/core']) {
                    projectType = 'nextjs';
                    buildCommand = 'npm run build';
                } else if (deps.react || deps['react-dom']) {
                    projectType = 'react';
                    buildCommand = scripts.build || 'npm run build';
                    outputDirectory = 'build';
                } else if (deps.vue || deps['@vue/cli']) {
                    projectType = 'vue';
                    buildCommand = scripts.build || 'npm run build';
                    outputDirectory = 'dist';
                } else if (deps.express || deps.fastify || deps.koa) {
                    projectType = 'node';
                }

                // Create appropriate vercel.json
                let vercelConfig: any = {};

                if (projectType === 'react' || projectType === 'vue') {
                    vercelConfig = {
                        version: 2,
                        builds: [
                            {
                                src: "package.json",
                                use: "@vercel/static-build",
                                config: {
                                    distDir: outputDirectory
                                }
                            }
                        ]
                    };
                } else if (projectType === 'node') {
                    vercelConfig = {
                        version: 2,
                        builds: [
                            {
                                src: packageJson.main || "index.js",
                                use: "@vercel/node"
                            }
                        ]
                    };
                } else if (projectType === 'nextjs') {
                    // Next.js projects don't need vercel.json, Vercel auto-detects
                    return;
                }

                if (Object.keys(vercelConfig).length > 0) {
                    const createConfig = await vscode.window.showInformationMessage(
                        `Create vercel.json for ${projectType} project?`,
                        'Yes', 'No'
                    );

                    if (createConfig === 'Yes') {
                        await vscode.workspace.fs.writeFile(
                            vercelConfigPath,
                            Buffer.from(JSON.stringify(vercelConfig, null, 2))
                        );
                        vscode.window.showInformationMessage('✅ Created vercel.json configuration');
                    }
                }

            } catch {
                // No package.json or error reading it, treat as static site
            }

        } catch (error) {
            console.error('Error preparing Vercel project:', error);
            // Continue anyway, Vercel can handle projects without vercel.json
        }
    }

    private async executeVercelDeployment(projectPath: string, token: string): Promise<void> {
        const terminal = vscode.window.createTerminal({
            name: 'DevGear Vercel Deploy',
            env: {
                ...process.env,
                VERCEL_TOKEN: token
            }
        });
        
        terminal.sendText(`cd "${projectPath}"`);
        
        // Use the --token flag directly (more reliable than environment variables)
        terminal.sendText(`npx vercel --prod --yes --token ${token}`);
        terminal.show();
        
        vscode.window.showInformationMessage(
            '🚀 Vercel deployment started with authentication! Check the terminal for progress.'
        );

        // Optional: Show follow-up actions
        setTimeout(() => {
            vscode.window.showInformationMessage(
                'Deployment in progress... You can check status at vercel.com/dashboard',
                'Open Dashboard'
            ).then(selection => {
                if (selection === 'Open Dashboard') {
                    vscode.env.openExternal(vscode.Uri.parse('https://vercel.com/dashboard'));
                }
            });
        }, 3000);
    }

    // Additional methods needed by extension.ts
    async dockerizeProject(targetPath: string): Promise<void> {
        try {
            // Check if target path exists
            try {
                await vscode.workspace.fs.stat(vscode.Uri.file(targetPath));
            } catch {
                vscode.window.showErrorMessage(`Target path does not exist: ${targetPath}`);
                return;
            }

            // Check if Dockerfile already exists
            const dockerfilePath = vscode.Uri.file(`${targetPath}/Dockerfile`);
            try {
                await vscode.workspace.fs.stat(dockerfilePath);
                const choice = await vscode.window.showWarningMessage(
                    'Dockerfile already exists. Do you want to overwrite it?',
                    'Yes, Overwrite',
                    'No, Cancel'
                );
                if (choice !== 'Yes, Overwrite') {
                    return;
                }
            } catch {
                // File doesn't exist, which is fine
            }

            // Detect project type and analyze package.json
            let dockerfileContent = '';
            try {
                // Check for package.json (Node.js project)
                const packageJsonUri = vscode.Uri.file(`${targetPath}/package.json`);
                await vscode.workspace.fs.stat(packageJsonUri);
                
                // Read and analyze package.json
                let startCommand = 'npm start';
                let mainFile = 'index.js';
                
                try {
                    const packageJsonData = await vscode.workspace.fs.readFile(packageJsonUri);
                    const packageJson = JSON.parse(new TextDecoder().decode(packageJsonData));
                    
                    // Check available scripts
                    const scripts = packageJson.scripts || {};
                    
                    // Determine the best start command
                    if (scripts.start) {
                        startCommand = 'npm start';
                    } else if (scripts.dev) {
                        startCommand = 'npm run dev';
                    } else if (scripts.serve) {
                        startCommand = 'npm run serve';
                    } else if (packageJson.main) {
                        mainFile = packageJson.main;
                        startCommand = `node ${mainFile}`;
                    } else {
                        // Look for common entry files
                        const commonFiles = ['index.js', 'app.js', 'server.js', 'main.js'];
                        for (const file of commonFiles) {
                            try {
                                await vscode.workspace.fs.stat(vscode.Uri.file(`${targetPath}/${file}`));
                                mainFile = file;
                                startCommand = `node ${file}`;
                                break;
                            } catch {
                                // File doesn't exist, continue
                            }
                        }
                    }
                } catch (error) {
                    console.log('Could not parse package.json, using defaults:', error);
                }

                dockerfileContent = `# Generated by DevGear - Node.js Project
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ${JSON.stringify(startCommand.split(' '))}`;
            } catch {
                // Check for Python project
                try {
                    await vscode.workspace.fs.stat(vscode.Uri.file(`${targetPath}/requirements.txt`));
                    dockerfileContent = `# Generated by DevGear - Python Project
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "app.py"]`;
                } catch {
                    // Default generic Dockerfile
                    dockerfileContent = `# Generated by DevGear - Generic Project
FROM alpine:latest

WORKDIR /app

# Copy all files
COPY . .

# Install basic tools
RUN apk add --no-cache bash

# Expose port
EXPOSE 8080

# Default command
CMD ["echo", "Please customize this Dockerfile for your project"]`;
                }
            }

            // Write the file directly using VS Code's file system API
            const encoder = new TextEncoder();
            const data = encoder.encode(dockerfileContent);
            await vscode.workspace.fs.writeFile(dockerfilePath, data);
            
            // Then open the created file
            const doc = await vscode.workspace.openTextDocument(dockerfilePath);
            await vscode.window.showTextDocument(doc);
            
            // Show helpful message based on what was detected
            if (dockerfileContent.includes('Node.js Project')) {
                vscode.window.showInformationMessage(
                    'Dockerfile generated successfully! Review the start command and customize as needed.',
                    'Add Start Script'
                ).then(choice => {
                    if (choice === 'Add Start Script') {
                        this.addStartScriptToPackageJson(targetPath);
                    }
                });
            } else {
                vscode.window.showInformationMessage('Dockerfile generated successfully! Please review and customize as needed.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to dockerize project: ${error}`);
            console.error('DevGear dockerizeProject error:', error);
        }
    }

    // Helper method to add a start script to package.json
    private async addStartScriptToPackageJson(targetPath: string): Promise<void> {
        try {
            const packageJsonUri = vscode.Uri.file(`${targetPath}/package.json`);
            const packageJsonData = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageJson = JSON.parse(new TextDecoder().decode(packageJsonData));
            
            // Add scripts section if it doesn't exist
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }
            
            // Ask user what kind of start script to add
            const scriptOptions = [
                'node index.js',
                'node app.js', 
                'node server.js',
                'nodemon index.js',
                'Custom command'
            ];
            
            const choice = await vscode.window.showQuickPick(scriptOptions, {
                placeHolder: 'Select a start command for your project'
            });
            
            if (choice) {
                let startCommand = choice;
                if (choice === 'Custom command') {
                    const customCommand = await vscode.window.showInputBox({
                        prompt: 'Enter custom start command',
                        placeHolder: 'e.g., node src/index.js'
                    });
                    if (!customCommand) return;
                    startCommand = customCommand;
                }
                
                packageJson.scripts.start = startCommand;
                
                // Write back to package.json
                const updatedContent = JSON.stringify(packageJson, null, 2);
                const encoder = new TextEncoder();
                await vscode.workspace.fs.writeFile(packageJsonUri, encoder.encode(updatedContent));
                
                vscode.window.showInformationMessage(`Added "start": "${startCommand}" to package.json`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update package.json: ${error}`);
        }
    }

    async buildDockerImage(): Promise<void> {
        try {
            const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspacePath) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const terminal = vscode.window.createTerminal('DevGear Docker Build');
            terminal.sendText(`cd "${workspacePath}" && docker build -t devgear-app .`);
            terminal.show();
            
            vscode.window.showInformationMessage('Docker build started');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to build Docker image: ${error}`);
        }
    }

    async runDockerContainer(): Promise<void> {
        try {
            const terminal = vscode.window.createTerminal('DevGear Docker Run');
            terminal.sendText('docker run -p 3000:3000 devgear-app');
            terminal.show();
            
            vscode.window.showInformationMessage('Docker container started');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to run Docker container: ${error}`);
        }
    }

    async deployDockerCompose(): Promise<void> {
        try {
            const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspacePath) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            await this.deployWithDockerCompose(`${workspacePath}/docker-compose.yml`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to deploy with Docker Compose: ${error}`);
        }
    }

    async setupCICD(): Promise<void> {
        try {
            const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspacePath) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            await this.setupCIPipeline(workspacePath);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to setup CI/CD: ${error}`);
        }
    }
}
