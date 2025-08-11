import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { Api } from "../../../api/Api";
import { ImageApi } from "../../../api/ImageApi";

import "../css/OrderAdmin.css";

// Map English status to Vietnamese translations
const statusTranslations = {
  pending: "Chờ xử lý",
  processing: "Đã xác nhận",
  shipped: "Đang giao hàng",
  delivered: "Giao hàng thành công",
  cancelled: "Đã hủy",
};

// Define valid forward transitions
const validTransitions = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const OrderAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(6);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${Api}/admin/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire({
        icon: "error",
        text: "Không thể tải danh sách đơn hàng",
      });
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (order.status === "cancelled") {
      Swal.fire({
        icon: "warning",
        text: "Đơn hàng đã bị hủy, không thể thay đổi trạng thái!",
        confirmButtonColor: "#FFD700",
      });
      return;
    }

    if (!validTransitions[order.status].includes(newStatus)) {
      Swal.fire({
        icon: "warning",
        text: `Không thể thay đổi trạng thái từ "${
          statusTranslations[order.status]
        }" sang "${statusTranslations[newStatus]}"!`,
        confirmButtonColor: "#FFD700",
      });
      return;
    }

    const isConfirm = await Swal.fire({
      title: "Xác nhận thay đổi?",
      text: `Bạn muốn thay đổi trạng thái đơn hàng thành "${statusTranslations[newStatus]}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FFD700",
      cancelButtonColor: "#DC3545",
      confirmButtonText: "Có, cập nhật!",
      cancelButtonText: "Hủy",
    }).then((result) => result.isConfirmed);

    if (!isConfirm) return;

    try {
      const response = await axios.put(
        `${Api}/order/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      Swal.fire({
        icon: "success",
        text: "Cập nhật trạng thái đơn hàng thành công!",
        confirmButtonColor: "#FFD700",
      });
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: response.data.order.status }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        text: "Không thể cập nhật trạng thái đơn hàng",
        confirmButtonColor: "#FFD700",
      });
    }
  };

  // Tính tổng tiền đơn hàng
  const calculateTotalPrice = (orderItems) => {
    return orderItems
      .reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.quantity || 0;
        return total + price;
      }, 0)
      .toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  // Fetch chi tiết đơn hàng
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${Api}/order/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      Swal.fire({
        icon: "error",
        text: "Không thể tải chi tiết đơn hàng",
        confirmButtonColor: "#FFD700",
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="order-list-container">
      <div className="order-table">
        <div className="table-header">
          <span>ID</span>
          <span>Khách Hàng</span>
          <span>Tổng Tiền</span>
          <span>Trạng Thái</span>
          <span>Ngày Đặt</span>
          <span>Thao Tác</span>
        </div>
        {currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <div key={order.id} className="table-row">
              <span>{order.id}</span>
              <span>
                {order.user?.name} <br />
                <small>({order.user?.email})</small>
              </span>
              <span>{calculateTotalPrice(order.order_items)}</span>
              <span>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={`status-select status-${order.status}`}
                  disabled={
                    order.status === "cancelled" || order.status === "delivered"
                  }
                >
                  <option value={order.status}>
                    {statusTranslations[order.status]}
                  </option>
                  {validTransitions[order.status].map((status) => (
                    <option key={status} value={status}>
                      {statusTranslations[status]}
                    </option>
                  ))}
                </select>
              </span>
              <span>
                {new Date(order.created_at).toLocaleDateString("vi-VN")}
              </span>
              <span>
                <Button
                  className="details-btn"
                  onClick={() => fetchOrderDetails(order.id)}
                >
                  <span className="btn-icon">📋</span> Xem Chi Tiết
                </Button>
              </span>
            </div>
          ))
        ) : (
          <div className="no-orders">Không có đơn hàng nào.</div>
        )}
      </div>

      <div className="pagination-container">
        {[...Array(Math.ceil(orders.length / ordersPerPage)).keys()].map(
          (number) => (
            <button
              key={number}
              onClick={() => paginate(number + 1)}
              className={`pagination-btn ${
                currentPage === number + 1 ? "active" : ""
              }`}
            >
              {number + 1}
            </button>
          )
        )}
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className="order-modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Chi Tiết Đơn Hàng #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div className="modal-content">
              <p>
                <strong>Tổng Tiền:</strong>{" "}
                {calculateTotalPrice(selectedOrder.order_items)}
              </p>
              <p>
                <strong>Trạng Thái:</strong>{" "}
                <span className={`status-${selectedOrder.status}`}>
                  {statusTranslations[selectedOrder.status]}
                </span>
              </p>
              <p>
                <strong>Ngày Đặt Hàng:</strong>{" "}
                {new Date(selectedOrder.created_at).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Ghi Chú:</strong> {selectedOrder.note || "Không có"}
              </p>
              <h5>Danh Sách Sản Phẩm:</h5>
              {selectedOrder.order_items.map((item, idx) => (
                <div key={idx} className="modal-product-card">
                  <img
                    src={`${ImageApi}/img/${item.product.photo}`}
                    alt={item.product.name}
                    className="modal-product-image"
                  />
                  <div className="modal-product-details">
                    <h6>{item.product.name}</h6>
                    <p>
                      <strong>Màu sắc:</strong> {item.color}
                    </p>
                    <p>
                      <strong>Kích thước:</strong> {item.size}
                    </p>
                    <p>
                      <strong>Số Lượng:</strong> {item.quantity}
                    </p>
                    <p>
                      <strong>Giá:</strong>{" "}
                      {parseFloat(item.price).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderAdmin;
