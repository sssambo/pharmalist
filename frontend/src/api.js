import axios from "axios";

// const API_BASE_URL = "https://pharmalist.onrender.com";
const API_BASE_URL = "http://127.0.0.1:5000";
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

// Categories API
export const categoriesAPI = {
	getAll: () => api.get("/api/categories"),
	create: (name, color) => api.post("/api/categories", { name, color }),
	delete: (id) => api.delete(`/api/categories/${id}`),
};

// Raw Medicines APIa
export const rawMedicinesAPI = {
	getAll: () => api.get("/api/raw-medicines"),
	validateMedicine: (medicineattributes) =>
		api.put("/api/raw-medicines/validate", { medicineattributes }),
};

// Image Upload API
export const imageAPI = {
	upload: (medicineId, file) => {
		const formData = new FormData();
		formData.append("image", file);
		return api.put(`/api/valid-names/${medicineId}/upload`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},
	getImageUrl: (imagePath) => {
		if (!imagePath) return "/placeholder.svg";
		if (imagePath.startsWith("http")) return imagePath;
		return `${API_BASE_URL}${imagePath}`;
	},
};

export default api;
