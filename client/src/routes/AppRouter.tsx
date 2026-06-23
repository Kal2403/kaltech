import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";
import { CartPage } from "../pages/CartPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ProductsPage } from "../pages/ProductsPage";
import { RegisterPage } from "../pages/RegisterPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <NotFoundPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "products", element: <ProductsPage /> },
            { path: "products/:id", element: <ProductDetailsPage /> },
            { path: "cart", element: <CartPage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
        ]
    }
]);

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};
