export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

const MOCK_USER: User = {
  id: 'user_001',
  name: 'Demo User',
  email: 'demo@example.com'
};

const VALID_PASSWORD = 'password123';

export async function signIn({ email, password }: Credentials): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const isMatch = email.trim().toLowerCase() === MOCK_USER.email && password === VALID_PASSWORD;

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return MOCK_USER;
}

export async function signOut(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));
}
