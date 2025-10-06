# Wagmi + OnchainKit Setup Guide

## 🎯 **What Changed**

Replaced Privy with **Wagmi + Farcaster Auth Kit + OnchainKit** for native Farcaster/Base integration.

## 🔧 **Required Dependencies**

Run this to install new dependencies:

```bash
npm install @coinbase/onchainkit @farcaster/auth-kit
npm uninstall @privy-io/react-auth
```

## 🔑 **Environment Variables**

Update your `.env.local`:

```env
# OnchainKit Configuration (get from Coinbase Developer Platform)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_api_key_here

# Farcaster Auth Kit Configuration
NEXT_PUBLIC_FARCASTER_DEVELOPER_FID=your_developer_fid_here
NEXT_PUBLIC_FARCASTER_DEVELOPER_MNEMONIC=your_developer_mnemonic_here

# Remove these (no longer needed):
# NEXT_PUBLIC_PRIVY_APP_ID=...
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

## 🚀 **How to Get API Keys**

### **1. OnchainKit API Key:**
1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project
3. Get your API key
4. Add to `NEXT_PUBLIC_ONCHAINKIT_API_KEY`

### **2. Farcaster Developer Setup:**
1. Go to [Farcaster Developer Portal](https://developers.farcaster.xyz/)
2. Create a developer account
3. Get your Developer FID and Mnemonic
4. Add to environment variables

## ✅ **Benefits of This Setup**

### **🎯 Native Farcaster Integration:**
- **Direct Farcaster sign-in** without third-party auth
- **Automatic wallet connection** via Farcaster mini app connector
- **Native signer support** for posting casts

### **🎯 OnchainKit Base Integration:**
- **Native Base network support**
- **Built-in wallet components** from Coinbase
- **Optimized for Base transactions**
- **Better UX** for Base app users

### **🎯 Improved Performance:**
- **Fewer dependencies** (removed Privy)
- **Direct API calls** to Farcaster/Base
- **Faster wallet connections**
- **Better mobile experience**

## 🔧 **How It Works Now**

1. **User opens mini app** → Farcaster Auth Kit handles sign-in
2. **Wagmi connects wallet** → Uses Farcaster mini app connector
3. **OnchainKit handles Base** → Native Base network integration
4. **All transactions** → Direct through Base network
5. **Posting casts** → Direct via Neynar with Farcaster signer

## 🧪 **Testing Steps**

1. **Install dependencies**: `npm install`
2. **Update environment variables**
3. **Restart dev server**: `npm run dev`
4. **Test sign-in** → Should use Farcaster Auth Kit
5. **Test wallet connection** → Should use OnchainKit components
6. **Test package purchase** → Should work with Base network
7. **Test posting** → Should work with Farcaster signer

## 🎉 **Result**

Your Cast Flow is now a **true native Farcaster mini app** with proper Base network integration!

- ✅ **No third-party auth providers**
- ✅ **Direct Farcaster integration**
- ✅ **Native Base network support**
- ✅ **Optimized for mini app experience**
- ✅ **Better performance and UX**
