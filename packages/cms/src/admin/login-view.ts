import { escapeHtml } from './escape.js'

interface LoginPageArgs {
  readonly error?: string | undefined
  readonly csrfToken: string
}

export function renderLoginPage (args: LoginPageArgs): string {
  const errorHtml = args.error
    ? `<div class="login-error">${escapeHtml(args.error)}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign In -- Valence CMS</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 1rem;
      line-height: 1.5;
      color: #e8e6e3;
      background: #131313;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      background: #1c1b1b;
      border-radius: 0.75rem;
      padding: 2.5rem 2rem;
      box-shadow: 0 4px 24px -4px rgba(0,0,0,0.5);
    }
    .login-brand {
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 2rem;
      letter-spacing: -0.03em;
      color: #e8e6e3;
    }
    .login-brand span { color: #45f99c; }
    .login-error {
      background: rgba(248, 113, 113, 0.12);
      color: #f87171;
      padding: 0.625rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      margin-bottom: 1.25rem;
    }
    .form-field label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #a9a6a1;
    }
    .form-field input {
      background: #201f1f;
      border: 2px solid transparent;
      border-radius: 0.5rem;
      padding: 0.625rem 0.75rem;
      color: #e8e6e3;
      font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 0.875rem;
      transition: border-color 120ms cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 120ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .form-field input:focus {
      outline: none;
      border-color: #45f99c;
      box-shadow: 0 0 0 2px #131313, 0 0 0 4px #45f99c;
    }
    .btn-login {
      width: 100%;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      border-radius: 0.5rem;
      border: none;
      cursor: pointer;
      background: linear-gradient(135deg, #45f99c, #00dc82);
      color: #131313;
      transition: background 120ms cubic-bezier(0.4, 0, 0.2, 1),
                  transform 120ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-login:hover { background: #00dc82; }
    .btn-login:active { transform: scale(0.97); }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="login-brand"><span>V</span>alence</div>
    ${errorHtml}
    <form method="POST" action="/admin/login">
      <input type="hidden" name="_csrf" value="${escapeHtml(args.csrfToken)}">
      <div class="form-field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required autocomplete="email" autofocus>
      </div>
      <div class="form-field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autocomplete="current-password">
      </div>
      <button type="submit" class="btn-login">Sign in</button>
    </form>
  </div>
</body>
</html>`
}
