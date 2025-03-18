const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

let webviewView = null;
let currentMarkdownIndex = 0;
let markdowns = vscode.workspace.getConfiguration('markdown-in-sider').get('markdowns');
if (!Array.isArray(markdowns)) {
  markdowns = [{ name: 'start', content: '' }];
} else {
  markdowns = markdowns.filter((markdown) => markdown.name && markdown.content);
  if (markdowns.length === 0) {
    markdowns = [{ name: 'start', content: '' }];
  }
}

function setMarkdown(markdownIndex) {
  currentMarkdownIndex = markdownIndex;
  const markdown = markdowns[currentMarkdownIndex];
  webviewView.title = markdown.name;
  webviewView.webview.postMessage({ command: 'markdown', data: markdown.content });
}

function updateConfig() {
  vscode.workspace.getConfiguration('markdown-in-sider').update('markdowns', markdowns, true);
}

function activate(context) {
  // 注册页面
  vscode.window.registerWebviewViewProvider(
    'markdown-in-sider:sider',
    {
      resolveWebviewView(webviewView0) {
        webviewView = webviewView0;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = fs.readFileSync(path.join(context.extensionPath, 'view/index.html')).toString();
        setMarkdown(0);
        webviewView.webview.onDidReceiveMessage((message) => {
          if (message.command === 'save') {
            markdowns[currentMarkdownIndex].content = message.data;
            updateConfig();
          }
        });
      },
    },
    {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }
  );

  // 注册按钮指令
  context.subscriptions.push(
    // 选择文档或操作
    vscode.commands.registerCommand('markdown-in-sider:select', async () => {
      const docnames = markdowns.map((m) => m.name);
      const options = ['✨ 新建 ', '✂️ 删除 '].concat(docnames); // 添加“新建...”选项
      const selectedOption = await vscode.window.showQuickPick(options, {
        placeHolder: '选择文档或操作!',
      });
      if (!selectedOption) return;
      if (selectedOption === '✨ 新建 ') {
        const newOption = await vscode.window.showInputBox({
          placeHolder: '请输入新文档名',
          prompt: '新文档名',
        });
        if (newOption) {
          markdowns.push({ name: newOption, content: `# ${newOption}` });
          setMarkdown(markdowns.length - 1);
          updateConfig();
        }
      } else if (selectedOption === '✂️ 删除 ') {
        const deleteDoc = await vscode.window.showQuickPick(docnames, {
          placeHolder: '选择需要删除的文档!',
        });
        if (deleteDoc) {
          const deleteIndex = markdowns.findIndex((m) => m.name === deleteDoc);
          if (markdowns.length === 1) {
            markdowns = [{ name: 'start', content: '' }];
          } else {
            markdowns = markdowns.splice(deleteIndex, 1);
          }
          if (deleteIndex === currentMarkdownIndex) {
            setMarkdown(0);
          } else if (deleteIndex < currentMarkdownIndex) {
            currentMarkdownIndex--;
          }
          updateConfig();
        }
      } else if (markdowns[currentMarkdownIndex].name !== selectedOption) {
        const docIndex = markdowns.findIndex((m) => m.name === selectedOption);
        setMarkdown(docIndex);
      }
    }),
    // 预览
    vscode.commands.registerCommand('markdown-in-sider:preview', () => {
      webviewView.webview.postMessage({ command: 'preview' });
    }),
    // 另存为
    vscode.commands.registerCommand('markdown-in-sider:save', async () => {
      const { name, content } = markdowns[currentMarkdownIndex];
      const url = await vscode.window.showSaveDialog(
        (options = {
          saveLabel: '保存', // 对话框按钮文本
          filters: [{ name: 'Markdown Files', extensions: ['.md'] }],
          defaultUri: vscode.Uri.file(`${name}.md`),
        })
      );
      if (!url) return;
      // 弹出输入框让用户输入文件内容
      try {
        await vscode.workspace.fs.writeFile(url, Buffer.from(content, 'utf8'));
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to save file: ${error.message}`);
      }
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
