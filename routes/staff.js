import express from "express";
import { Staff } from "../models/staff.js";
import mongoose from "mongoose";
const router = express.Router();
router.post("/add-staff", async (req, res) => {
  const { staffName, email, phoneNumber, position, month, day, year } =
    req.body;

  const newStaff = new Staff({
    staffName,
    email,
    phoneNumber,
    position,
    month,
    day,
    year,
  });

  try {
    await newStaff.save();
    res
      .status(200)
      .json({ status: true, message: "Staff added successfully!" });
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while adding the staff",
    });
  }
});

// Fetch all staffs
router.get("/get-staffs", async (req, res) => {
  try {
    const staffs = await Staff.find({});
    res.status(200).json({ status: true, data: staffs });
  } catch (error) {
    console.error("Error fetching staffs:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the staffs",
    });
  }
});

// Edit staffs
router.patch("/edit-staff/:id", async (req, res) => {
  const { id } = req.params;
  const { staffName, email, phoneNumber, position, month, day, year } =
    req.body;

  try {
    const staff = await Staff.findByIdAndUpdate(
      id,
      { staffName, email, phoneNumber, position, month, day, year },
      { new: true }
    );

    if (!staff) {
      return res
        .status(404)
        .json({ status: false, message: "Staff not found" });
    }

    res.status(200).json({
      status: true,
      message: "Staff updated successfully!",
      data: staff,
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while updating the staff",
    });
  }
});

//  Deleting staff
router.delete("/delete-staff/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await Staff.findByIdAndDelete(id);

    if (!staff) {
      return res
        .status(404)
        .json({ status: false, message: "Staff not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Staff deleted successfully!" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while deleting the staff",
    });
  }
});

// Endpoint to preview staff data
router.get("/preview-staff/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const staff = await Staff.findById(id);

    if (!staff) {
      return res
        .status(404)
        .json({ status: false, message: "Staff not found" });
    }

    res.status(200).json({
      status: true,
      data: staff,
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the staff",
    });
  }
});

router.put("/add-work-done/:id", async (req, res) => {
  const { id } = req.params;
  const { workdone, charge, month, day, year } = req.body;

  try {
    const staff = await Staff.findById(id);

    if (!staff) {
      return res
        .status(404)
        .json({ status: false, message: "Staff not found" });
    }

    const newWorkDone = { workdone, charge, month, day, year };
    staff.workDone.push(newWorkDone);

    await staff.save();

    res.status(200).json({
      status: true,
      message: "Work done added successfully!",
      data: staff,
    });
  } catch (error) {
    console.error("Error adding work done:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while adding the work done",
    });
  }
});
// edit workdone
router.patch("/edit-work-done/:staffId/:workId", async (req, res) => {
  const { staffId, workId } = req.params;
  const { workdone, charge, month, day, year } = req.body;

  try {
    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res
        .status(404)
        .json({ status: false, message: "Staff not found" });
    }

    const workDoneEntry = staff.workDone.id(workId);
    if (!workDoneEntry) {
      return res
        .status(404)
        .json({ status: false, message: "Work done entry not found" });
    }

    workDoneEntry.workdone = workdone;
    workDoneEntry.charge = charge;
    workDoneEntry.month = month;
    workDoneEntry.day = day;
    workDoneEntry.year = year;

    await staff.save();

    res.status(200).json({
      status: true,
      message: "Work done entry updated successfully!",
      data: staff,
    });
  } catch (error) {
    console.error("Error updating work done entry:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while updating the work done entry",
    });
  }
});
// Endpoint to fetch the total number of staff
router.get("/total-staffs", async (req, res) => {
  try {
    const totalStaffs = await Staff.countDocuments({});

    res.status(200).json({
      status: true,
      total: totalStaffs, // This should match what your frontend is expecting
      message: "Total number of staff fetched successfully!",
    });
  } catch (error) {
    console.error("Error fetching total number of staff:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the total number of staff",
    });
  }
});

// DELETE route to remove a specific work done entry
router.delete("/delete-work-done/:staffId/:workId", async (req, res) => {
  const { staffId, workId } = req.params;

  try {
    // Find and update the staff member by ID, pulling the specific work done entry
    const result = await Staff.findByIdAndUpdate(
      staffId,
      { $pull: { workDone: { _id: workId } } },
      { new: true } // Return the updated document
    );

    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Staff not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Work done entry deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting work done entry:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while deleting the work done entry",
    });
  }
});

export { router as StaffRouter };
