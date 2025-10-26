# Cast Flow Production Deployment Checklist

Use this checklist to ensure your Cast Flow app is fully production-ready with all features working correctly.

## Environment Setup

- [ ] Create a production `.env` file with all required variables
- [ ] Set up Supabase project with proper security policies
- [ ] Deploy smart contract to Base mainnet
- [ ] Configure GitHub Actions with proper secrets
- [ ] Set up Vercel project with environment variables

## Database and Security

- [ ] Run database setup script (`npm run setup`)
- [ ] Verify Row Level Security policies are active
- [ ] Create production database backup policy
- [ ] Set strong, unique password for admin access
- [ ] Configure CORS policies for API endpoints

## Smart Contract and Blockchain

- [ ] Deploy tipping contract with proper owner address
- [ ] Record contract address in environment variables
- [ ] Fund admin wallet with sufficient ETH for gas
- [ ] Test all contract functions (tip creation, claiming)
- [ ] Verify contract on Basescan (optional)

## Automated Tasks

- [ ] Configure cron job for post processing (every 15 minutes)
- [ ] Set up monitoring for cron job failures
- [ ] Test manual post processing endpoint
- [ ] Create alert system for failed posts

## Authentication and User Flow

- [ ] Test Farcaster authentication flow
- [ ] Verify signer creation and approval process
- [ ] Test wallet connection with multiple providers
- [ ] Ensure proper error handling for auth failures

## Features Testing

### Scheduling System

- [ ] Test creating single posts
- [ ] Test creating thread posts
- [ ] Verify scheduled posts appear in database
- [ ] Confirm posts are published at scheduled times
- [ ] Check error handling for failed posts

### Tipping System

- [ ] Test creating tip pools for posts
- [ ] Verify tip distribution for interactions
- [ ] Test claiming tips for all supported tokens
- [ ] Ensure proper error handling for failed transactions

### Admin Features

- [ ] Verify admin-only routes are protected
- [ ] Test admin dashboard functionality
- [ ] Confirm token management features work correctly
- [ ] Test user management capabilities

## Performance and Optimization

- [ ] Enable caching for static assets
- [ ] Optimize database queries for performance
- [ ] Implement proper error logging and monitoring
- [ ] Set up analytics to track user behavior

## Legal and Compliance

- [ ] Add Terms of Service and Privacy Policy
- [ ] Implement GDPR compliance features
- [ ] Ensure compliance with relevant financial regulations
- [ ] Add appropriate disclaimers for crypto transactions

## Final Deployment Steps

- [ ] Deploy to production environment
- [ ] Run post-deployment tests
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry recommended)

## Post-Launch Monitoring

- [ ] Monitor scheduled posts for successful publishing
- [ ] Watch for smart contract interactions
- [ ] Check database performance and scaling
- [ ] Set up alerts for critical errors

## Common Issues and Solutions

### Posts Not Publishing

**Symptoms:**
- Posts remain in "scheduled" status
- No casts appear on Farcaster

**Solutions:**
1. Check cron job logs for execution issues
2. Verify Neynar API key is valid
3. Confirm signer credentials are working
4. Manually trigger post processing API

### Tipping System Failures

**Symptoms:**
- Tips not distributed for interactions
- Failed transaction errors

**Solutions:**
1. Check Base network status
2. Verify wallet has sufficient gas
3. Confirm contract address is correct
4. Test contract functions directly

### Database Connection Issues

**Symptoms:**
- API errors related to database access
- Missing data in application

**Solutions:**
1. Verify Supabase credentials
2. Check RLS policies
3. Test database connection manually
4. Increase connection timeout settings

---

Complete each item in this checklist to ensure your Cast Flow app is fully functional and ready for users!
