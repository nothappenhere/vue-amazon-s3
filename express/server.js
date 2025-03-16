import express from 'express'
import AWS from 'aws-sdk'
import multer from 'multer'
import fs from 'fs/promises'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Konfigurasi AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

const upload = multer({ dest: 'express/uploads/' })

// Endpoint untuk mengupload file ke S3
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path
    const fileContent = await fs.readFile(filePath)

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: req.file.originalname,
      Body: fileContent,
      ContentType: req.file.mimetype,
    }

    const data = await s3.upload(params).promise()

    // Hapus file lokal setelah berhasil diunggah
    await fs.unlink(filePath)

    res.json({ message: 'File uploaded successfully!', location: data.Location })
  } catch (err) {
    console.error('Error while uploading files:', err)
    res.status(500).json({ message: 'Error while uploading files.' })
  }
})

// Endpoint untuk mendapatkan daftar file dari S3
app.get('/files', async (req, res) => {
  try {
    const params = { Bucket: process.env.AWS_BUCKET }
    const data = await s3.listObjectsV2(params).promise()

    const files = data.Contents.map((file) => ({
      key: file.Key,
      url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
      lastModified: file.LastModified,
      size: file.Size,
    }))

    res.json(files)
  } catch (error) {
    console.error('Error fetching files:', error)
    res.status(500).json({ message: 'Failed to retrieve file list.' })
  }
})

app.listen(8000, () => {
  console.log('Server running on http://localhost:8000')
})
