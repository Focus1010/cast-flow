// Setup script for scheduled posts cron job
const { execSync } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🚀 Cast Flow Cron Setup");
console.log("------------------------\n");
console.log("This script will help you set up the scheduled post processor");

// Function to prompt user
function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function setup() {
  try {
    console.log("\n1. Setting up environment variables");
    
    // Generate CRON_SECRET if not exists
    let envContent = '';
    const envPath = './.env';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    if (!envContent.includes('CRON_SECRET=') || envContent.includes('CRON_SECRET=YOUR_SECURE_RANDOM_STRING')) {
      const secret = crypto.randomBytes(32).toString('hex');
      
      if (envContent.includes('CRON_SECRET=')) {
        envContent = envContent.replace(/CRON_SECRET=.*/, `CRON_SECRET=${secret}`);
      } else {
        envContent += `\nCRON_SECRET=${secret}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log("✅ Generated new CRON_SECRET");
    } else {
      console.log("✅ CRON_SECRET already exists");
    }
    
    // Set up Vercel cron
    console.log("\n2. Setting up Vercel cron job");
    
    const useVercel = await prompt("Are you deploying on Vercel? (y/n): ");
    
    if (useVercel.toLowerCase() === 'y') {
      console.log("\nTo set up the cron job on Vercel:");
      console.log("1. Go to your Vercel project settings");
      console.log("2. Navigate to 'Cron Jobs' section");
      console.log("3. Add a new cron job with these settings:");
      console.log("   - Name: process-scheduled-posts");
      console.log("   - Schedule: */5 * * * *  (runs every 5 minutes)");
      console.log("   - Command: curl -X POST -H \"Authorization: Bearer YOUR_CRON_SECRET\" https://your-domain.vercel.app/api/cron/process-scheduled-posts");
      console.log("\nReplace YOUR_CRON_SECRET with the value in your .env file");
      console.log("Replace your-domain.vercel.app with your actual deployed domain\n");
    } else {
      console.log("\nTo set up a local cron job:");
      console.log("1. Open your crontab with: crontab -e");
      console.log("2. Add the following line:");
      console.log("   */5 * * * * curl -X POST -H \"Authorization: Bearer YOUR_CRON_SECRET\" http://localhost:3000/api/cron/process-scheduled-posts");
      console.log("\nReplace YOUR_CRON_SECRET with the value in your .env file\n");
    }
    
    console.log("\n3. Testing cron endpoint");
    const testEndpoint = await prompt("Would you like to test the endpoint now? (y/n): ");
    
    if (testEndpoint.toLowerCase() === 'y') {
      const secret = envContent.match(/CRON_SECRET=([^\n]*)/)[1];
      
      try {
        console.log("\nTesting local endpoint...");
        
        // Get the current URL from .env or use localhost
        let baseUrl = "http://localhost:3000";
        if (envContent.includes('VERCEL_URL=')) {
          const vercelUrl = envContent.match(/VERCEL_URL=([^\n]*)/)[1];
          if (vercelUrl && !vercelUrl.includes('your-domain')) {
            baseUrl = `https://${vercelUrl}`;
          }
        }
        
        const curlCommand = `curl -X POST -H "Authorization: Bearer ${secret}" ${baseUrl}/api/cron/process-scheduled-posts`;
        
        console.log(`Executing: ${curlCommand}`);
        const result = execSync(curlCommand, { encoding: 'utf8' });
        
        console.log("✅ Test successful!");
        console.log("Response:", result);
      } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.log("Make sure your development server is running at http://localhost:3000");
      }
    }
    
    console.log("\n🎉 Setup complete!");
    console.log("Your scheduled post processor is now configured.");
    console.log("Remember to restart your server for the changes to take effect.");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
  } finally {
    rl.close();
  }
}

setup();
