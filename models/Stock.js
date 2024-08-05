import mongoose from "mongoose";

const StockSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    currencySymbol: { type: String, required: true },
    month: { type: String, required: true },
    day: { type: String, required: true },
    year: { type: String, required: true },
    quantityLeft: {
      type: Number,
      default: function () {
        return this.quantity;
      },
    },
    imageUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const StockModel = mongoose.model("Stock", StockSchema);

export { StockModel as Stock };
