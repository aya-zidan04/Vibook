import { useEffect } from 'react';
import { useRouter } from 'expo-router';

/** Legacy route: first-time flow now starts at `/entry`. */
export default function OnboardingScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/entry');
  }, [router]);
  return null;
}
