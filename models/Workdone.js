import mongoose from "mongoose";

const WorkdoneSchema = new mongoose.Schema(
  {
    workDone: { type: String, required: true },
    charge: { type: String, required: true },
    month: { type: String, required: true },
    day: { type: String, required: true },
    year: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const WorkDoneModel = mongoose.model("Workdone", WorkdoneSchema);

export { WorkDoneModel as Workdone };
