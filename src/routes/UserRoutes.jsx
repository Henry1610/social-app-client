import Profile from "../features/Profile/Profile";
import Home from "../pages/Home";

const UserRoutes = [
  { path: "/", component: Home },
  { path: "/:username", component: Profile },

]

export default UserRoutes;
