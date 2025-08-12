import * as vscode from "vscode";
import { DevGearProvider } from "./providers/devgear-provider";
import { MCPOrchestrator } from "./core/mcp-orchestrator";
import { DevGearWebviewProvider } from "./webview/webview-provider";
import { DevGearTreeProvider } from "./providers/tree-provider";
import { initializeKubernetesIntegration } from "./extension-integrate";

export function activate(context: vscode.ExtensionContext) {
  console.log("DevGear extension is being activated");

  const orchestrator = new MCPOrchestrator(context);
  const provider = new DevGearProvider(orchestrator);
  const treeProvider = new DevGearTreeProvider(provider);
  const webviewProvider = new DevGearWebviewProvider(context.extensionUri);

  const treeView = vscode.window.createTreeView("devgear", {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "devgear.webview",
      webviewProvider
    )
  );

  const commands = [
    vscode.commands.registerCommand("devgear.openDevGearPanel", async () => {
      vscode.commands.executeCommand("devgear.webview.focus");
    }),

    vscode.commands.registerCommand("devgear.githubClone", async () => {
      await provider.cloneRepository();
    }),

    vscode.commands.registerCommand("devgear.githubCreateRepo", async () => {
      await provider.createGitHubRepository();
    }),

    vscode.commands.registerCommand("devgear.githubCreateIssue", async () => {
      await provider.createGitHubIssue();
    }),

    vscode.commands.registerCommand("devgear.githubCreatePR", async () => {
      await provider.createGitHubPullRequest();
    }),

    vscode.commands.registerCommand("devgear.githubViewActions", async () => {
      await provider.viewGitHubActions();
    }),

    vscode.commands.registerCommand("devgear.githubViewSecurity", async () => {
      await provider.viewSecurityAlerts();
    }),

    vscode.commands.registerCommand("devgear.githubCreateGist", async () => {
      await provider.createGist();
    }),

    vscode.commands.registerCommand(
      "devgear.dockerize",
      async (uri?: vscode.Uri) => {
        const targetPath =
          uri?.fsPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (targetPath) {
          await provider.dockerizeProject(targetPath);
        }
      }
    ),

    vscode.commands.registerCommand("devgear.dockerBuild", async () => {
      await provider.buildDockerImage();
    }),

    vscode.commands.registerCommand("devgear.dockerRun", async () => {
      await provider.runDockerContainer();
    }),

    vscode.commands.registerCommand("devgear.dockerCompose", async () => {
      await provider.deployDockerCompose();
    }),

    vscode.commands.registerCommand(
      "devgear.deployVercel",
      async (uri?: vscode.Uri) => {
        const targetPath =
          uri?.fsPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (targetPath) {
          await provider.deployToVercel(targetPath);
        }
      }
    ),

    vscode.commands.registerCommand("devgear.setupCICD", async () => {
      await provider.setupCICD();
    }),

    vscode.commands.registerCommand("devgear.refresh", () => {
      treeProvider.refresh();
    }),
  ];

  commands.forEach((cmd) => context.subscriptions.push(cmd));

  // Initialize Kubernetes integration
  initializeKubernetesIntegration(context);

  orchestrator
    .initialize()
    .then(() => {
      vscode.window.showInformationMessage(
        "DevGear: MCP servers initialized successfully!"
      );
    })
    .catch((error) => {
      vscode.window.showErrorMessage(
        `DevGear: Failed to initialize MCP servers: ${error.message}`
      );
    });

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(gear) DevGear";
  statusBarItem.command = "devgear.openDevGearPanel";
  statusBarItem.tooltip = "Open DevGear Control Panel";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  console.log("DevGear extension activated successfully");
}

export function deactivate() {
  console.log("DevGear extension is being deactivated");
}
