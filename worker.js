import supabase from "./config.js";
import { categorizeEmail } from "./utils.js";

const MAX_EMAILS_PER_REQUEST = 100;

export const processEmails = async () => {
  try {
    const { data: emails } = await supabase
      .from("emails")
      .select("*")
      .eq("processed", false)
      .eq("processing", false)
      .limit(MAX_EMAILS_PER_REQUEST);

    if (!emails || emails.length === 0) return;

    console.log(`Processing of ${emails.length} emails started...`);

    const emailIds = emails.map((e) => e.id);
    await supabase
      .from("emails")
      .update({ processing: true })
      .in("id", emailIds);

    for (const email of emails) {
      const category = categorizeEmail(email.email);

      // Mimic a slow process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await supabase
        .from("emails")
        .update({ category, processed: true })
        .eq("id", email.id);

      console.log(`Processed email ${email.email} with category ${category}`);

      const { data: req } = await supabase
        .from("upload_requests")
        .select("*")
        .eq("id", email.request_id)
        .single();

      await supabase
        .from("upload_requests")
        .update({
          processed_entries: req.processed_entries + 1,
          [`${category}_count`]: req[`${category}_count`] + 1,
          status:
            req.processed_entries + 1 >= req.total_entries
              ? "Completed"
              : "Processing",
        })
        .eq("id", email.request_id);
    }

    console.log("Processing of emails completed successfully.");
  } catch (err) {
    console.log("Error in processEmails: ", err);
  }
};

// processEmails();
