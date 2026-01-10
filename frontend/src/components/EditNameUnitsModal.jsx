"use client"

import { useState, useEffect } from "react"
import "./Modal.css"

const UNITS = [
  { code: "B", label: "Box" },
  { code: "P", label: "Pack" },
  { code: "R", label: "Roll" },
  { code: "K", label: "Kit" },
  { code: "TIN", label: "Tin" },
]

function EditNameUnitsModal({ validNames, onUpdate, onClose, editingName, setEditingName }) {
  const [selectedName, setSelectedName] = useState(editingName)
  const [selectedUnits, setSelectedUnits] = useState([])

  useEffect(() => {
    if (selectedName) {
      setSelectedUnits(selectedName.units || [])
    }
  }, [selectedName])

  const handleSelectName = (name) => {
    setSelectedName(name)
    setSelectedUnits(name.units || [])
  }

  const handleUnitToggle = (unit) => {
    setSelectedUnits((prev) => (prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]))
  }

  const handleSave = () => {
    if (selectedName) {
      onUpdate(selectedName.id, selectedUnits)
      setSelectedName(null)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Assign Units to Medicines</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="two-column">
            <div className="column">
              <h3>Medicine Names</h3>
              <div className="name-list">
                {validNames.map((name) => (
                  <div key={name.id} className="name-item">
                    <button
                      className={`name-btn ${selectedName?.id === name.id ? "active" : ""}`}
                      onClick={() => handleSelectName(name)}
                    >
                      {name.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="column">
              <h3>Available Units</h3>
              {selectedName ? (
                <div className="unit-list">
                  {UNITS.map((unit) => (
                    <label key={unit.code} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedUnits.includes(unit.code)}
                        onChange={() => handleUnitToggle(unit.code)}
                      />
                      <span>{unit.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="empty-message">Select a medicine name</p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-primary" onClick={handleSave} disabled={!selectedName}>
              Save Units
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditNameUnitsModal
