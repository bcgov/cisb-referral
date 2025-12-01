import { Header, Footer } from "@bcgov/design-system-react-components";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Header title="CISB Admin" />
      <main className="main-content">
        <div className="content-container">
          <h1>CISB Admin</h1>
          <p>Admin dashboard for managing referrals.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
