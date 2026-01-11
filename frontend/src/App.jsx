"use client";

import { useState, useEffect } from "react";
import MedicineList from "./components/MedicineList";
import ValidateNamesModal from "./components/ValidateNamesModal";
import EditRawMedicineModal from "./components/EditRawMedicineModal";
import ValidatedNamesView from "./components/ValidatedNamesView";
import EditValidNameModal from "./components/EditValidNameModal";
import ManageCategoriesModal from "./components/ManageCategoriesModal";
import { validNamesAPI, rawMedicinesAPI } from "./api";
import "./App.css";

const UNIT_MAP = { B: "Box", P: "Pack", R: "Roll", K: "Carton", TIN: "Tin" };

function App() {
	const [validNames, setValidNames] = useState([]);
	const [rawMedicines, setRawMedicines] = useState([]);
	const [step, setStep] = useState("list"); // list, validated, unvalidated, manage_categories
	const [editingName, setEditingName] = useState(null);
	const [editingRawMedicine, setEditingRawMedicine] = useState(null);
	const [editingValidName, setEditingValidName] = useState(null);
	const [loading, setLoading] = useState(true);
	const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);

	// derived: unvalidated grouped names
	const unvalidatedByName = () => {
		const grouped = {};
		rawMedicines.forEach((m) => {
			const key = m.name.toLowerCase();
			if (!grouped[key])
				grouped[key] = { name: m.name, units: new Set() };
			grouped[key].units.add(m.unit);
		});
		const validSet = new Set(validNames.map((vn) => vn.name.toLowerCase()));
		return Object.values(grouped).filter(
			(g) => !validSet.has(g.name.toLowerCase())
		);
	};

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [validRes, rawRes] = await Promise.all([
				validNamesAPI.getAll(),
				rawMedicinesAPI.getAll(),
			]);
			setValidNames(validRes.data);
			setRawMedicines(rawRes.data);
		} catch (error) {
			console.error("Failed to fetch data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddValidName = async (name, units) => {
		try {
			const response = await validNamesAPI.create(name, units);
			setValidNames([...validNames, response.data]);
		} catch (error) {
			console.error("Failed to add valid name:", error);
		}
	};

	// Save edited raw medicine (from modal)
	const handleSaveEditedRawMedicine = async ({
		originalName,
		newName,
		units,
	}) => {
		try {
			// Update all raw entries that matched the original name
			const updatedRawMedicines = rawMedicines.map((m) => {
				if (m.name === originalName) {
					return {
						...m,
						name: newName,
						unit: units && units.length > 0 ? units[0] : m.unit,
						edited: true,
					};
				}
				return m;
			});
			setRawMedicines(updatedRawMedicines);
			const response = await rawMedicinesAPI.updateAll(
				updatedRawMedicines
			);

			// If backend returned validNames, update the state
			if (response.data.validNames) {
				setValidNames(response.data.validNames);
			}
		} catch (error) {
			console.error("Failed to save edited raw medicine:", error);
		}
	};

	const handleUpdateCategories = async (id, categories) => {
		try {
			const response = await validNamesAPI.update(id, {
				categories,
			});
			setValidNames(
				validNames.map((vn) =>
					vn.id === response.data.id ? response.data : vn
				)
			);
			setEditingName(null);
		} catch (error) {
			console.error("Failed to update categories:", error);
		}
	};

	// Validate a grouped medicine (move to valid names and remove raw entries)
	const handleValidateMedicine = async (medicine) => {
		try {
			const response = await rawMedicinesAPI.validateMedicine(
				medicine.name
			);

			// Update both states with response from backend
			setRawMedicines(response.data.rawMedicines);
			setValidNames(response.data.validNames);
		} catch (error) {
			console.error("Failed to validate medicine:", error);
		}
	};

	const handleUpdateUnits = async (id, units) => {
		try {
			const response = await validNamesAPI.update(id, { units });
			setValidNames(
				validNames.map((vn) =>
					vn.id === response.data.id ? response.data : vn
				)
			);
			setEditingName(null);
		} catch (error) {
			console.error("Failed to update units:", error);
		}
	};

	const handleDeleteName = async (id) => {
		if (window.confirm("Delete this medicine name?")) {
			try {
				await validNamesAPI.delete(id);
				setValidNames(validNames.filter((vn) => vn.id !== id));
			} catch (error) {
				console.error("Failed to delete:", error);
			}
		}
	};

	const handleCategoriesUpdate = async () => {
		try {
			const response = await validNamesAPI.getAll();
			setValidNames(response.data);
		} catch (error) {
			console.error("Failed to refresh valid names:", error);
		}
	};

	return (
		<div className="app-container">
			<header className="app-header">
				<h1>Pharmacy Medicine Manager</h1>
				<div className="header-buttons">
					<button
						className={`nav-btn ${step === "list" ? "active" : ""}`}
						onClick={() => setStep("list")}
					>
						Medicine List
					</button>
					<button
						className={`nav-btn ${
							step === "validated" ? "active" : ""
						}`}
						onClick={() => setStep("validated")}
					>
						Validate Names
					</button>
					<button
						className="unvalidated-btn"
						onClick={() => setStep("unvalidated")}
					>
						{unvalidatedByName().length} unvalidated
					</button>
					<button
						className={`nav-btn ${
							step === "manage_categories" ? "active" : ""
						}`}
						onClick={() => setManageCategoriesOpen(true)}
					>
						Manage Categories
					</button>
				</div>
			</header>

			<ManageCategoriesModal
				isOpen={manageCategoriesOpen}
				onClose={() => setManageCategoriesOpen(false)}
				onCategoriesUpdate={handleCategoriesUpdate}
			/>

			{loading ? (
				<p className="loading">Loading...</p>
			) : step === "validated" ? (
				<>
					<ValidatedNamesView
						validNames={validNames}
						onEditName={(vn) => setEditingValidName(vn)}
						onClose={() => setStep("list")}
						onValidNamesUpdate={handleCategoriesUpdate}
					/>

					{editingValidName && (
						<EditValidNameModal
							open={!!editingValidName}
							nameObj={editingValidName}
							onSave={async ({ id, name }) => {
								try {
									const res = await validNamesAPI.update(id, {
										name,
									});
									setValidNames(
										validNames.map((vn) =>
											vn.id === res.data.id
												? res.data
												: vn
										)
									);
									setEditingValidName(null);
								} catch (e) {
									console.error(
										"Failed to update valid name:",
										e
									);
								}
							}}
							onClose={() => setEditingValidName(null)}
						/>
					)}
				</>
			) : step === "unvalidated" ? (
				<>
					<ValidateNamesModal
						rawMedicines={rawMedicines}
						validNames={validNames}
						onValidate={handleValidateMedicine}
						onRequestEdit={(m) => setEditingRawMedicine(m)}
						onClose={() => setStep("list")}
					/>

					{editingRawMedicine && (
						<EditRawMedicineModal
							open={!!editingRawMedicine}
							medicine={editingRawMedicine}
							onSave={handleSaveEditedRawMedicine}
							onClose={() => setEditingRawMedicine(null)}
						/>
					)}
				</>
			) : (
				<MedicineList
					medicines={validNames}
					onEdit={(name) => {
						setEditingName(name);
						setStep("list");
					}}
					onDelete={handleDeleteName}
				/>
			)}
		</div>
	);
}

export default App;
