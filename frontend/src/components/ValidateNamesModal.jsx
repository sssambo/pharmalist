"use client";

import { useState, useMemo } from "react";
import "./Modal.css";

function ValidateNamesModal({
	rawMedicines,
	validNames,
	onAddValidName,
	onValidate,
	onRequestEdit,
	onClose,
}) {
	const [search, setSearch] = useState("");

	const medicinesByName = useMemo(() => {
		const grouped = {};
		rawMedicines.forEach((m) => {
			const key = m.name.toLowerCase();
			if (!grouped[key]) {
				grouped[key] = {
					name: m.name,
					units: [],
					edited: m.edited || false,
				};
			}
			grouped[key].units.push(m.unit);
		});
		return Object.values(grouped);
	}, [rawMedicines]);

	const validNameSet = useMemo(
		() => new Set(validNames.map((vn) => vn.name.toLowerCase())),
		[validNames]
	);

	const filteredMedicines = useMemo(
		() =>
			medicinesByName.filter(
				(m) =>
					m.name.toLowerCase().includes(search.toLowerCase()) &&
					!validNameSet.has(m.name.toLowerCase())
			),
		[medicinesByName, search, validNameSet]
	);

	const handleAddName = (medicine) => {
		onAddValidName(medicine.name, medicine.units);
		setSearch("");
	};

	const handleEditMedicine = (medicine) => {
		if (typeof onRequestEdit === "function") {
			onRequestEdit(medicine);
			return;
		}
	};

	return (
		<div className="validate-view">
			<div className="validate-header">
				<button className="back-btn" onClick={onClose}>
					← Back
				</button>
				<h2>Validate Medicine Names</h2>
				<span className="validated-count">
					Validated: {validNames.length}
				</span>
			</div>

			<div className="validate-body">
				<input
					type="text"
					placeholder="Search medicines..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="search-input"
				/>

				<div className="medicine-list">
					{filteredMedicines.length === 0 ? (
						<p className="empty-message">
							No medicines to validate
						</p>
					) : (
						filteredMedicines.map((medicine) => (
							<div
								key={medicine.name}
								className="medicine-item mobile"
							>
								<div className="medicine-info">
									<span className="medicine-name">
										{medicine.name}
									</span>
									<span className="medicine-unit">
										{medicine.units.join(", ")}
									</span>
								</div>
								<div className="medicine-actions">
									<button
										className="btn-add-small"
										onClick={() =>
											typeof onValidate === "function"
												? onValidate(medicine)
												: handleAddName(medicine)
										}
									>
										✓ Valid
									</button>
									<button
										className="btn-edit-small"
										onClick={() =>
											typeof onRequestEdit === "function"
												? onRequestEdit(medicine)
												: handleEditMedicine(medicine)
										}
									>
										✎ Edit
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

export default ValidateNamesModal;
