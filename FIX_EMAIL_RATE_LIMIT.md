# 🔧 Fix: Email Rate Limit Exceeded

## Problem
Supabase has email rate limits on the free tier, which can block signups during testing.

## Solution: Disable Email Confirmation

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to Authentication Settings**
   ```
   https://supabase.com/dashboard/project/ymeqyrcstuskhcbpenss/auth/providers
   ```

2. **Disable Email Confirmation**
   - Scroll down to **"Email Auth"** section
   - Find **"Enable email confirmations"**
   - **Toggle it OFF** (disable it)
   - Click **Save**

3. **Test Signup Again**
   - Users can now sign up without email verification
   - Perfect for development/testing

### Option 2: Use Different Email Providers

If you need email confirmation enabled, try these test emails:
- `user1@example.com`
- `user2@example.com`
- `user3@example.com`
- etc.

Each unique email counts separately for rate limiting.

---

## Alternative: Configure Custom SMTP (For Production)

If you need email confirmation for production:

1. **Go to Authentication → Email Templates**
   ```
   https://supabase.com/dashboard/project/ymeqyrcstuskhcbpenss/auth/templates
   ```

2. **Configure Custom SMTP**
   - Click "SMTP Settings"
   - Add your own email service (SendGrid, Mailgun, etc.)
   - This bypasses Supabase's rate limits

---

## Quick Fix Summary

**For Development/Testing:**
- Disable email confirmation in Auth settings
- Users can sign up instantly without verification

**For Production:**
- Set up custom SMTP provider
- Keep email confirmation enabled for security

---

## ✅ After Disabling Email Confirmation

You can now:
1. Create test accounts instantly
2. Test the complete application flow
3. No email verification needed

Try signing up again with any email! 🎉
