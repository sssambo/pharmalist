"use client"

import "./MedicineList.css"

function MedicineList({ medicines, onEdit, onDelete }) {
  if (medicines.length === 0) {
    return (
      <div className="empty-state">
        <h2>No medicines yet</h2>
        <p>Start by validating medicine names in the "Validate Names" tab</p>
      </div>
    )
  }

  return (
    <main className="medicine-grid">
      {medicines.map((medicine) => (
        <div key={medicine.id} className="medicine-card">
          <div className="card-image">
            {medicine.hasImage ? (
              <img src={medicine.imagePath || "/placeholder.svg"} alt={medicine.name} />
            ) : (
              <div className="placeholder">📷</div>
            )}
          </div>
          <div className="card-content">
            <h3>{medicine.name}</h3>
            <div className="categories">
              {medicine.categories?.length > 0 ? (
                medicine.categories.map((cat) => (
                  <span key={cat} className="category-badge">
                    {cat.replace(/_/g, " ")}
                  </span>
                ))
              ) : (
                <span className="no-category">No categories</span>
              )}
            </div>
            <div className="units">
              {medicine.units?.length > 0 ? (
                medicine.units.map((unit) => (
                  <span key={unit} className="unit-badge">
                    {unit}
                  </span>
                ))
              ) : (
                <span className="no-unit">No units</span>
              )}
            </div>
          </div>
          <div className="card-actions">
            <button className="btn-edit" onClick={() => onEdit(medicine)}>
              Edit
            </button>
            <button className="btn-delete" onClick={() => onDelete(medicine.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </main>
  )
}

export default MedicineList
