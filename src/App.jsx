import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { useStore } from './lib/store';
import { Overview, Bookings, Calendar, ServicesPage, Availability, Customers } from './pages/admin';
import { PublicLayout } from './components/public/PublicLayout';
import { Home } from './pages/public/Home';
import { Services } from './pages/public/Services';
import { Contact } from './pages/public/Contact';
import { Book } from './pages/public/Book';
import { BookingConfirmation } from './pages/public/BookingConfirmation';
import { AdminAuth } from './pages/admin/AdminAuth';
import { AdminLayout } from './components/admin/AdminLayout';
import { RequireAdmin } from './pages/admin/RequireAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<Book />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        </Route>

        {/* Admin site — separate entry point */}
        <Route path="/admin" element={<AdminAuth />} />
        <Route
          path="/admin/:page"
          element={
            <RequireAdmin>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function Dashboard() {
  const data = useStore();
  const params = useParams();
  const page = params.page || 'overview';

  const renderPage = () => {
    switch (page) {
      case 'overview':
        return <Overview data={data} />;
      case 'bookings':
        return <Bookings data={data} />;
      case 'calendar':
        return <Calendar data={data} />;
      case 'services':
        return <ServicesPage data={data} />;
      case 'availability':
        return <Availability data={data} />;
      case 'customers':
        return <Customers data={data} />;
      default:
        return <Overview data={data} />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
