"use client"

import { useState, useEffect } from "react"
import "./AddMedicineForm.css"

const CATEGORIES = [
  "ANTIBIOTIC",
  "ANALGESIC",
  "ANTIMALARIAL",
  "ANTIHISTAMINE",
  "COUGH_COLD",
  "GASTROINTESTINAL",
  "VITAMIN_SUPPLEMENT",
  "IV_FLUID",
  "STEROID",
  "PEDIATRIC",
  "ANTIFUNGAL_ANTIPROTOZOAL",
  "CARDIOVASCULAR",
  "DIABETES",
  "EMERGENCY_INJECTION",
]

const UNITS = ["B", "P", "R", "K", "TIN"]

function AddMedicineForm({ onSubmit, editingMedicine }) {
  const [formData, setFormData] = useState({
    name: "",
    category: CATEGORIES[0],
    unit: UNITS[0],
  })

  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name,
        category: editingMedicine.category,
        unit: editingMedicine.unit,
      })
    }
  }, [editingMedicine])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("Please enter medicine name")
      return
    }
    onSubmit(formData)
    setFormData({
      name: "",
      category: CATEGORIES[0],
      unit: UNITS[0],
    })
  }

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>{editingMedicine ? "Edit Medicine" : "Add New Medicine"}</h2>

        <form onSubmit={handleSubmit} className="medicine-form">
          <div className="form-group">
            <label htmlFor="name">Medicine Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Amlodipin, Paracetamol..."
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select id="unit" name="unit" value={formData.unit} onChange={handleChange}>
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit === "B" ? "Box" : unit === "P" ? "Pack" : unit === "R" ? "Roll" : unit === "K" ? "Kit" : unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            {editingMedicine ? "Update Medicine" : "Add Medicine"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddMedicineForm
