import { protectedProcedure } from '$/lib/server/api'
import type { KeyInfo, ResponseWithData } from '$/types/types'
import { z } from 'zod'

export const info = protectedProcedure.POST.input(z.number()).query(async ({ ctx, input }) => {
    const data = ctx.db.getKey(input)

    if (!data) {
        return {
            status: false,
            code: 404,
            message: 'Key not found'
        }
    }

    return {
        status: true,
        data
    } satisfies ResponseWithData<KeyInfo>
})
