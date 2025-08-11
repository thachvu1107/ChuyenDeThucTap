import React, { Component } from "react";
import axios from "axios";
import Slider from "react-slick";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import { Api } from "../../api/Api";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Carsousel.css";
import { ImageApi } from "./../../api/ImageApi";
import ProductPage from "../pages/products/ProductPage";
class Carousel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      currentCategory: 1,
      categories: [],
      products: [],
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleWishlist = this.handleWishlist.bind(this);
  }

  componentDidMount() {
    this.getCategories();
    this.getProducts(1);
  }

  getCategories() {
    axios
      .get(`${Api}/product/categories`)
      .then((response) => {
        this.setState({ categories: [...response.data] });
      })
      .catch((error) => console.log(error));
  }

  handleWishlist(e) {
    if (!localStorage.getItem("token")) {
      this.props.showLogin();
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
            this.props.updateWishlistCount(response.data);
            this.props.showToast("Added to wishlist!");
            toast.success("Đã thêm sản phẩm vào danh sách yêu thích!");
          }
        })
        .catch(() => {
          this.props.showToast("Product is already in the wishlist!");
          toast.success("Sản phẩm đã có trong danh sách yêu thích!");
        });
    }
  }

  handleClick(e) {
    const id = e.target.id;
    if (e.target.className === "add-to-cart-btn") {
      this.props.showQuickView(id);
    } else if (
      e.target.className === "qucik-view q q-primary" ||
      e.target.className === "fa fa-eye"
    ) {
      this.props.showQuickView(id);
    } else {
      e.preventDefault();
      this.getProducts(id);
      this.setState({ currentCategory: id });
    }
  }

  getProducts(categoryId) {
    let query = this.props.id === 1 ? "new" : "top-selling";
    this.setState({ loading: true });
    axios
      .get(`${Api}/product/categories/${categoryId}/${query}`)
      .then((response) => {
        this.setState({ products: [...response.data], loading: false });
      })
      .catch((error) => console.log(error));
  }

  render() {
    const settings = {
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      infinite: false,
      dots: false,
      arrows: true,
      rows: 2,
      slidesPerRow: 1,
      responsive: [
        {
          breakpoint: 991,
          settings: { slidesToShow: 2, slidesToScroll: 1, rows: 2 },
        },
        {
          breakpoint: 480,
          settings: { slidesToShow: 1, slidesToScroll: 1, rows: 2 },
        },
      ],
    };

    return <ProductPage />;
  }
}

const mapStateToProps = (state) => ({
  productId: state.product_id,
  showModal: state.show_modal,
});

const mapDispatchToProps = (dispatch) => ({
  showQuickView: (id) => dispatch({ type: "QUICKVIEW_CONTROL", value: id }),
  showLogin: () => dispatch({ type: "LOGIN_CONTROL", value: true }),
  updateWishlistCount: (count) =>
    dispatch({ type: "WISHLIST_COUNT", value: count }),
  showToast: (msg) => dispatch({ type: "SHOW_TOAST", value: msg }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Carousel);
