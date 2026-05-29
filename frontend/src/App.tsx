import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RegisterPage from "./pages/RegisterPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import RegistrationDetailPage from "./pages/RegistrationDetailPage";

function App() {
  const [role, setRole] = useState<"customer" | "agent">("customer");

  return (
    <BrowserRouter>
      <Navbar role={role} onRoleChange={setRole} />
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/registrations" element={<RegistrationsPage />} />
        <Route path="/registrations/:id" element={<RegistrationDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
