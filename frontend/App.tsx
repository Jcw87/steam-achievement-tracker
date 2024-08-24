
import 'bootsteam-theme/dist/bootsteam-theme.min.css';
import './assets/css/style.css';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from "react-router-dom";

import { MyNavbar } from "./components/Navbar";

function Layout() {
  return (
    <>
      <MyNavbar/>
      <Outlet/>
      <ScrollRestoration/>
    </>
  );
}

export default function App() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache(),
    mutationCache: new MutationCache(),
  });

  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", { eager: true }) as Record<string, {default: React.JSXElementConstructor<object>}>;
  const routes = Object.keys(pages).map((key) => {
    let path = key
      .replace(/^\.\/pages/, "")
      .replace(/\.(t|j)sx?$/, "")
      /**
       * Replace /index with /
       */
      .replace(/\/index$/i, "/")
      /**
       * Convert /[handle].jsx and /[...handle].jsx to /:handle.jsx for react-router-dom
       */
      .replace(/\[(?:[.]{3})?(\w+?)\]/g, (_match, param) => `:${param}`);

    if (path.endsWith("/") && path !== "/") {
      path = path.substring(0, path.length - 1);
    }

    if (!pages[key].default) {
      console.warn(`${key} doesn't export a default React component`);
    }

    return {
      path,
      Component: pages[key].default,
    };
  }).filter((route) => route.Component);

  const layoutRoute = {element: <Layout/>, children: routes};

  const router = createBrowserRouter([layoutRoute]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
    </QueryClientProvider>
  );
}
