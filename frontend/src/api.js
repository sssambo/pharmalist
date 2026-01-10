import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Valid Names API
export const validNamesAPI = {
	getAll: () => api.get("/api/valid-names"),
	create: (name, units) => api.post("/api/valid-names", { name, units }),
	update: (id, data) => api.put(`/api/valid-names/${id}`, data),
	delete: (id) => api.delete(`/api/valid-names/${id}`),
};

// Raw Medicines API
export const rawMedicinesAPI = {
	getAll: () => api.get("/api/raw-medicines"),
	updateAll: (medicines) =>
		api.put("/api/raw-medicines", medicines),
	validateMedicine: (medicineName) =>
		api.put("/api/raw-medicines/validate", { medicineName }),
};

// Image Upload API
export const imageAPI = {
	upload: (medicineId, file) => {
		const formData = new FormData();
		formData.append("image", file);
		return api.post(`/api/medicines/${medicineId}/upload`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},
};

export default api;
