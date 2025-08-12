import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import { Api } from "../../api/Api";
import { ImageApi } from "../../api/ImageApi";
import "../css/MyOrder.css";

const statusTranslations = {
  pending: "Chờ xử lý",
  processing: "Đã xác nhận",
  shipped: "Đang giao hàng",
  delivered: "Giao hàng thành công",
  cancelled: "Đã hủy",
};

// Hàm định dạng tiền VNĐ
const formatCurrencyVN = (amount) => {
  return parseFloat(amount).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userId = localStorage.getItem("userId");

  const calculateTotalPrice = (orderItems) => {
    const total = orderItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 0;
      return sum + price;
    }, 0);
    return formatCurrencyVN(total);
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${Api}/orders?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      Swal.fire({
        icon: "error",
        text: "Không thể tải danh sách đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const isConfirm = await Swal.fire({
      title: "Xác nhận hủy đơn hàng?",
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FFD700",
      cancelButtonColor: "#d33",
      confirmButtonText: "Có, hủy đơn!",
      cancelButtonText: "Không",
    }).then((result) => result.isConfirmed);

    if (!isConfirm) return;

    try {
      await axios.post(
        `${Api}/order/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
      Swal.fire({
        icon: "success",
        text: "Đơn hàng đã được hủy thành công!",
      });
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      Swal.fire({
        icon: "error",
        text: "Không thể hủy đơn hàng. Vui lòng thử lại!",
      });
    }
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="my-order-container">
      <h1 className="page-title">Đơn Hàng Của Tôi</h1>
      {loading ? (
        <div className="loading-spinner">Đang tải...</div>
      ) : orders.length > 0 ? (
        <div className="order-table">
          <div className="table-header">
            <span>STT</span>
            <span>Sản Phẩm</span>
            <span>Số Lượng</span>
            <span>Tổng Giá</span>

            <span>Trạng Thái</span>
            <span>Ngày Đặt Hàng</span>
            <span>Thao Tác</span>
          </div>
          {orders.map((order, index) => (
            <div key={order.id} className="table-row">
              <span>{index + 1}</span>
              <span className="product-column">
                {order.order_items.map((item, idx) => (
                  <Card key={idx} className="product-card">
                    <div className="product-card-content">
                      <img
                        src={`${ImageApi}/img/${item.image}`}
                        alt={item.name}
                        className="product-image"
                      />
                      <div className="product-details">
                        <h5>{item.name}</h5>
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
                          <strong>Giá:</strong> {formatCurrencyVN(item.price)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </span>
              <span>
                {order.order_items.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}
              </span>
              <span>{calculateTotalPrice(order.order_items)}</span>
              <span className={`status-${order.status}`}>
                {statusTranslations[order.status] || order.status}
              </span>
              <span>
                {new Date(order.created_at).toLocaleDateString("vi-VN")}
              </span>
              <span className="action-buttons">
                <Button
                  className="details-btn"
                  onClick={() => handleShowDetails(order)}
                >
                  <span className="btn-icon">📋</span> Xem Chi Tiết
                </Button>
                {order.status === "pending" && (
                  <Button
                    className="cancel-btn"
                    onClick={() => cancelOrder(order.id)}
                  >
                    <span className="btn-icon">✖</span> Hủy Đơn
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-orders">Không có đơn hàng nào.</div>
      )}

      {/* Modal chi tiết đơn hàng */}
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
                <strong>Tổng Giá:</strong>{" "}
                {calculateTotalPrice(selectedOrder.order_items)}
              </p>
              <p>
                <strong>Trạng Thái:</strong>{" "}
                <span className={`status-${selectedOrder.status}`}>
                  {statusTranslations[selectedOrder.status] ||
                    selectedOrder.status}
                </span>
              </p>
              <p>
                <strong>Ngày Đặt Hàng:</strong>{" "}
                {new Date(selectedOrder.created_at).toLocaleDateString("vi-VN")}
              </p>
              <h5>Danh Sách Sản Phẩm:</h5>
              {selectedOrder.order_items.map((item, idx) => (
                <Card key={idx} className="modal-product-card">
                  <Card.Body>
                    <div className="modal-product-content">
                      <img
                        src={`${ImageApi}/img/${item.image}`}
                        alt={item.product.name}
                        className="modal-product-image"
                      />
                      <div className="modal-product-details">
                        <h5>{item.name}</h5>
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
                          <strong>Giá:</strong> {formatCurrencyVN(item.price)}
                        </p>
                        <p>
                          <strong>Mô Tả:</strong> {item.product.description}
                        </p>
                        <p>
                          <strong>Chi Tiết:</strong> {item.product.details}
                        </p>
                        <p>
                          <strong>Thương Hiệu:</strong> {item.product.brand}
                        </p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="close-btn" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyOrder;
