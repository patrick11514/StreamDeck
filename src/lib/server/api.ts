import { APICreate, MiddleWareError } from '@patrick115/sveltekitapi'
import type { Context } from './context'

const t = new APICreate<Context>()

export const router = t.router
export const procedure = t.procedure
export const protectedProcedure = procedure.use(async ({ ctx, next }) => {
    if (!ctx.connected) {
        throw new MiddleWareError({
            status: false,
            code: 400,
            message: 'No device connected'
        })
    }

    return next({
        ...ctx,
        connected: true
    } as typeof ctx)
})
