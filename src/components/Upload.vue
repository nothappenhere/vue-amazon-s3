<script setup>
import { ref } from 'vue'

const selectedFile = ref(null)

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const location = ref(null)

const handleSubmit = async () => {
  if (!selectedFile.value) {
    alert('Pilih file terlebih dahulu!')
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const response = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData, // Menggunakan FormData, bukan JSON
    })

    const data = await response.json()
    alert(`${data.message} Location: ${data.location}`)

    location.value = data.location

    if (response.ok) window.location.reload()
  } catch (error) {
    console.error('Upload gagal:', error)
    alert('Gagal mengunggah file')
  }
}
</script>

<template>
  <h1>Upload File ke S3</h1>
  <form @submit.prevent="handleSubmit">
    <input type="file" @change="handleFileChange" required />
    <button type="submit">Upload</button>

    <p>{{ location }}</p>
  </form>
</template>
