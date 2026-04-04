import { Redirect } from 'expo-router';

/** Old path; partner profile tab lives at `/business/profile`. */
export default function BusinessBrandRedirect() {
  return <Redirect href="/business/profile" />;
}
