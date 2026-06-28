/*
  src/infra/acl.ts - capability check helper
*/

export const hasCapability = (capabilities: string, cap: string): boolean =>
  capabilities
    .split(";")
    .map((s) => s.trim())
    .includes(cap);
