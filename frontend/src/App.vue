<template>
  <div class="App">
    {{ markdowns }}
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const vscode = acquireVsCodeApi();
const markdowns = ref([]);
const currentIndex = ref(0);
const currentMarkdown = computed(() => markdowns.value[currentIndex.value]);

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
  }
});
</script>

<style scoped>
.App {
}
</style>
