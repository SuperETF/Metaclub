import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { HashRouter } from "react-router-dom";  // ✅ 추가

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>  {/* ✅ 여기로 감싸줘야 Hash URL 처리됨 */}
      <App />
    </HashRouter>
  </React.StrictMode>
);
