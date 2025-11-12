import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/SideBar";
import BottomNavigationBar from "./BottomNavigationBar";

const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <Outlet/>
      <BottomNavigationBar />
    </div>
  );
};

export default Layout;