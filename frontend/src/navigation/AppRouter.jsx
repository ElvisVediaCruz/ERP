import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { UserProvider } from '@shared/context/UserContext';
import { NotificationProvider, useNotifications } from '@shared/context/NotificationContext';
import Toast from '@shared/components/common/Toast';
import AppLayout from '@shared/components/layout/AppLayout';
import RequireUser from './RequireUser';
import RequireRole from './RequireRole';

import LoginScreen from '@modules/auth/screens/LoginScreen';

import DashboardScreen from '@modules/dashboard/screens/DashboardScreen';

import CategoriesList from '@modules/categories/screens/CategoriesList';
import CategoryForm from '@modules/categories/screens/CategoryForm';

import SuppliersList from '@modules/suppliers/screens/SuppliersList';
import SupplierForm from '@modules/suppliers/screens/SupplierForm';

import ProductsList from '@modules/products/screens/ProductsList';
import ProductForm from '@modules/products/screens/ProductForm';
import LowStockScreen from '@modules/products/screens/LowStockScreen';

import PurchasesList from '@modules/purchases/screens/PurchasesList';
import PurchaseDetail from '@modules/purchases/screens/PurchaseDetail';
import NewPurchaseForm from '@modules/purchases/screens/NewPurchaseForm';

import SalesList from '@modules/sales/screens/SalesList';
import SaleDetail from '@modules/sales/screens/SaleDetail';
import NewSaleForm from '@modules/sales/screens/NewSaleForm';

import UsersList from '@modules/users/screens/UsersList';
import UserForm from '@modules/users/screens/UserForm';

function ToastPortal() {
  const { toasts } = useNotifications();
  return <Toast toasts={toasts} />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <UserProvider>
        <NotificationProvider>
          <ToastPortal />
          <Routes>
            <Route path="/login" element={<LoginScreen />} />

            <Route element={<RequireUser />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />

                <Route path="dashboard" element={<DashboardScreen />} />

                <Route element={<RequireRole roles={['admin']} />}>
                  <Route path="categories" element={<CategoriesList />} />
                  <Route path="categories/new" element={<CategoryForm />} />
                  <Route path="categories/:id/edit" element={<CategoryForm />} />

                  <Route path="suppliers" element={<SuppliersList />} />
                  <Route path="suppliers/new" element={<SupplierForm />} />
                  <Route path="suppliers/:id/edit" element={<SupplierForm />} />

                  <Route path="products" element={<ProductsList />} />
                  <Route path="products/low-stock" element={<LowStockScreen />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id/edit" element={<ProductForm />} />

                  <Route path="purchases" element={<PurchasesList />} />
                  <Route path="purchases/new" element={<NewPurchaseForm />} />
                  <Route path="purchases/:id" element={<PurchaseDetail />} />

                  <Route path="users" element={<UsersList />} />
                  <Route path="users/:id/edit" element={<UserForm />} />
                </Route>

                <Route element={<RequireRole roles={['admin', 'vendedor']} />}>
                  <Route path="sales" element={<SalesList />} />
                  <Route path="sales/new" element={<NewSaleForm />} />
                  <Route path="sales/:id" element={<SaleDetail />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
