import { protectedProcedure } from '$/lib/server/api'
import { DYNAMIC_IMAGES_FOLDER } from '$/lib/server/variables'
import type { ResponseWithData } from '$/types/types'
import type { ErrorApiResponse } from '@patrick115/sveltekitapi'
import Path from 'node:path'
import { z } from 'zod'

export const icon = protectedProcedure.POST.input(z.number()).query(async ({ input, ctx }) => {
    if (!ctx.db.existsKey(input)) {
        return {
            status: false,
            code: 404,
            message: 'Key not found'
        } satisfies ErrorApiResponse
    }

    return {
        status: true,
        data: Path.join(DYNAMIC_IMAGES_FOLDER, ctx.serial, input + '.png')
    } satisfies ResponseWithData<string>
})
