import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BigOTeacher from "./BigOTeacher.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BigOTeacher />
  </StrictMode>,
);
