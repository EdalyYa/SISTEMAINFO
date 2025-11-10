import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ToastProvider } from "./components/ui";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ToastProvider position="top-right" maxToasts={5}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ToastProvider>
);
