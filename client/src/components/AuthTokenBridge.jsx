import { useAuth0 } from "@auth0/auth0-react";
import { setTokenGetter } from "../utils/api";

export default function AuthTokenBridge({ children }) {
  const { getAccessTokenSilently } = useAuth0();
  setTokenGetter(getAccessTokenSilently);
  return children;
}