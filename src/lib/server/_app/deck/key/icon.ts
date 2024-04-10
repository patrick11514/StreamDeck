import { protectedProcedure } from '$/lib/server/api'
import { DYNAMIC_IMAGES_FOLDER } from '$/lib/server/variables'
import type { Response, ResponseWithData } from '$/types/types'
import type { ErrorApiResponse } from '@patrick115/sveltekitapi'
import fs from 'node:fs'
import Path from 'node:path'
import { z } from 'zod'

const get = protectedProcedure.POST.input(z.number()).query(async ({ input, ctx }) => {
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

const remove = protectedProcedure.DELETE.input(z.number()).query(async ({ input, ctx }) => {
    if (!ctx.db.existsKey(input)) {
        return {
            status: false,
            code: 404,
            message: 'Key not found'
        } satisfies ErrorApiResponse
    }

    const data = ctx.db.getKey(input)

    if (!data || data.icon === false) {
        return {
            status: false,
            code: 404,
            message: 'Key not found'
        } satisfies ErrorApiResponse
    }

    ctx.db.setKeyData(input, 'icon', false)

    const path = Path.join(DYNAMIC_IMAGES_FOLDER, ctx.serial, input + '.png')

    if (fs.existsSync(path)) {
        fs.unlinkSync(path)
    }

    ctx.device.clearKey(input)

    return {
        status: true
    } satisfies Response
})

export default [get, remove]
