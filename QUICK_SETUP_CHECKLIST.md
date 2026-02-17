# 🚀 Quick Setup Checklist

## ✅ Completed
- [x] Created consolidated schema (`fresh_supabase_setup.sql`)
- [x] Updated `.env` with new credentials
  - Project: `ymeqyrcstuskhcbpenss`
  - URL: `https://ymeqyrcstuskhcbpenss.supabase.co`

## 📋 Next Steps

### 1. Run Database Schema (5 minutes)

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/ymeqyrcstuskhcbpenss
   ```

2. **Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run the Schema**
   - Open: `fresh_supabase_setup.sql`
   - Copy entire file
   - Paste in SQL Editor
   - Click **"Run"** (or Cmd+Enter)
   - Wait for "Success. No rows returned"

### 2. Verify Tables Created

**Go to Table Editor** and confirm you see:
- ✅ `profiles`
- ✅ `ventures`
- ✅ `programs` (should have 5 rows)
- ✅ `venture_milestones`
- ✅ `venture_streams`
- ✅ `support_hours`
- ✅ `venture_history`

### 3. Restart Dev Server

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### 4. Test the Application

**Create test account:**
```
Email: test@example.com
Password: Test123!
Name: Test User
```

**Submit a venture application:**
1. Login with test account
2. Click "Apply Now"
3. Fill all 4 steps
4. Submit

**Verify in Supabase:**
- Go to Table Editor → `ventures`
- You should see your submitted venture
- Check `venture_streams` table for stream data

---

## 🐛 If Something Goes Wrong

**Dev server won't restart?**
```bash
# Kill any existing process
pkill -f "vite"
# Then start fresh
npm run dev
```

**Can't connect to Supabase?**
- Check `.env` file has correct values
- Clear browser cache
- Restart dev server

**SQL errors?**
- Make sure you copied the ENTIRE file
- Try running in Supabase SQL Editor, not terminal

---

## 📞 Ready to Test?

Once you've run the SQL and restarted the server, you're ready to test the complete end-to-end flow! 🎉
