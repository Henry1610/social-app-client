
import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/SideBar";
const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <Outlet/>
    </div>
  );
};

export default Layout;