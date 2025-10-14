import AuthCallback from "../features/auth/AuthCallback";

// Auth pages
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ForgotPassword from "../features/auth/ForgotPassword";
import ResetPassword from '../features/auth/ResetPassword';

const PublicRoutes =[
    { path: "login", component: Login },
    { path: "register", component: Register },
    { path: "forgot-password", component: ForgotPassword },
    { path: "auth/callback", component: AuthCallback },
    { path: "reset-password", component: ResetPassword },

]

export default PublicRoutes;
