import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import { AuthProvider } from './Administrator/AuthContext.jsx';
import ProtectedRoute from './Administrator/ProtectedRoute.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductCategoryPage = lazy(() => import('./pages/products/ProductCategoryPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Admin CMS — lazy-loaded and routed outside <MainLayout />, so the public
// Header/Footer never wrap admin pages.
const AdminLogin = lazy(() => import('./Administrator/Login.jsx'));
const AdminLayout = lazy(() => import('./Administrator/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('./Administrator/Dashboard.jsx'));
const AdminProducts = lazy(() => import('./Administrator/Products.jsx'));
const AdminTaxonomy = lazy(() => import('./Administrator/Taxonomy.jsx'));
const AdminAnalytics = lazy(() => import('./Administrator/Analytics.jsx'));
const AdminLogs = lazy(() => import('./Administrator/Logs.jsx'));

export default function App() {
  return (
    <Suspense fallback={null}>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductCategoryPage />} />
            <Route path="/products/:slug/:productId" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={(
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            )}
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminTaxonomy />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Suspense>
  );
}
