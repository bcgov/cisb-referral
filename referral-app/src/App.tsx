import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header, Footer } from "@bcgov/design-system-react-components";
import { ReferralForm } from "./components/ReferralForm";
import { ReferralSuccess } from "./pages";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header title="CISB Referral" />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ReferralForm />} />
            <Route path="/success" element={<ReferralSuccess />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
