import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import Home from "./layouts/Home";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import ShoppingCart from "./components/pages/ShoppingCart";
import Wishlist from "./components/pages/Wishlist";
import ProductDetail from "./components/pages/products/ProductDetail";
import ProductPage from "./components/pages/products/ProductPage";
import Checkout from "./components/pages/Checkout";
import store from "./state/store";
import Admin from "./admin/Admin";
import ProductList from "./admin/components/Product/list.component";
import CreateProduct from "./admin/components/Product/create.component";
import EditProduct from "./admin/components/Product/edit.component";

import CategoryList from "./admin/components/Category/CategoryList";

import News from "./components/pages/News";
import Contact from "./components/pages/Contact";
import Feedback from "./components/pages/Feedback";
import SearchResultPage from "./components/pages/SearchResultPage ";
import QuickPage from "./components/pages/QuickPage";
import MyAccount from "./components/pages/MyAcount";
import MyOrder from "./components/pages/MyOrder";
import OrderAdmin from "./admin/components/Order/OrderAdmin";
import UserAdmin from "./admin/components/User/UserAdmin";

import AllProducts from "./components/pages/AllProducts";
import "./admin/components/thongKe/ThongKeDoanhThu";
import ThongKeDoanhThu from "./admin/components/thongKe/ThongKeDoanhThu";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "shopping-cart",
        element: <ShoppingCart />,
      },
      {
        path: "wishlist",
        element: <Wishlist />,
      },
      {
        path: "my-account",
        element: <MyAccount />,
      },
      {
        path: "track-my-order",
        element: <MyOrder />,
      },
      {
        path: "quickpage/:categoryId",
        element: <QuickPage />,
      },
      {
        path: "news",
        element: <News />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "products/:productId",
        element: <ProductDetail />,
      },
      {
        path: "product",
        element: <ProductPage />,
      },
      {
        path: "all-products",
        element: <AllProducts />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "feedback",
        element: <Feedback />,
      },
      {
        path: "search/:searchTerm",
        element: <SearchResultPage />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <Admin />,
    children: [
      {
        path: "thong_ke",
        element: <ThongKeDoanhThu />,
      },
      // {
      //   index: true,
      //   element: <ProductList />,
      // },
      {
        index: true,
        element: <ProductList />,
      },

      {
        path: "dashboard/product/create",
        element: <CreateProduct />,
      },
      {
        path: "dashboard/product/edit/:id",
        element: <EditProduct />,
      },
      {
        path: "/dashboard/category",
        element: <CategoryList />,
      },
      {
        path: "/dashboard/order",
        element: <OrderAdmin />,
      },
      {
        path: "/dashboard/customer",
        element: <UserAdmin />,
      },
    ],
  },
]);
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}></RouterProvider>
    </Provider>
  </React.StrictMode>
);
