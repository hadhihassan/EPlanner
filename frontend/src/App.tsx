import { Suspense, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes";
import Spinner from "./components/ui/Spinner";
import { useAppDispatch } from "./store/hooks";
import { fetchMe } from "./store/slices/authSlice";

export default function App() {
  const element = useRoutes(routes);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    
    if (accessToken) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      {element}
    </Suspense>
  );
}
