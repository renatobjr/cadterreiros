import { AppRouter } from "./router";
import { AuthProvider } from "./features/auth/AuthProvider";
import { ConsentProvider } from "./features/analytics/ConsentProvider";
import ToastProvider from "./components/ui/ToastProvider";

function App() {
  return (
    <ConsentProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </ConsentProvider>
  );
}

export default App;
