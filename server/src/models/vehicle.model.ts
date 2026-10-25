import mongoose, { Schema, type InferSchemaType } from "mongoose";
const vehicleSchema = new Schema({
  make: { type: String, required: true, trim: true, maxlength: 80 },
  model: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, required: true, trim: true, maxlength: 40 },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0, validate: Number.isInteger },
  imageUrl: { type: String, trim: true }
}, { timestamps: true, versionKey: false });
export type VehicleDocument = InferSchemaType<typeof vehicleSchema> & { _id: mongoose.Types.ObjectId };
export const Vehicle: mongoose.Model<VehicleDocument> = (mongoose.models.Vehicle as mongoose.Model<VehicleDocument>) || mongoose.model<VehicleDocument>("Vehicle", vehicleSchema);
