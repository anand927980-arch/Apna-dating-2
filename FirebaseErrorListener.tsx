'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error: FirestorePermissionError) => {
      // In development, this will trigger the Next.js error overlay
      // providing the contextual information needed to fix Security Rules.
      throw error;
    });

    return () => unsubscribe();
  }, []);

  return null;
}
