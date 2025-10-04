#!/bin/bash

# Deploy Supabase Edge Functions
echo "🚀 Deploying Supabase Edge Functions..."

# Install Supabase CLI if not installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Login to Supabase (you'll need to do this once)
echo "🔐 Make sure you're logged in to Supabase..."
echo "Run: supabase login"

# Link to your project (replace with your project reference)
echo "🔗 Linking to Supabase project..."
echo "Run: supabase link --project-ref YOUR_PROJECT_REF"

# Deploy the function
echo "🚀 Deploying auto-post function..."
supabase functions deploy auto-post

# Set environment variables
echo "⚙️ Setting environment variables..."
supabase secrets set NEYNAR_API_KEY=your_neynar_api_key_here
supabase secrets set SUPABASE_URL=your_supabase_url_here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Set GitHub repository secrets"
echo "   2. Enable GitHub Actions"
echo "   3. Test the function manually"
