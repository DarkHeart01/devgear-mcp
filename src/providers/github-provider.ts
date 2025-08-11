import * as vscode from 'vscode';
import { MCPOrchestrator } from '../core/mcp-orchestrator';

export interface GitHubRepository {
    owner: string;
    repo: string;
    url?: string;
}

export interface GitHubIssue {
    number: number;
    title: string;
    body?: string;
    state?: string;
    labels?: string[];
    assignees?: string[];
}

export interface GitHubPullRequest {
    number: number;
    title: string;
    body?: string;
    head: string;
    base: string;
    state?: string;
}

export interface GitHubWorkflow {
    id: number;
    name: string;
    state?: string;
    path?: string;
}

export class GitHubProvider {
    private orchestrator: MCPOrchestrator;

    constructor(orchestrator: MCPOrchestrator) {
        this.orchestrator = orchestrator;
    }

    private mapToolName(toolName: string): string {
        const toolMapping: { [key: string]: string } = {
            'mcp_github_search_repositories': 'search_repositories',
            'mcp_github_create_repository': 'create_repository',
            'mcp_github_fork_repository': 'fork_repository',
            'mcp_github_get_file_contents': 'get_file_contents',
            'mcp_github_create_or_update_file': 'create_or_update_file',
            'mcp_github_delete_file': 'delete_file',
            'mcp_github_list_branches': 'list_branches',
            'mcp_github_create_branch': 'create_branch',
            'mcp_github_list_commits': 'list_commits',
            'mcp_github_get_commit': 'get_commit',
            'mcp_github_search_code': 'search_code',
            
            'mcp_github_list_issues': 'list_issues',
            'mcp_github_get_issue': 'get_issue',
            'mcp_github_create_issue': 'create_issue',
            'mcp_github_update_issue': 'update_issue',
            'mcp_github_add_issue_comment': 'add_issue_comment',
            'mcp_github_get_issue_comments': 'get_issue_comments',
            'mcp_github_search_issues': 'search_issues',
            'mcp_github_assign_copilot_to_issue': 'assign_copilot_to_issue',
            
            'mcp_github_list_pull_requests': 'list_pull_requests',
            'mcp_github_get_pull_request': 'get_pull_request',
            'mcp_github_create_pull_request': 'create_pull_request',
            'mcp_github_update_pull_request': 'update_pull_request',
            'mcp_github_merge_pull_request': 'merge_pull_request',
            'mcp_github_get_pull_request_files': 'get_pull_request_files',
            'mcp_github_get_pull_request_diff': 'get_pull_request_diff',
            'mcp_github_request_copilot_review': 'request_copilot_review',
            'mcp_github_search_pull_requests': 'search_pull_requests',
            
            'mcp_github_list_workflows': 'list_workflows',
            'mcp_github_list_workflow_runs': 'list_workflow_runs',
            'mcp_github_get_workflow_run': 'get_workflow_run',
            'mcp_github_run_workflow': 'run_workflow',
            'mcp_github_rerun_workflow_run': 'rerun_workflow_run',
            'mcp_github_rerun_failed_jobs': 'rerun_failed_jobs',
            'mcp_github_cancel_workflow_run': 'cancel_workflow_run',
            'mcp_github_get_job_logs': 'get_job_logs',
            'mcp_github_download_workflow_run_artifact': 'download_workflow_run_artifact',
            
            'mcp_github_list_code_scanning_alerts': 'list_code_scanning_alerts',
            'mcp_github_get_code_scanning_alert': 'get_code_scanning_alert',
            'mcp_github_list_secret_scanning_alerts': 'list_secret_scanning_alerts',
            'mcp_github_get_secret_scanning_alert': 'get_secret_scanning_alert',
            'mcp_github_list_dependabot_alerts': 'list_dependabot_alerts',
            'mcp_github_get_dependabot_alert': 'get_dependabot_alert',
            
            'mcp_github_list_gists': 'list_gists',
            'mcp_github_create_gist': 'create_gist',
            'mcp_github_update_gist': 'update_gist',
            
            'mcp_github_list_notifications': 'list_notifications',
            'mcp_github_mark_all_notifications_read': 'mark_all_notifications_read',
            
            // Search tools
            'mcp_github_search_users': 'search_users',
            'mcp_github_search_organizations': 'search_orgs',
            
            'mcp_github_get_me': 'get_me',
            
            'mcp_github_list_discussions': 'list_discussions',
            'mcp_github_get_discussion': 'get_discussion'
        };

        const mappedName = toolMapping[toolName] || toolName;
        console.log(`[GitHubProvider] Tool mapping: ${toolName} -> ${mappedName}`);
        return mappedName;
    }

    private async callGitHubTool(toolName: string, params: any): Promise<any> {
        const actualToolName = this.mapToolName(toolName);
        
        console.log(`[GitHubProvider] Mapping tool: ${toolName} -> ${actualToolName}`);
        console.log(`[GitHubProvider] Calling tool with params:`, params);
        
        try {
            const result = await this.orchestrator.callTool('github', actualToolName, params);
            console.log(`[GitHubProvider] Tool call successful:`, result);
            return result;
        } catch (error) {
            console.error(`GitHub MCP tool error (${actualToolName}):`, error);
            throw error;
        }
    }

