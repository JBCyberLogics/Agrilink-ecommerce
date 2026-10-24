/**
 * Auth service — signup, login, session check and logout.
 * Payloads and response shapes are exactly what they were before the
 * frontend was restructured ({ name, email, role } on success); nothing
 * here talks to the transport directly elsewhere.
 */
import { call } from '../../../services/apiClient.js'

export const signup = (body) => call('/api/auth/signup', body)
export const login = (body) => call('/api/auth/login', body)
export const me = () => call('/api/auth/me').then((d) => (d?.name ? d : null))
export const logout = () => call('/api/auth/logout', {})
