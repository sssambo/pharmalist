"use client";

import "./DeleteModal.css";

function DeleteModal({ isOpen, itemName, onConfirm, onCancel }) {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<div className="modal-header">
					<h2>Delete Confirmation</h2>
				</div>
				<div className="modal-body">
					<p>
						Are you sure you want to delete <strong>{itemName}</strong>?
					</p>
					<p className="modal-warning">This action cannot be undone.</p>
				</div>
				<div className="modal-footer">
					<button className="btn-cancel" onClick={onCancel}>
						Cancel
					</button>
					<button className="btn-confirm-delete" onClick={onConfirm}>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}

export default DeleteModal;
