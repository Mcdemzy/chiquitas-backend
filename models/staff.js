import mongoose from "mongoose";

const WorkDoneSchema = new mongoose.Schema({
  workdone: { type: String, required: true },
  charge: { type: Number, required: true },
  month: { type: String, required: true },
  day: { type: String, required: true },
  year: { type: String, required: true },
});

const StaffSchema = new mongoose.Schema(
  {
    staffName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    position: { type: String, required: true },
    month: { type: String, required: true },
    day: { type: String, required: true },
    year: { type: String, required: true },
    workDone: [WorkDoneSchema], // Array of work done entries
  },
  {
    timestamps: true,
  }
);

const StaffModel = mongoose.model("Staff", StaffSchema);

export { StaffModel as Staff };
