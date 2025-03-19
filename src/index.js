const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

let webviewView = null;
let currentMarkdownIndex = 0;
let markdowns = vscode.workspace.getConfiguration('markdown-in-sider').get('markdowns');
if (!Array.isArray(markdowns)) {
  markdowns = [{ name: 'start', id: Date.now(), file: '', content: '# start' }];
} else {
  markdowns = markdowns.filter((markdown) => markdown.name && markdown.content);
  if (markdowns.length === 0) {
    markdowns = [{ name: 'start', id: Date.now(), file: '', content: '# start' }];
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
  // type,taskid,caseid,tyid,user,seatid,pid
  // type为0是数据回放，type为1是最小化窗口，type为2是关闭窗口
  // 注册按钮指令
  context.subscriptions.push(
    // 新建文档
    vscode.commands.registerCommand('markdown-in-sider:add', async () => {
      const newOption = await vscode.window.showInputBox({
        placeHolder: '请输入新文档名',
        prompt: '新文档名',
      });
      if (newOption) {
        markdowns.push({ name: newOption, id: Date.now(), content: `# ${newOption}` });
        setMarkdown(markdowns.length - 1);
        updateConfig();
      }
    }),
    // 导入
    vscode.commands.registerCommand('markdown-in-sider:reference', async () => {
      const uris = await vscode.window.showOpenDialog({
        saveLabel: '选择文件', // 对话框按钮文本
        canSelectMany: true,
      });
      if (!uris || uris.length === 0) return;
      // 弹出输入框让用户输入文件内容
      for (const uri of uris) {
        // 文档关联路径
        const markdown = { file: uri.fsPath, id: Date.now(), name: uri.path.split('/').pop().split('.')[0] };
        // 读取文档内容
        try {
          markdown.content = (await fs.readFileSync(uri.fsPath)).toString();
          markdowns.push(markdown);
          setMarkdown(markdowns.length - 1);
          updateConfig();
        } catch (error) {
          vscode.window.showErrorMessage(`读取文件 ${fileName} 时出错:`, error);
        }
      }
    }),
    // 选择文档
    vscode.commands.registerCommand('markdown-in-sider:select', async () => {
      const options = markdowns.map((m) => ({ label: m.name, id: m.id }));
      const selectedOption = await vscode.window.showQuickPick(options, {
        placeHolder: '选择文档或操作!',
      });
      if (selectedOption && markdowns[currentMarkdownIndex].id !== selectedOption.id) {
        const docIndex = markdowns.findIndex((m) => m.id === selectedOption.id);
        setMarkdown(docIndex);
      }
    }),
    // 删除文档
    vscode.commands.registerCommand('markdown-in-sider:delete', async () => {
      const options = markdowns.map((m) => ({ label: m.name, id: m.id }));
      const deleteDoc = await vscode.window.showQuickPick(options, {
        placeHolder: '选择需要删除的文档!',
      });
      if (deleteDoc) {
        const deleteIndex = markdowns.findIndex((m) => m.id === deleteDoc.id);
        if (markdowns.length === 1) {
          markdowns = [{ name: 'start', id: Date.now(), content: '# start' }];
        } else {
          markdowns.splice(deleteIndex, 1);
        }
        if (deleteIndex === currentMarkdownIndex) {
          setMarkdown(0);
        } else if (deleteIndex < currentMarkdownIndex) {
          currentMarkdownIndex--;
        }
        updateConfig();
      }
    }),
    // 另存为
    vscode.commands.registerCommand('markdown-in-sider:save', async () => {
      const markdown = markdowns[currentMarkdownIndex];
      const url = await vscode.window.showSaveDialog({
        saveLabel: '保存', // 对话框按钮文本
        defaultUri: vscode.Uri.file(markdown.file || `${markdown.name}.md`),
      });
      if (!url) return;
      // 弹出输入框让用户输入文件内容
      try {
        markdown.file = url.fsPath;
        await vscode.workspace.fs.writeFile(url, Buffer.from(markdown.content, 'utf8'));
        updateConfig();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to save file: ${error.message}`);
      }
    }),
    // 预览
    vscode.commands.registerCommand('markdown-in-sider:preview', () => {
      webviewView.webview.postMessage({ command: 'preview' });
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
