import type { Response } from '$/types/types'
import { protectedProcedure } from '$lib/server/api'
import { z } from 'zod'

export const brightness = protectedProcedure.POST.input(z.number()).query(async ({ input, ctx }) => {
    ctx.device.setBrightness(input)

    ctx.db.setBrightness(input)

    return {
        status: true
    } satisfies Response
})
