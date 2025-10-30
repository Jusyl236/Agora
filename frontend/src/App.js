import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CafeProvider } from "./context/CafeContext";
import Agora from "./pages/Agora";

function App() {
  return (
    <CafeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Agora />} />
        </Routes>
      </BrowserRouter>
    </CafeProvider>
  );
}

export default App;
