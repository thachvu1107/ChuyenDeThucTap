import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../css/ChatBox.css";
import { Api } from "../../api/Api";
import { ImageApi } from "../../api/ImageApi";
import Fuse from "fuse.js";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const getAuth = async (token) => {
    try {
      console.log("🔐 Bắt đầu xác thực với token:", token);
      const response = await axios.get(`${Api}/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data.user;
      if (user) {
        console.log("✅ Xác thực thành công, user:", user);
        return { success: true, user };
      } else {
        console.warn("⚠️ Không tìm thấy user trong kết quả.");
        return {
          success: false,
          message: "Không tìm thấy thông tin người dùng.",
        };
      }
    } catch (error) {
      console.error("❌ Lỗi khi xác thực:", error.response || error.message);
      return {
        success: false,
        message:
          error.response?.status === 401
            ? "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
            : "Lỗi khi xác thực. Vui lòng thử lại.",
      };
    }
  };
  const getCartItems = async (token) => {
    let cartItems = [];
    if (token) {
      const authResult = await getAuth(token);
      if (!authResult.success) {
        return { success: false, message: authResult.message };
      }
      try {
        const response = await axios.get(`${Api}/product/cart-list/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        cartItems = response.data;
      } catch (error) {
        console.error("Error fetching cart:", error.response || error.message);
        return {
          success: false,
          message: "Có lỗi khi lấy thông tin giỏ hàng. Vui lòng thử lại!",
        };
      }
    } else {
      const localCartList = localStorage.getItem("cartList");
      if (localCartList) {
        try {
          const response = await axios.post(`${Api}/product/cart-list/guest`, {
            cartList: localCartList,
          });
          cartItems = response.data;
        } catch (error) {
          console.error(
            "Error fetching guest cart:",
            error.response || error.message
          );
          return {
            success: false,
            message: "Có lỗi khi lấy thông tin giỏ hàng. Vui lòng thử lại!",
          };
        }
      }
    }
    return { success: true, cartItems };
  };

  const getUserDefaultAddress = async (userId, token) => {
    try {
      const result = await axios.get(`${Api}/user/default-address/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (result.status === 200 && result.data) {
        const user = result.data.user;
        const defaultAddress =
          user.addresses && user.addresses.length > 0
            ? user.addresses[0]
            : null;
        if (defaultAddress) {
          return {
            success: true,
            address: {
              firstName: defaultAddress.firstname,
              lastName: defaultAddress.lastname,
              email: user.email,
              address: defaultAddress.address,
              city: defaultAddress.city,
              country: defaultAddress.country,
              zip: defaultAddress.zip,
              telephone: defaultAddress.telephone,
            },
          };
        }
      }
      return { success: false, message: "Không tìm thấy địa chỉ mặc định." };
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ mặc định:", error);
      return {
        success: false,
        message: "Lỗi khi lấy địa chỉ mặc định. Vui lòng thử lại!",
      };
    }
  };

  const createUserAddress = async (addressData) => {
    try {
      const response = await axios.post(
        `${Api}/user/create-user-address`,
        addressData
      );
      localStorage.setItem("token", response.data.token);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("Error creating user address:", error);
      return {
        success: false,
        message: "Không thể tạo địa chỉ. Vui lòng thử lại!",
      };
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${Api}/product`, {
        headers: { Accept: "application/json" },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(
        "Error fetching products:",
        error.response || error.message
      );
      return [];
    }
  };
  const searchProducts = async (searchTerm) => {
    try {
      console.log("Đầu vào", searchTerm);
      const response = await axios.post(`${Api}/search/chatbox`, {
        searchTerm: searchTerm,
      });

      console.log("Search API Response:", response.data.data);
      return response.data.data || [];
    } catch (error) {
      console.error(
        "Error searching products:",
        error.response || error.message
      );
      return [];
    }
  };

  const formatProductList = (products, limit = products.length) => {
    const limitedProducts = products.slice(0, limit);
    if (limitedProducts.length === 0) {
      return "Không có sản phẩm nào để hiển thị.";
    }
    let response = `<table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #ddd;">
          <th>ID</th><th>Tên sản phẩm</th><th>Hình ảnh</th><th>Danh mục</th><th>Thương hiệu</th><th>Giá</th>
        </tr>
      </thead>
      <tbody>`;
    limitedProducts.forEach((product) => {
      response += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td>${product.id}</td>
          <td><a href="/dashboard/product/edit/${product.id}" target="_blank">${
        product.name
      }</a></td>
          <td><img src="${ImageApi}/img/${product.photo}" alt="${
        product.name
      }" style="width:50px;" /></td>
          <td>${product.category?.name || "-"}</td>
          <td>${product.brand || "-"}</td>
          <td>${product.price}</td>
        </tr>`;
    });
    response += `</tbody></table>`;
    return response;
  };

  const formatProductDetails = (product) => {
    return `
      <div>
        <h3>Chi tiết sản phẩm: <a href="/dashboard/product/edit/${
          product.id
        }" target="_blank">${product.name}</a></h3>
        <p><strong>ID:</strong> ${product.id}</p>
        <p><strong>Tên sản phẩm:</strong> ${product.name}</p>
        <p><strong>Hình ảnh:</strong> <img src="${ImageApi}/img/${
      product.photo
    }" alt="${product.name}" style="width:100px;" /></p>
        <p><strong>Danh mục:</strong> ${product.category?.name || "-"}</p>
        <p><strong>Thương hiệu:</strong> ${product.brand || "-"}</p>
        <p><strong>Giá:</strong> ${product.price}</p>
        <p><strong>Chi tiết:</strong> ${product.description || "-"}</p>
        <p><strong>Kích thước:</strong> ${
          product.stocks?.length > 0 ? product.stocks[0].size : "-"
        }</p>
        <p><strong>Màu sắc:</strong> ${
          product.stocks?.length > 0 ? product.stocks[0].color : "-"
        }</p>
        <p><strong>Số lượng:</strong> ${
          product.stocks?.length > 0 ? product.stocks[0].quantity : "-"
        }</p>
      </div>`;
  };

  const formatCartList = (cartItems) => {
    if (!cartItems || cartItems.length === 0) {
      return "Giỏ hàng của bạn hiện đang trống. Hãy thêm sản phẩm bằng lệnh: 'thêm vào giỏ hàng id [số] kích thước [size] màu [color] số lượng [số]'.";
    }

    let subtotal = 0;
    cartItems.forEach((item) => {
      subtotal += item.stock.product.price * item.quantity;
    });

    let response = `<table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #ddd;">
          <th>ID</th><th>Tên sản phẩm</th><th>Hình ảnh</th><th>Kích thước</th><th>Màu sắc</th><th>Số lượng</th><th>Giá</th><th>Tổng</th>
        </tr>
      </thead>
      <tbody>`;
    cartItems.forEach((item) => {
      const totalPrice = item.stock.product.price * item.quantity;
      response += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td>${item.id}</td>
          <td><a href="/products/${item.stock.product.id}" target="_blank">${
        item.stock.product.name
      }</a></td>
          <td><img src="${ImageApi}/img/${item.stock.product.photo}" alt="${
        item.stock.product.name
      }" style="width:50px;" /></td>
          <td>${item.stock.size}</td>
          <td>${item.stock.color}</td>
          <td>${item.quantity}</td>
          <td>${item.stock.product.price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}</td>
          <td>${totalPrice.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}</td>
        </tr>`;
    });
    response += `</tbody></table>`;
    response += `<p><strong>Tổng cộng:</strong> ${subtotal.toLocaleString(
      "vi-VN",
      { style: "currency", currency: "VND" }
    )}</p>`;
    response += `<p><a href="/checkout">Tiến hành thanh toán</a></p>`;
    return response;
  };

  const formatOrderSummary = (cartItems, address) => {
    const summary = formatCartList(cartItems);
    const addressDetails = `
      <p><strong>Địa chỉ giao hàng:</strong></p>
      <p>Họ tên: ${address.firstName} ${address.lastName}</p>
      <p>Địa chỉ: ${address.address}, ${address.city}, ${address.country}</p>
      <p>Mã ZIP: ${address.zip}</p>
      <p>Số điện thoại: ${address.telephone}</p>
    `;
    return `${summary}${addressDetails}<p>Bạn có chắc chắn muốn đặt hàng không? Hãy trả lời 'oke', 'có', hoặc 'rồi' để tiếp tục.</p>`;
  };

  const isAddressValid = (address) => {
    const requiredFields = [
      "firstName",
      "lastName",
      "address",
      "city",
      "country",
      "zip",
      "telephone",
    ];
    return requiredFields.every(
      (field) => address[field] && address[field].trim() !== ""
    );
  };

  const parseAddress = (input) => {
    const parts = input.split(",").map((part) => part.trim());
    if (parts.length < 6) return null;
    return {
      firstName: parts[0].split(" ").slice(0, -1).join(" ") || "Unknown",
      lastName: parts[0].split(" ").slice(-1)[0] || "Unknown",
      address: parts[1],
      city: parts[2],
      country: parts[3],
      zip: parts[4],
      telephone: parts[5],
    };
  };

  const createOrder = async (token, cartItems, address, method) => {
    const userId = parseInt(localStorage.getItem("userId"), 10);
    const orderItems = cartItems.map((item) => ({
      product_id: item.stock.product.id,
      quantity: item.quantity,
      name: item.stock.product.name,
      image: item.stock.product.photo,
      size: item.stock.size,
      color: item.stock.color,
      price: item.stock.product.price * item.quantity,
    }));

    const total = cartItems.reduce(
      (sum, item) => sum + item.stock.product.price * item.quantity,
      0
    );

    const orderData = {
      user_id: userId,
      order_items: orderItems,
      note: "",
      total,
      method,
    };

    try {
      await axios.post(`${Api}/order`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await axios.delete(`${Api}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem(`flagChat:${userId}`);
      localStorage.removeItem(`flagChatState:${userId}`);
      localStorage.removeItem("selectedItems");

      return { success: true, message: "Đặt hàng thành công!" };
    } catch (error) {
      console.error(`${method} order error:`, error);
      return {
        success: false,
        message: "Đặt hàng không thành công! Vui lòng thử lại.",
      };
    }
  };

  const initiateVNPayPayment = async (token, total) => {
    const paymentData = {
      amount: total,
      orderId: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      returnUrl: `http://localhost:3000/checkout`,
    };

    try {
      const response = await axios.post(`${Api}/vnpay`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.code === "00" && response.data.data) {
        return { success: true, paymentUrl: response.data.data };
      }
      return {
        success: false,
        message: "Không thể khởi tạo thanh toán VNPay. Vui lòng thử lại!",
      };
    } catch (error) {
      console.error("VNPay payment error:", error);
      return {
        success: false,
        message: "Đã xảy ra lỗi khi xử lý thanh toán VNPay. Vui lòng thử lại!",
      };
    }
  };

  const removeDiacritics = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };
  const token = localStorage.getItem("token");

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");

      const flagChatKey = `flagChat:${userId}`;

      const flagChatStateKey = `flagChatState:${userId}`;
      let orderState = JSON.parse(localStorage.getItem(flagChatStateKey)) || {};

      if (orderState.stage) {
        const lowerInput = input.toLowerCase().trim();
        const normalizedInput = removeDiacritics(lowerInput);

        if (orderState.stage === "awaiting") {
          const address = parseAddress(input);
          if (!address || !isAddressValid(address)) {
            setMessages((prev) => [
              ...prev,
              {
                role: "bot",
                content:
                  "Địa chỉ cung cấp đầy đủ: Họ tên, Địa chỉ, Thành phố, Quốc gia, Mã ZIP, Số điện thoại (cách nhau bằng dấu phẩy). Ví dụ: 'Nguyen Van A, 123 Đường Láng, Hà Nội, Việt Nam, 100000, 0123456789'. Nếu chưa có tài khoản, thêm email, mật khẩu, xác nhận mật khẩu. Ví dụ: 'Nguyen Van A, 123 Đường Láng, Hà Nội, Việt Nam, 100000, 0123456789, a@example.com, pass123, pass123'.",
              },
            ]);
            return;
          }

          if (!token) {
            if (
              !address.email ||
              !address.password ||
              !address.passwordConfirm
            ) {
              setMessages((prev) => [
                ...prev,
                {
                  role: "bot",
                  content:
                    "Vui lòng cung cấp email, mật khẩu và xác nhận mật khẩu để tạo tài khoản. Ví dụ: 'Nguyen Van A, 123 Đường Láng, Hà Nội, Việt Nam, 100000, 0123456789, a@example.com, pass123, pass123'.",
                },
              ]);
              return;
            }

            const createResult = await createUserAddress({
              firstName: address.firstName,
              lastName: address.lastName,
              email: address.email,
              address: address.address,
              city: address.city,
              country: address.country,
              zip: address.zip,
              telephone: address.telephone,
              password: address.password,
              passwordConfirm: address.passwordConfirm,
              localCartList: localStorage.getItem("cartList"),
            });

            if (!createResult.success) {
              setMessages((prev) => [
                ...prev,
                { role: "bot", content: createResult.message },
              ]);
              return;
            }

            localStorage.setItem("userId", createResult.user.id);
          } else {
            const createResult = await createUserAddress({
              firstName: address.firstName,
              lastName: address.lastName,
              address: address.address,
              city: address.city,
              country: address.country,
              zip: address.zip,
              telephone: address.telephone,
            });

            if (!createResult.success) {
              setMessages((prev) => [
                ...prev,
                { role: "bot", content: createResult.message },
              ]);
              return;
            }
          }

          orderState = {
            ...orderState,
            stage: "awaiting_confirmation",
            address,
          };
          localStorage.setItem(flagChatStateKey, JSON.stringify(orderState));

          const cartItems = JSON.parse(localStorage.getItem(flagChatKey)) || [];
          const reply = formatOrderSummary(cartItems, address);
          setMessages((prev) => [...prev, { role: "bot", content: reply }]);
          return;
        }

        if (orderState.stage === "awaiting_confirmation") {
          if (["oke", "co", "roi"].includes(normalizedInput)) {
            orderState = {
              ...orderState,
              stage: "awaiting_payment",
            };
            localStorage.setItem(flagChatStateKey, JSON.stringify(orderState));
            setMessages((prev) => [
              ...prev,
              {
                role: "bot",
                content:
                  "Chọn phương thức thanh toán: 1. Tiền mặt khi nhận hàng, 2. Thanh toán VNPay. Hãy trả lời 'tiền mặt' hoặc 'vnpay'.",
              },
            ]);
            return;
          }

          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content:
                "Vui lòng xác nhận bằng cách trả lời 'oke', 'có', hoặc 'rồi' để tiếp tục đặt hàng.",
            },
          ]);
          return;
        }

        if (orderState.stage === "awaiting_payment") {
          if (["tien mat", "tiền mặt"].includes(normalizedInput)) {
            if (!token) {
              setMessages((prev) => [
                ...prev,
                {
                  role: "bot",
                  content: `Bạn cần <a href="/login">đăng nhập</a> để đặt hàng!`,
                },
              ]);
              localStorage.removeItem(flagChatKey);
              localStorage.removeItem(flagChatStateKey);
              return;
            }

            const cartItems =
              JSON.parse(localStorage.getItem(flagChatKey)) || [];
            const result = await createOrder(
              token,
              cartItems,
              orderState.address,
              "COD"
            );
            setMessages((prev) => [
              ...prev,
              { role: "bot", content: result.message },
            ]);
            return;
          }

          if (["vnpay"].includes(normalizedInput)) {
            if (!token) {
              setMessages((prev) => [
                ...prev,
                {
                  role: "bot",
                  content: `Bạn cần <a href="/login">đăng nhập</a> để đặt hàng!`,
                },
              ]);
              localStorage.removeItem(flagChatKey);
              localStorage.removeItem(flagChatStateKey);
              return;
            }

            const cartItems =
              JSON.parse(localStorage.getItem(flagChatKey)) || [];
            const total = cartItems.reduce(
              (sum, item) => sum + item.stock.product.price * item.quantity,
              0
            );
            const result = await initiateVNPayPayment(token, total);
            if (result.success) {
              const selectedItems = cartItems.map((item) => ({
                productId: item.stock.product.id,
                quantity: item.quantity,
                name: item.stock.product.name,
                photo: item.stock.product.photo,
                size: item.stock.size,
                color: item.stock.color,
                price: item.stock.product.price,
              }));
              localStorage.setItem(
                "selectedItems",
                JSON.stringify(selectedItems)
              );
              localStorage.setItem("total", total);
              window.location.href = result.paymentUrl;
            } else {
              setMessages((prev) => [
                ...prev,
                { role: "bot", content: result.message },
              ]);
              localStorage.removeItem(flagChatKey);
              localStorage.removeItem(flagChatStateKey);
            }
            return;
          }

          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content:
                "Vui lòng chọn 'tiền mặt' hoặc 'vnpay' để tiếp tục thanh toán.",
            },
          ]);
          return;
        }
      }
      const lowerInput = input.toLowerCase().trim();
      const normalizedInput = removeDiacritics(lowerInput); // Normalize input
      const patterns = [
        { key: "chao", action: "greeting" },
        { key: "hi", action: "greeting" },
        { key: "tim san pham", action: "searchProducts" },
        { key: "tìm", action: "searchProducts" },
        { key: "xem san pham", action: "searchProducts" }, // Thêm "xem sản phẩm"
        { key: "xem", action: "searchProducts" }, // Thêm "xem"
        { key: "chi tiet san pham", action: "productDetails" },

        { key: "gia cao nhat", action: "highestPrice" },
        { key: "gia thap nhat", action: "lowestPrice" },
        { key: "tìm xe dap", action: "searchProducts" }, // Add specific pattern
        { key: "tim xe", action: "searchProducts" },
        { key: "giỏ hàng", action: "cartProduct" },
        { key: "thêm ", action: "cartProduct" },
        { key: "xem giỏ hàng ", action: "cartList" },
        { key: "giỏ hang của tôi ", action: "cartList" },
        { key: "số sản phẩm trong giỏ hàng", action: "countCartItems" },
        { key: "xóa sản phẩm", action: "removeCartItem" },
        { key: "tăng số lượng sản phẩm", action: "increaseCartItemQuantity" },
        { key: "giảm số lượng sản phẩm", action: "decreaseCartItemQuantity" },

        { key: "mua hang", action: "orderProduct" },
        { key: "dat hang", action: "orderProduct" },
      ];

      const fuse = new Fuse(patterns, {
        keys: ["key"],
        threshold: 0.8, // 0.3 có thể quá nghiêm ngặt
        ignoreLocation: true,
        normalize: true,
        includeScore: true,
      });

      const result = fuse.search(normalizedInput); // Use normalized input
      const matchedPattern = result.length > 0 ? result[0].item : null;

      // console.log(
      //   "Input:",
      //   lowerInput,
      //   "Normalized:",
      //   normalizedInput,
      //   "Matched:",
      //   matchedPattern
      // ); // Debug log

      if (matchedPattern) {
        switch (matchedPattern.action) {
          case "greeting": {
            const reply = `Chào bạn! 😊 Tôi là TIENDO#STORE Chatbot, hỗ trợ bạn mua sắm dễ dàng! Bạn có thể:
- Tìm sản phẩm: "tìm xe"
- Xem chi tiết: "chi tiết sản phẩm id [số]"
- Quản lý giỏ hàng: "thêm vào giỏ hàng id [số] kích thước [size] màu [color] số lượng [số]", "xóa sản phẩm id [số]", "tăng/giảm số lượng sản phẩm id [số] số lượng [số]"
- Xem giỏ hàng: "xem giỏ hàng" hoặc "số sản phẩm trong giỏ hàng"
- Đặt hàng: "đặt hàng"
Hãy hỏi bất kỳ câu gì, tôi sẽ giúp ngay!`;
            setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            return;
          }

          case "productDetails": {
            const productIdMatch = lowerInput.match(
              /(?:id|sp|sản phẩm(?:\s+id)?)(?:\s*[:=]?\s*|\s+là\s+)(\d+)/i
            );
            const productNameMatch = lowerInput.match(
              /tên\s*[:=]?\s*([\w\s]+)/i
            );
            let foundProduct = null;

            if (productIdMatch) {
              const productId = productIdMatch[1];
              try {
                const res = await axios.get(`${Api}/products/${productId}`);
                foundProduct = res.data;
              } catch (error) {
                console.error("Error fetching product by ID:", error);
                foundProduct = null;
              }
            } else if (productNameMatch) {
              const productName = productNameMatch[1].trim();
              const products = await fetchProducts();
              foundProduct = products.find((p) =>
                p.name.toLowerCase().includes(productName.toLowerCase())
              );
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  role: "bot",
                  content:
                    'Bạn muốn xem chi tiết sản phẩm nào? Vui lòng nhập theo cú pháp:\n- "chi tiết sản phẩm id [số]"\n- hoặc "chi tiết sản phẩm tên [tên sản phẩm]"',
                },
              ]);
              return;
            }

            if (foundProduct) {
              const reply = formatProductDetails(foundProduct);
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  role: "bot",
                  content: `Không tìm thấy sản phẩm với ID hoặc tên đã cung cấp. Vui lòng kiểm tra lại hoặc thử nhập: "chi tiết sản phẩm id [số]" hoặc "chi tiết sản phẩm tên [tên sản phẩm]".`,
                },
              ]);
            }
            return;
          }

          case "searchProducts": {
            let lowerInput = input.toLowerCase();
            let searchInput;
            if (
              lowerInput === "xem" ||
              lowerInput === "sp" ||
              lowerInput === "sản phẩm" ||
              lowerInput === "xem sản phẩm"
            ) {
              searchInput = null; // tìm tất cả sản phẩm
            } else {
              searchInput = lowerInput
                .replace("tìm sản phẩm", "")
                .replace("tìm", "")
                .replace("xem sản phẩm", "")
                .replace("xem", "")
                .trim();

              // Nếu sau khi loại bỏ từ khóa mà rỗng => yêu cầu nhập lại
              if (!searchInput) {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "bot",
                    content:
                      'Vui lòng cung cấp từ khóa tìm kiếm. Ví dụ: "tìm áo sơ mi", "xem quần jeans", hoặc "tìm sản phẩm áo".',
                  },
                ]);
                return;
              }
            }
            console.log("Dữ liệu trả đi:", searchInput); // Debug log

            const products = await searchProducts(searchInput);
            console.log("Dữ liệu trả về:", products); // Debug log

            if (products.length === 0) {
              setMessages((prev) => [
                ...prev,
                {
                  role: "bot",
                  content: `Không tìm thấy sản phẩm nào với từ khóa "${searchInput}". Hãy thử từ khóa khác như "áo sơ mi" hoặc "quần jeans"!`,
                },
              ]);
              return;
            }

            const reply = formatProductList(products, 6);
            setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            return;
          }

          case "highestPrice": {
            const products = await fetchProducts();
            if (products.length === 0) {
              setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Không tìm thấy sản phẩm nào." },
              ]);
              return;
            }
            const highest = products.reduce((max, p) =>
              p.price > max.price ? p : max
            );
            const reply = formatProductDetails(highest);
            setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            return;
          }

          case "lowestPrice": {
            const products = await fetchProducts();
            if (products.length === 0) {
              setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Không tìm thấy sản phẩm nào." },
              ]);
              return;
            }
            const lowest = products.reduce((min, p) =>
              p.price < min.price ? p : min
            );
            const reply = formatProductDetails(lowest);
            setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            return;
          }

          case "cartProduct": {
            const token = localStorage.getItem("token");
            if (!token) {
              const reply = `Bạn cần <a href="/login">đăng nhập</a> để thêm vào giỏ hàng!`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            const authResult = await getAuth(token);
            if (!authResult.success) {
              const reply = `⚠️ ${authResult.message} Vui lòng <a href="/login">đăng nhập lại</a>.`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            // Parse input for product ID, size, color, and quantity
            const productIdMatch = lowerInput.match(
              /(?:id|sp|sản phẩm(?:\s+id)?)(?:\s*[:=]?\s*|\s+là\s+)(\d+)/i
            );
            const sizeMatch = lowerInput.match(
              /(?:kích thước|size)\s*[:=]?\s*([\w\s]+)/i
            );
            const colorMatch = lowerInput.match(
              /(?:màu sắc|màu|color)\s*[:=]?\s*([\w\s]+)/i
            );
            const quantityMatch = lowerInput.match(
              /(?:số lượng|so luong|sl|quantity)\s*[:=]?\s*(\d+)/i
            );

            if (!productIdMatch) {
              const reply = `Vui lòng cung cấp ID sản phẩm để thêm vào giỏ hàng. Ví dụ: "thêm vào giỏ hàng sp [số]".`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            const productId = productIdMatch[1];
            const size = sizeMatch ? sizeMatch[1].trim() : null;
            const color = colorMatch ? colorMatch[1].trim() : null;
            const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

            if (quantity > 10) {
              const reply = `Số lượng tối đa cho mỗi sản phẩm trong giỏ hàng là 10. Vui lòng chọn số lượng từ 1 đến 10.`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            try {
              // Fetch product details
              const res = await axios.get(`${Api}/products/${productId}`);
              const product = res.data;
              const stocks = product.stocks || [];

              if (!stocks.length) {
                const reply = `Sản phẩm với ID ${productId} không có sẵn trong kho. Vui lòng kiểm tra lại.`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              // Find matching stock
              let stock = stocks.find(
                (item) =>
                  (!size || item.size === size) &&
                  (!color || item.color === color)
              );

              if (!stock && (!size || !color)) {
                stock = stocks[0]; // Default to first stock if size/color not specified
              }

              if (!stock) {
                const reply = `Không tìm thấy sản phẩm với kích thước "${size}" và màu "${color}". Vui lòng kiểm tra lại hoặc xem chi tiết sản phẩm bằng "chi tiết sản phẩm id ${productId}".`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }
              if (quantity > stock.quantity) {
                const reply = `Số lượng yêu cầu (${quantity}) vượt quá số lượng có sẵn (${stock.quantity}) cho sản phẩm "${product.name}" (kích thước: ${stock.size}, màu: ${stock.color}).`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              if (quantity > stock.quantity) {
                const reply = `Số lượng yêu cầu (${quantity}) vượt quá số lượng có sẵn (${stock.quantity}) cho sản phẩm "${product.name}" (kích thước: ${stock.size}, màu: ${stock.color}).`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              // Add to cart (authenticated user)
              let reply;
              try {
                const response = await axios.post(
                  `${Api}/product/cart-list`,
                  {
                    stockId: stock.id,
                    quantity: quantity,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                reply = `Đã thêm <strong>${product.name}</strong> (kích thước: ${stock.size}, màu: ${stock.color}, số lượng: ${quantity}) vào giỏ hàng!`;
              } catch (error) {
                console.error(
                  "Error adding to cart:",
                  error.response || error.message
                );
                reply = `Có lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            } catch (error) {
              console.error(
                "Error fetching product:",
                error.response || error.message
              );
              const reply = `Không tìm thấy sản phẩm với ID ${productId}. Vui lòng kiểm tra lại hoặc nhập "chi tiết sản phẩm id [số]".`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            }
            return;
          }

          case "cartList": {
            const token = localStorage.getItem("token");
            const cartResult = await getCartItems(token);
            let reply;

            if (!cartResult.success) {
              reply =
                cartResult.message +
                (token ? ` Vui lòng <a href="/login">đăng nhập lại</a>.` : "");
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            reply = formatCartList(cartResult.cartItems);
            setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            return;
          }

          case "countCartItems": {
            const token = localStorage.getItem("token");
            const cartResult = await getCartItems(token);
            let reply;

            if (!cartResult.success) {
              reply =
                cartResult.message +
                (token ? ` Vui lòng <a href="/login">đăng nhập lại</a>.` : "");
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            const count = cartResult.cartItems.length;
            reply = `Giỏ hàng của bạn hiện có <strong>${count}</strong> sản phẩm. Để xem chi tiết, hãy nói: "xem giỏ hàng".`;
            setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            return;
          }

          case "removeCartItem": {
            const token = localStorage.getItem("token");
            const cartIdMatch = lowerInput.match(
              /(?:id|sp|sản phẩm(?:\s+id)?)(?:\s*[:=]?\s*|\s+là\s+)(\d+)/i
            );

            if (!cartIdMatch) {
              const reply = `Vui lòng cung cấp ID sản phẩm trong giỏ hàng để xóa. Ví dụ: "xóa sản phẩm id [số]".`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            const cartId = parseInt(cartIdMatch[1]);
            let reply;

            if (token) {
              const authResult = await getAuth(token);
              if (!authResult.success) {
                reply = `⚠️ ${authResult.message} Vui lòng <a href="/login">đăng nhập lại</a>.`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              try {
                const cartResult = await getCartItems(token);
                if (!cartResult.success) {
                  reply = cartResult.message;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                const cartItem = cartResult.cartItems.find(
                  (item) => item.id === cartId
                );
                if (!cartItem) {
                  reply = `Không tìm thấy sản phẩm với ID ${cartId} trong giỏ hàng. Hãy kiểm tra lại hoặc xem giỏ hàng bằng "xem giỏ hàng".`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                await axios.delete(`${Api}/product/cart-list/${cartId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                const updatedCartResult = await getCartItems(token);
                reply = `Đã xóa sản phẩm <strong>${
                  cartItem.stock.product.name
                }</strong> khỏi giỏ hàng. Dưới đây là giỏ hàng hiện tại:\n${formatCartList(
                  updatedCartResult.cartItems
                )}`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
              } catch (error) {
                console.error(
                  "Error removing cart item:",
                  error.response || error.message
                );
                reply = `Có lỗi khi xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại!`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }
            } else {
              const localCartList = localStorage.getItem("cartList");
              if (!localCartList) {
                reply = `Giỏ hàng của bạn hiện đang trống. Hãy thêm sản phẩm bằng lệnh: "thêm vào giỏ hàng id [số] kích thước [size] màu [color] số lượng [số]".`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              try {
                const response = await axios.post(
                  `${Api}/product/cart-list/guest`,
                  {
                    cartList: localCartList,
                  }
                );
                const cartItems = response.data;
                const cartItem = cartItems.find((item) => item.id === cartId);

                if (!cartItem) {
                  reply = `Không tìm thấy sản phẩm với ID ${cartId} trong giỏ hàng. Hãy kiểm tra lại hoặc xem giỏ hàng bằng "xem giỏ hàng".`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                let items = JSON.parse(localCartList);
                items = items.filter((item, index) => index + 1 !== cartId);
                localStorage.setItem("cartList", JSON.stringify(items));

                const updatedResponse = await axios.post(
                  `${Api}/product/cart-list/guest`,
                  {
                    cartList: JSON.stringify(items),
                  }
                );
                reply = `Đã xóa sản phẩm <strong>${
                  cartItem.stock.product.name
                }</strong> khỏi giỏ hàng. Dưới đây là giỏ hàng hiện tại:\n${formatCartList(
                  updatedResponse.data
                )}`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
              } catch (error) {
                console.error(
                  "Error removing guest cart item:",
                  error.response || error.message
                );
                reply = `Có lỗi khi xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại!`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }
            }
            return;
          }

          case "increaseCartItemQuantity": {
            const token = localStorage.getItem("token");
            const cartIdMatch = lowerInput.match(
              /(?:id|sp|sản phẩm(?:\s+id)?)(?:\s*[:=]?\s*|\s+là\s+)(\d+)/i
            );
            const quantityMatch = lowerInput.match(
              /(?:số lượng|sl|quantity)\s*[:=]?\s*(\d+)/i
            );

            if (!cartIdMatch) {
              const reply = `Vui lòng cung cấp ID sản phẩm trong giỏ hàng để tăng số lượng. Ví dụ: "tăng số lượng sản phẩm id [số] số lượng [số]".`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            const cartId = parseInt(cartIdMatch[1]);
            const quantityIncrement = quantityMatch
              ? parseInt(quantityMatch[1])
              : 1;
            let reply;

            if (token) {
              const authResult = await getAuth(token);
              if (!authResult.success) {
                reply = `⚠️ ${authResult.message} Vui lòng <a href="/login">đăng nhập lại</a>.`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              try {
                const cartResult = await getCartItems(token);
                if (!cartResult.success) {
                  reply = cartResult.message;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                const cartItem = cartResult.cartItems.find(
                  (item) => item.id === cartId
                );
                if (!cartItem) {
                  reply = `Không tìm thấy sản phẩm với ID ${cartId} trong giỏ hàng. Hãy kiểm tra lại hoặc xem giỏ hàng bằng "xem giỏ hàng".`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                const newQuantity = cartItem.quantity + quantityIncrement;
                if (newQuantity > 10) {
                  reply = `Số lượng tối đa cho mỗi sản phẩm trong giỏ hàng là 10. Hiện tại sản phẩm <strong>${cartItem.stock.product.name}</strong> có ${cartItem.quantity} đơn vị.`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }
                if (newQuantity > cartItem.stock.quantity) {
                  reply = `Số lượng yêu cầu (${newQuantity}) vượt quá số lượng có sẵn (${cartItem.stock.quantity}) cho sản phẩm <strong>${cartItem.stock.product.name}</strong>.`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                await axios.put(
                  `${Api}/product/cart-list/${cartId}`,
                  { quantity: newQuantity },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                const updatedCartResult = await getCartItems(token);
                reply = `Đã tăng số lượng sản phẩm <strong>${
                  cartItem.stock.product.name
                }</strong> lên ${newQuantity}. Dưới đây là giỏ hàng hiện tại:\n${formatCartList(
                  updatedCartResult.cartItems
                )}`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
              } catch (error) {
                console.error(
                  "Error increasing cart item quantity:",
                  error.response || error.message
                );
                reply = `Có lỗi khi tăng số lượng sản phẩm. Vui lòng thử lại!`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }
            } else {
              const localCartList = localStorage.getItem("cartList");
              if (!localCartList) {
                reply = `Giỏ hàng của bạn hiện đang trống. Hãy thêm sản phẩm bằng lệnh: "thêm vào giỏ hàng id [số] kích thước [size] màu [color] số lượng [số]".`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              try {
                const response = await axios.post(
                  `${Api}/product/cart-list/guest`,
                  {
                    cartList: localCartList,
                  }
                );
                const cartItems = response.data;
                const cartItem = cartItems.find((item) => item.id === cartId);

                if (!cartItem) {
                  reply = `Không tìm thấy sản phẩm với ID ${cartId} trong giỏ hàng. Hãy kiểm tra lại hoặc xem giỏ hàng bằng "xem giỏ hàng".`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                const newQuantity = cartItem.quantity + quantityIncrement;
                if (newQuantity > 10) {
                  reply = `Số lượng tối đa cho mỗi sản phẩm trong giỏ hàng là 10. Hiện tại sản phẩm <strong>${cartItem.stock.product.name}</strong> có ${cartItem.quantity} đơn vị.`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }
                if (newQuantity > cartItem.stock.quantity) {
                  reply = `Số lượng yêu cầu (${newQuantity}) vượt quá số lượng có sẵn (${cartItem.stock.quantity}) cho sản phẩm <strong>${cartItem.stock.product.name}</strong>.`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                let items = JSON.parse(localCartList);
                items = items.map((item, index) => {
                  if (index + 1 === cartId) {
                    return [{ ...item[0], quantity: newQuantity }];
                  }
                  return item;
                });
                localStorage.setItem("cartList", JSON.stringify(items));

                const updatedResponse = await axios.post(
                  `${Api}/product/cart-list/guest`,
                  {
                    cartList: JSON.stringify(items),
                  }
                );
                reply = `Đã tăng số lượng sản phẩm <strong>${
                  cartItem.stock.product.name
                }</strong> lên ${newQuantity}. Dưới đây là giỏ hàng hiện tại:\n${formatCartList(
                  updatedResponse.data
                )}`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
              } catch (error) {
                console.error(
                  "Error increasing guest cart item quantity:",
                  error.response || error.message
                );
                reply = `Có lỗi khi tăng số lượng sản phẩm. Vui lòng thử lại!`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }
            }
            return;
          }

          case "decreaseCartItemQuantity": {
            const token = localStorage.getItem("token");
            const cartIdMatch = lowerInput.match(
              /(?:id|sp|sản phẩm(?:\s+id)?)(?:\s*[:=]?\s*|\s+là\s+)(\d+)/i
            );
            const quantityMatch = lowerInput.match(
              /(?:số lượng|sl|quantity)\s*[:=]?\s*(\d+)/i
            );

            if (!cartIdMatch) {
              const reply = `Vui lòng cung cấp ID sản phẩm trong giỏ hàng để giảm số lượng. Ví dụ: "giảm số lượng sản phẩm id [số] số lượng [số]".`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            const cartId = parseInt(cartIdMatch[1]);
            const quantityDecrement = quantityMatch
              ? parseInt(quantityMatch[1])
              : 1;
            let reply;

            if (token) {
              const authResult = await getAuth(token);
              if (!authResult.success) {
                reply = `⚠️ ${authResult.message} Vui lòng <a href="/login">đăng nhập lại</a>.`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              try {
                const cartResult = await getCartItems(token);
                if (!cartResult.success) {
                  reply = cartResult.message;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                const cartItem = cartResult.cartItems.find(
                  (item) => item.id === cartId
                );
                if (!cartItem) {
                  reply = `Không tìm thấy sản phẩm với ID ${cartId} trong giỏ hàng. Hãy kiểm tra lại hoặc xem giỏ hàng bằng "xem giỏ hàng".`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                const newQuantity = cartItem.quantity - quantityDecrement;
                if (newQuantity <= 0) {
                  await axios.delete(`${Api}/product/cart-list/${cartId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  const updatedCartResult = await getCartItems(token);
                  reply = `Đã xóa sản phẩm <strong>${
                    cartItem.stock.product.name
                  }</strong> khỏi giỏ hàng vì số lượng bằng 0. Dưới đây là giỏ hàng hiện tại:\n${formatCartList(
                    updatedCartResult.cartItems
                  )}`;
                } else {
                  await axios.put(
                    `${Api}/product/cart-list/${cartId}`,
                    { quantity: newQuantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  const updatedCartResult = await getCartItems(token);
                  reply = `Đã giảm số lượng sản phẩm <strong>${
                    cartItem.stock.product.name
                  }</strong> xuống ${newQuantity}. Dưới đây là giỏ hàng hiện tại:\n${formatCartList(
                    updatedCartResult.cartItems
                  )}`;
                }
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
              } catch (error) {
                console.error(
                  "Error decreasing cart item quantity:",
                  error.response || error.message
                );
                reply = `Có lỗi khi giảm số lượng sản phẩm. Vui lòng thử lại!`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }
            } else {
              const localCartList = localStorage.getItem("cartList");
              if (!localCartList) {
                reply = `Giỏ hàng của bạn hiện đang trống. Hãy thêm sản phẩm bằng lệnh: "thêm vào giỏ hàng id [số] kích thước [size] màu [color] số lượng [số]".`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }

              try {
                const response = await axios.post(
                  `${Api}/product/cart-list/guest`,
                  {
                    cartList: localCartList,
                  }
                );
                const cartItems = response.data;
                const cartItem = cartItems.find((item) => item.id === cartId);

                if (!cartItem) {
                  reply = `Không tìm thấy sản phẩm với ID ${cartId} trong giỏ hàng. Hãy kiểm tra lại hoặc xem giỏ hàng bằng "xem giỏ hàng".`;
                  setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: reply },
                  ]);
                  return;
                }

                const newQuantity = cartItem.quantity - quantityDecrement;
                let items = JSON.parse(localCartList);
                if (newQuantity <= 0) {
                  items = items.filter((item, index) => index + 1 !== cartId);
                  localStorage.setItem("cartList", JSON.stringify(items));
                  const updatedResponse = await axios.post(
                    `${Api}/product/cart-list/guest`,
                    {
                      cartList: JSON.stringify(items),
                    }
                  );
                  reply = `Đã xóa sản phẩm <strong>${
                    cartItem.stock.product.name
                  }</strong> khỏi giỏ hàng vì số lượng bằng 0. Dưới đây là giỏ hàng hiện tại:\n${formatCartList(
                    updatedResponse.data
                  )}`;
                } else {
                  items = items.map((item, index) => {
                    if (index + 1 === cartId) {
                      return [{ ...item[0], quantity: newQuantity }];
                    }
                    return item;
                  });
                  localStorage.setItem("cartList", JSON.stringify(items));
                  const updatedResponse = await axios.post(
                    `${Api}/product/cart-list/guest`,
                    {
                      cartList: JSON.stringify(items),
                    }
                  );
                  reply = `Đã giảm số lượng sản phẩm <strong>${
                    cartItem.stock.product.name
                  }</strong> xuống ${newQuantity}. Dưới đây là giỏ hàng hiện tại:\n${formatCartList(
                    updatedResponse.data
                  )}`;
                }
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
              } catch (error) {
                console.error(
                  "Error decreasing guest cart item quantity:",
                  error.response || error.message
                );
                reply = `Có lỗi khi giảm số lượng sản phẩm. Vui lòng thử lại!`;
                setMessages((prev) => [
                  ...prev,
                  { role: "bot", content: reply },
                ]);
                return;
              }
            }
            return;
          }

          case "orderProduct": {
            const token = localStorage.getItem("token");
            if (!token) {
              const reply = `Bạn cần <a href="/login">đăng nhập</a> để đặt hàng!`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            const authResult = await getAuth(token);
            if (!authResult.success) {
              const reply = `⚠️ ${authResult.message} Vui lòng <a href="/login">đăng nhập lại</a>.`;
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
              return;
            }

            const cartResult = await getCartItems(token);
            if (!cartResult.success) {
              setMessages((prev) => [
                ...prev,
                { role: "bot", content: cartResult.message },
              ]);
              break;
            }
            if (cartResult.cartItems.length === 0) {
              setMessages((prev) => [
                ...prev,
                {
                  role: "bot",
                  content:
                    "Giỏ hàng của bạn trống. Hãy thêm sản phẩm trước khi đặt hàng!",
                },
              ]);
              break;
            }

            localStorage.setItem(
              flagChatKey,
              JSON.stringify(cartResult.cartItems)
            );

            const selectedItems = cartResult.cartItems.map((item) => ({
              productId: item.stock.product.id,
              quantity: item.quantity,
              name: item.stock.product.name,
              photo: item.stock.product.photo,
              size: item.stock.size,
              color: item.stock.color,
              price: item.stock.product.price,
            }));
            localStorage.setItem(
              "selectedItems",
              JSON.stringify(selectedItems)
            );

            const addressResult = await getUserDefaultAddress(userId, token);
            if (addressResult.success) {
              orderState = {
                stage: "awaiting_confirmation",
                address: addressResult.address,
              };
              localStorage.setItem(
                flagChatStateKey,
                JSON.stringify(orderState)
              );
              const reply = formatOrderSummary(
                cartResult.cartItems,
                addressResult.address
              );
              setMessages((prev) => [...prev, { role: "bot", content: reply }]);
            } else {
              orderState = {
                stage: "awaiting_address",
              };
              localStorage.setItem(
                flagChatStateKey,
                JSON.stringify(orderState)
              );
              setMessages((prev) => [
                ...prev,
                {
                  role: "bot",
                  content:
                    "Không tìm thấy địa chỉ mặc định. Vui lòng cung cấp địa chỉ giao hàng: Họ tên, Địa chỉ, Thành phố, Quốc gia, Mã ZIP, Số điện thoại (cách nhau bằng dấu phẩy). Ví dụ: 'Nguyen Van A, 123 Đường Láng, Hà Nội, Việt Nam, 100000, 0123456789'.",
                },
              ]);
            }
            return;
          }

          // Other cases (s

          default:
            break;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. 😅 Hãy thử hỏi về sản phẩm, chi tiết sản phẩm, giá cao/thấp nhất, tìm sản phẩm (VD: 'tìm áo'), hoặc nói 'chào' để biết thêm!",
        },
      ]);
    } catch (error) {
      console.error("Error in handleSend:", error.response || error.message);
      let errorMessage = "⚠️ Có lỗi xảy ra. Vui lòng thử lại sau!";
      if (error.response?.status === 401) {
        errorMessage =
          '⚠️ Phiên đăng nhập hết hạn. Vui lòng <a href="/login">đăng nhập lại</a>.';
      } else if (error.response?.status === 404) {
        errorMessage =
          "⚠️ Không tìm thấy dữ liệu. Hãy kiểm tra câu hỏi hoặc thử lại!";
      }
      setMessages((prev) => [...prev, { role: "bot", content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-title">TIENDO#STORE Chatbot</h2>
      <div className="chatbox" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.role === "user" ? "user-message" : "bot-message"
            }`}
            dangerouslySetInnerHTML={{
              __html: `<strong>${
                msg.role === "user" ? "Bạn: " : "TIENDO#STORE Bot: "
              }</strong>${msg.content}`,
            }}
          />
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Hỏi tôi về sản phẩm, giá, chi tiết, tìm kiếm..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "Đang xử lý..." : "Gửi"}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
