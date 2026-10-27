import LoginForm from "../features/auth/components/LoginForm";

export function Login() {
  return (
    <main className="authwrap">
      <div className="auth">
        <div className="auth__box">
          <h1>Login</h1>
          <LoginForm />
        </div>
        <p className="auth__note">
          Acesso restrito a administradores e voluntários cadastrados.
        </p>
      </div>
    </main>
  );
}

export default Login;