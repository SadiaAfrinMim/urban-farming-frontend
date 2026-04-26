'use client';

import { useState, useEffect } from 'react';

export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

export function getClientToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}