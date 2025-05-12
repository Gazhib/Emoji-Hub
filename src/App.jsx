import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import RootLayout from "./RootLayout";
import LandingPage from "./Pages/LandingPage/LandingPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EmojiPage from "./Pages/EmojiPage/EmojiPage";
import AuthPage, { action as authAction } from "./Pages/AuthPage/AuthPage";
import AccountPage from "./Pages/AccountPage/AccountPage";
import { Provider } from "react-redux";
import { store } from "./store/store";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <LandingPage />,
        },
        {
          path: "/emojis",
          element: <EmojiPage />,
        },
        {
          path: "/auth",
          element: <AuthPage />,
          action: authAction,
        },
        {
          path: "/account",
          element: <AccountPage />,
        },
      ],
    },
  ]);

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
