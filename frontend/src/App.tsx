import { Suspense, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes";
import Spinner from "./components/ui/Spinner";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchMe } from "./store/slices/authSlice";
import { SocketProvider } from "./context/SocketContext";
import NotificationListener from "./components/notifications/NotificationListener";

export default function App() {
  const element = useRoutes(routes);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { token } = useAppSelector(state => state.auth);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return (
    <>
      <SocketProvider token={token}>
        {isAuthenticated && <NotificationListener />}
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <Spinner />
            </div>
          }
        >
          {element}
        </Suspense>
      </SocketProvider>
    </>
  );
}
