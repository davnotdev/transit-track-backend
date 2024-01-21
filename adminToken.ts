import { v4 as uuidv4 } from "uuid";
import { TransitUnit } from "./transit";

interface AdminData {
  token: string;
  transit: TransitUnit;
}

export interface AdminTokenMan {
  //  email -> token
  tokens: Map<string, AdminData>;
}

export function createAdminTokenMan(): AdminTokenMan {
  return {
    tokens: new Map(),
  };
}

export function adminTokenLogin(
  tokenMan: AdminTokenMan,
  email: string,
  transit: TransitUnit,
): string {
  let token = uuidv4();
  tokenMan.tokens.set(email, {
    token,
    transit,
  });
  return token;
}
