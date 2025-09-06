import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import useAuth from '@/src/hooks/useAuth';

export default function Index() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/login" />;
  }
}