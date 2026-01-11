import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import ValidName from "./models/ValidName.js"
import Category from "./models/Category.js"

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads/medicines")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

// Raw medicines file path (still using file for raw medicines)
const rawMedicinesFile = path.join(__dirname, "raw-medicines.json")

// Helper: Read raw medicines
const readRawMedicines = () => {
  const data = fs.readFileSync(rawMedicinesFile, "utf8")
  return JSON.parse(data)
}

// GET raw medicines (for validation screen)
app.get("/api/raw-medicines", (req, res) => {
  try {
    const medicines = readRawMedicines()
    res.json(medicines)
  } catch (error) {
    res.status(500).json({ error: "Failed to read raw medicines" })
  }
})

// PUT validate medicine by name
app.put("/api/raw-medicines/validate", async (req, res) => {
  try {
    const { medicineName } = req.body

    if (!medicineName) {
      return res.status(400).json({
        error: "medicineName is required",
      })
    }

    // Read raw medicines
    const rawMedicines = readRawMedicines()

    // Find the medicine group to validate
    const medicineGroup = rawMedicines.filter((m) => m.name === medicineName).map((m) => m.unit)

    if (medicineGroup.length === 0) {
      return res.status(400).json({
        error: "Medicine not found in raw medicines",
      })
    }

    // Check if already exists in valid names
    const exists = await ValidName.findOne({
      name: { $regex: new RegExp(`^${medicineName}$`, "i") },
    })

    if (!exists) {
      // Create new valid name entry
      await ValidName.create({
        name: medicineName,
        categories: [],
        units: medicineGroup,
        imagePath: null,
        hasImage: false,
      })
    }

    // Remove raw medicines with this name
    const updatedMedicines = rawMedicines.filter((m) => m.name !== medicineName)

    // Save raw medicines file
    fs.writeFileSync(rawMedicinesFile, JSON.stringify(updatedMedicines, null, 2))

    // Get all valid names from database
    const validNames = await ValidName.find()

    res.json({
      message: "Medicine validated successfully",
      rawMedicines: updatedMedicines,
      validNames: validNames,
    })
  } catch (error) {
    console.error("Validation error:", error)
    res.status(500).json({ error: "Failed to validate medicine" })
  }
})

// POST validate and remove raw medicines (single endpoint)
app.post("/api/raw-medicines/validate", async (req, res) => {
  try {
    const { medicineName, medicines } = req.body

    if (!medicineName || !medicines) {
      return res.status(400).json({
        error: "medicineName and medicines are required",
      })
    }

    // Find the medicine group to validate
    const medicineGroup = medicines.filter((m) => m.name === medicineName).map((m) => m.unit)

    if (medicineGroup.length === 0) {
      return res.status(400).json({
        error: "Medicine not found",
      })
    }

    // Check if already exists in valid names
    const exists = await ValidName.findOne({
      name: { $regex: new RegExp(`^${medicineName}$`, "i") },
    })

    if (!exists) {
      // Create new valid name entry
      await ValidName.create({
        name: medicineName,
        categories: [],
        units: medicineGroup,
        imagePath: null,
        hasImage: false,
      })
    }

    // Remove raw medicines with this name
    const updatedMedicines = medicines.filter((m) => m.name !== medicineName)

    // Save raw medicines file
    fs.writeFileSync(rawMedicinesFile, JSON.stringify(updatedMedicines, null, 2))

    // Get all valid names from database
    const validNames = await ValidName.find()

    res.json({
      message: "Medicine validated and removed from raw medicines",
      rawMedicines: updatedMedicines,
      validNames: validNames,
    })
  } catch (error) {
    console.error("Validation error:", error)
    res.status(500).json({ error: "Failed to validate medicine" })
  }
})

// GET all valid names
app.get("/api/valid-names", async (req, res) => {
  try {
    const validNames = await ValidName.find().populate("categories")
    res.json(validNames)
  } catch (error) {
    res.status(500).json({ error: "Failed to read valid names" })
  }
})

