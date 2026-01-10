"use client";

import { useState, useEffect } from "react";
import "./Modal.css";

const CATEGORIES = [
	"ANALGESIC",
	"ANTIBIOTIC",
	"ANTIMALARIAL",
	"ANTIHISTAMINE",
	"COUGH_COLD",
	"GASTROINTESTINAL",
	"VITAMIN_SUPPLEMENT",
	"IV_FLUID",
	"STEROID",
	"PEDIATRIC",
	"ANTIFUNGAL_ANTIPROTOZOAL",
	"CARDIOVASCULAR",
	"DIABETES",
	"EMERGENCY_INJECTION",
];

function EditNameCategoriesModal({
	validNames,
	onUpdate,
	onDelete,
	onClose,
	editingName,
	setEditingName,
}) {
	const [selectedName, setSelectedName] = useState(editingName);
	const [selectedCategories, setSelectedCategories] = useState([]);

	useEffect(() => {
		if (selectedName) {
			setSelectedCategories(selectedName.categories || []);
		}
	}, [selectedName]);

	// Keep selectedName in sync when App opens the modal for a single medicine
	useEffect(() => {
		if (editingName) {
			setSelectedName(editingName);
			setSelectedCategories(editingName.categories || []);
		}
	}, [editingName]);

	const singleMode = !!editingName;

	const handleSelectName = (name) => {
		setSelectedName(name);
		setSelectedCategories(name.categories || []);
	};

	const handleCategoryToggle = (category) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	const handleSave = () => {
		if (selectedName) {
			onUpdate(selectedName.id, selectedCategories);
			if (singleMode) {
				// Close modal and clear editingName when saving a single selected medicine
				setEditingName(null);
				onClose();
			} else {
				setSelectedName(null);
			}
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal-container">
				<div className="modal-header">
					<h2>Assign Categories to Medicines</h2>
					<button className="close-btn" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="modal-body">
					<div className="two-column">
						{singleMode ? (
							<div className="column">
								<h3>Medicine</h3>
								<div className="name-item">
									<button className={`name-btn active`}>
										{selectedName?.name}
									</button>
								</div>
							</div>
						) : (
							<div className="column">
								<h3>Medicine Names</h3>
								<div className="name-list">
									{validNames.map((name) => (
										<div
											key={name.id}
											className="name-item"
										>
											<button
												className={`name-btn ${
													selectedName?.id === name.id
														? "active"
														: ""
												}`}
												onClick={() =>
													handleSelectName(name)
												}
											>
												{name.name}
											</button>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="column">
							<h3>Categories</h3>
							{selectedName ? (
								<div className="category-list">
									{CATEGORIES.map((category) => (
										<label
											key={category}
											className="checkbox-item"
										>
											<input
												type="checkbox"
												checked={selectedCategories.includes(
													category
												)}
												onChange={() =>
													handleCategoryToggle(
														category
													)
												}
											/>
											<span>
												{category.replace(/_/g, " ")}
											</span>
										</label>
									))}
								</div>
							) : (
								<p className="empty-message">
									Select a medicine name
								</p>
							)}
						</div>
					</div>

					<div className="modal-footer">
						<button
							className="btn-primary"
							onClick={handleSave}
							disabled={!selectedName}
						>
							Save Categories
						</button>
						<button className="btn-secondary" onClick={onClose}>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default EditNameCategoriesModal;
