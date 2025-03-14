const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

function activate(context) {
  vscode.window.registerWebviewViewProvider('markdown-in-sider:sider', {
    resolveWebviewView(webviewView) {
      webviewView.webview.options = { enableScripts: true };
      webviewView.webview.html = fs.readFileSync(path.join(context.extensionPath, 'view/index.html')).toString();
      webviewView.webview.onDidReceiveMessage(({ commend, data }) => {
        if (commend === 'openRequstView') {
          openRequstView(context);
        } else if (commend === 'openFlowView') {
          openFlowView(context);
        }
      });
    },
  });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
