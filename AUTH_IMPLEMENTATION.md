# Authentication Implementation

Professional authentication system for RiskLens fintech application.

## 📁 Files Added

### Core Services & Types
- **`src/types/auth.ts`** - TypeScript interfaces for auth data
- **`src/lib/authService.ts`** - Authentication service layer
- **`src/hooks/use-auth.ts`** - React hook for auth state

### Pages
- **`src/pages/SignInPage.tsx`** - Sign in page at `/login`
- **`src/pages/SignUpPage.tsx`** - Sign up page at `/signup`

### Components
- **`src/components/PrivateRoute.tsx`** - Route protection wrapper

### Updated Files
- **`src/App.tsx`** - Added auth routes and protected app routes
- **`src/lib/api.ts`** - Automatically includes auth token in API requests
- **`src/components/layout/AppHeader.tsx`** - Added user menu with logout
- **`src/pages/LandingPage.tsx`** - Updated navigation to link to login

## 🎯 Features Implemented

### Sign In Page (`/login`)
- Email and password fields with validation
- "Remember me" checkbox (UI only)
- Google sign-in button (placeholder for future implementation)
- Link to sign up page
- Professional fintech design matching existing theme

### Sign Up Page (`/signup`)
- Full name, email, password, and confirm password fields
- Client-side validation:
  - Email format validation
  - Password strength (8+ chars, uppercase, lowercase, number)
  - Password confirmation match
- Google sign-up button (placeholder)
- Link to sign in page

### Route Protection
- All `/app/*` routes require authentication
- Automatic redirect to `/login` if not authenticated
- Token stored in localStorage

### API Integration
- Auth service calls backend endpoints:
  - `POST /auth/login` - Email/password authentication
  - `POST /auth/signup` - User registration
  - `POST /auth/google` - Google OAuth (prepared)
- Expected backend response:
  ```json
  {
    "access_token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string"
    }
  }
  ```

### Token Management
- JWT token stored in `localStorage` as `risklens_auth_token`
- User data stored as `risklens_user`
- Token automatically included in all API requests via `Authorization: Bearer <token>`

### User Experience
- Toast notifications for success/error states
- Loading states with disabled buttons
- Inline validation error messages
- Smooth transitions and hover effects
- Fully responsive (mobile-friendly)
- User menu in app header with email display and logout

## 🔐 Security Notes

### What's Implemented
✅ Client-side input validation  
✅ Token-based authentication  
✅ Protected routes  
✅ Secure password field inputs  
✅ Auth token in API requests  

### Backend Requirements (Not Implemented Here)
- Password hashing (bcrypt/argon2)
- JWT token generation and validation
- Token expiration and refresh
- Rate limiting on auth endpoints
- HTTPS enforcement

## 📝 Usage Examples

### Using Auth Service Directly
```typescript
import { authService } from "@/lib/authService";

// Login
await authService.login({ email, password });

// Sign up
await authService.signup({ name, email, password });

// Check auth status
const isAuthenticated = authService.isAuthenticated();

// Get current user
const user = authService.getUser();

// Logout
authService.logout();
```

### Using Auth Hook
```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {user && <p>Welcome, {user.name}!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes
Routes under `/app` are automatically protected via the `PrivateRoute` component in `App.tsx`.

## 🧪 Testing Checklist

- [ ] Navigate to `/login` - should show sign in page
- [ ] Navigate to `/signup` - should show sign up page
- [ ] Try accessing `/app` without auth - should redirect to `/login`
- [ ] Sign in with valid credentials - should redirect to `/app`
- [ ] Check user menu in app header - should show email
- [ ] Click logout - should clear auth and redirect to `/login`
- [ ] Check API requests include `Authorization` header when authenticated
- [ ] Test form validations (empty fields, invalid email, weak password)
- [ ] Test responsive design on mobile

## 🚀 Future Enhancements (Not Implemented)

- Google OAuth integration
- Password reset flow
- Email verification
- Two-factor authentication
- Remember me persistence (beyond localStorage)
- Token refresh mechanism
- Session timeout warnings

## 🎨 Design Decisions

1. **Minimal and Professional** - Enterprise fintech aesthetic, not consumer social app
2. **Type-Safe** - Full TypeScript with strict types
3. **Abstracted Auth Logic** - All auth calls in service layer, not in components
4. **Reused Theme** - Uses existing Tailwind theme tokens and shadcn/ui components
5. **No Overengineering** - Simple, focused implementation for resume-grade project

## 📦 Dependencies Used

All dependencies already exist in the project:
- React Router for routing
- shadcn/ui components (Button, Input, Label, Card, Checkbox, etc.)
- Tailwind CSS for styling
- lucide-react for icons
- Existing toast system for notifications
