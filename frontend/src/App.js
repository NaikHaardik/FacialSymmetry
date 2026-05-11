import { useState } from "react";
import LandingPage from "./LandingPage";
import AnalysisPage from "./AnalysisPage";

export default function App() {
  const [page, setPage] = useState("landing");
  return page === "landing"
    ? <LandingPage onEnter={() => setPage("analysis")} />
    : <AnalysisPage />;
}