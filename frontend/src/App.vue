<template>
  <MdEditor class="editor" :class="{ preview: isPreview }" v-model="markdown" theme="dark" :toolbars="false" :preview="true" />
</template>

<script setup>
import { ref } from 'vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const vscode = acquireVsCodeApi();

// 文档内容列表
const markdown = ref('');

// 切换编辑和预览
const isPreview = ref(false);

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
.editor:deep(.md-editor-resize-operate) {
  display: none !important;
}
.editor:deep(.cm-scroller) {
  overflow-y: auto;
}
.editor:deep(.cm-content),
.editor:deep(.cm-editor) {
  background: transparent;
}
.editor:deep(.md-editor-content) {
  margin-bottom: 25px;
}
.editor:deep(.md-editor-footer) {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
}
</style>
