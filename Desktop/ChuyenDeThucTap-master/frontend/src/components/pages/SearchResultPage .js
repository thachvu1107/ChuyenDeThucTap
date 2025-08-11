import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Api } from "../../api/Api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ImageApi } from "../../api/ImageApi";
import Slider from "react-slick";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import { connect } from "react-redux";
import ProductItem from "./products/ProductItem";
function SearchResultPage({ showQuickView, updateWishlistCount }) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useParams();
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (!searchTerm) {
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${Api}/search`, {
          params: {
            searchTerm,
          },
        });
        setSearchResults(response.data.data);
        setTotalResults(response.data.data.length);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  if (!searchTerm) {
    return <div>No search term specified.</div>;
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (searchResults.length === 0) {
    return <div>No results found for "{searchTerm}"</div>;
  }

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

  const settings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    infinite: false,
    dots: false,
    arrows: true,
    rows: 1,
    slidesPerRow: 1,
    responsive: [
      { breakpoint: 991, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="section">
      <ToastContainer />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h4 style={{ marginLeft: "90px", marginBottom: "30px" }}>
            Kết quả tìm kiếm cho "{searchTerm}"
          </h4>
        </div>
        <div>
          <h4 style={{ marginRight: "90px", marginBottom: "30px" }}>
            {totalResults} sản phẩm
          </h4>
        </div>
      </div>

      <div className="container">
        <div className="col">
          <div className="products-tabs">
            <div className="tab-pane active">
              <div className="products-slick" data-nav="#slick-nav">
                <Slider {...settings}>
                  {searchResults.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      handleWishlist={handleWishlist}
                      showQuickView={showQuickView}
                    />
                  ))}
                </Slider>
              </div>
              <div id="slick-nav" className="products-slick-nav"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  productId: state.product_id,
  showModal: state.show_modal,
});

const mapDispatchToProps = (dispatch) => ({
  showQuickView: (id) => dispatch({ type: "QUICKVIEW_CONTROL", value: id }),
  updateWishlistCount: (count) =>
    dispatch({ type: "WISHLIST_COUNT", value: count }),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultPage);
