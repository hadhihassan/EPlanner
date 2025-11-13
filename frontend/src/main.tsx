import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import store from "./store/index";
import "./index.css";
import { Toaster } from "./components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <Toaster />
      <App />
    </BrowserRouter>
    <Toaster />
  </Provider>
);
