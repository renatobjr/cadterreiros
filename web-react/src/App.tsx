import { AppRouter } from "./router";
import { AuthProvider } from "./features/auth/AuthProvider";
import ToastProvider from "./components/ui/ToastProvider";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
