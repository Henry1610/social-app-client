import Profile from "../pages/user/Profile";
import Home from "../pages/user/Home";
import ChatLayout from "../components/layouts/ChatLayout";
import ChatMain from "../features/chat/ChatMain";
import DefaultChat from "../features/chat/DefaultChat";
const UserRoutes = [
  { path: "/", component: Home },
  { path: "/:username", component: Profile },
  {
    path: "/chat",
    component: ChatLayout,
    children: [
      { path: "", component: DefaultChat },
      { path: ":conversationId", component: ChatMain },
    ],
  },
]

export default UserRoutes;
