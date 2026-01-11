"use client"

import { useState, useEffect } from "react"
import { categoriesAPI } from "../api"
import "./ManageCategoriesModal.css"

function ManageCategoriesModal({ isOpen, onClose, onCategoriesUpdate }) {
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#10b981")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesAPI.getAll()
      setCategories(response.data)
      setError("")
    } catch (err) {
      setError("Failed to fetch categories")
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) {
      setError("Category name is required")
      return
    }

    try {
      setLoading(true)
      const response = await categoriesAPI.create(newCategoryName, newCategoryColor)
      setCategories([...categories, response.data])
      setNewCategoryName("")
      setNewCategoryColor("#10b981")
      setError("")
      onCategoriesUpdate()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add category")
      console.error("Error adding category:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return
    }

    try {
      await categoriesAPI.delete(categoryId)
      setCategories(categories.filter((cat) => cat.id !== categoryId))
      onCategoriesUpdate()
    } catch (err) {
      setError("Failed to delete category")
      console.error("Error deleting category:", err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content manage-categories-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Categories</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleAddCategory} className="add-category-form">
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-picker-container">
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  disabled={loading}
                />
                <span className="color-value">{newCategoryColor}</span>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>

          <div className="categories-list">
            <h3>Existing Categories</h3>
            {loading && categories.length === 0 ? (
              <p className="loading">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="no-categories">No categories yet</p>
            ) : (
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category.id} className="category-item">
                    <div className="category-header">
                      <div
                        className="category-color-badge"
                        style={{ backgroundColor: category.color }}
                        title={category.color}
                      />
                      <span className="category-name">{category.name}</span>
                    </div>
                    <button
                      className="btn-delete-category"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageCategoriesModal
