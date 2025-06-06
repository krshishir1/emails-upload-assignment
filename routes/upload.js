import express from "express";
import multer from "multer";
import Joi from "joi";
import csvParser from "csv-parser";
import supabase from "../config.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const uploadSchema = Joi.object({ file: Joi.object().required() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { error } = uploadSchema.validate({ file: req.file });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const emails = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (data) => emails.push(data.email))
      .on("end", async () => {
        console.log("Emails collected: ", emails.length);

        const requestId = uuidv4();
        const { data: requestData, error: reqErr } = await supabase
          .from("upload_requests")
          .insert([{ status: "Pending", total_entries: emails.length, id: requestId }])
          .select("*")
          .single();

        if (reqErr) return res.status(500).json({ error: reqErr.message });

        const records = emails.map((email) => ({
          email,
          request_id: requestData.id,
        }));
        const { error: insertErr } = await supabase
          .from("emails")
          .insert(records);

        if (insertErr)
          return res.status(500).json({ error: insertErr.message });

        res.json({ request_id: requestData.id });
      });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router