// POST add valid name
app.post("/api/valid-names", async (req, res) => {
  try {
    const { name, units } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" })
    }

    // Check if already exists
    const exists = await ValidName.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    })

    if (exists) {
      return res.status(400).json({ error: "Name already exists" })
    }

    const newValidName = await ValidName.create({
      name: name.trim(),
      categories: [],
      units: units || [],
      imagePath: null,
      hasImage: false,
    })

    res.status(201).json(newValidName)
  } catch (error) {
    res.status(500).json({ error: "Failed to add valid name" })
  }
})

// PUT update valid name
app.put("/api/valid-names/:id", async (req, res) => {
  try {
    const { categories, units, name } = req.body
    const validName = await ValidName.findById(req.params.id)

    if (!validName) {
      return res.status(404).json({ error: "Valid name not found" })
    }

    // If updating name, ensure uniqueness
    if (name && name.trim()) {
      const exists = await ValidName.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: req.params.id },
      })
      if (exists) {
        return res.status(400).json({ error: "Name already exists" })
      }
      validName.name = name.trim()
    }

    // Handle category IDs
    if (categories) validName.categories = categories
    if (units) validName.units = units

    await validName.save()
    // Populate categories before returning
    const updated = await ValidName.findById(req.params.id).populate("categories")
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: "Failed to update valid name" })
  }
})

// DELETE valid name
app.delete("/api/valid-names/:id", async (req, res) => {
  try {
    const validName = await ValidName.findById(req.params.id)

    if (!validName) {
      return res.status(404).json({ error: "Valid name not found" })
    }

    // Delete image if exists
    if (validName.imagePath) {
      const imagePath = path.join(__dirname, validName.imagePath)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await ValidName.findByIdAndDelete(req.params.id)
    res.json({ message: "Valid name deleted" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete valid name" })
  }
})

// POST upload image for valid name
app.post("/api/valid-names/:id/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" })
    }

    const validName = await ValidName.findById(req.params.id)

    if (!validName) {
      return res.status(404).json({ error: "Valid name not found" })
    }

    // Delete old image if exists
    if (validName.imagePath) {
      const oldImagePath = path.join(__dirname, validName.imagePath)
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath)
      }
    }

    validName.imagePath = `/uploads/medicines/${req.file.filename}`
    validName.hasImage = true

    await validName.save()
    res.json(validName)
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image" })
  }
})

// PUT update raw medicines
app.put("/api/raw-medicines", async (req, res) => {
  try {
    const updatedMedicines = req.body

    // Process edited medicines - add them to valid-names
    for (const medicine of updatedMedicines) {
      if (medicine.edited === true) {
        // Check if this edited name already exists in valid names
        const exists = await ValidName.findOne({
          name: {
            $regex: new RegExp(`^${medicine.name}$`, "i"),
          },
        })

        if (!exists) {
          // Create new valid name entry
          await ValidName.create({
            name: medicine.name,
            categories: [],
            units: medicine.unit ? [medicine.unit] : [],
            imagePath: null,
            hasImage: false,
          })
        }
      }
    }

    // Save raw medicines file
    fs.writeFileSync(rawMedicinesFile, JSON.stringify(updatedMedicines, null, 2))

    // Get all valid names from database
    const validNames = await ValidName.find()

    res.json({
      message: "Raw medicines updated successfully",
      validNames: validNames,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to update raw medicines" })
  }
})

// GET all categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

// POST add new category
app.post("/api/categories", async (req, res) => {
  try {
    const { name, color } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" })
    }

    // Check if category already exists
    const exists = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    })

    if (exists) {
      return res.status(400).json({ error: "Category already exists" })
    }

    const newCategory = await Category.create({
      name: name.trim(),
      color: color || "#10b981",
    })

    res.status(201).json(newCategory)
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" })
  }
})

// DELETE category
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ error: "Category not found" })
    }

    // Remove category from all valid names
    await ValidName.updateMany({ categories: req.params.id }, { $pull: { categories: req.params.id } })

    await Category.findByIdAndDelete(req.params.id)
    res.json({ message: "Category deleted" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
