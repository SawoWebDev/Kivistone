import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductCategoryPage = lazy(() => import('./pages/products/ProductCategoryPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <Suspense fallback={null}>
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
      </Routes>
    </Suspense>
  );
}
