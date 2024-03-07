import { protectedProcedure } from '$/lib/server/api'
import type { ResponseWithData } from '$/types/types'
import { FormDataInput, type ErrorApiResponse } from '@patrick115/sveltekitapi'
import fs from 'node:fs'
import Path from 'node:path'
import sharp from 'sharp'
import { DYNAMIC_IMAGES_FOLDER, isValidExtension } from '../variables'

export const upload = protectedProcedure.POST.input(FormDataInput).query(async ({ input, ctx }) => {
    const keyStr = input.get('key') as string | null
    const image = input.get('image') as File | null

    if (!keyStr || !image) {
        return {
            status: false,
            code: 400,
            message: 'Invalid input'
        } satisfies ErrorApiResponse
    }

    const key = parseInt(keyStr)

    const path = Path.join(DYNAMIC_IMAGES_FOLDER, ctx.serial, key + '.png')

    const parsed = Path.parse(image.name)

    if (!isValidExtension(parsed.ext)) {
        return {
            status: false,
            code: 400,
            message: 'Invalid file extension'
        } satisfies ErrorApiResponse
    }

    if (!fs.existsSync(Path.join(DYNAMIC_IMAGES_FOLDER, ctx.serial))) {
        fs.mkdirSync(Path.join(DYNAMIC_IMAGES_FOLDER, ctx.serial), {
            recursive: true
        })
    }

    const buffer = await image.arrayBuffer()

    const data = await sharp(buffer).flatten().resize(ctx.device.ICON_SIZE, ctx.device.ICON_SIZE).raw().toBuffer()
    await ctx.device.fillKeyBuffer(key, data)

    const file = await sharp(buffer).resize(ctx.device.ICON_SIZE, ctx.device.ICON_SIZE).png().toBuffer()

    fs.writeFileSync(path, file)

    ctx.db.setKey(key)

    return {
        status: true,
        data: path
    } satisfies ResponseWithData<string>
})
