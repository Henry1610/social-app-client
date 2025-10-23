import Profile from "../pages/user/Profile";
import Home from "../pages/user/Home";
import ConversationList from "../pages/user/Chat";
const UserRoutes = [
  { path: "/", component: Home },
  {path: "/chat", component: ConversationList}, // Chat component can be nested within Home
  { path: "/:username", component: Profile },
]

export default UserRoutes;
