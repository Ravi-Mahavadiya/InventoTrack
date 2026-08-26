import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    module: { type: String, required: true, uppercase: true, trim: true },
    can_create: { type: Boolean, default: false },
    can_view: { type: Boolean, default: false },
    can_edit: { type: Boolean, default: false },
    can_delete: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Permission", permissionSchema);
