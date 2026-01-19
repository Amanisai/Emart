import React from "react";
import { Routes, Route } from "react-router-dom";

import "./App.css";
import SoftCursor from "./stores/components/SoftCursor";
import UserRoutes from "./stores/routes/UserRoutes";
import AdminRoutes from "./stores/routes/AdminRoutes";
import RoleSelectPage from "./stores/pages/RoleSelectPage";


const App = () => {
  return (
    <div>
      <SoftCursor />
      <Routes>
        <Route path="/" element={<RoleSelectPage />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </div>
  )
}

export default App