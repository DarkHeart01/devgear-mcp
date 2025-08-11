/**
 * GitHub Provider Tool Mapping Validation Script
 * 
 * This script validates that our GitHub MCP tool name mapping is working correctly.
 * It doesn't require a testing framework - just run it to verify the mappings.
 */

import { GitHubProvider } from './github-provider';
import { MCPOrchestrator } from '../core/mcp-orchestrator';

// Mock the MCPOrchestrator for validation
class MockMCPOrchestrator extends MCPOrchestrator {
    private lastToolCall: { server: string; tool: string; params: any } | null = null;

    constructor() {
        super({} as any); // Pass empty context for validation
    }

    async callTool(server: string, tool: string, params: any): Promise<any> {
        this.lastToolCall = { server, tool, params };
        console.log(`✓ Tool called: ${tool} (server: ${server})`);
        return Promise.resolve({ success: true, tool, params });
    }

    getLastToolCall() {
        return this.lastToolCall;
    }

    async requireGitHubMCP(): Promise<boolean> {
        return true;
    }
}

async function validateGitHubProviderMapping() {
    console.log('🔧 Validating GitHub Provider Tool Name Mapping...\n');
    
    const mockOrchestrator = new MockMCPOrchestrator();
    const provider = new GitHubProvider(mockOrchestrator);

    const testCases = [
        {
            name: 'Repository Creation',
            action: () => provider.createRepository('test-repo', 'Test description'),
            expectedTool: 'create_repository'
        },
        {
            name: 'Search Repositories', 
            action: () => provider.searchRepositories('test query'),
            expectedTool: 'search_repositories'
        },
        {
            name: 'Issue Creation',
            action: () => provider.createIssue('owner', 'repo', 'Test Issue', 'Test body'),
            expectedTool: 'create_issue'
        },
        {
            name: 'Pull Request Creation',
            action: () => provider.createPullRequest('owner', 'repo', 'Test PR', 'feature-branch', 'main'),
            expectedTool: 'create_pull_request'
        },
        {
            name: 'List Workflows',
            action: () => provider.listWorkflows('owner', 'repo'),
            expectedTool: 'list_workflows'
        },
        {
            name: 'Code Scanning Alerts',
            action: () => provider.listCodeScanningAlerts('owner', 'repo'),
            expectedTool: 'list_code_scanning_alerts'
        },
        {
            name: 'Search Organizations (corrected mapping)',
            action: () => provider.searchOrganizations('test org'),
            expectedTool: 'search_orgs'
        },
        {
            name: 'Get Current User',
            action: () => provider.getMe(),
            expectedTool: 'get_me'
        }
    ];

    let passedTests = 0;
    let totalTests = testCases.length;

    for (const testCase of testCases) {
        try {
            console.log(`Testing: ${testCase.name}`);
            await testCase.action();
            
            const lastCall = mockOrchestrator.getLastToolCall();
            if (lastCall?.tool === testCase.expectedTool) {
                console.log(`  ✅ PASS - Tool correctly mapped to: ${testCase.expectedTool}`);
                passedTests++;
            } else {
                console.log(`  ❌ FAIL - Expected: ${testCase.expectedTool}, Got: ${lastCall?.tool}`);
            }
        } catch (error) {
            console.log(`  ❌ ERROR - ${error}`);
        }
        console.log('');
    }

    // Test URL parsing functionality
    console.log('Testing URL parsing functionality:');
    const urlTests = [
        {
            url: 'https://github.com/owner/repo',
            expected: { owner: 'owner', repo: 'repo' }
        },
        {
            url: 'git@github.com:owner/repo.git', 
            expected: { owner: 'owner', repo: 'repo' }
        }
    ];

    for (const urlTest of urlTests) {
        const result = provider.parseRepositoryUrl(urlTest.url);
        if (result?.owner === urlTest.expected.owner && result?.repo === urlTest.expected.repo) {
            console.log(`  ✅ URL parsing PASS: ${urlTest.url}`);
            passedTests++;
        } else {
            console.log(`  ❌ URL parsing FAIL: ${urlTest.url}`);
        }
        totalTests++;
    }

    console.log('\n📊 Test Results:');
    console.log(`Passed: ${passedTests}/${totalTests} tests`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All GitHub MCP tool mappings are working correctly!');
        return true;
    } else {
        console.log('⚠️  Some mappings need attention.');
        return false;
    }
}

// Export for potential use in other contexts
export { validateGitHubProviderMapping };

// Run validation if this file is executed directly
if (require.main === module) {
    validateGitHubProviderMapping().catch(console.error);
}
