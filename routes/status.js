import express from "express";
import supabase from "../config.js";

const router = express.Router();

router.get("/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { data: request, error } = await supabase
      .from("upload_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    console.log(error)  

    if (error || !request)
      return res.status(404).json({ error: "Request not found" });

    res.json({
      request_id: request.id,
      status: request.status,
      total_entries: request.total_entries,
      processed_entries: request.processed_entries,
      personal_count: request.personal_count,
      work_count: request.work_count,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to get status" });
  }
});

export default router;
