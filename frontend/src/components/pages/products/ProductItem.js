import React from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { Api } from "./../../../api/Api";
import { ImageApi } from "./../../../api/ImageApi";

const ProductItem = ({ product, showQuickView, updateWishlistCount }) => {
  const handleWishlist = (e) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      toast.error("Bạn cần đăng nhập!");
    } else {
      axios
        .post(
          `${Api}/product/wishlist`,
          { productId: product.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          updateWishlistCount(response.data);
          toast.success("Đã thêm vào danh sách yêu thích!");
        })
        .catch((error) => {
          toast.error("Sản phẩm đã có trong danh sách yêu thích!");
        });
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    showQuickView(product.id);
  };

  const formatPriceVND = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (

    <div
  className="card product-card shadow-lg border-0 mb-4"
  style={{
    borderRadius: "16px",
    background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
    color: "#2d2d2d",
    transition: "transform 0.3s",
    overflow: "hidden",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
>
  <div className="position-relative">
    <img
      src={`${ImageApi}/img/${product.photo}`}
      alt={product.name}
      className="card-img-top"
      style={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        height: "250px",
        objectFit: "cover",
        filter: "brightness(1.1)",
      }}
    />

    {/* NEW badge */}
    {new Date(product.created_at).toDateString() ===
      new Date().toDateString() && (
      <span className="badge bg-danger position-absolute top-0 start-0 m-2 shadow">
        MỚI
      </span>
    )}

    {/* Icon buttons */}
    <div className="position-absolute top-0 end-0 m-2 d-flex flex-column gap-2">
      <button
        className="btn btn-light btn-sm rounded-circle shadow-sm"
        title="Yêu thích"
        onClick={handleWishlist}
      >
        <i className="fa fa-heart text-danger"></i>
      </button>
      <button
        className="btn btn-light btn-sm rounded-circle shadow-sm"
        title="So sánh"
      >
        <i className="fa fa-exchange"></i>
      </button>
      <button
        className="btn btn-light btn-sm rounded-circle shadow-sm"
        title="Xem nhanh"
        onClick={handleClick}
      >
        <i className="fa fa-eye"></i>
      </button>
    </div>
  </div>

  {/* Thông tin sản phẩm */}
  <div className="card-body text-center">
    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
      {product.category.name}
    </p>
    <h5
      className="card-title mb-2"
      style={{
        fontWeight: "700",
        fontSize: "16px",
        color: "#1f1f1f",
      }}
    >
      {product.name}
    </h5>

    {/* Giá */}
    {new Date(product.sale_expires).getTime() > new Date().getTime() ? (
      <h6 className="fw-bold mb-2" style={{ color: "#e63946" }}>
        {(product.price - product.price * product.sale).toLocaleString(
          "vi-VN"
        )}{" "}
        ₫
        <del className="text-muted ms-2" style={{ fontSize: "14px" }}>
          {product.price.toLocaleString("vi-VN")} ₫
        </del>
      </h6>
    ) : (
      <h6 className="text-success fw-bold mb-2">
        {product.price.toLocaleString("vi-VN")} ₫
      </h6>
    )}

    {/* Sao đánh giá */}
    <div className="d-flex justify-content-center mb-3">
      {[...Array(5)].map((_, index) => (
        <i
          key={index}
          className={
            product.review >= index + 1
              ? "fa fa-star text-warning"
              : product.review > index
              ? "fa fa-star-half-o text-warning"
              : "fa fa-star-o text-muted"
          }
        ></i>
      ))}
    </div>

    {/* Nút thêm vào giỏ hàng */}
    <button
      className="btn btn-primary w-100 fw-bold"
      onClick={handleClick}
      style={{ borderRadius: "30px" }}
    >
      <i className="fa fa-shopping-cart me-2"></i> Thêm vào giỏ hàng
    </button>
  </div>
</div>

  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    showQuickView: (id) => dispatch({ type: "QUICKVIEW_CONTROL", value: id }),
    updateWishlistCount: (count) =>
      dispatch({ type: "WISHLIST_COUNT", value: count }),
  };
};

export default connect(null, mapDispatchToProps)(ProductItem);
