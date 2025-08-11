import * as vscode from 'vscode';
import * as path from 'path';

export class DevGearWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'devgear.webview';

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'cloneRepo':
                    vscode.commands.executeCommand('devgear.cloneRepository');
                    break;
                case 'createContainer':
                    vscode.commands.executeCommand('devgear.createContainer');
                    break;
                case 'deployVercel':
                    vscode.commands.executeCommand('devgear.deployVercel');
                    break;
                case 'setupPipeline':
                    vscode.commands.executeCommand('devgear.setupPipeline');
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'devgear');
                    break;
            }
        });
    }

    public updateStatus(status: any) {
        if (this._view) {
            this._view.webview.postMessage({ type: 'updateStatus', status });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>DevGear Control Panel</title>
			</head>
			<body>
				<div class="container">
					<h1>DevGear Control Panel</h1>
					
					<div class="section">
						<h2>🐙 GitHub Operations</h2>
						<div class="button-group">
							<button class="primary-button" onclick="cloneRepo()">
								📥 Clone Repository
							</button>
							<button class="secondary-button" onclick="createIssue()">
								🐛 Create Issue
							</button>
						</div>
					</div>

					<div class="section">
						<h2>🐳 Docker Operations</h2>
						<div class="button-group">
							<button class="primary-button" onclick="createContainer()">
								📦 Create Container
							</button>
							<button class="secondary-button" onclick="deployCompose()">
								🚀 Deploy Compose
							</button>
						</div>
					</div>

					<div class="section">
						<h2>☁️ Vercel Deployment</h2>
						<div class="button-group">
							<button class="primary-button" onclick="deployVercel()">
								🌐 Deploy to Vercel
							</button>
						</div>
					</div>

					<div class="section">
						<h2>⚙️ CI/CD Pipeline</h2>
						<div class="button-group">
							<button class="primary-button" onclick="setupPipeline()">
								🔧 Setup Pipeline
							</button>
						</div>
					</div>

					<div class="section">
						<h2>📊 Status</h2>
						<div id="status-container">
							<div class="status-item">
								<span class="status-label">GitHub MCP:</span>
								<span id="github-status" class="status-value">Checking...</span>
							</div>
							<div class="status-item">
								<span class="status-label">Docker MCP:</span>
								<span id="docker-status" class="status-value">Checking...</span>
							</div>
							<div class="status-item">
								<span class="status-label">Vercel:</span>
								<span id="vercel-status" class="status-value">Ready</span>
							</div>
						</div>
					</div>

					<div class="section">
						<button class="settings-button" onclick="openSettings()">
							⚙️ Settings
						</button>
					</div>
				</div>

				<script nonce="${nonce}">
					const vscode = acquireVsCodeApi();

					function cloneRepo() {
						vscode.postMessage({ type: 'cloneRepo' });
					}

					function createContainer() {
						vscode.postMessage({ type: 'createContainer' });
					}

					function deployVercel() {
						vscode.postMessage({ type: 'deployVercel' });
					}

					function setupPipeline() {
						vscode.postMessage({ type: 'setupPipeline' });
					}

					function openSettings() {
						vscode.postMessage({ type: 'openSettings' });
					}

					window.addEventListener('message', event => {
						const message = event.data;
						switch (message.type) {
							case 'updateStatus':
								updateServerStatus(message.status);
								break;
						}
					});

					function updateServerStatus(status) {
						if (status.has && status.has('github')) {
							document.getElementById('github-status').textContent = 
								status.get('github') ? '✅ Connected' : '❌ Disconnected';
						}
						if (status.has && status.has('docker')) {
							document.getElementById('docker-status').textContent = 
								status.get('docker') ? '✅ Connected' : '❌ Disconnected';
						}
					}

					setTimeout(() => {
						vscode.postMessage({ type: 'getStatus' });
					}, 1000);
				</script>
			</body>
			</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
