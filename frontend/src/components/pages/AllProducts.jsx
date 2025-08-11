import React, { useState, useEffect } from "react";
import axios from "axios";
import { Api } from "../../api/Api";
import ProductItem from "./products/ProductItem";
import { ToastContainer, toast } from "react-toastify";
import { connect } from "react-redux";
import Spinner from "react-bootstrap/Spinner";

function AllProducts({ showQuickView, updateWishlistCount }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${Api}/products`)
      .then((res) => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleWishlist = (e) => {
    if (!localStorage.getItem("token")) {
      toast.error("Cần đăng nhập!");
    } else {
      axios
        .post(
          `${Api}/product/wishlist`,
          { productId: e.target.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            updateWishlistCount(response.data);
            toast.success("Đã thêm sản phẩm vào danh sách yêu thích!");
          }
        })
        .catch(() => {
          toast.success("Sản phẩm đã có trong danh sách yêu thích!");
        });
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="section">
      <ToastContainer />
      <div className="container">
        <h3 className="text-center mb-4">Tất cả sản phẩm</h3>
        <div className="row">
          {products.map((product) => (
            <div key={product.id} className="col-md-3 col-sm-6 mb-4">
              <ProductItem
                product={product}
                showQuickView={showQuickView}
                handleWishlist={handleWishlist}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  showQuickView: (id) => dispatch({ type: "QUICKVIEW_CONTROL", value: id }),
  updateWishlistCount: (count) =>
    dispatch({ type: "WISHLIST_COUNT", value: count }),
});

export default connect(null, mapDispatchToProps)(AllProducts);
