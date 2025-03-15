import { BrowserRouter, Route, Routes } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import NewsAddScreen from "./pages/News";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/store" element={<Stock/>} />
        <Route path="/news" element={<NewsAddScreen />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;