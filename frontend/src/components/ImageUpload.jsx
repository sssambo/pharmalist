"use client"

import { useState } from "react"
import { imageAPI } from "../api"
import "./ImageUpload.css"

function ImageUpload({ medicineId, onUploadSuccess, onClose }) {
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState(null)

	const handleFileSelect = async (e) => {
		const file = e.target.files?.[0]
		if (!file) return

		await uploadImage(file)
	}

	const uploadImage = async (file) => {
		try {
			setUploading(true)
			setError(null)

			const response = await imageAPI.upload(medicineId, file)
			onUploadSuccess(response.data.imagePath)
		} catch (err) {
			setError("Failed to upload image. Please try again.")
			console.error("Upload error:", err)
		} finally {
			setUploading(false)
		}
	}

	const handleCapture = (e) => {
		const file = e.target.files?.[0]
		if (file) {
			uploadImage(file)
		}
	}

	return (
		<div className="image-upload-modal">
			<div className="upload-actions">
				<label className="upload-btn camera-btn">
					<input
						type="file"
						accept="image/*"
						capture="environment"
						onChange={handleCapture}
						style={{ display: "none" }}
					/>
					📷 Take Photo
				</label>

				<label className="upload-btn gallery-btn">
					<input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
					🖼️ Upload File
				</label>

				<button className="upload-btn close-btn" onClick={onClose}>
					✕ Cancel
				</button>
			</div>

			{uploading && <div className="upload-progress">Uploading image...</div>}
			{error && <div className="upload-error">{error}</div>}
		</div>
	)
}

export default ImageUpload
