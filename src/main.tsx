// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { HashRouter } from "react-router-dom"; // ✅ 추가

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>  {/* ✅ 여기서 라우팅 컨텍스트 적용 */}
      <App />
    </HashRouter>
  </React.StrictMode>
);
