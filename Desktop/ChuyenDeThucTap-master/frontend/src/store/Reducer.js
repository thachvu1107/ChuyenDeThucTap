const initialState = {
    user_data: {},
    show_modal: false,
    toast_message: "",
    product_id: 0,
    cart_count: 0,
    wishlist_count: 0,
    toast_count: 0,
    show_login: false,
    toast_show: false,
    user: null,
};

const Reducer = (state = initialState, action) => {
    switch (action.type) {
        case "USER_DATA":
            return {
                ...state,
                user_data: action.value,
            };
        case "MODAL_CONTROL":
            return {
                ...state,
                show_modal: action.value,
            };
        case "LOGIN_CONTROL":
            return {
                ...state,
                show_modal: action.value,
            };
        case "QUICKVIEW_CONTROL":
            return {
                ...state,
                product_id: action.value,
                show_modal: true,
            };
        case "CART_COUNT":
            return {
                ...state,
                cart_count: action.value,
            };
        case "WISHLIST_COUNT":
            return {
                ...state,
                wishlist_count: action.value,
            };
        case "SHOW_TOAST":
            return {
                ...state,
                toast_message: action.value,
                toast_count: true,
            };
        case "HIDE_TOAST":
            return {
                ...state,
                toast_state: false,
            };
        default:
            return state;
    }
};

export default Reducer;
