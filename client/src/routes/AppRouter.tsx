import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import { AdminLayout } from "../layouts/AdminLayout";
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

import { AdminCategoriesPage } from "../pages/admin/AdminCategoriesPage";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";
import { CreateCategoryPage } from "../pages/admin/CreateCategoryPage";
import { CreateProductPage } from "../pages/admin/CreateProductPage";
import { DashboardPage } from "../pages/admin/DashboardPage";
import { EditCategoryPage } from "../pages/admin/EditCategoryPage";
import { EditProductPage } from "../pages/admin/EditProductPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <NotFoundPage />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "products",
                element: <ProductCatalogPage />,
            },
            {
                path: "products/:id",
                element: <ProductDetailsPage />,
            },
            {
                path: "cart",
                element: <CartPage />,
            },
            {
                path: "checkout",
                element: <CheckoutPage />,
            },
            {
                path: "orders",
                element: <OrdersPage />,
            },
            {
                path: "orders/:id",
                element: <OrderDetailsPage />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "register",
                element: <RegisterPage />,
            },
        ],
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        errorElement: <NotFoundPage />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: "products",
                element: <AdminProductsPage />,
            },
            {
                path: "products/new",
                element: <CreateProductPage />,
            },
            {
                path: "products/:id/edit",
                element: <EditProductPage />,
            },
            {
                path: "categories",
                element: <AdminCategoriesPage />,
            },
            {
                path: "categories/new",
                element: <CreateCategoryPage />,
            },
            {
                path: "categories/:id/edit",
                element: <EditCategoryPage />,
            },
            {
                path: "orders",
                element: <AdminOrdersPage />,
            },
        ],
    },
]);

export const AppRouter = () => {
    return <RouterProvider router={router} />;
};
