# Install Supabase CLI on Windows
Write-Host "🚀 Installing Supabase CLI for Windows..."

# Download and install via Scoop (recommended for Windows)
if (!(Get-Command scoop -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Scoop package manager first..."
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
}

Write-Host "📦 Installing Supabase CLI via Scoop..."
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

Write-Host "✅ Supabase CLI installed successfully!"
Write-Host "🔍 Verifying installation..."
supabase --version
