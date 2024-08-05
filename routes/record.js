import express from "express";
import { Record } from "../models/Record.js";
import { Stock } from "../models/Stock.js";

const router = express.Router();

// Endpoint for adding records
// Add a new record and update stock quantityLeft
// Add a new record and update stock quantityLeft
router.post("/add-record", async (req, res) => {
  const {
    productName,
    quantity,
    pricePerQuantity,
    overview,
    customer,
    staff,
    month,
    day,
    year,
  } = req.body;

  if (!productName || !quantity) {
    return res
      .status(400)
      .json({ status: false, message: "Missing required fields." });
  }

  try {
    // Find the stock and update its quantityLeft
    const stock = await Stock.findOne({ productName });
    if (!stock) {
      return res.status(404).json({ status: false, error: "Stock not found." });
    }

    // Create a new record
    const newRecord = new Record({
      productName,
      quantity,
      pricePerQuantity,
      overview,
      customer,
      staff,
      date: new Date(year, month, day),
      stockId: stock._id, // Store reference to stock
    });
    await newRecord.save();

    stock.quantityLeft -= parseInt(quantity, 10);
    await stock.save();

    res.status(200).json({
      status: true,
      message: "Record added and stock quantityLeft updated successfully.",
    });
  } catch (error) {
    console.error(
      "Error adding record and updating stock quantityLeft:",
      error
    );
    res
      .status(500)
      .json({ status: false, error: "An error occurred. Please try again." });
  }
});

// Endpoint for searching stocks by name
router.get("/search-stocks", async (req, res) => {
  const { query } = req.query;

  try {
    const stocks = await Stock.find({
      productName: { $regex: query, $options: "i" },
    }).limit(10);

    res.status(200).json({ status: true, data: stocks });
  } catch (error) {
    console.error("Error searching stocks:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while searching for stocks",
    });
  }
});

// Endpoint to fetch the total number of records
router.get("/total-records", async (req, res) => {
  try {
    const total = await Record.countDocuments({});
    res.status(200).json({ status: true, total });
  } catch (error) {
    console.error("Error fetching total records:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the total records",
    });
  }
});

// Endpoint to fetch all records
router.get("/get-records", async (req, res) => {
  try {
    const records = await Record.find({});
    res.status(200).json({ status: true, data: records });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the records",
    });
  }
});

// Endpoint for editing records
router.put("/edit-record/:id", async (req, res) => {
  const { id } = req.params;
  const {
    productName,
    quantity,
    pricePerQuantity,
    overview,
    customer,
    staff,
    date,
  } = req.body;

  try {
    const record = await Record.findByIdAndUpdate(
      id,
      {
        productName,
        quantity,
        pricePerQuantity,
        overview,
        customer,
        staff,
        date,
      },
      { new: true }
    );

    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Record not found" });
    }

    res.status(200).json({
      status: true,
      message: "Record updated successfully!",
      data: record,
    });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while updating the record",
    });
  }
});

// Endpoint for deleting records
router.delete("/delete-record/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const record = await Record.findByIdAndDelete(id);

    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Record not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Record deleted successfully!" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while deleting the record",
    });
  }
});

// Endpoint to preview record data
router.get("/preview-record/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const record = await Record.findById(id);

    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Record not found" });
    }

    res.status(200).json({
      status: true,
      data: record,
    });
  } catch (error) {
    console.error("Error fetching record:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the record",
    });
  }
});

// Endpoint to fetch records for a specific stock by productName
router.get("/records/:productName", async (req, res) => {
  const { productName } = req.params; // Correctly use params instead of query

  if (!productName) {
    return res.status(400).json({
      status: false,
      message: "Product name is required",
    });
  }

  try {
    const records = await Record.find({ productName });
    res.status(200).json({ status: true, records });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the records",
    });
  }
});

export { router as RecordRouter };
