import { proctedProcedure } from '$lib/server/api'
import type { Response } from '$types/types'
import { z } from 'zod'

export const brightness = proctedProcedure.POST.input(z.number()).query(async ({ input, ctx }) => {
    ctx.device.setBrightness(input)

    ctx.db.setBrightness(input)

    return {
        status: true
    } satisfies Response
})
