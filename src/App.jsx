import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import your page components
import Layout from "@/components/Layout.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import Therapist from "@/pages/Therapist.jsx";
import Gossip from "@/pages/Gossip.jsx";
import History from "@/pages/History.jsx";
import Nutrition from "@/pages/Nutrition.jsx";
import ScreenTime from "@/pages/ScreenTime.jsx";
import Meditation from "@/pages/Meditation.jsx";

// Import authentication components
import Login from "@/pages/auth/Login.jsx";
import SignUp from "@/pages/auth/Signup.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";

// THE OLD MOCK DATA IMPORTS HAVE BEEN REMOVED TO PREVENT CRASHES
// No more "@/entities/all.js", etc.

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* --- Protected Routes Group --- */}
        {/* This outer route guards all the main pages of your application. */}
        <Route element={<ProtectedRoute />}>
          
          {/* This Layout Route renders your main UI shell (sidebar, etc.). */}
          <Route path="/" element={<Layout />}>
            {/* The 'index' route is the default page for the '/' path (your dashboard). */}
            <Route index element={<Dashboard />} />
            
            {/* All other pages will also be rendered inside the main Layout. */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="therapist" element={<Therapist />} />
            <Route path="gossip" element={<Gossip />} />
            <Route path="history" element={<History />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="screentime" element={<ScreenTime />} />
            <Route path="meditation" element={<Meditation />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;