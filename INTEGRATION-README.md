# Kubernetes Integration Guide for DevGear MCP Server

This guide explains how to integrate Kubernetes MCP server functionality into your existing DevGear extension without modifying any original source files.

## 🚀 Quick Integration (3 Steps)

### Step 1: Add Integration Files

Copy the following files to your `devgear-mcp/src/` directory:

- `providers/kubernetes-provider.ts` - Core Kubernetes functionality
- `extension-integrate.ts` - Integration module

### Step 2: Update Extension Entry Point

Add the following line to your `extension.ts` file (after the existing imports):

```typescript
import { initializeKubernetesIntegration } from "./extension-integrate";
```

Then add this line inside the `activate` function (after orchestrator is created):

```typescript
// Initialize Kubernetes integration
initializeKubernetesIntegration(context, orchestrator);
```

### Step 3: Update package.json

Add the new Kubernetes commands to your `package.json` under `contributes.commands`:

```json
{
  "command": "devgear.kubernetesListPods",
  "title": "Kubernetes: List Pods"
},
{
  "command": "devgear.kubernetesCreatePod",
  "title": "Kubernetes: Create Pod"
},
{
  "command": "devgear.kubernetesListDeployments",
  "title": "Kubernetes: List Deployments"
},
{
  "command": "devgear.kubernetesCreateDeployment",
  "title": "Kubernetes: Create Deployment"
},
{
  "command": "devgear.kubernetesScaleDeployment",
  "title": "Kubernetes: Scale Deployment"
},
{
  "command": "devgear.kubernetesListServices",
  "title": "Kubernetes: List Services"
},
{
  "command": "devgear.kubernetesListNamespaces",
  "title": "Kubernetes: List Namespaces"
},
{
  "command": "devgear.kubernetesCreateNamespace",
  "title": "Kubernetes: Create Namespace"
}
```

Add activation events:

```json
"onCommand:devgear.kubernetesListPods",
"onCommand:devgear.kubernetesCreatePod",
"onCommand:devgear.kubernetesListDeployments",
"onCommand:devgear.kubernetesCreateDeployment",
"onCommand:devgear.kubernetesScaleDeployment",
"onCommand:devgear.kubernetesListServices",
"onCommand:devgear.kubernetesListNamespaces",
"onCommand:devgear.kubernetesCreateNamespace"
```

## 🔧 Available Kubernetes Tools

After integration, your DevGear extension will have these new MCP tools:

### Pod Management

- `kubernetes_list_pods` - List all pods in namespace
- `kubernetes_create_pod` - Create new pod
- `kubernetes_delete_pod` - Delete pod
- `kubernetes_get_pod_logs` - Get pod logs

### Deployment Management

- `kubernetes_list_deployments` - List all deployments
- `kubernetes_create_deployment` - Create new deployment
- `kubernetes_scale_deployment` - Scale deployment replicas

### Service Management

- `kubernetes_list_services` - List all services
- `kubernetes_create_service` - Create new service

### Namespace Management

- `kubernetes_list_namespaces` - List all namespaces
- `kubernetes_create_namespace` - Create new namespace

## 🎯 Usage

### Via Command Palette

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Kubernetes" to see available commands
3. Select desired operation

### Via MCP Server

The tools are automatically registered with your MCP orchestrator and can be called via:

```typescript
await orchestrator.executeTool("kubernetes_list_pods", {
  namespace: "default",
});
```

### Via Natural Language (if supported)

The tools integrate with your existing natural language processing capabilities.

## 📝 Example Integration Code

### Minimal Extension.ts Update

```typescript
import * as vscode from "vscode";
import { DevGearProvider } from "./providers/devgear-provider";
import { MCPOrchestrator } from "./core/mcp-orchestrator";
import { DevGearWebviewProvider } from "./webview/webview-provider";
import { DevGearTreeProvider } from "./providers/tree-provider";
import { initializeKubernetesIntegration } from "./extension-integrate"; // Add this line

export function activate(context: vscode.ExtensionContext) {
  console.log("DevGear extension is being activated");

  const orchestrator = new MCPOrchestrator(context);
  const provider = new DevGearProvider(orchestrator);
  const treeProvider = new DevGearTreeProvider(provider);
  const webviewProvider = new DevGearWebviewProvider(context.extensionUri);

  // Initialize Kubernetes integration - Add this line
  initializeKubernetesIntegration(context, orchestrator);

  // ... rest of your existing code ...
}
```

## 🔄 Switching to Real Kubernetes

The integration uses mock data by default. To use real Kubernetes:

1. Install kubectl CLI
2. Configure kubectl to connect to your cluster
3. Replace mock implementations in `kubernetes-provider.ts` with actual kubectl calls

## 🧪 Testing

1. **Build the extension**: `npm run compile`
2. **Test in VS Code**: Press F5 to launch Extension Development Host
3. **Verify integration**: Check that Kubernetes commands appear in Command Palette
4. **Test tools**: Run a few Kubernetes commands to ensure they work

## 🐛 Troubleshooting

### Extension Not Loading

- Check that all files are in correct locations
- Verify TypeScript compilation succeeds
- Check VS Code Developer Console for errors

### Commands Not Appearing

- Ensure package.json includes all new commands
- Check activation events are properly configured
- Reload VS Code window

### Tools Not Working

- Verify MCP orchestrator is properly initialized
- Check console logs for error messages
- Ensure Kubernetes provider is registered correctly

## 📁 File Structure After Integration

```
devgear-mcp/
├── src/
│   ├── extension.ts (modified)
│   ├── extension-integrate.ts (new)
│   ├── providers/
│   │   ├── kubernetes-provider.ts (new)
│   │   └── ... existing files
│   └── ... existing files
├── package.json (modified)
└── ... existing files
```

## 🚀 Next Steps

1. Test the integration with mock data
2. Replace mock implementations with real kubectl calls
3. Add more Kubernetes resource types as needed
4. Enhance UI/UX for Kubernetes operations
5. Add error handling and validation

## 🔗 Related Files

- `src/providers/kubernetes-provider.ts` - Core Kubernetes functionality
- `src/extension-integrate.ts` - Integration module
- `src/extension.ts` - Modified extension entry point
- `package.json` - Updated manifest with new commands
