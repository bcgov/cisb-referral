import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components";
import {
  Referrals,
  ReferralDetail,
  Regions,
  Ministries,
  AgencyTypes,
} from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/referrals" replace />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="referrals/:id" element={<ReferralDetail />} />
          <Route path="regions" element={<Regions />} />
          <Route path="ministries" element={<Ministries />} />
          <Route path="agency-types" element={<AgencyTypes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
