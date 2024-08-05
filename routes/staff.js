import express from "express";
import { Staff } from "../models/staff.js";

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

//delete workdone
// Delete work done
router.delete("/delete-workdone/:staffId/:workId", async (req, res) => {
  const { staffId, workId } = req.params;

  try {
    console.log(
      `Attempting to delete work done entry with staffId: ${staffId} and workId: ${workId}`
    );

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(staffId) ||
      !mongoose.Types.ObjectId.isValid(workId)
    ) {
      console.log("Invalid IDs provided");
      return res.status(400).json({ status: false, message: "Invalid IDs" });
    }

    // Find the staff document
    const staff = await Staff.findById(staffId);
    if (!staff) {
      console.log("Staff not found");
      return res
        .status(404)
        .json({ status: false, message: "Staff not found" });
    }

    // Find the work done entry and remove it
    const workDoneIndex = staff.workDone.findIndex(
      (entry) => entry._id.toString() === workId
    );
    if (workDoneIndex === -1) {
      console.log("Work done entry not found");
      return res
        .status(404)
        .json({ status: false, message: "Work done entry not found" });
    }

    // Remove the work done entry from the array
    staff.workDone.splice(workDoneIndex, 1);

    // Save the staff document with the updated array
    await staff.save();

    res
      .status(200)
      .json({ status: true, message: "Work done entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting work done entry:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while deleting the work done entry",
      error: error.message,
      stack: error.stack, // Include stack trace for debugging
    });
  }
});

export { router as StaffRouter };
