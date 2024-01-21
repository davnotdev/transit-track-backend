import { v4 as uuidv4 } from "uuid";

export interface AdminTokenMan {
  //  email -> token
  tokens: Map<string, string>;
}

export function createAdminTokenMan(): AdminTokenMan {
  return {
    tokens: new Map(),
  };
}

export function adminTokenLogin(tokenMan: AdminTokenMan, email: string): string {
  let token = uuidv4();
  tokenMan.tokens.set(email, token);
  return token;
}
