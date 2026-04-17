import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BitwiseTeacher from "./BitwiseTeacher.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BitwiseTeacher />
  </StrictMode>,
);
