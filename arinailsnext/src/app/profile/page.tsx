'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente al dashboard del cliente
    router.replace('/dashboard/client');
  }, [router]);

  return null;
}