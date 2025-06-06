import express from 'express'
import uploadRouter from './routes/upload.js'
import statusRouter from './routes/status.js'

import { processEmails } from './worker.js'

const app = express()

app.use(express.json())

app.use('/upload', uploadRouter)
app.use('/status', statusRouter)

setInterval(() => processEmails().catch(console.error), 5000);

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

