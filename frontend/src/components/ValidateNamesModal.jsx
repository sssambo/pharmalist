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
	const [loadingMedicine, setLoadingMedicine] = useState(null);
	const [successMedicine, setSuccessMedicine] = useState(null);
	const [successMessage, setSuccessMessage] = useState(null);
	const [errorMedicine, setErrorMedicine] = useState(null);
	const [errorMessage, setErrorMessage] = useState(null);

	const medicinesByName = useMemo(() => {
		// rawMedicines is already in the desired grouped format from rawnew.json
		return rawMedicines;
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

	const handleValidateMedicine = async (medicine) => {
		setLoadingMedicine(medicine.name);
		setErrorMedicine(null);
		setErrorMessage(null);
		setSuccessMessage(null);
		try {
			let response;
			if (typeof onValidate === "function") {
				response = await onValidate(medicine);
			} else {
				response = handleAddName(medicine);
			}
			setLoadingMedicine(null);
			setSuccessMedicine(medicine.name);
			// Show backend success message if available
			if (response && response.message) {
				setSuccessMessage(response.message);
			} else {
				setSuccessMessage("Validated successfully");
			}
			setTimeout(() => {
				setSuccessMedicine(null);
				setSuccessMessage(null);
			}, 1500);
		} catch (error) {
			setLoadingMedicine(null);
			const errorMsg =
				error.response?.data?.error ||
				error.message ||
				"Validation failed";
			setErrorMedicine(medicine.name);
			setErrorMessage(errorMsg);
			setTimeout(() => {
				setErrorMedicine(null);
				setErrorMessage(null);
			}, 3000);
		}
	};

	return (
		<div className="validate-view">
			<div className="validate-header">
				<button className="back-btn" onClick={onClose}>
					← Back
				</button>
				<h2>Validate Medicine Names</h2>
				<span className="validated-count ">
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
						<>
							{successMedicine && successMessage && (
								<div className="success-hint">
									{successMessage}
								</div>
							)}
							{filteredMedicines.map((medicine, index) => (
								<div
									key={`${medicine.name}-${index}`}
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
											className={`btn-add-small ${
												loadingMedicine ===
												medicine.name
													? "loading"
													: ""
											} ${
												successMedicine ===
												medicine.name
													? "success"
													: ""
											} ${
												errorMedicine === medicine.name
													? "error"
													: ""
											}`}
											onClick={() =>
												handleValidateMedicine(medicine)
											}
											disabled={
												loadingMedicine ===
												medicine.name
											}
											title={errorMessage || undefined}
										>
											{loadingMedicine ===
											medicine.name ? (
												<span className="spinner"></span>
											) : successMedicine ===
											  medicine.name ? (
												"✓"
											) : errorMedicine ===
											  medicine.name ? (
												"✗"
											) : (
												"✓ Valid"
											)}
										</button>
										{errorMedicine === medicine.name && (
											<span className="error-hint">
												{errorMessage}
											</span>
										)}
										<button
											className="btn-edit-small"
											onClick={() =>
												typeof onRequestEdit ===
												"function"
													? onRequestEdit(medicine)
													: handleEditMedicine(
															medicine
													  )
											}
										>
											✎ Edit
										</button>
									</div>
								</div>
							))}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default ValidateNamesModal;
