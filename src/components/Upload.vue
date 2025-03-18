<script setup>
import { ref, onMounted } from 'vue'

const files = ref([])
const location = ref('')
const isUploading = ref(false)
const uploadError = ref(true)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    location.value = ''
  }
}

const handleSubmit = async () => {
  isUploading.value = true

  const fileInput = document.querySelector('input[type="file"]')
  const file = fileInput.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    location.value = data.location
    fetchFiles()
  } catch (error) {
    uploadError.value = false
    console.error('Upload gagal:', error)
  } finally {
    isUploading.value = false
  }
}

const fetchFiles = async () => {
  try {
    const response = await fetch('http://localhost:8000/files')
    files.value = await response.json()
  } catch (error) {
    console.error('Gagal mengambil daftar file:', error)
  }
}

onMounted(fetchFiles)
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Upload File -->
    <div class="bg-white shadow-lg rounded-lg p-6 mb-8 border">
      <h1 class="text-2xl font-bold mb-4 text-center text-gray-700">Upload File ke Amazon S3</h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input
          type="file"
          @change="handleFileChange"
          required
          class="block w-full text-sm p-3 text-gray-500 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
        />

        <button
          type="submit"
          :disabled="isUploading"
          class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all cursor-pointer"
        >
          {{ isUploading ? 'Uploading...' : 'Upload' }}
        </button>

        <p v-if="location" class="text-green-600 text-center text-sm mt-2">
          File berhasil diupload:
          <a :href="location" target="_blank" class="underline">{{ location }}</a>
        </p>
        <p :class="{ hidden: uploadError }" class="text-red-600 text-center text-sm mt-2">
          Tidak dapat mengupload file, coba lagi nanti.
        </p>
      </form>
    </div>

    <!-- Daftar File -->
    <div class="bg-white shadow-lg border rounded-lg p-6">
      <h1 class="text-2xl font-semibold mb-4 text-gray-700">Daftar File di Amazon S3</h1>

      <div v-if="files.length" class="overflow-x-auto">
        <table class="w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr class="bg-gray-300">
              <th class="border px-4 py-2">Nama File</th>
              <th class="border px-4 py-2">Ukuran</th>
              <th class="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in files" :key="file.key" class="hover:bg-gray-50">
              <td class="border px-4 py-2">{{ file.key }}</td>
              <td class="border px-4 py-2">{{ (file.size / 1024).toFixed(2) }} KB</td>
              <td class="border px-4 py-2">
                <a :href="file.url" target="_blank" class="text-blue-600 hover:underline">Unduh</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="text-gray-500 text-sm">Tidak ada file yang tersedia.</p>
    </div>
  </div>
</template>
