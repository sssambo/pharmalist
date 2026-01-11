"use client"

import { useState, useEffect } from "react"
import { validNamesAPI } from "../api"
import "./AddUnitsModal.css"

function AddUnitsModal({ isOpen, onClose, validName, onSave }) {
  const [units, setUnits] = useState([])
  const [newUnit, setNewUnit] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setUnits(validName.units || [])
      setNewUnit("")
      setError("")
    }
  }, [isOpen, validName])

  const handleAddUnit = () => {
    const trimmedUnit = newUnit.trim().toUpperCase()
    if (!trimmedUnit) {
      setError("Unit cannot be empty")
      return
    }

    if (units.includes(trimmedUnit)) {
      setError("Unit already exists")
      return
    }

    setUnits([...units, trimmedUnit])
    setNewUnit("")
    setError("")
  }

  const handleRemoveUnit = (unitToRemove) => {
    setUnits(units.filter((unit) => unit !== unitToRemove))
  }

  const handleSave = async () => {
    if (units.length === 0) {
      setError("At least one unit is required")
      return
    }

    try {
      setLoading(true)
      await validNamesAPI.update(validName.id, { units })
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update units")
      console.error("Error saving units:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-units-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Units to {validName.name}</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="unit-input-group">
            <input
              type="text"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddUnit()}
              placeholder="Enter unit (e.g., Box, Pack, Bottle)"
              disabled={loading}
            />
            <button className="btn-add-unit" onClick={handleAddUnit} disabled={loading}>
              Add
            </button>
          </div>

          <div className="units-list">
            <h3>Current Units</h3>
            {units.length === 0 ? (
              <p className="no-units">No units added yet</p>
            ) : (
              <div className="units-tags">
                {units.map((unit) => (
                  <div key={unit} className="unit-tag">
                    <span>{unit}</span>
                    <button className="btn-remove-unit" onClick={() => handleRemoveUnit(unit)} disabled={loading}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={loading || units.length === 0}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddUnitsModal
