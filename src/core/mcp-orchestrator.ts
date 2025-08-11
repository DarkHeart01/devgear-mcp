import { spawn, ChildProcess } from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';

export interface MCPServerConfig {
    name: string;
    command: string;
    args: string[];
    cwd?: string;
    env?: Record<string, string>;
}

export class MCPOrchestrator {
    private mcpProcesses: Map<string, ChildProcess> = new Map();
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async initialize(): Promise<void> {
        const config = vscode.workspace.getConfiguration('devgear');
        
        await this.startGitHubMCP(config.get('githubToken') || '');
        await this.startDockerMCP();
        await this.startVercelMCP(config.get('vercelToken') || '');
    }

    private async startGitHubMCP(token: string): Promise<void> {
        if (!token) {
            console.log('DevGear: GitHub token not configured. GitHub features will be disabled.');
            return;
        }

        const serverConfig: MCPServerConfig = {
            name: 'github',
            command: 'docker',
            args: [
                'run', '-i', '--rm',
                '-e', 'GITHUB_PERSONAL_ACCESS_TOKEN',
                'ghcr.io/github/github-mcp-server'
            ],
            env: {
                'GITHUB_PERSONAL_ACCESS_TOKEN': token
            }
        };

        await this.startMCPServer(serverConfig);
    }

    private async startDockerMCP(): Promise<void> {
        const dockerMcpPath = path.join(__dirname, '..', '..', '..', 'docker-mcp');
        
        const serverConfig: MCPServerConfig = {
            name: 'docker',
            command: 'python',
            args: ['-m', 'docker_mcp'],
            cwd: dockerMcpPath,
            env: {
                'PYTHONPATH': path.join(dockerMcpPath, 'src')
            }
        };

        await this.startMCPServer(serverConfig);
    }

    private async startVercelMCP(token: string): Promise<void> {
        if (!token) {
            console.log('DevGear: Vercel token not configured. Deployment features will require manual setup.');
            return;
        }

        if (!token.startsWith('vercel_') && token.length < 20) {
            console.log('DevGear: Invalid Vercel token format detected.');
            return;
        }

        console.log('DevGear: Vercel token configured successfully.');
    }

    async requireVercelToken(): Promise<string | null> {
        const config = vscode.workspace.getConfiguration('devgear');
        const token = config.get<string>('vercelToken');
        
        if (!token) {
            const setup = await vscode.window.showErrorMessage(
                'Vercel token required for deployment features',
                'Configure Token',
                'Get Token'
            );
            
            if (setup === 'Configure Token') {
                const newToken = await vscode.window.showInputBox({
                    prompt: 'Enter your Vercel API Token',
                    placeHolder: 'vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                    password: true,
                    ignoreFocusOut: true
                });
                
                if (newToken) {
                    await config.update('vercelToken', newToken, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage('✅ Vercel token saved');
                    return newToken;
                }
            } else if (setup === 'Get Token') {
                vscode.env.openExternal(vscode.Uri.parse('https://vercel.com/account/tokens'));
            }
            
            return null;
        }
        
        return token;
    }

    async startMCPServer(config: MCPServerConfig): Promise<void> {
        try {
            const childProcess = spawn(config.command, config.args, {
                cwd: config.cwd,
                env: { ...process.env, ...config.env },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            childProcess.on('error', (error: any) => {
                vscode.window.showErrorMessage(`Failed to start ${config.name} MCP server: ${error.message}`);
            });

            childProcess.stderr?.on('data', (data: any) => {
                console.error(`${config.name} MCP stderr:`, data.toString());
            });

            this.mcpProcesses.set(config.name, childProcess);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            throw new Error(`Failed to start ${config.name} MCP server: ${error}`);
        }
    }

    async callTool(serverName: string, toolName: string, args: any): Promise<any> {
        const childProcess = this.mcpProcesses.get(serverName);
        if (!childProcess || childProcess.killed) {
            throw new Error(`MCP server ${serverName} is not running`);
        }

        const request = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: { name: toolName, arguments: args }
        };

        console.log(`[MCPOrchestrator] Calling ${serverName}/${toolName} with request:`, JSON.stringify(request, null, 2));

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Tool call timeout for ${serverName}/${toolName}`));
            }, 30000);

            const handleResponse = (data: any) => {
                try {
                    const response = JSON.parse(data.toString());
                    console.log(`[MCPOrchestrator] Response from ${serverName}/${toolName}:`, JSON.stringify(response, null, 2));
                    clearTimeout(timeout);
                    
                    if (response.error) {
                        reject(new Error(response.error.message));
                    } else {
                        resolve(response.result);
                    }
                } catch (error) {
                    console.error(`[MCPOrchestrator] Failed to parse response from ${serverName}/${toolName}:`, data.toString());
                    clearTimeout(timeout);
                    reject(new Error(`Failed to parse response: ${error}`));
                }
            };

            childProcess.stdout?.once('data', handleResponse);
            childProcess.stdin?.write(JSON.stringify(request) + '\n');
        });
    }

    async listTools(serverName: string): Promise<any[]> {
        const childProcess = this.mcpProcesses.get(serverName);
        if (!childProcess || childProcess.killed) {
            return [];
        }

        const request = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/list',
            params: {}
        };

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                resolve([]);
            }, 5000);

            const handleResponse = (data: any) => {
                try {
                    const response = JSON.parse(data.toString());
                    clearTimeout(timeout);
                    resolve(response.result?.tools || []);
                } catch (error) {
                    clearTimeout(timeout);
                    resolve([]);
                }
            };

            childProcess.stdout?.once('data', handleResponse);
            childProcess.stdin?.write(JSON.stringify(request) + '\n');
        });
    }

    dispose(): void {
        this.mcpProcesses.forEach((childProcess) => {
            if (!childProcess.killed) {
                childProcess.kill();
            }
        });
        this.mcpProcesses.clear();
    }

    getServerStatus(): Map<string, boolean> {
        const status = new Map<string, boolean>();
        this.mcpProcesses.forEach((childProcess, name) => {
            status.set(name, !childProcess.killed);
        });
        return status;
    }

    async requireGitHubMCP(): Promise<boolean> {
        const hasGitHub = this.mcpProcesses.has('github') && !this.mcpProcesses.get('github')?.killed;
        if (!hasGitHub) {
            const config = vscode.workspace.getConfiguration('devgear');
            const token = config.get('githubToken') || '';
            if (!token) {
                vscode.window.showWarningMessage(
                    'GitHub token not configured. Please set your GitHub token in settings to use GitHub features.',
                    'Open Settings'
                ).then(choice => {
                    if (choice === 'Open Settings') {
                        vscode.commands.executeCommand('workbench.action.openSettings', 'devgear.githubToken');
                    }
                });
            } else {
                vscode.window.showErrorMessage('GitHub MCP server is not running. Please restart the extension.');
            }
        }
        return hasGitHub;
    }
}
