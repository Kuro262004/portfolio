import { Route, Routes, Link } from "react-router-dom";
import Footer from "./components/Footer";
import Toasts from "./components/Toasts";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { useLive } from "./lib/useLive";

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="etch text-5xl">404</h1>
      <p>Open circuit: nothing is connected to this address.</p>
      <Link to="/" className="btn-primary">Back to the board</Link>
    </main>
  );
}

export default function App() {
  useLive();
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <Toasts />
    </>
  );
}
