import * as vscode from 'vscode';
import { DevGearProvider } from '../providers/devgear-provider';

export class DevGearTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue?: string,
        public readonly iconPath?: string | vscode.Uri | vscode.ThemeIcon,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.contextValue = contextValue;
        this.iconPath = iconPath;
        this.command = command;
    }
}

export class DevGearTreeProvider implements vscode.TreeDataProvider<DevGearTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DevGearTreeItem | undefined | null | void> = new vscode.EventEmitter<DevGearTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DevGearTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private devGearProvider: DevGearProvider;

    constructor(devGearProvider: DevGearProvider) {
        this.devGearProvider = devGearProvider;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DevGearTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: DevGearTreeItem): Promise<DevGearTreeItem[]> {
        if (!element) {
            return [
                new DevGearTreeItem(
                    'GitHub',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'github-section',
                    new vscode.ThemeIcon('github')
                ),
                new DevGearTreeItem(
                    'Docker',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'docker-section',
                    new vscode.ThemeIcon('package')
                ),
                new DevGearTreeItem(
                    'Vercel',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'vercel-section',
                    new vscode.ThemeIcon('cloud')
                ),
                new DevGearTreeItem(
                    'CI/CD',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'cicd-section',
                    new vscode.ThemeIcon('gear')
                )
            ];
        }

        switch (element.contextValue) {
            case 'github-section':
                return this.getGitHubItems();
            case 'docker-section':
                return this.getDockerItems();
            case 'vercel-section':
                return this.getVercelItems();
            case 'cicd-section':
                return this.getCICDItems();
            default:
                return [];
        }
    }

    private async getGitHubItems(): Promise<DevGearTreeItem[]> {
        try {
            const repos = await this.devGearProvider.listGitHubRepositories();
            const items: DevGearTreeItem[] = [
                new DevGearTreeItem(
                    'Clone Repository',
                    vscode.TreeItemCollapsibleState.None,
                    'github-clone',
                    new vscode.ThemeIcon('repo-clone'),
                    {
                        command: 'devgear.cloneRepository',
                        title: 'Clone Repository'
                    }
                ),
                new DevGearTreeItem(
                    'Create Issue',
                    vscode.TreeItemCollapsibleState.None,
                    'github-issue',
                    new vscode.ThemeIcon('issues'),
                    {
                        command: 'devgear.createIssue',
                        title: 'Create Issue'
                    }
                ),
                new DevGearTreeItem(
                    'My Repositories',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'github-repos',
                    new vscode.ThemeIcon('repo')
                )
            ];

            repos.slice(0, 5).forEach(repo => {
                items.push(new DevGearTreeItem(
                    repo.name,
                    vscode.TreeItemCollapsibleState.None,
                    'github-repo-item',
                    new vscode.ThemeIcon('repo'),
                    {
                        command: 'devgear.openRepository',
                        title: 'Open Repository',
                        arguments: [repo.html_url]
                    }
                ));
            });

            return items;
        } catch (error) {
            return [
                new DevGearTreeItem(
                    'Error loading repositories',
                    vscode.TreeItemCollapsibleState.None,
                    'error',
                    new vscode.ThemeIcon('error')
                )
            ];
        }
    }

    private async getDockerItems(): Promise<DevGearTreeItem[]> {
        try {
            const containers = await this.devGearProvider.listDockerContainers();
            const items: DevGearTreeItem[] = [
                new DevGearTreeItem(
                    'Create Container',
                    vscode.TreeItemCollapsibleState.None,
                    'docker-create',
                    new vscode.ThemeIcon('add'),
                    {
                        command: 'devgear.createContainer',
                        title: 'Create Container'
                    }
                ),
                new DevGearTreeItem(
                    'Deploy Compose',
                    vscode.TreeItemCollapsibleState.None,
                    'docker-compose',
                    new vscode.ThemeIcon('file-code'),
                    {
                        command: 'devgear.deployCompose',
                        title: 'Deploy Compose'
                    }
                ),
                new DevGearTreeItem(
                    'Running Containers',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'docker-containers',
                    new vscode.ThemeIcon('package')
                )
            ];

            containers.forEach(container => {
                const status = container.status || 'unknown';
                const icon = status.includes('running') ? 'play' : 'stop';
                
                items.push(new DevGearTreeItem(
                    `${container.name} (${status})`,
                    vscode.TreeItemCollapsibleState.None,
                    'docker-container-item',
                    new vscode.ThemeIcon(icon),
                    {
                        command: 'devgear.showContainerLogs',
                        title: 'Show Logs',
                        arguments: [container.id]
                    }
                ));
            });

            return items;
        } catch (error) {
            return [
                new DevGearTreeItem(
                    'Error loading containers',
                    vscode.TreeItemCollapsibleState.None,
                    'error',
                    new vscode.ThemeIcon('error')
                )
            ];
        }
    }

    private getVercelItems(): DevGearTreeItem[] {
        return [
            new DevGearTreeItem(
                'Deploy Project',
                vscode.TreeItemCollapsibleState.None,
                'vercel-deploy',
                new vscode.ThemeIcon('cloud-upload'),
                {
                    command: 'devgear.deployVercel',
                    title: 'Deploy to Vercel'
                }
            ),
            new DevGearTreeItem(
                'View Deployments',
                vscode.TreeItemCollapsibleState.None,
                'vercel-deployments',
                new vscode.ThemeIcon('history'),
                {
                    command: 'devgear.showWebview',
                    title: 'View Deployments'
                }
            )
        ];
    }

    private getCICDItems(): DevGearTreeItem[] {
        return [
            new DevGearTreeItem(
                'Setup Pipeline',
                vscode.TreeItemCollapsibleState.None,
                'cicd-setup',
                new vscode.ThemeIcon('gear'),
                {
                    command: 'devgear.setupPipeline',
                    title: 'Setup CI/CD Pipeline'
                }
            ),
            new DevGearTreeItem(
                'View Workflows',
                vscode.TreeItemCollapsibleState.None,
                'cicd-workflows',
                new vscode.ThemeIcon('list-unordered'),
                {
                    command: 'devgear.showWebview',
                    title: 'View Workflows'
                }
            )
        ];
    }
}
