import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LinkedListsTeacher from "./LinkedListsTeacher.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LinkedListsTeacher />
  </StrictMode>,
);
