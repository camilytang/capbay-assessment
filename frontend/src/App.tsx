import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import RegistrationDetailPage from "./pages/RegistrationDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/registrations" element={<RegistrationsPage />} />
        <Route path="/registrations/:id" element={<RegistrationDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
