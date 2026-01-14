import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ValidName from "./models/ValidName.js";
import Category from "./models/Category.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for image uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = path.join(__dirname, "uploads/medicines");
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		const uniqueName = `${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}${path.extname(file.originalname)}`;
		cb(null, uniqueName);
	},
});

const upload = multer({ storage });

// Raw medicines file path (still using file for raw medicines)
const rawMedicinesFile = path.join(__dirname, "raw.json");

// Helper: Read raw medicines
const readRawMedicines = () => {
	const data = fs.readFileSync(rawMedicinesFile, "utf8");
	return JSON.parse(data);
};

// GET raw medicines (for validation screen)
app.get("/api/raw-medicines", (req, res) => {
	console.log("GET /api/raw-medicines - req.body:", req.body);
	try {
		const medicines = readRawMedicines();
		res.json(medicines);
	} catch (error) {
		res.status(500).json({ error: "Failed to read raw medicines" });
	}
});

// PUT validate medicine by name
app.put("/api/raw-medicines/validate", async (req, res) => {
	console.log("PUT /api/raw-medicines/validate - req.body:", req.body);

	try {
		const { oldname, newname, units = [] } = req.body.medicineattributes;

		if (!oldname) {
			return res.status(400).json({ error: "oldname is required" });
		}

		// Read raw medicines
		const rawMedicines = readRawMedicines();

		// Find raw medicine (case-insensitive)
		const rawMedicine = rawMedicines.find(
			(m) => m.name.toLowerCase() === oldname.toLowerCase()
		);

		if (!rawMedicine) {
			return res.status(400).json({
				error: "Medicine not found in raw medicines",
			});
		}

		// ❌ Prevent double validation
		if (rawMedicine.edited == true) {
			return res.status(409).json({
				error: "This raw medicine has already been validated",
			});
		}

		// Merge unique units
		const existingUnits = Array.isArray(rawMedicine.units)
			? rawMedicine.units
			: [];

		const mergedUnits = [...new Set([...existingUnits, ...units])];

		// Update raw medicine
		rawMedicine.units = mergedUnits;
		rawMedicine.edited = true;

		if (newname) {
			rawMedicine.correctedname = newname;
		}

		// Save back to rawnew.json
		fs.writeFileSync(
			rawMedicinesFile,
			JSON.stringify(rawMedicines, null, 2)
		);

		// Determine valid name value
		const validNameValue = newname || oldname;

		// Prevent duplicate valid names
		const existingValidName = await ValidName.findOne({
			name: { $regex: new RegExp(`^${validNameValue}$`, "i") },
		});

		if (existingValidName) {
			return res.status(409).json({
				error: "Valid name already exists",
			});
		}

		// Create new valid name
		const newValidName = await ValidName.create({
			name: validNameValue,
			categories: [],
			units: mergedUnits,
			imagePath: null,
			hasImage: false,
		});

		// ✅ Respond ONLY with the added valid name
		res.json({
			message: "Medicine validated successfully",
			validName: newValidName,
		});
	} catch (error) {
		console.error("Validation error:", error);
		res.status(500).json({ error: "Failed to validate medicine" });
	}
});

// GET all valid names
app.get("/api/valid-names", async (req, res) => {
	console.log("GET /api/valid-names - req.body:", req.body);
	try {
		const validNames = await ValidName.find().populate("categories");
		res.json(validNames);
	} catch (error) {
		res.status(500).json({ error: "Failed to read valid names" });
	}
});

// PUT update valid name
app.put("/api/valid-names/:id", async (req, res) => {
	console.log("PUT /api/valid-names/:id - req.body:", req.body);
	try {
		const { categories, units, name } = req.body;
		const validName = await ValidName.findById(req.params.id);

		if (!validName) {
			return res.status(404).json({ error: "Valid name not found" });
		}

		// If updating name, ensure uniqueness
		if (name && name.trim()) {
			const exists = await ValidName.findOne({
				name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
				_id: { $ne: req.params.id },
			});
			if (exists) {
				return res.status(400).json({ error: "Name already exists" });
			}
			validName.name = name.trim();
		}

		// Handle category IDs
		if (categories) validName.categories = categories;
		if (units) validName.units = units;

		await validName.save();
		// Populate categories before returning
		const updated = await ValidName.findById(req.params.id).populate(
			"categories"
		);
		res.json(updated);
	} catch (error) {
		res.status(500).json({ error: "Failed to update valid name" });
	}
});

// DELETE valid name
app.delete("/api/valid-names/:id", async (req, res) => {
	console.log("DELETE /api/valid-names/:id - req.body:", req.body);
	try {
		const validName = await ValidName.findById(req.params.id);

		if (!validName) {
			return res.status(404).json({ error: "Valid name not found" });
		}

		// Delete image if exists
		if (validName.imagePath) {
			const imagePath = path.join(__dirname, validName.imagePath);
			if (fs.existsSync(imagePath)) {
				fs.unlinkSync(imagePath);
			}
		}

		await ValidName.findByIdAndDelete(req.params.id);
		res.json({ message: "Valid name deleted" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete valid name" });
	}
});

// POST upload image for valid name
app.put(
	"/api/valid-names/:id/upload",
	upload.single("image"),
	async (req, res) => {
		console.log("POST /api/valid-names/:id/upload - req.body:", req.body);
		try {
			if (!req.file) {
				return res.status(400).json({ error: "No image provided" });
			}

			const validName = await ValidName.findById(req.params.id);

			if (!validName) {
				return res.status(404).json({ error: "Valid name not found" });
			}

			// Delete old image if exists
			if (validName.imagePath) {
				const oldImagePath = path.join(__dirname, validName.imagePath);
				if (fs.existsSync(oldImagePath)) {
					fs.unlinkSync(oldImagePath);
				}
			}

			validName.imagePath = `/uploads/medicines/${req.file.filename}`;
			validName.hasImage = true;

			await validName.save();
			res.json(validName);
		} catch (error) {
			res.status(500).json({ error: "Failed to upload image" });
		}
	}
);

// GET all categories
app.get("/api/categories", async (req, res) => {
	console.log("GET /api/categories - req.body:", req.body);
	try {
		const categories = await Category.find().sort({ name: 1 });
		res.json(categories);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch categories" });
	}
});

// POST add new category
app.post("/api/categories", async (req, res) => {
	console.log("POST /api/categories - req.body:", req.body);
	try {
		const { name, color } = req.body;

		if (!name || !name.trim()) {
			return res.status(400).json({ error: "Category name is required" });
		}

		// Check if category already exists
		const exists = await Category.findOne({
			name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
		});

		if (exists) {
			return res.status(400).json({ error: "Category already exists" });
		}

		const newCategory = await Category.create({
			name: name.trim(),
			color: color || "#10b981",
		});

		res.status(201).json(newCategory);
	} catch (error) {
		res.status(500).json({ error: "Failed to create category" });
	}
});

// DELETE category
app.delete("/api/categories/:id", async (req, res) => {
	console.log("DELETE /api/categories/:id - req.body:", req.body);
	try {
		const category = await Category.findById(req.params.id);

		if (!category) {
			return res.status(404).json({ error: "Category not found" });
		}

		// Remove category from all valid names
		await ValidName.updateMany(
			{ categories: req.params.id },
			{ $pull: { categories: req.params.id } }
		);

		await Category.findByIdAndDelete(req.params.id);
		res.json({ message: "Category deleted" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete category" });
	}
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
