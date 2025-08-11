export interface DevGearConfig {
    githubToken?: string;
    vercelToken?: string;
    dockerEndpoint?: string;
}

export interface MCPServerStatus {
    name: string;
    connected: boolean;
    lastSeen?: Date;
}

export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description?: string;
    private: boolean;
    fork: boolean;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    language?: string;
    stargazers_count: number;
    forks_count: number;
}

export interface DockerContainer {
    id: string;
    name: string;
    image: string;
    status: string;
    ports: string[];
    created: string;
}

export interface VercelDeployment {
    id: string;
    url: string;
    name: string;
    state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
    created: string;
    type: 'LAMBDAS';
}

export interface GitHubIssue {
    number: number;
    title: string;
    body: string;
    state: 'open' | 'closed';
    created_at: string;
    updated_at: string;
    html_url: string;
}

export interface CIPipelineConfig {
    name: string;
    triggers: string[];
    jobs: CIJob[];
}

export interface CIJob {
    name: string;
    runs_on: string;
    steps: CIStep[];
}

export interface CIStep {
    name: string;
    uses?: string;
    run?: string;
    with?: Record<string, any>;
}
