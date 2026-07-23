import { auth } from "./auth";

export async function keycloakLogout() {

  const session = await auth();

  const idToken = session?.idToken;

  const issuer = process.env.KEYCLOAK_ISSUER;

  const postLogoutRedirectUri =
    process.env.NEXTAUTH_URL;


  if (!issuer || !idToken) {
    return;
  }


  const logoutUrl =
    `${issuer}/protocol/openid-connect/logout` +
    `?id_token_hint=${idToken}` +
    `&post_logout_redirect_uri=${postLogoutRedirectUri}`;


  return logoutUrl;
}