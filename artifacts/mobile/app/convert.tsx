import { Redirect } from 'expo-router';

/** Keep old converter bookmarks on the canonical multi-currency tab. */
export default function ConvertCompatibilityRoute() {
  return <Redirect href="/(tabs)" />;
}
