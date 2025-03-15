const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

function activate(context) {
  let webview = null;
  let markdowns = vscode.workspace.getConfiguration('markdown-in-sider').get('markdowns');
  if (!Array.isArray(markdowns)) {
    markdowns = [{ name: 'start', content: '' }];
  } else {
    markdowns = markdowns.filter((markdown) => markdown.name && markdown.content);
    if (markdowns.length === 0) {
      markdowns = [{ name: 'start', content: '' }];
    }
  }

  // 注册页面
  vscode.window.registerWebviewViewProvider('markdown-in-sider:sider', {
    resolveWebviewView(webviewView) {
      webview = webviewView.webview;
      webview.options = { enableScripts: true, retainContextWhenHidden: true };
      webview.html = fs.readFileSync(path.join(context.extensionPath, 'view/index.html')).toString();
      webview.postMessage({ command: 'markdowns', data: markdowns });
      webview.onDidReceiveMessage((message) => {
        if (message.command === 'save') {
          vscode.workspace.getConfiguration('markdown-in-sider').update('markdowns', message.data, true);
        } else if (message.command === 'changeTitle') {
          webviewView.title = message.data;
        }
      });
    },
  });

  // 注册按钮指令
  context.subscriptions.push(
    vscode.commands.registerCommand('markdown-in-sider:select', () => {
      webview.postMessage({ command: 'select' });
    }),
    vscode.commands.registerCommand('markdown-in-sider:preview', () => {
      webview.postMessage({ command: 'preview' });
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
