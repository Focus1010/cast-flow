import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  const { castId, token } = req.body;
  const wallet = req.headers['x-wallet-address']; // Assume auth

  const { data: user } = await supabase.from('users').select('is_admin').eq('wallet', wallet).single();
  if (!user.is_admin) return res.status(403).json({ error: "Not admin" });

  // Call contract removeUnclaimedTips via ethers on server
  const ethers = require('ethers');
  const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider); // Set in env
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, require('../../../utils/contractABI.json'), signer);
  try {
    let tokenAddress;
    if (token === 'ETH') {
      tokenAddress = ethers.constants.AddressZero;
    } else if (token === 'USDC') {
      tokenAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    } else if (token === 'ENB') {
      tokenAddress = await contract.enbToken(); // Fetch from contract
    } else if (token === 'FCS') {
      tokenAddress = await contract.miniAppToken(); // Fetch from contract
    } else {
      throw new Error("Unsupported token");
    }
    await contract.removeUnclaimedTips(castId, tokenAddress);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}