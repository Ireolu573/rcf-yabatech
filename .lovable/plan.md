

## Fix Admin Dashboard Loading & Hooks Issues

### Problems Found

1. **`loading` state never resolves to `false`**: In `useAuth.tsx`, if the `checkAdmin()` RPC call throws an error (e.g., expired session, network issue), the `await` fails and `setLoading(false)` is never reached. This causes the dashboard to spin forever on "Loading dashboard..."

2. **Duplicate early returns in AdminDashboard**: Lines 237-238 contain duplicate guard checks (`if (loading)` and `if (!isAdmin)`) that are identical to lines 53-66. These are unreachable but messy, and the second `if (loading)` return at line 237 renders differently than the one at line 53, which can cause the "fewer hooks" React error during hot module replacement.

### Fix Plan

**File 1: `src/hooks/useAuth.tsx`**
- Wrap both `checkAdmin` calls (in `onAuthStateChange` and `getSession`) with try/catch blocks
- Ensure `setLoading(false)` is always called, even if the admin check fails
- If `checkAdmin` errors, default `isAdmin` to `false`

**File 2: `src/pages/AdminDashboard.tsx`**
- Remove the duplicate guard checks at lines 237-238 (they are unreachable since lines 53-66 already handle these cases)

### Technical Details

```text
useAuth.tsx changes:
  onAuthStateChange callback:
    try { await checkAdmin(session.user.id); }
    catch { setIsAdmin(false); }
    finally not needed - setLoading(false) is already after the if/else

  getSession callback:
    try { checkAdmin(session.user.id); }
    catch { setIsAdmin(false); }

AdminDashboard.tsx:
  Delete line 237: if (loading) return <div>...Loading...</div>;
  Delete line 238: if (!isAdmin) return null;
```

These two changes ensure the auth loading state always resolves and the dashboard either shows content or redirects to login, never gets stuck.

