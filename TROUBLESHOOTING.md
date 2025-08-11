# DevGear Extension Development Host - Troubleshooting Guide

## Common Issues and Solutions

### 1. **Cannot Launch Extension Development Host**

#### Step-by-Step Launch Process:

1. **Open DevGear in VS Code**:
   ```bash
   code "c:\Users\Nishant Raj\Documents\Projects\MITADT\devgear"
   ```

2. **Compile the Extension**:
   - Press `Ctrl+Shift+P`
   - Type "Tasks: Run Task"
   - Select "npm: compile"
   - OR run: `npm run compile`

3. **Launch Extension Development Host**:
   - Press `F5` 
   - OR Press `Ctrl+Shift+P` → "Debug: Start Debugging"
   - OR Go to Run and Debug panel (`Ctrl+Shift+D`) → Click "Run Extension"

#### If F5 Doesn't Work:

1. **Check VS Code is in the right folder**:
   - File → Open Folder → Select the `devgear` folder
   - Ensure you see `src/`, `package.json`, etc. in Explorer

2. **Manually select debug configuration**:
   - Go to Run and Debug panel (`Ctrl+Shift+D`)
   - In the dropdown, select "Run Extension"
   - Click the green play button

3. **Check the debug console**:
   - Go to View → Debug Console
   - Look for any error messages

### 2. **Common Error Messages and Fixes**

#### "Cannot find module 'vscode'"
- This is normal outside VS Code environment
- Only happens when testing outside Extension Development Host

#### "Extension activation failed"
- Check the Debug Console for specific errors
- Verify all dependencies are installed: `npm install`
- Recompile: `npm run compile`

#### "Command not found" errors
- Check package.json commands section
- Verify extension.ts has proper command registration

#### "MCP Server errors"
- GitHub MCP requires Docker to be running
- Docker MCP requires Docker daemon to be running
- Check tokens are configured in VS Code settings

### 3. **Verification Steps**

#### Check Extension is Recognized:
1. Open Extension Development Host (F5)
2. In the new VS Code window, press `Ctrl+Shift+P`
3. Type "DevGear" - you should see DevGear commands

#### Verify Commands Work:
1. Try: "DevGear: Open DevGear Panel"
2. Check if DevGear appears in Explorer sidebar
3. Look for DevGear in status bar (bottom right)

#### Check Debug Output:
1. In Extension Development Host, press `Ctrl+Shift+I`
2. Go to Console tab
3. Look for "DevGear extension is being activated"

### 4. **Manual Launch Commands**

If VS Code launch doesn't work, try from terminal:

```bash
cd "c:\Users\Nishant Raj\Documents\Projects\MITADT\devgear"

# Compile first
npm run compile

# Open in VS Code
code .

# Then press F5 in VS Code
```

### 5. **Alternative Debug Methods**

#### Use Terminal Output:
```bash
# Watch mode for development
npm run watch

# This will recompile automatically on changes
```

#### Check Extension Manifest:
- Ensure package.json has correct "main": "./out/extension.js"
- Verify engines.vscode version is compatible
- Check activationEvents are properly defined

### 6. **Reset and Clean Start**

If nothing works:

```bash
# Clean everything
rm -rf node_modules
rm -rf out
rm package-lock.json

# Reinstall
npm install

# Recompile
npm run compile

# Try F5 again
```

### 7. **VS Code Extension Development Requirements**

Ensure you have:
- VS Code 1.74.0 or higher
- Node.js 16.x or higher  
- TypeScript properly installed
- Extension folder opened as workspace root

### 8. **Quick Test Script**

Run this to verify setup:

```bash
cd "c:\Users\Nishant Raj\Documents\Projects\MITADT\devgear"
npm run compile && echo "✅ Compilation OK" || echo "❌ Compilation Failed"
```

### 9. **Expected Behavior**

When F5 works correctly:
1. A new VS Code window opens (Extension Development Host)
2. Your extension is loaded in this new window
3. You can use DevGear commands in Command Palette
4. DevGear appears in Explorer sidebar
5. Status bar shows "DevGear" button

### 10. **Getting Help**

If still having issues:
1. Check VS Code Developer Tools (Help → Toggle Developer Tools)
2. Look at Output panel → Extension Host
3. Check specific error messages in Debug Console

## Success Indicators ✅

- ✅ `npm run compile` succeeds without errors
- ✅ `out/extension.js` file exists and is recent
- ✅ F5 opens a new VS Code window
- ✅ DevGear commands appear in Command Palette
- ✅ No errors in Debug Console
- ✅ DevGear appears in Explorer sidebar
