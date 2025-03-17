<template>
  <div class="App">
    {{ currentMarkdown.content }}
  </div>
  <div class="select-box" v-show="isShowSelectBox">
    <div class="select-item" v-for="(item, index) in markdowns">
      <input v-if="item.renaming" class="select-item-name" type="text" v-model="item.name" />
      <p v-else class="select-item-name" @click="selectItem(index)">{{ item.name }}</p>
      <img class="select-icon" src="./imgs/edit.png" @click="item.renaming = true" />
      <img class="select-icon" src="./imgs/edit.png" @click="item.renaming = false" />
      <img class="select-icon" src="./imgs/delete.png" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const vscode = acquireVsCodeApi();

// 文档内容列表
const markdowns = ref([]);
const currentIndex = ref(0);
const currentMarkdown = computed(() => markdowns.value[currentIndex.value] || {});

// 是否显示文档选择弹窗
const isShowSelectBox = ref(false);

// 切换编辑和预览
const isPreview = ref(false);

/**
 * @description: 选择一个文档
 */
function selectItem(index) {
  currentIndex.value = index;
  isShowSelectBox.value = false;
}

/**
 * @description: 删除目标下标的文档
 */
function deleteItem(index) {
  markdowns.value.splice(index, 1);
  if (!currentMarkdown.value) {
    currentIndex.value = 0;
  }
}

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.command === 'markdowns') {
    markdowns.value = message.data;
    if (currentMarkdown) {
      vscode.postMessage({
        command: 'changeTitle',
        data: currentMarkdown.value.name,
      });
    }
  } else if (message.command === 'select') {
    isShowSelectBox.value = true;
  } else if (message.command === 'preview') {
    isPreview.value = !isPreview.value;
  }
});
</script>

<style scoped>
.App {
  padding: 10px 5px;
  min-height: 100vh;
  box-sizing: border-box;
}
.select-box {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  border-top: 1px solid #8ae;
}
.select-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.select-item-name {
  flex: 1;
  width: 0;
  outline: none;
  border: #9a88 1px solid;
}
.select-icon {
  height: 1em;
  width: 1em;
  cursor: pointer;
}
</style>

<style scoped>
button {
}
button.readonly {
  opacity: 0.5;
  pointer-events: none;
}
</style>
