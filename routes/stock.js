import express from "express";
import { Stock } from "../models/Stock.js";

const router = express.Router();

// Endpoint for adding stocks
router.post("/add-stock", async (req, res) => {
  const {
    productName,
    quantity,
    price,
    currencySymbol,
    month,
    day,
    year,
    quantityLeft,
    imageUrl,
  } = req.body;

  const newStock = new Stock({
    productName,
    quantity,
    price,
    currencySymbol,
    month,
    day,
    year,
    quantityLeft,
    imageUrl,
  });

  try {
    await newStock.save();
    res
      .status(200)
      .json({ status: true, message: "Stock added successfully!" });
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while adding the stock",
    });
  }
});

// New endpoint to fetch the total number of stocks
router.get("/total-stocks", async (req, res) => {
  try {
    const total = await Stock.countDocuments({});
    res.status(200).json({ status: true, total });
  } catch (error) {
    console.error("Error fetching total stocks:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the total stocks",
    });
  }
});

// Endpoint to fetch all stocks
router.get("/get-stocks", async (req, res) => {
  try {
    const stocks = await Stock.find({});
    res.status(200).json({ status: true, data: stocks });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the stocks",
    });
  }
});

// Endpoint for editing stocks
router.put("/edit-stock/:id", async (req, res) => {
  const { id } = req.params;
  const {
    productName,
    quantity,
    price,
    currencySymbol,
    month,
    day,
    year,
    quantityLeft,
  } = req.body;

  try {
    const stock = await Stock.findByIdAndUpdate(
      id,
      {
        productName,
        quantity,
        price,
        currencySymbol,
        month,
        day,
        year,
        quantityLeft,
      },
      { new: true }
    );

    if (!stock) {
      return res
        .status(404)
        .json({ status: false, message: "Stock not found" });
    }

    res.status(200).json({
      status: true,
      message: "Stock updated successfully!",
      data: stock,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while updating the stock",
    });
  }
});

// Endpoint for deleting stocks
router.delete("/delete-stock/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const stock = await Stock.findByIdAndDelete(id);

    if (!stock) {
      return res
        .status(404)
        .json({ status: false, message: "Stock not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Stock deleted successfully!" });
  } catch (error) {
    console.error("Error deleting stock:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while deleting the stock",
    });
  }
});

// Endpoint to preview stock data
router.get("/preview-stock/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const stock = await Stock.findById(id);

    if (!stock) {
      return res
        .status(404)
        .json({ status: false, message: "Stock not found" });
    }

    res.status(200).json({
      status: true,
      data: stock,
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the stock",
    });
  }
});

// New endpoint to fetch the most recent 5 stocks
router.get("/recent-stocks", async (req, res) => {
  try {
    const recentStocks = await Stock.find({})
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .limit(5); // Limit the results to 5

    res.status(200).json({ status: true, data: recentStocks });
  } catch (error) {
    console.error("Error fetching recent stocks:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the recent stocks",
    });
  }
});

export { router as StockRouter };

// Now I'll need your help with the implementation right but first I want you to explain what you think I want if you are correct then I'll tell you to proceed okay
