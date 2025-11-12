import Profile from "../pages/user/Profile";
import Home from "../pages/user/Home";
import Notifications from "../pages/user/Notifications";
import Search from "../pages/user/Search";
import ChatLayout from "../components/layouts/ChatLayout";
import ChatMain from "../features/chat/ChatMain";
import DefaultChat from "../features/chat/DefaultChat";
const UserRoutes = [
  { path: "/", component: Home },
  { path: "/notifications", component: Notifications },
  { path: "/search", component: Search },
  { path: "/:username", component: Profile },
  {
    path: "/chat",
    component: ChatLayout,
    children: [
      { path: "", component: DefaultChat },
      { path: ":conversationId", component: ChatMain },
    ],
  },
];

export default UserRoutes;
