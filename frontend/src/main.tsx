/**
 * Quran Twin - Frontend Entry
 * © 2026 Abdul-Quddus (@ghostscript0x). All rights reserved.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
