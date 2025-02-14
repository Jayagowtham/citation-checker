const express = require("express")
const multer = require("multer")
const cors = require("cors")
const path = require("path")
const apiRoutes = require("./routes/api")

const app = express()
app.use(cors(
  {
    origin:["https://deploy-mern-lwhq.vercel,app"],
    methods:["POST","GET"],
    credentials:true
  }
  ));

app.use(express.json())

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + ".pdf")
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only PDF files are allowed!"))
    }
  },
})

// Enable CORS for all routes
/*
app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
)
*/


// Error handling for file upload
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size is too large. Maximum size is 10MB." })
    }
    return res.status(400).json({ error: err.message })
  }
  next(err)
})

app.use("/api", apiRoutes(upload))

module.exports = app

