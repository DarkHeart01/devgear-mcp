import * as vscode from "vscode";
import { KubernetesProvider } from "./providers/kubernetes-provider";

/**
 * Integration module for adding Kubernetes functionality to DevGear
 * This file extends the existing DevGear extension with Kubernetes MCP tools
 * without modifying any original source files
 */

let kubernetesProvider: KubernetesProvider | undefined;

/**
 * Initialize Kubernetes integration
 * Call this function from the main extension.ts to add Kubernetes capabilities
 */
export function initializeKubernetesIntegration(
  context: vscode.ExtensionContext
): void {
  try {
    // Create Kubernetes provider instance
    kubernetesProvider = new KubernetesProvider(context);

    // Register additional commands for Kubernetes operations
    registerKubernetesCommands(context);

    console.log("Kubernetes integration initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Kubernetes integration:", error);
  }
}

/**
 * Register additional Kubernetes-specific commands
 */
function registerKubernetesCommands(context: vscode.ExtensionContext): void {
  // Register Kubernetes-specific commands that can be called directly
  const commands = [
    vscode.commands.registerCommand("devgear.kubernetesListPods", async () => {
      const namespace = await vscode.window.showInputBox({
        prompt: "Enter namespace (optional)",
        placeHolder: "default",
        value: "default",
      });

      const result = await kubernetesProvider?.listPods(namespace || "default");
      displayKubernetesResult(result);
    }),

    vscode.commands.registerCommand("devgear.kubernetesCreatePod", async () => {
      const podName = await vscode.window.showInputBox({
        prompt: "Enter pod name",
        placeHolder: "my-pod",
      });

      const image = await vscode.window.showInputBox({
        prompt: "Enter container image",
        placeHolder: "nginx:latest",
      });

      const namespace = await vscode.window.showInputBox({
        prompt: "Enter namespace (optional)",
        placeHolder: "default",
        value: "default",
      });

      if (podName && image) {
        const result = await kubernetesProvider?.createPod(
          podName,
          image,
          namespace || "default"
        );
        displayKubernetesResult(result);
      }
    }),

    vscode.commands.registerCommand(
      "devgear.kubernetesListDeployments",
      async () => {
        const namespace = await vscode.window.showInputBox({
          prompt: "Enter namespace (optional)",
          placeHolder: "default",
          value: "default",
        });

        const result = await kubernetesProvider?.listDeployments(
          namespace || "default"
        );
        displayKubernetesResult(result);
      }
    ),

    vscode.commands.registerCommand(
      "devgear.kubernetesCreateDeployment",
      async () => {
        const deploymentName = await vscode.window.showInputBox({
          prompt: "Enter deployment name",
          placeHolder: "my-deployment",
        });

        const image = await vscode.window.showInputBox({
          prompt: "Enter container image",
          placeHolder: "nginx:latest",
        });

        const replicasStr = await vscode.window.showInputBox({
          prompt: "Enter number of replicas",
          placeHolder: "1",
          value: "1",
        });

        const namespace = await vscode.window.showInputBox({
          prompt: "Enter namespace (optional)",
          placeHolder: "default",
          value: "default",
        });

        if (deploymentName && image && replicasStr) {
          const replicas = parseInt(replicasStr, 10);
          const result = await kubernetesProvider?.createDeployment(
            deploymentName,
            image,
            replicas,
            namespace || "default"
          );
          displayKubernetesResult(result);
        }
      }
    ),

    vscode.commands.registerCommand(
      "devgear.kubernetesScaleDeployment",
      async () => {
        const deploymentName = await vscode.window.showInputBox({
          prompt: "Enter deployment name",
          placeHolder: "my-deployment",
        });

        const replicasStr = await vscode.window.showInputBox({
          prompt: "Enter number of replicas",
          placeHolder: "3",
        });

        const namespace = await vscode.window.showInputBox({
          prompt: "Enter namespace (optional)",
          placeHolder: "default",
          value: "default",
        });

        if (deploymentName && replicasStr) {
          const replicas = parseInt(replicasStr, 10);
          const result = await kubernetesProvider?.scaleDeployment(
            deploymentName,
            replicas,
            namespace || "default"
          );
          displayKubernetesResult(result);
        }
      }
    ),

    vscode.commands.registerCommand(
      "devgear.kubernetesListServices",
      async () => {
        const namespace = await vscode.window.showInputBox({
          prompt: "Enter namespace (optional)",
          placeHolder: "default",
          value: "default",
        });

        const result = await kubernetesProvider?.listServices(
          namespace || "default"
        );
        displayKubernetesResult(result);
      }
    ),

    vscode.commands.registerCommand(
      "devgear.kubernetesListNamespaces",
      async () => {
        const result = await kubernetesProvider?.listNamespaces();
        displayKubernetesResult(result);
      }
    ),

    vscode.commands.registerCommand(
      "devgear.kubernetesCreateNamespace",
      async () => {
        const namespaceName = await vscode.window.showInputBox({
          prompt: "Enter namespace name",
          placeHolder: "my-namespace",
        });

        if (namespaceName) {
          const result = await kubernetesProvider?.createNamespace(
            namespaceName
          );
          displayKubernetesResult(result);
        }
      }
    ),
  ];

  // Add commands to context subscriptions
  context.subscriptions.push(...commands);
}

/**
 * Display Kubernetes command results
 */
function displayKubernetesResult(result: any): void {
  if (!result) {
    vscode.window.showErrorMessage("Kubernetes provider not initialized");
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "kubernetesResult",
    "Kubernetes Result",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
    }
  );

  panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Kubernetes Result</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        padding: 20px;
                    }
                    pre {
                        background-color: var(--vscode-editor-selectionBackground);
                        padding: 10px;
                        border-radius: 4px;
                        overflow-x: auto;
                    }
                </style>
            </head>
            <body>
                <h1>Kubernetes Operation Result</h1>
                <pre>${JSON.stringify(result, null, 2)}</pre>
            </body>
            </html>
        `;
}

/**
 * Get the active Kubernetes provider instance
 */
export function getKubernetesProvider(): KubernetesProvider | undefined {
  return kubernetesProvider;
}

/**
 * Check if Kubernetes integration is active
 */
export function isKubernetesIntegrationActive(): boolean {
  return kubernetesProvider !== undefined;
}
