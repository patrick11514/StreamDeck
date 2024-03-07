import type { ResponseWithData } from '$/types/types'
import type { ErrorApiResponse } from '@patrick115/sveltekitapi'
import Path from 'node:path'
import { z } from 'zod'
import { protectedProcedure } from '../../api'
import { DYNAMIC_IMAGES_FOLDER } from '../../variables'

const info = protectedProcedure.POST.input(z.number()).query(async ({ input, ctx }) => {
    const key = ctx.db.getKey(input)

    if (!key) {
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

export default [info]
