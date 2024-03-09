import type { KeyInfo, ResponseWithData } from '$/types/types'
import type { ErrorApiResponse } from '@patrick115/sveltekitapi'
import { protectedProcedure } from '../../api'

export const keys = protectedProcedure.GET.query(async ({ ctx }) => {
    const data = ctx.db.getKeys()

    if (!data) {
        return {
            status: false,
            code: 404,
            message: 'Keys not found'
        } satisfies ErrorApiResponse
    }

    return {
        status: true,
        data
    } satisfies ResponseWithData<Record<string, KeyInfo>>
})
