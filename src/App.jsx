import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Menu from "./Menu";
import Contact from "./Contact";
import AdminLogin from "./components/AdminLogin";
import Admin from "./components/Admin";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const maintenance = true;

  if (maintenance) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Burger Pub Munich</h1>
          <p className="mt-4 text-xl">
            Unsere Website wird derzeit aktualisiert.
          </p>
          <p className="mt-2 text-gray-400">
            Wir sind bald wieder für euch da! 🍔
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="w-full h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
