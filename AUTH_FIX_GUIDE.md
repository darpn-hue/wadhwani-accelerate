# 🔐 Auth Session Fix

## Problem
Your auth session is disconnected. The app stores tokens in localStorage but Supabase client doesn't use them.

## ✅ Immediate Fix (Do This Now)

### Step 1: Clear Everything and Re-login

**In Browser Console (F12):**
```javascript
// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Reload page
location.reload();
```

### Step 2: Log In Again
1. Go to login page
2. Enter your credentials
3. Log in

### Step 3: Verify Auth Works

**In Console:**
```javascript
// Check Supabase session
const { data: { session } } = await supabase.auth.getSession();
console.log('Supabase session:', session);

// Check user
const { data: { user } } = await supabase.auth.getUser();
console.log('Logged in user:', user);
```

**Expected:** Should see user object with email, id, etc.

---

## 🔄 Testing Submit After Fix

1. ✅ Session is active
2. ✅ Go to VSM Dashboard
3. ✅ Select a venture
4. ✅ Fill form and submit
5. ✅ Should work now!

---

## 🐛 If Still Not Working

### Check localStorage

**In Console:**
```javascript
// See what's stored
console.log('All localStorage:', {...localStorage});

// Check for Supabase auth
console.log('Supabase auth:', localStorage.getItem('supabase.auth.token'));
```

### Verify API Calls Include Auth

**In Network Tab (F12 → Network):**
1. Submit a recommendation
2. Find the PUT request to `/rest/v1/ventures`
3. Click it → **Headers** tab
4. Look for: `Authorization: Bearer eyJ...`

**If missing:** Auth token not being sent!

---

## 📝 Long-Term Fix (Optional)

The current auth implementation has a mismatch. Consider using Supabase's native auth flow:

**Instead of:**
```typescript
// Custom token storage
localStorage.setItem('access_token', session.access_token);
```

**Use:**
```typescript
// Supabase handles it automatically
await supabase.auth.signInWithPassword({ email, password });
// Session auto-persisted ✓
```

---

## ⚡ Quick Test Script

**Paste in console to diagnose:**
```javascript
async function diagnoseAuth() {
    console.log('🔍 Diagnosing auth...\n');

    // 1. Check localStorage
    const customToken = localStorage.getItem('access_token');
    const supabaseToken = localStorage.getItem('supabase.auth.token');
    console.log('Custom token exists:', !!customToken);
    console.log('Supabase token exists:', !!supabaseToken);

    // 2. Check Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('\nSupabase session:', session ? 'Active ✓' : 'Missing ✗');
    if (sessionError) console.error('Session error:', sessionError);

    // 3. Check user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Supabase user:', user ? user.email : 'Not logged in ✗');
    if (userError) console.error('User error:', userError);

    // 4. Test ventures read
    const { data: ventures, error: venturesError } = await supabase
        .from('ventures')
        .select('id, name')
        .limit(1);
    console.log('\nCan read ventures:', ventures ? 'Yes ✓' : 'No ✗');
    if (venturesError) console.error('Ventures error:', venturesError);

    console.log('\n--- Summary ---');
    if (session && user && ventures) {
        console.log('✅ Auth is working! You can submit now.');
    } else {
        console.log('❌ Auth broken. Clear storage and log in again.');
    }
}

// Run it
diagnoseAuth();
```

---

## 🎯 Expected Working State

After fix:
```
✓ Supabase session: Active
✓ Supabase user: your-email@example.com
✓ Can read ventures: Yes
✓ Auth is working!
```

Then submit should work! 🚀
