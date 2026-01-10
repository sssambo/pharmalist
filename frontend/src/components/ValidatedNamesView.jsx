"use client";

import { useState } from "react";
import "./Modal.css";

function ValidatedNamesView({ validNames, onEditName, onClose }) {
	const [search, setSearch] = useState("");

	const filtered = validNames.filter((vn) =>
		vn.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="validate-view">
			<div className="validate-header">
				<button className="back-btn" onClick={onClose}>
					← Back
				</button>
				<h2>Validated Names</h2>
				<span className="validated-count">
					Total: {validNames.length}
				</span>
			</div>

			<div className="validate-body">
				<input
					type="text"
					placeholder="Search validated names..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="search-input"
				/>

				<div className="medicine-list">
					{filtered.length === 0 ? (
						<p className="empty-message">No validated names</p>
					) : (
						filtered.map((vn) => (
							<div key={vn.id} className="medicine-item mobile">
								<div className="medicine-info">
									<span className="medicine-name">
										{vn.name}
									</span>
									<span className="medicine-unit">
										{(vn.units || []).join(", ")}
									</span>
								</div>
								<div className="medicine-actions">
									<button
										className="btn-edit-small"
										onClick={() => onEditName(vn)}
									>
										✎ Edit name
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

export default ValidatedNamesView;
