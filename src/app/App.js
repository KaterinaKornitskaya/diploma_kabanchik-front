// src/app/App.js
import { Routes, Route, Outlet } from 'react-router-dom';
import { Header } from "../widgets/header";
import { Footer } from "../widgets/footer";

import HomePage from "../pages/home/HomePage";
import CategoryPage from "../pages/categories/CategoryPage";
import TasksPage from "../pages/tasks/TasksPage";

import LoginPage from "../pages/auth/LoginPage";
import SignupCustomerPage from "../pages/auth/SignupCustomerPage";
import ProSignUpStep1Page from "../pages/auth/pro-signup-step-1";
import ProSignUpStep2Page from "../pages/auth/pro-signup-step-2";
import ProSignUpStep3Page from "../pages/auth/pro-signup-step-3";
import ProSignUpSuccessPage from "../pages/auth/pro-signup-success";

import OrderCreatePage from "../pages/orders/OrderCreatePage";
import OrderCreatedPage from "../pages/orders/OrderCreatedPage";
import OrderDetailsPage from '../pages/orders/OrderDetailsPage';

import AccountLayout from "../pages/account/AccountLayout";
import AccountProfile from "../pages/account/AccountProfile";
import CustomerOrdersPage from "../pages/account/CustomerOrdersPage";

import ProLayout from "../pages/pro/ProLayout";
import ProProfile from "../pages/pro/ProProfile";                
import ProFindOrdersPage from "../pages/pro/ProFindOrdersPage";
import ProActiveOrdersPage from "../pages/pro/ProActiveOrdersPage";
import ProServicesPage from "../pages/pro/ProServicesPage";   
import ProDoneOrdersPage from '../pages/pro/ProDoneOrdersPage';

// публічний вид Спеціаліста
import ProsSearchPage from "../pages/pros/ProsSearchPage";
import ProPublicProfile from "../pages/pros/ProPublicProfile";

function Layout() {
  return (
    <>
      <Header />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Публічні сторінки */}
        <Route path="/" element={<HomePage />} />
        <Route path="/categories/:id" element={<CategoryPage />} />
        <Route path="/tasks" element={<TasksPage />} />

        {/* Авторизація / реєстрація */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupCustomerPage />} />
        <Route path="/auth/pro-signup/step-1" element={<ProSignUpStep1Page />} />
        <Route path="/auth/pro-signup/step-2" element={<ProSignUpStep2Page />} />
        <Route path="/auth/pro-signup/step-3" element={<ProSignUpStep3Page />} />
        <Route path="/auth/pro-signup/success" element={<ProSignUpSuccessPage />} />

        {/* Замовлення */}
        <Route path="/orders/new" element={<OrderCreatePage />} />
        <Route path="/orders/created" element={<OrderCreatedPage />} />

        {/* Кабінет замовника */}
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<AccountProfile />} />
          <Route path="orders" element={<CustomerOrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
        </Route>

        {/* Кабінет фахівця (весь /pro під одним layout) */}
        <Route path="/pro" element={<ProLayout />}>
          <Route index element={<ProProfile />} />                {/* профіль фахівця */}
          {<Route path="services" element={<ProServicesPage />} /> }
          <Route path="find" element={<ProFindOrdersPage />} />
          <Route path="active" element={<ProActiveOrdersPage />} />
          <Route path="done" element={<ProDoneOrdersPage />} />
        </Route>

        {/* публічний вид Спеціаліста */}
        <Route path="/pros" element={<ProsSearchPage />} />
        <Route path="/pros/:id" element={<ProPublicProfile />} />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 16 }}>Сторінку не знайдено</div>} />
      </Route>
    </Routes>
  );
}
