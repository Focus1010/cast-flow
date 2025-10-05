# Neynar API Setup for Cast Flow

## 🔑 Getting Your Neynar API Key

1. **Go to [Neynar.com](https://neynar.com/)**
2. **Sign up/Login** with your account
3. **Go to Dashboard** → **API Keys**
4. **Create New API Key** with these permissions:
   - ✅ **Cast creation**
   - ✅ **User data access**
   - ✅ **Signer management**

## 🔧 Required Environment Variables

Add these to your `.env.local`:

```env
# Neynar API Configuration
NEYNAR_API_KEY=your_actual_neynar_api_key_here

# Make sure this is the FULL API key, not truncated
# Example format: NEYNAR_API_KEY=NEYNAR_API_1A2B3C4D5E6F...
```

## 🚨 Common Issues & Solutions

### **"Incorrect or missing API key" Error:**

1. **Check API Key Format**: Make sure it starts with `NEYNAR_API_`
2. **No Spaces**: Ensure no extra spaces before/after the key
3. **Restart Server**: After adding the key, restart your dev server
4. **Check Permissions**: Ensure your API key has cast creation permissions

### **API Key Permissions Required:**
- ✅ **POST /v2/farcaster/cast** - For posting casts
- ✅ **GET /v2/farcaster/user** - For user data
- ✅ **Signer Management** - For authenticated posting

## 🧪 Testing Your Setup

1. **Add API key** to `.env.local`
2. **Restart dev server**: `npm run dev`
3. **Schedule a test post**
4. **Click "Post Now"** - should work without API errors

## 📝 Webhook Setup (Optional)

If you want webhook notifications:

1. **In Neynar Dashboard** → **Webhooks**
2. **Add webhook URL**: `https://your-domain.com/api/webhook`
3. **Select events**: Cast created, Cast deleted
4. **Add webhook secret** to `.env.local`:
   ```env
   NEYNAR_WEBHOOK_SECRET=your_webhook_secret
   ```

## ✅ Verification

Your API is working correctly when:
- ✅ **Manual "Post Now"** works without errors
- ✅ **Scheduled posts** appear on Farcaster
- ✅ **No "API key" errors** in console
