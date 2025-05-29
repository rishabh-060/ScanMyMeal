'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loader from '@/Components/Loader';
import { store, persistor } from '@/public/store/store'; // Updated import
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // Import PersistGate
import Navbar2 from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import { ToastContainer } from "react-toastify";
import { GlobalProvider } from '@/provider/GlobalProvider';
import CartMobile from '@/Components/CartMobile';

export default function LayoutWrapper({ children }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <main>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <GlobalProvider>
            <ToastContainer />
            <Navbar2 />
            {loading && <Loader />}
            {!loading && children}
            <Footer />
            {pathname !== '/place-order' && <CartMobile />}
          </GlobalProvider>
        </PersistGate>
      </Provider>
    </main>
  );
}
