import { Header, Footer } from "@bcgov/design-system-react-components";
import { ReferralForm } from "./components/ReferralForm";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Header title="CISB Referral Portal" />
      <main className="main-content">
        <ReferralForm />
      </main>
      <Footer />
    </div>
  );
}

export default App;
