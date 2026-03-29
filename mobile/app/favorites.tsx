import { Redirect } from 'expo-router';

/** Deep links to `/favorites` land on the Favorites tab. */
export default function FavoritesRedirect() {
  return <Redirect href="/(tabs)/favorites" />;
}