    async searchRepositories(query: string, sort?: string, order?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_search_repositories', {
            q: query,
            sort,
            order
        });
    }

    async createRepository(name: string, description?: string, isPrivate?: boolean): Promise<any> {
        return await this.callGitHubTool('mcp_github_create_repository', {
            name,
            description,
            private: isPrivate
        });
    }

    async forkRepository(owner: string, repo: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_fork_repository', {
            owner,
            repo
        });
    }

    async getFileContents(owner: string, repo: string, path: string, ref?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_file_contents', {
            owner,
            repo,
            path,
            ref
        });
    }

    async createOrUpdateFile(owner: string, repo: string, path: string, content: string, message: string, branch?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_create_or_update_file', {
            owner,
            repo,
            path,
            content,
            message,
            branch
        });
    }

    async deleteFile(owner: string, repo: string, path: string, message: string, sha: string, branch?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_delete_file', {
            owner,
            repo,
            path,
            message,
            sha,
            branch
        });
    }

    async listBranches(owner: string, repo: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_branches', {
            owner,
            repo
        });
    }

    async createBranch(owner: string, repo: string, branch: string, sha: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_create_branch', {
            owner,
            repo,
            ref: `refs/heads/${branch}`,
            sha
        });
    }

    async listCommits(owner: string, repo: string, sha?: string, path?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_commits', {
            owner,
            repo,
            sha,
            path
        });
    }

    async getCommit(owner: string, repo: string, ref: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_commit', {
            owner,
            repo,
            ref
        });
    }

    async searchCode(query: string, sort?: string, order?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_search_code', {
            q: query,
            sort,
            order
        });
    }

    async listIssues(owner: string, repo: string, state?: string, labels?: string[], assignee?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_issues', {
            owner,
            repo,
            state,
            labels: labels?.join(','),
            assignee
        });
    }

    async getIssue(owner: string, repo: string, issueNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_issue', {
            owner,
            repo,
            issue_number: issueNumber
        });
    }

    async createIssue(owner: string, repo: string, title: string, body?: string, labels?: string[], assignees?: string[]): Promise<any> {
        return await this.callGitHubTool('mcp_github_create_issue', {
            owner,
            repo,
            title,
            body,
            labels,
            assignees
        });
    }

    async updateIssue(owner: string, repo: string, issueNumber: number, title?: string, body?: string, state?: string, labels?: string[]): Promise<any> {
        return await this.callGitHubTool('mcp_github_update_issue', {
            owner,
            repo,
            issue_number: issueNumber,
            title,
            body,
            state,
            labels
        });
    }

    async addIssueComment(owner: string, repo: string, issueNumber: number, body: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_add_issue_comment', {
            owner,
            repo,
            issue_number: issueNumber,
            body
        });
    }

    async getIssueComments(owner: string, repo: string, issueNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_issue_comments', {
            owner,
            repo,
            issue_number: issueNumber
        });
    }

    async searchIssues(query: string, sort?: string, order?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_search_issues', {
            q: query,
            sort,
            order
        });
    }

    async assignCopilotToIssue(owner: string, repo: string, issueNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_assign_copilot_to_issue', {
            owner,
            repo,
            issueNumber
        });
    }

    async listPullRequests(owner: string, repo: string, state?: string, head?: string, base?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_pull_requests', {
            owner,
            repo,
            state,
            head,
            base
        });
    }

    async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_pull_request', {
            owner,
            repo,
            pull_number: pullNumber
        });
    }

    async createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_create_pull_request', {
            owner,
            repo,
            title,
            head,
            base,
            body
        });
    }

    async updatePullRequest(owner: string, repo: string, pullNumber: number, title?: string, body?: string, state?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_update_pull_request', {
            owner,
            repo,
            pull_number: pullNumber,
            title,
            body,
            state
        });
    }

    async mergePullRequest(owner: string, repo: string, pullNumber: number, commitTitle?: string, commitMessage?: string, mergeMethod?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_merge_pull_request', {
            owner,
            repo,
            pull_number: pullNumber,
            commit_title: commitTitle,
            commit_message: commitMessage,
            merge_method: mergeMethod
        });
    }

    async getPullRequestFiles(owner: string, repo: string, pullNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_pull_request_files', {
            owner,
            repo,
            pull_number: pullNumber
        });
    }

    async getPullRequestDiff(owner: string, repo: string, pullNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_pull_request_diff', {
            owner,
            repo,
            pull_number: pullNumber
        });
    }

    async requestCopilotReview(owner: string, repo: string, pullNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_request_copilot_review', {
            owner,
            repo,
            pullNumber
        });
    }

    async searchPullRequests(query: string, sort?: string, order?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_search_pull_requests', {
            q: query,
            sort,
            order
        });
    }

    async listWorkflows(owner: string, repo: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_workflows', {
            owner,
            repo
        });
    }

    async listWorkflowRuns(owner: string, repo: string, workflowId?: string, branch?: string, status?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_workflow_runs', {
            owner,
            repo,
            workflow_id: workflowId,
            branch,
            status
        });
    }

    async getWorkflowRun(owner: string, repo: string, runId: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_workflow_run', {
            owner,
            repo,
            run_id: runId
        });
    }

    async runWorkflow(owner: string, repo: string, workflowId: string, ref: string, inputs?: Record<string, any>): Promise<any> {
        return await this.callGitHubTool('mcp_github_run_workflow', {
            owner,
            repo,
            workflow_id: workflowId,
            ref,
            inputs
        });
    }

    async rerunWorkflowRun(owner: string, repo: string, runId: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_rerun_workflow_run', {
            owner,
            repo,
            run_id: runId
        });
    }

    async rerunFailedJobs(owner: string, repo: string, runId: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_rerun_failed_jobs', {
            owner,
            repo,
            run_id: runId
        });
    }

    async cancelWorkflowRun(owner: string, repo: string, runId: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_cancel_workflow_run', {
            owner,
            repo,
            run_id: runId
        });
    }

    async getJobLogs(owner: string, repo: string, jobId?: number, runId?: number, failedOnly?: boolean): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_job_logs', {
            owner,
            repo,
            job_id: jobId,
            run_id: runId,
            failed_only: failedOnly,
            return_content: true
        });
    }

    async downloadWorkflowRunArtifact(owner: string, repo: string, artifactId: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_download_workflow_run_artifact', {
            owner,
            repo,
            artifact_id: artifactId
        });
    }

    async listCodeScanningAlerts(owner: string, repo: string, state?: string, severity?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_code_scanning_alerts', {
            owner,
            repo,
            state,
            severity
        });
    }

    async getCodeScanningAlert(owner: string, repo: string, alertNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_code_scanning_alert', {
            owner,
            repo,
            alert_number: alertNumber
        });
    }

    async listSecretScanningAlerts(owner: string, repo: string, state?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_secret_scanning_alerts', {
            owner,
            repo,
            state
        });
    }

    async getSecretScanningAlert(owner: string, repo: string, alertNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_secret_scanning_alert', {
            owner,
            repo,
            alert_number: alertNumber
        });
    }

    async listDependabotAlerts(owner: string, repo: string, state?: string, severity?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_dependabot_alerts', {
            owner,
            repo,
            state,
            severity
        });
    }

    async getDependabotAlert(owner: string, repo: string, alertNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_dependabot_alert', {
            owner,
            repo,
            alert_number: alertNumber
        });
    }

    async listGists(username?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_gists', {
            username
        });
    }

    async createGist(filename: string, content: string, description?: string, isPublic?: boolean): Promise<any> {
        return await this.callGitHubTool('mcp_github_create_gist', {
            filename,
            content,
            description,
            public: isPublic
        });
    }

    async updateGist(gistId: string, filename: string, content: string, description?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_update_gist', {
            gist_id: gistId,
            filename,
            content,
            description
        });
    }

    async listNotifications(all?: boolean, participating?: boolean): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_notifications', {
            all,
            participating
        });
    }

    async markAllNotificationsRead(): Promise<any> {
        return await this.callGitHubTool('mcp_github_mark_all_notifications_read', {});
    }

    async searchUsers(query: string, sort?: string, order?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_search_users', {
            q: query,
            sort,
            order
        });
    }

    async searchOrganizations(query: string, sort?: string, order?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_search_organizations', {
            q: query,
            sort,
            order
        });
    }

    // ===== CONTEXT =====

    async getMe(): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_me', {});
    }

    // ===== DISCUSSIONS =====

    async listDiscussions(owner: string, repo: string, categoryId?: string): Promise<any> {
        return await this.callGitHubTool('mcp_github_list_discussions', {
            owner,
            repo,
            category_id: categoryId
        });
    }

    async getDiscussion(owner: string, repo: string, discussionNumber: number): Promise<any> {
        return await this.callGitHubTool('mcp_github_get_discussion', {
            owner,
            repo,
            discussion_number: discussionNumber
        });
    }

    // ===== HELPER METHODS =====

    async isGitHubAvailable(): Promise<boolean> {
        return await this.orchestrator.requireGitHubMCP();
    }

    async listAvailableTools(): Promise<any[]> {
        try {
            const tools = await this.orchestrator.listTools('github');
            console.log('[GitHubProvider] Available GitHub MCP tools:', tools.map(t => t.name || t));
            return tools;
        } catch (error) {
            console.error('[GitHubProvider] Failed to list GitHub MCP tools:', error);
            return [];
        }
    }

    parseRepositoryUrl(url: string): GitHubRepository | null {
        const match = url.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);
        if (match) {
            return {
                owner: match[1],
                repo: match[2].replace('.git', ''),
                url
            };
        }
        return null;
    }

    async getCurrentRepository(): Promise<GitHubRepository | null> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return null;
        }

        // Try to get repository info from git remote
        // This would require git integration which we can add later
        return null;
    }
}
