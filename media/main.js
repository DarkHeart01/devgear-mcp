// Main JavaScript for the DevGear webview
(function() {
    'use strict';

    // Global variables
    let isLoading = false;

    // Utility functions
    function setLoading(loading) {
        isLoading = loading;
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        });
    }

    function showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--vscode-notifications-background);
            color: var(--vscode-notifications-foreground);
            padding: 12px 16px;
            border-radius: 4px;
            border: 1px solid var(--vscode-notifications-border);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Enhanced button handlers
    function cloneRepo() {
        if (isLoading) return;
        setLoading(true);
        showNotification('Starting repository clone...', 'info');
        
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }

    function createContainer() {
        if (isLoading) return;
        setLoading(true);
        showNotification('Creating Docker container...', 'info');
        
        setTimeout(() => {
            setLoading(false);
        }, 3000);
    }

    function deployVercel() {
        if (isLoading) return;
        setLoading(true);
        showNotification('Deploying to Vercel...', 'info');
        
        setTimeout(() => {
            setLoading(false);
        }, 5000);
    }

    function setupPipeline() {
        if (isLoading) return;
        setLoading(true);
        showNotification('Setting up CI/CD pipeline...', 'info');
        
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }

    // Status management
    function updateServerStatus(status) {
        try {
            const githubStatus = document.getElementById('github-status');
            const dockerStatus = document.getElementById('docker-status');
            
            if (githubStatus && status.github !== undefined) {
                githubStatus.textContent = status.github ? '✅ Connected' : '❌ Disconnected';
                githubStatus.style.color = status.github ? 'var(--vscode-gitDecoration-addedResourceForeground)' : 'var(--vscode-gitDecoration-deletedResourceForeground)';
            }
            
            if (dockerStatus && status.docker !== undefined) {
                dockerStatus.textContent = status.docker ? '✅ Connected' : '❌ Disconnected';
                dockerStatus.style.color = status.docker ? 'var(--vscode-gitDecoration-addedResourceForeground)' : 'var(--vscode-gitDecoration-deletedResourceForeground)';
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        // Initial status check
        setTimeout(() => {
            // Simulate initial status
            updateServerStatus({
                github: false,
                docker: false
            });
        }, 500);
    });

    // Make functions available globally
    window.cloneRepo = cloneRepo;
    window.createContainer = createContainer;
    window.deployVercel = deployVercel;
    window.setupPipeline = setupPipeline;
    window.updateServerStatus = updateServerStatus;
})();
