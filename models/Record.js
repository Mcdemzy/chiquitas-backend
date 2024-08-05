import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerQuantity: { type: Number, required: true },
    overview: { type: String },
    customer: { type: String },
    staff: { type: String },
  },
  {
    timestamps: true,
  }
);

const RecordModel = mongoose.model("Record", RecordSchema);

export { RecordModel as Record };
