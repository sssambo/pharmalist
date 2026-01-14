"use client";

import "./MedicineList.css";
import { useRef } from "react";
import DeleteModal from "./DeleteModal";
import { imageAPI } from "../api";

function MedicineList({ medicines, onEdit, onDelete, deleteModal, onDeleteClick, onConfirmDelete, onCancelDelete }) {
	const fileInputRef = useRef(null);

	const handleUploadImage = async (medicineId, file) => {
		try {
			await imageAPI.upload(medicineId, file);
			window.location.reload();
		} catch (error) {
			console.error("Failed to upload image:", error);
		}
	};

	const triggerFileInput = (medicineId) => {
		const input = fileInputRef.current;
		if (input) {
			input.medicineId = medicineId;
			input.click();
		}
	};

	if (medicines.length === 0) {
		return (
			<div className="empty-state">
				<h2>No medicines yet</h2>
				<p>
					Start by validating medicine names in the "Validate Names"
					tab
				</p>
			</div>
		);
	}

	return (
		<>
			<main className="medicine-grid">
				<input
					type="file"
					ref={fileInputRef}
					style={{ display: "none" }}
					accept="image/*"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file && fileInputRef.current?.medicineId) {
							handleUploadImage(fileInputRef.current.medicineId, file);
						}
					}}
				/>
				{medicines.map((medicine) => (
				<div key={medicine.id} className="medicine-card">
					<div className="card-image">
						{medicine.hasImage ? (
							<img
								src={imageAPI.getImageUrl(medicine.imagePath)}
								alt={medicine.name}
								onError={(e) => {
									e.currentTarget.src = "/placeholder.svg";
								}}
							/>
						) : (
							<div className="placeholder">📷</div>
						)}
					</div>
					<div className="card-content">
						<h3>{medicine.name}</h3>
						<div className="categories">
							{medicine.categories?.length > 0 ? (
								medicine.categories.map((cat) => (
									<span key={typeof cat === 'string' ? cat : cat.name} className="category-badge">
										{(typeof cat === 'string' ? cat : cat.name).replace(/_/g, " ")}
									</span>
								))
							) : (
								<span className="no-category">
									No categories
								</span>
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
					<button
						className="btn-upload"
						onClick={() => triggerFileInput(medicine.id)}
						title="Upload image"
					>
						📷 Upload
					</button>
					<button
						className="btn-delete"
						onClick={() =>
							onDeleteClick(medicine.id, medicine.name)
						}
					>
						🗑 Delete
					</button>
				</div>
				</div>
			))}
			</main>

			<DeleteModal
			isOpen={deleteModal.isOpen}
			itemName={deleteModal.medicineName}
			onConfirm={onConfirmDelete}
			onCancel={onCancelDelete}
		/>
		</>
	);
}

export default MedicineList;
