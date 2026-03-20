export interface AuthUser {
  readonly id: string
  readonly role: string
}

export type AuthResult =
  | { readonly authenticated: false }
  | { readonly authenticated: true; readonly user: AuthUser }

export type RoleHierarchy = Readonly<Record<string, number>>

export const DefaultRoleHierarchy: RoleHierarchy = { editor: 1, admin: 2 } as const

export function hasRole (userRole: string, requiredRole: string, hierarchy: RoleHierarchy): boolean {
  const userLevel = hierarchy[userRole] ?? 0
  const requiredLevel = hierarchy[requiredRole] ?? Infinity
  return userLevel >= requiredLevel
}
