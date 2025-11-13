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
            <ToastContainer
              position="top-right"
              limit={1}
              autoClose={4000}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              pauseOnHover
              draggable
              hideProgressBar={false}
              theme="colored"
              toastClassName={() =>
                "relative flex items-start gap-3 bg-gray-900 text-yellow-300 rounded-xl shadow-lg px-6 py-4 mb-4 w-full max-w-md mx-auto"
              }
              bodyClassName="text-sm font-medium leading-snug"
              progressClassName="bg-yellow-400 h-1 rounded-b-xl"
              iconClassName="!w-6 !h-6 mt-[2px]"
            />
            <Navbar2 />
            {loading && <Loader />}
            {!loading && children}
            {pathname !== '/place-order' && <CartMobile />}
            <Footer />
          </GlobalProvider>
        </PersistGate>
      </Provider>
    </main>
  );
}
