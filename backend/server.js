import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5000;

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

// Database file paths
const rawMedicinesFile = path.join(__dirname, "raw-medicines.json");
const validNamesFile = path.join(__dirname, "valid-names.json");

// Initialize valid names if it doesn't exist
if (!fs.existsSync(validNamesFile)) {
	fs.writeFileSync(
		validNamesFile,
		JSON.stringify({ validNames: [] }, null, 2)
	);
}

// Helper: Read raw medicines
const readRawMedicines = () => {
	const data = fs.readFileSync(rawMedicinesFile, "utf8");
	return JSON.parse(data);
};

// Helper: Read valid names
const readValidNames = () => {
	const data = fs.readFileSync(validNamesFile, "utf8");
	return JSON.parse(data);
};

// Helper: Write valid names
const writeValidNames = (data) => {
	fs.writeFileSync(validNamesFile, JSON.stringify(data, null, 2));
};

// GET raw medicines (for validation screen)
app.get("/api/raw-medicines", (req, res) => {
	try {
		const medicines = readRawMedicines();
		res.json(medicines);
	} catch (error) {
		res.status(500).json({ error: "Failed to read raw medicines" });
	}
});

// PUT validate medicine by name
app.put("/api/raw-medicines/validate", (req, res) => {
	try {
		const { medicineName } = req.body;

		if (!medicineName) {
			return res.status(400).json({
				error: "medicineName is required",
			});
		}

		// Read data
		const validData = readValidNames();
		const rawMedicines = readRawMedicines();

		// Find the medicine group to validate
		const medicineGroup = rawMedicines
			.filter((m) => m.name === medicineName)
			.map((m) => m.unit);

		if (medicineGroup.length === 0) {
			return res.status(400).json({
				error: "Medicine not found in raw medicines",
			});
		}

		// Check if already exists in valid names
		const exists = validData.validNames.some(
			(vn) => vn.name.toLowerCase() === medicineName.toLowerCase()
		);

		if (!exists) {
			// Create new valid name entry
			const newValidName = {
				id: Date.now().toString(),
				name: medicineName,
				categories: [],
				units: medicineGroup,
				imagePath: null,
				hasImage: false,
			};
			validData.validNames.push(newValidName);
		}

		// Remove raw medicines with this name
		const updatedMedicines = rawMedicines.filter(
			(m) => m.name !== medicineName
		);

		// Save both files
		fs.writeFileSync(
			rawMedicinesFile,
			JSON.stringify(updatedMedicines, null, 2)
		);
		writeValidNames(validData);

		res.json({
			message: "Medicine validated successfully",
			rawMedicines: updatedMedicines,
			validNames: validData.validNames,
		});
	} catch (error) {
		console.error("Validation error:", error);
		res.status(500).json({ error: "Failed to validate medicine" });
	}
});

// POST validate and remove raw medicines (single endpoint)
app.post("/api/raw-medicines/validate", (req, res) => {
	try {
		const { medicineName, medicines } = req.body;

		if (!medicineName || !medicines) {
			return res.status(400).json({
				error: "medicineName and medicines are required",
			});
		}

		// Get valid names data
		const data = readValidNames();

		// Find the medicine group to validate
		const medicineGroup = medicines
			.filter((m) => m.name === medicineName)
			.map((m) => m.unit);

		if (medicineGroup.length === 0) {
			return res.status(400).json({
				error: "Medicine not found",
			});
		}

		// Check if already exists in valid names
		const exists = data.validNames.some(
			(vn) => vn.name.toLowerCase() === medicineName.toLowerCase()
		);

		if (!exists) {
			// Create new valid name entry
			const newValidName = {
				id: Date.now().toString(),
				name: medicineName,
				categories: [],
				units: medicineGroup,
				imagePath: null,
				hasImage: false,
			};
			data.validNames.push(newValidName);
		}

		// Remove raw medicines with this name
		const updatedMedicines = medicines.filter(
			(m) => m.name !== medicineName
		);

		// Save both files
		fs.writeFileSync(
			rawMedicinesFile,
			JSON.stringify(updatedMedicines, null, 2)
		);
		writeValidNames(data);

		res.json({
			message: "Medicine validated and removed from raw medicines",
			rawMedicines: updatedMedicines,
			validNames: data.validNames,
		});
	} catch (error) {
		console.error("Validation error:", error);
		res.status(500).json({ error: "Failed to validate medicine" });
	}
});

