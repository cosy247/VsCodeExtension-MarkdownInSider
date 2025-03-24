<template>
  <MdEditor
    class="editor"
    :class="{ preview: isPreview }"
    v-model="markdown"
    theme="dark"
    :toolbars="false"
    :preview="true"
    @onBlur="handleBlur" />
</template>

<script setup>
import { ref } from 'vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
// const vscode = acquireVsCodeApi();

// 文档内容列表
const markdown = ref(`
# 87

\`\`\`js
// 文档内容列表
const markdown = ref('# 87');

// 切换编辑和预览
const isPreview = ref(false);

// 编辑器失去焦点
function handleBlur() {
  vscode.postMessage({ command: 'save', data: markdown.value });
}
\`\`\`

| 1 | 2 | 3| 1 | 2 | 3| 1 | 2 | 3123| 
| --- | -- | -- |--- | -- | -- |--- | -- | -- |
| 23 | 3 | 21
`);

// 切换编辑和预览
const isPreview = ref(true);

// 编辑器失去焦点
function handleBlur() {
  vscode.postMessage({ command: 'save', data: markdown.value });
}

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.command === 'markdown') {
    markdown.value = message.data;
  } else if (message.command === 'preview') {
    isPreview.value = !isPreview.value;
    console.log(isPreview.value);
  }
});
</script>

<style scoped>
.editor {
  position: fixed;
  height: 100vh;
  width: 200vw;
  left: 0;
  top: 0;
  overflow: hidden;
  border: none;
  background: #0000;
}
.editor.preview {
  left: unset;
  right: 0;
}
</style>

<style>
#app .md-editor-resize-operate {
  display: none !important;
}
#app .cm-scroller {
  overflow-y: auto;
}
#app .cm-content,
#app .cm-editor {
  background: transparent;
  margin: 0px;
}
#app .md-editor-content {
  margin-bottom: 25px;
}
#app .md-editor-footer {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
}
#app .md-editor-preview {
  padding: 0 2px;
}
#app .md-editor-code {
  margin: 1em 0;
  box-shadow: #8882 0 0 3px;
}
#app .md-editor-code-head {
  display: none;
}
#app .md-editor-code pre code {
  padding: 2px !important;
}
#app .md-editor-code span[rn-wrapper] {
  display: none;
}
#app .md-editor-preview h1,
#app .md-editor-preview h2,
#app .md-editor-preview h3,
#app .md-editor-preview h4,
#app .md-editor-preview h5,
#app .md-editor-preview h6 {
  margin: 0.4em 0 0.2em;
}
#app .md-editor-preview > table {
  width: 100%;
  overflow: auto;
  table-layout: fixed;
}
</style>
