"use client"

import { useState } from "react"
import AddCategoriesModal from "./AddCategoriesModal"
import AddUnitsModal from "./AddUnitsModal"
import "./Modal.css"
import "./ValidatedNamesView.css"

function ValidatedNamesView({ validNames, onEditName, onClose, onValidNamesUpdate }) {
  const [search, setSearch] = useState("")
  const [addCategoriesOpen, setAddCategoriesOpen] = useState(false)
  const [addUnitsOpen, setAddUnitsOpen] = useState(false)
  const [selectedValidName, setSelectedValidName] = useState(null)

  const filtered = validNames.filter((vn) => vn.name.toLowerCase().includes(search.toLowerCase()))

  const handleAddCategories = (validName) => {
    setSelectedValidName(validName)
    setAddCategoriesOpen(true)
  }

  const handleAddUnits = (validName) => {
    setSelectedValidName(validName)
    setAddUnitsOpen(true)
  }

  const handleSaveCategories = () => {
    setAddCategoriesOpen(false)
    setSelectedValidName(null)
    onValidNamesUpdate()
  }

  const handleSaveUnits = () => {
    setAddUnitsOpen(false)
    setSelectedValidName(null)
    onValidNamesUpdate()
  }

  return (
    <>
      <div className="validate-view">
        <div className="validate-header">
          <button className="back-btn" onClick={onClose}>
            ← Back
          </button>
          <h2>Validated Names</h2>
          <span className="validated-count">Total: {validNames.length}</span>
        </div>

        <div className="validate-body">
          <input
            type="text"
            placeholder="Search validated names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <div className="medicine-list">
            {filtered.length === 0 ? (
              <p className="empty-message">No validated names</p>
            ) : (
              filtered.map((vn) => (
                <div key={vn.id} className="valid-name-item">
                  <div className="valid-name-info">
                    <div className="valid-name-header">
                      <span className="valid-name-name">{vn.name}</span>
                    </div>

                    <div className="valid-name-details">
                      <div className="detail-section">
                        <span className="detail-label">Categories:</span>
                        <div className="category-badges">
                          {vn.categories && vn.categories.length > 0 ? (
                            vn.categories.map((cat) => (
                              <span
                                key={cat.id || cat}
                                className="category-badge"
                                style={{ backgroundColor: cat.color }}
                              >
                                {cat.name}
                              </span>
                            ))
                          ) : (
                            <span className="no-data-text">None</span>
                          )}
                        </div>
                      </div>

                      <div className="detail-section">
                        <span className="detail-label">Units:</span>
                        <div className="unit-badges">
                          {vn.units && vn.units.length > 0 ? (
                            vn.units.map((unit) => (
                              <span key={unit} className="unit-badge">
                                {unit}
                              </span>
                            ))
                          ) : (
                            <span className="no-data-text">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="valid-name-actions">
                    <button className="btn-add-categories" onClick={() => handleAddCategories(vn)}>
                      + Add Categories
                    </button>
                    <button className="btn-add-units" onClick={() => handleAddUnits(vn)}>
                      + Add Units
                    </button>
                    <button className="btn-edit-name" onClick={() => onEditName(vn)}>
                      ✎ Edit Name
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedValidName && (
        <>
          <AddCategoriesModal
            isOpen={addCategoriesOpen}
            onClose={() => setAddCategoriesOpen(false)}
            validName={selectedValidName}
            onSave={handleSaveCategories}
          />
          <AddUnitsModal
            isOpen={addUnitsOpen}
            onClose={() => setAddUnitsOpen(false)}
            validName={selectedValidName}
            onSave={handleSaveUnits}
          />
        </>
      )}
    </>
  )
}

export default ValidatedNamesView