// GET all valid names
app.get("/api/valid-names", (req, res) => {
	try {
		const data = readValidNames();
		res.json(data.validNames);
	} catch (error) {
		res.status(500).json({ error: "Failed to read valid names" });
	}
});

// POST add valid name
app.post("/api/valid-names", (req, res) => {
	try {
		const { name, units } = req.body;
		if (!name || !name.trim()) {
			return res.status(400).json({ error: "Name is required" });
		}

		const data = readValidNames();
		const exists = data.validNames.some(
			(vn) => vn.name.toLowerCase() === name.toLowerCase()
		);
		if (exists) {
			return res.status(400).json({ error: "Name already exists" });
		}

		const newValidName = {
			id: Date.now().toString(),
			name: name.trim(),
			categories: [],
			units: units || [],
			imagePath: null,
			hasImage: false,
		};

		data.validNames.push(newValidName);
		writeValidNames(data);
		res.status(201).json(newValidName);
	} catch (error) {
		res.status(500).json({ error: "Failed to add valid name" });
	}
});

app.put("/api/valid-names/:id", (req, res) => {
	try {
		const { categories, units, name } = req.body;
		const data = readValidNames();
		const validName = data.validNames.find((vn) => vn.id === req.params.id);

		if (!validName) {
			return res.status(404).json({ error: "Valid name not found" });
		}

		// If updating name, ensure uniqueness
		if (name && name.trim()) {
			const exists = data.validNames.some(
				(vn) =>
					vn.name.toLowerCase() === name.toLowerCase() &&
					vn.id !== req.params.id
			);
			if (exists) {
				return res.status(400).json({ error: "Name already exists" });
			}
			validName.name = name.trim();
		}

		if (categories) validName.categories = categories;
		if (units) validName.units = units;

		writeValidNames(data);
		res.json(validName);
	} catch (error) {
		res.status(500).json({ error: "Failed to update valid name" });
	}
});

// DELETE valid name
app.delete("/api/valid-names/:id", (req, res) => {
	try {
		const data = readValidNames();
		const validName = data.validNames.find((vn) => vn.id === req.params.id);

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

		data.validNames = data.validNames.filter(
			(vn) => vn.id !== req.params.id
		);
		writeValidNames(data);
		res.json({ message: "Valid name deleted" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete valid name" });
	}
});

// POST upload image for valid name
app.post("/api/valid-names/:id/upload", upload.single("image"), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No image provided" });
		}

		const data = readValidNames();
		const validName = data.validNames.find((vn) => vn.id === req.params.id);

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

		writeValidNames(data);
		res.json(validName);
	} catch (error) {
		res.status(500).json({ error: "Failed to upload image" });
	}
});

// PUT update raw medicines
app.put("/api/raw-medicines", (req, res) => {
	try {
		const updatedMedicines = req.body;
		const data = readValidNames();

		// Process edited medicines - add them to valid-names
		updatedMedicines.forEach((medicine) => {
			if (medicine.edited === true) {
				// Check if this edited name already exists in valid names
				const exists = data.validNames.some(
					(vn) =>
						vn.name.toLowerCase() ===
						medicine.name.toLowerCase()
				);

				if (!exists) {
					// Create new valid name entry
					const newValidName = {
						id: Date.now().toString(),
						name: medicine.name,
						categories: [],
						units: medicine.unit ? [medicine.unit] : [],
						imagePath: null,
						hasImage: false,
					};
					data.validNames.push(newValidName);
				}
			}
		});

		// Save both files
		fs.writeFileSync(
			rawMedicinesFile,
			JSON.stringify(updatedMedicines, null, 2)
		);
		writeValidNames(data);

		res.json({ 
			message: "Raw medicines updated successfully",
			validNames: data.validNames
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to update raw medicines" });
	}
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
