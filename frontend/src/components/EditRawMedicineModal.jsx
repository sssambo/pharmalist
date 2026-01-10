"use client";

import React, { useState } from "react";
import "./Modal.css";

function EditRawMedicineModal({ open, medicine, onSave, onClose }) {
	const [name, setName] = useState(medicine?.name || "");
	const [units, setUnits] = useState(
		(medicine?.units || []).join(", ") || ""
	);

	// keep inputs in sync if medicine prop changes
	React.useEffect(() => {
		setName(medicine?.name || "");
		setUnits((medicine?.units || []).join(", ") || "");
	}, [medicine]);

	if (!open) return null;

	const handleSave = () => {
		const unitsArray = units
			.split(",")
			.map((u) => u.trim())
			.filter(Boolean);
		onSave({
			originalName: medicine.name,
			newName: name.trim(),
			units: unitsArray,
		});
		onClose();
	};

	return (
		<div className="modal-overlay">
			<div className="modal-container mobile-modal">
				<div className="modal-header">
					<h3>Edit medicine</h3>
					<button className="close-btn" onClick={onClose}>
						✕
					</button>
				</div>
				<div className="modal-body">
					<label className="input-label">Name</label>
					<input
						className="text-input"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>

					<label className="input-label">
						Units (comma separated)
					</label>
					<input
						className="text-input"
						value={units}
						onChange={(e) => setUnits(e.target.value)}
					/>

					<div className="modal-actions">
						<button className="btn-primary" onClick={handleSave}>
							Save
						</button>
						<button className="btn-secondary" onClick={onClose}>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default EditRawMedicineModal;
