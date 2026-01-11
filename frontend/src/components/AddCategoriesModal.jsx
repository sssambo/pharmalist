"use client"

import { useState, useEffect } from "react"
import { categoriesAPI, validNamesAPI } from "../api"
import "./AddCategoriesModal.css"

function AddCategoriesModal({ isOpen, onClose, validName, onSave }) {
  const [allCategories, setAllCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await categoriesAPI.getAll()
      setAllCategories(response.data)
      // Set selected categories based on validName
      const selectedIds = validName.categories.map((cat) => (typeof cat === "string" ? cat : cat.id))
      setSelectedCategories(selectedIds)
      setError("")
    } catch (err) {
      setError("Failed to fetch categories")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await validNamesAPI.update(validName.id, { categories: selectedCategories })
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update categories")
      console.error("Error saving categories:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-categories-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Categories to {validName.name}</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          {loading && allCategories.length === 0 ? (
            <p className="loading">Loading categories...</p>
          ) : allCategories.length === 0 ? (
            <p className="no-data">No categories available. Create categories first.</p>
          ) : (
            <div className="categories-checkbox-list">
              {allCategories.map((category) => (
                <label key={category.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    disabled={loading}
                  />
                  <div className="checkbox-color" style={{ backgroundColor: category.color }} />
                  <span className="checkbox-label">{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={loading || !allCategories.length}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddCategoriesModal
