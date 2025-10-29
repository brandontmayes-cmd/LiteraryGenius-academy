# Deployment Fixes Applied

## Issues Fixed

### 1. ✅ Parent Account Signup Error
**Problem:** "invalid input syntax for type integer" error when signing up as parent
**Cause:** The `gradeLevel` field was being sent as an empty string "" for parent accounts, but the database expects either an integer or NULL
**Fix:** Modified `AuthContext.tsx` to convert empty `gradeLevel` to `null` for non-student roles

### 2. ✅ Parent Dashboard Redirect
**Problem:** Parents were being redirected to student dashboard
**Cause:** Related to the signup error - user profiles weren't being created properly
**Fix:** Fixed by resolving the gradeLevel issue above

### 3. ✅ Watch Demo Button
**Problem:** "Watch Demo" button on landing page didn't do anything
**Fix:** Added onClick handler to open demo video in new tab

### 4. ✅ Missing Component Import
**Problem:** LessonViewer component was used but not imported in StudentDashboard
**Fix:** Added proper import and alias for EnhancedLessonPlayer

## Next Steps

1. **Test the signup flow** - Try creating a new parent account
2. **Verify dashboard routing** - Confirm parents go to parent dashboard
3. **Check diagnostic test** - The test has fallback questions if the edge function fails
4. **Access standards** - Click "Practice Standards" tab in student dashboard

## How to Deploy

```bash
git add .
git commit -m "Fix parent signup, dashboard routing, and component imports"
git push
```

Vercel will automatically deploy the changes.
