import { APICreate } from '@patrick115/sveltekitapi'
import type { Context } from './context'

const t = new APICreate<Context>()

export const router = t.router
export const procedure = t.procedure
