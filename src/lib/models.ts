import mongoose, { Schema, models, model } from "mongoose";
const ref = (n: string) => ({ type: Schema.Types.ObjectId, ref: n, required: true, index: true });
const opt = { timestamps: { createdAt: true, updatedAt: false } };

const UserSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  bgUrl: { type: String, default: "" },
  pdfLimit: { type: Number, default: () => Number(process.env.DEFAULT_PDF_LIMIT ?? 10), min: 0 },
}, opt);

const CollectionSchema = new Schema({ title: { type: String, required: true, trim: true }, userId: ref("User") }, opt);

const PdfLinkSchema = new Schema({
  url: { type: String, required: true }, title: { type: String, required: true, trim: true },
  collectionId: ref("Collection"), userId: ref("User"),
}, opt);

export const User = (models.User as mongoose.Model<any>) || model("User", UserSchema);
export const Collection = (models.Collection as mongoose.Model<any>) || model("Collection", CollectionSchema);
export const PdfLink = (models.PdfLink as mongoose.Model<any>) || model("PdfLink", PdfLinkSchema);
