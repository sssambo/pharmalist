import mongoose from "mongoose";

const validNameSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		categories: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Category",
			default: [],
		},
		units: {
			type: [String],
			default: [],
		},
		imagePath: {
			type: String,
			default: null,
		},
		cloudinaryPublicId: {
			type: String,
			default: null,
		},
		hasImage: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => {
				ret.id = ret._id.toString();
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		},
	}
);

const ValidName = mongoose.model("ValidName", validNameSchema);

export default ValidName;
