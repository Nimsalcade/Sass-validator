import { ChangeEvent, FormEvent, useState } from 'react';
import { signIn, signOut } from './auth/mockAuth';
import { ReportExport } from './components/ReportExport';

interface Credentials {
  email: string;
  password: string;
}

const defaultCredentials: Credentials = {
  email: 'demo@example.com',
  password: 'password123'
};

function AuthForm({ onSuccess }: { onSuccess: (userName: string) => void }) {
  const [credentials, setCredentials] = useState<Credentials>(defaultCredentials);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const user = await signIn(credentials);
      onSuccess(user.name);
    } catch (authenticationError) {
      setError(authenticationError instanceof Error ? authenticationError.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Mock sign in form">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={credentials.email}
        onChange={handleChange}
        data-testid="email-input"
        autoComplete="email"
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        value={credentials.password}
        onChange={handleChange}
        data-testid="password-input"
        autoComplete="current-password"
        required
      />

      {error ? (
        <p className="error" role="alert" data-testid="error-message">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={isSubmitting} data-testid="sign-in-button">
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    setUserName(null);
  };

  const mockProjectData = {
    id: 'proj-123',
    name: 'SaaS Validator',
    description: 'A comprehensive validation tool for SaaS businesses to analyze market fit, competitive landscape, and growth potential.',
    industry: 'Software & Technology',
    targetMarket: 'B2B SaaS Founders and Investors',
    url: 'https://example.com',
  };

  return (
    <main>
      <section className="card" data-testid="home">
        <h1 data-testid="home-title">Sass Validator</h1>
        {userName ? (
          <div className="welcome">
            <p data-testid="welcome-message">Welcome back, {userName}!</p>
            <button type="button" onClick={handleSignOut} data-testid="sign-out-button">
              Sign out
            </button>
          </div>
        ) : (
          <AuthForm onSuccess={setUserName} />
        )}
      </section>
      
      {userName && (
        <section className="card" data-testid="report-section">
          <ReportExport projectData={mockProjectData} />
        </section>
      )}
    </main>
  );
}
