import "./assets/sass/app.scss";
import QucikView from "./components/home/QuickView";
import Header from "./layouts/Header";
import Nav from "./layouts/Nav";
import Main from "./layouts/Main";
import AutoCapture from "./admin/components/AutoCapture";
import Footer from "./layouts/Footer";
import Reducer from "./store/Reducer";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { Outlet } from "react-router-dom";
import ChatBox from "./components/pages/ChatBox";
import "bootstrap/dist/css/bootstrap.min.css";

import React, { useState, useEffect } from "react";
const store = createStore(
  Reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
function App() {
  const [showChatBot, setShowChatBot] = useState(() => {
    const savedState = localStorage.getItem("showChatBot");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem("showChatBot", JSON.stringify(showChatBot));
  }, [showChatBot]);

  return (
    <div>
      <Provider store={store}>
        <QucikView />
        <Header />
        <Nav />

        <Outlet />
        {/* <NewsLetter /> */}
        <Footer />
        <AutoCapture />
        <button
          style={{
            position: "fixed",
            bottom: 60,
            right: 20,
            zIndex: 10000,
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#DB4916",
            color: "white",
            fontSize: 18,
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            cursor: "pointer",
            transition: "background 0.3s ease-in-out",
          }}
          onClick={() => setShowChatBot((prev) => !prev)}
          title={showChatBot ? "Ẩn Chatbot" : "Hiện Chatbot"}
        >
          {showChatBot ? "✖" : "💬"}
        </button>

        {showChatBot && (
          <div
            style={{
              position: "fixed",
              bottom: 110,
              right: 20,
              zIndex: 9998,
            }}
          >
            <ChatBox />
          </div>
        )}
      </Provider>
    </div>
  );
}

export default App;
