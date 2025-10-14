
import { Outlet } from "react-router-dom";
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
<Outlet/>    </div>
  );
};

export default Layout;