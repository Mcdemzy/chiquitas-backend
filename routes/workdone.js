import express from "express";
import { Workdone } from "../models/Workdone.js";
import { WorkflowIcon } from "lucide-react";

const router = express.Router();

router.post("/add-workdone", async (req, res) => {
  const { workDone, charge, month, day, year } = req.body;

  const newWorkDone = new Workdone({
    workDone,
    charge,
    month,
    day,
    year,
  });

  try {
    await newWorkDone.save();
    res
      .status(200)
      .json({ status: true, message: "Work Done added successfully!" });
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while adding the workdone",
    });
  }
});

// Fetch all workdone
router.get("/get-workdone", async (req, res) => {
  try {
    const workdone = await Workdone.find({});
    res.status(200).json({ status: true, data: workdone });
  } catch (error) {
    console.error("Error fetching the workdone:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the workdone",
    });
  }
});

// Edit workdone
router.patch("/edit-workdone/:id", async (req, res) => {
  const { id } = req.params;
  const { workdone, charge, month, day, year } = req.body;

  try {
    const work = await Workdone.findByIdAndUpdate(
      id,
      { workdone, charge, month, day, year },
      { new: true }
    );

    if (!work) {
      return res
        .status(404)
        .json({ status: false, message: "Workdone not found" });
    }

    res.status(200).json({
      status: true,
      message: "Workdone updated successfully!",
      data: work,
    });
  } catch (error) {
    console.error("Error updating workdone:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while updating the workdone",
    });
  }
});

//  Deleting staff
router.delete("/delete-workdone/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const work = await Workdone.findByIdAndDelete(id);

    if (!work) {
      return res
        .status(404)
        .json({ status: false, message: "workdone not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Workdone deleted successfully!" });
  } catch (error) {
    console.error("Error deleting workdone:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while deleting the workdone",
    });
  }
});

// Endpoint to preview workdone
router.get("/preview-workdone/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const work = await Workdone.findById(id);

    if (!work) {
      return res.status(404).json({ status: false, message: "work not found" });
    }

    res.status(200).json({
      status: true,
      data: work,
    });
  } catch (error) {
    console.error("Error fetching work:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the workdone",
    });
  }
});

export { router as WorkdoneRouter };
