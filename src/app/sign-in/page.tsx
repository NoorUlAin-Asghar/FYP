// app/sign-in/page.tsx
import { Suspense } from 'react';
import SignInClient from './signInClient';

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInClient />
    </Suspense>
  );
}
