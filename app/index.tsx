import { Redirect } from "expo-router";

// Always redirect to onboarding for testing
export default function Index() {
  return <Redirect href="/onboarding" />;
}
