import AuthCallback from "../features/auth/components/AuthCallback";

// Auth pages
import Login from "../features/auth/components/Login";
import Register from "../features/auth/components/Register";
import ForgotPassword from "../features/auth/components/ForgotPassword";
import ResetPassword from '../features/auth/components/ResetPassword';

const PublicRoutes =[
    { path: "login", component: Login },
    { path: "register", component: Register },
    { path: "forgot-password", component: ForgotPassword },
    { path: "auth/callback", component: AuthCallback },
    { path: "reset-password", component: ResetPassword },

]

export default PublicRoutes;
