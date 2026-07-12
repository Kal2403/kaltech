import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { OrderDetailsPage } from "../pages/OrderDetailsPage";
import { OrdersPage } from "../pages/OrdersPage";
import { ProductCatalogPage } from "../pages/ProductCatalogPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { RegisterPage } from "../pages/RegisterPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <NotFoundPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "products", element: <ProductCatalogPage /> },
            { path: "products/:id", element: <ProductDetailsPage /> },
            { path: "cart", element: <CartPage /> },
            { path: "checkout", element: <CheckoutPage /> },
            { path: "orders", element: <OrdersPage /> },
            { path: "orders/:id", element: <OrderDetailsPage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
        ],
    },
]);

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};
