// Deploy script for CastFlow Tipping Contract
const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
  console.log("Deploying CastFlowTipping contract to Base network...");

  // Connect to provider using environment variable
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"
  );

  // Get wallet from private key
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
  console.log(`Connected to wallet address: ${wallet.address}`);

  // Get contract artifacts
  const fs = require("fs");
  const contractJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/CastFlowTipping.sol/CastFlowTipping.json")
  );
  
  // Deploy contract
  console.log("Deploying contract...");
  const ContractFactory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );

  try {
    const contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("Contract deployed successfully!");
    console.log(`Contract Address: ${contractAddress}`);

    // Write deployment info to .env file
    console.log("Updating .env file with contract address...");
    const envPath = "./.env";
    let envContent = "";
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // Update or add TIPPING_CONTRACT_ADDRESS
    if (envContent.includes("NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(".env file updated with contract address");

    // Create contract ABI file
    console.log("Creating contract ABI file...");
    if (!fs.existsSync("./utils")) {
      fs.mkdirSync("./utils");
    }
    fs.writeFileSync(
      "./utils/contractABI.json",
      JSON.stringify(contractJson.abi, null, 2)
    );
    console.log("Contract ABI file created at ./utils/contractABI.json");

    console.log("\nDeployment completed successfully!");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
