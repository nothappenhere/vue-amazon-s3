<script setup>
import { ref, onMounted } from "vue";

const files = ref([]);

const fetchFiles = async () => {
  try {
    const response = await fetch("http://localhost:8000/files");
    files.value = await response.json();
  } catch (error) {
    console.error("Gagal mengambil daftar file:", error);
  }
};

onMounted(fetchFiles);
</script>

<template>
  <div>
    <h1>Daftar File di Amazon S3</h1>
    <ul>
      <li v-for="file in files" :key="file.key">
        <a :href="file.url" target="_blank">{{ file.key }}</a>
        ({{ (file.size / 1024).toFixed(2) }} KB)
      </li>
    </ul>
  </div>
</template>
