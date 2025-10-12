import { Routes, Route, Navigate } from "react-router-dom";

// User pages
import HomePage from "../pages/HomePage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
};

export default UserRoutes;
