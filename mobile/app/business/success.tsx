import { Redirect } from 'expo-router';

/** Legacy route after apply — hub entry routes by status. */
export default function BusinessSuccessRedirect() {
  return <Redirect href="/business" />;
}
