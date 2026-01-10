"use client";

import React, { useState, useEffect } from "react";
import "./Modal.css";

function EditValidNameModal({ open, nameObj, onSave, onClose }) {
	const [name, setName] = useState(nameObj?.name || "");

	useEffect(() => {
		setName(nameObj?.name || "");
	}, [nameObj]);

	if (!open) return null;

	const handleSave = () => {
		if (!name.trim()) return;
		onSave({ id: nameObj.id, name: name.trim() });
		onClose();
	};

	return (
		<div className="modal-overlay">
			<div className="modal-container mobile-modal">
				<div className="modal-header">
					<h3>Edit Validated Name</h3>
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

export default EditValidNameModal;
