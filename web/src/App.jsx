import { Routes, Route, useLocation } from "react-router-dom";
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import Product from './pages/Product';
import Courses from './pages/Courses';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/admin/Admin';
import Unsubscribe from './pages/Unsubscribe';

function App() {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');
    const isUnsubscribePage = location.pathname === '/unsubscribe';
    const hideLayout = isAdminPage || isUnsubscribePage;

    return (
        <>
            <ScrollToTop />
            {!hideLayout && <Header />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<AllProducts />} />
                <Route path="/products/:id" element={<Product />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
            </Routes>
            {!hideLayout && <Footer />}
        </>
    );
}

export default App;
