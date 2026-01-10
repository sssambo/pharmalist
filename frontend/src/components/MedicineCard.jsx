"use client"

import { useState } from "react"
import ImageUpload from "./ImageUpload"
import "./MedicineCard.css"

function MedicineCard({ medicine, onEdit, onDelete }) {
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [imagePath, setImagePath] = useState(medicine.imagePath)

  const handleImageUpload = (newImagePath) => {
    setImagePath(newImagePath)
    setShowImageUpload(false)
  }

  const categoryColors = {
    ANTIBIOTIC: "#ef4444",
    ANALGESIC: "#f59e0b",
    ANTIMALARIAL: "#ec4899",
    ANTIHISTAMINE: "#8b5cf6",
    COUGH_COLD: "#06b6d4",
    GASTROINTESTINAL: "#14b8a6",
    VITAMIN_SUPPLEMENT: "#84cc16",
    IV_FLUID: "#6366f1",
    STEROID: "#f97316",
    PEDIATRIC: "#d946ef",
    ANTIFUNGAL_ANTIPROTOZOAL: "#0ea5e9",
    CARDIOVASCULAR: "#06b6d4",
    DIABETES: "#a855f7",
    EMERGENCY_INJECTION: "#dc2626",
  }

  const bgColor = categoryColors[medicine.category] || "#10b981"

  return (
    <div className="medicine-card">
      <div className="card-image-container">
        {imagePath ? (
          <img src={imagePath || "/placeholder.svg"} alt={medicine.name} className="card-image" />
        ) : (
          <div className="no-image" style={{ backgroundColor: bgColor }}>
            <span className="no-image-text">No Image</span>
          </div>
        )}
        <button
          className="btn-upload-small"
          onClick={() => setShowImageUpload(!showImageUpload)}
          title="Upload medicine image"
        >
          📷
        </button>
      </div>

      {showImageUpload && (
        <ImageUpload
          medicineId={medicine.id}
          onUploadSuccess={handleImageUpload}
          onClose={() => setShowImageUpload(false)}
        />
      )}

      <div className="card-content">
        <h3 className="medicine-name">{medicine.name}</h3>

        <div className="medicine-meta">
          <span className="badge category-badge" style={{ backgroundColor: bgColor }}>
            {medicine.category.replace(/_/g, " ")}
          </span>
          <span className="badge unit-badge">{medicine.unit}</span>
        </div>

        <p className="medicine-date">Updated: {medicine.lastUpdated}</p>

        <div className="card-actions">
          <button className="btn-edit" onClick={() => onEdit(medicine)}>
            ✎ Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(medicine.id)}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default MedicineCard
