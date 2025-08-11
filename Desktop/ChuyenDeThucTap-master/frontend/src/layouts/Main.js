import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import ProductPage from "./../components/pages/products/ProductPage";
import Wishlist from "./../components/pages/Wishlist";
import ShoppingCart from "./../components/pages/ShoppingCart";
import Checkout from "./../components/pages/Checkout";
import ProductDetail from "../components/pages/products/ProductDetail";
import News from "../components/pages/News";
import Contact from "../components/pages/Contact";
import Feedback from "../components/pages/Feedback";
import SearchResultPage from "../components/pages/SearchResultPage ";
const Main = () => (
  <main>
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route exact path="/product" element={<ProductPage />} />
      <Route exact path="/wishlist" element={<Wishlist />} />
      <Route exact path="/shopping-cart" element={<ShoppingCart />} />
      <Route exact path="/checkout" element={<Checkout />} />
      <Route exact path="/products/:productId" element={<ProductDetail />} />
      <Route exact path="/news" element={<News />} />
      <Route exact path="/contact" element={<Contact />} />
      <Route exact path="/feedback" element={<Feedback />} />
      <Route exact path="/search/:searchTerm" element={SearchResultPage} />
    </Routes>
  </main>
);

export default Main;
