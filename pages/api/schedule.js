import { supabase } from "../../lib/supabase";
import { ethers } from "ethers";
import contractABI from "../../utils/contractABI.json";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { signer_uuid, text, scheduled_at, user_fid } = req.body;

  if (!signer_uuid || !text || !scheduled_at || !user_fid) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Fetch user data to get wallet address
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("wallet")
      .eq("fid", user_fid)
      .single();
    if (userError || !user) {
      throw new Error("User not found or error fetching user");
    }
    const { wallet } = user;

    // Call Neynar API to schedule the cast
    const neynarResponse = await fetch("https://api.neynar.com/v2/farcaster/cast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": process.env.NEYNAR_API_KEY,
        "x-neynar-experimental": "true",
      },
      body: JSON.stringify({
        signer_uuid,
        text,
        scheduled_at: parseInt(scheduled_at, 10), // Ensure it's an integer timestamp
      }),
    });

    if (!neynarResponse.ok) {
      const errorText = await neynarResponse.text();
      throw new Error(`Neynar API error: ${errorText}`);
    }

    const neynarData = await neynarResponse.json();
    const castId = neynarData.hash;

    // Register in contract (using admin signer for now; replace with user signer if needed)
    const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider); // Securely stored in env
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, signer);
    await contract.registerScheduledPost(castId, parseInt(scheduled_at, 10), wallet);

    // Update Supabase with scheduled post
    const { error: insertError } = await supabase.from("scheduled_posts").insert({
      user_id: user_fid,
      posts: [text], // Store as array for consistency with client
      datetime: new Date(parseInt(scheduled_at, 10) * 1000).toISOString(), // Convert to ISO
      cast_id: castId,
    });

    if (insertError) throw insertError;

    // Update user monthly usage
    const { data: userData } = await supabase
      .from("users")
      .select("monthly_used")
      .eq("fid", user_fid)
      .single();
    const currentUsed = userData.monthly_used || 0;
    await supabase
      .from("users")
      .update({ monthly_used: currentUsed + 1 })
      .eq("fid", user_fid);

    res.status(200).json({ success: true, castId });
  } catch (error) {
    console.error("Scheduling error:", error.message);
    res.status(500).json({ error: "Scheduling failed: " + error.message });
  }
}