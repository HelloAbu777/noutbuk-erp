import 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    login: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      role: string;
      login: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    login: string;
  }
}
