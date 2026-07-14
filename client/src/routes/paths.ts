export const ROUTES = {
    home: "/",
    products: "/products",
    productDetails: "/products/:id",
    cart: "/cart",
    checkout: "/checkout",
    orders: "/orders",
    orderDetails: "/orders/:id",
    login: "/login",
    register: "/register",

    admin: "/admin",
    adminProducts: "/admin/products",
    adminCategories: "/admin/categories",
    adminOrders: "/admin/orders",
} as const;
