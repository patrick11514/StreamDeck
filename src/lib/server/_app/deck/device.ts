import { configFileSchema, type ConfigFileSchema, type Response, type ResponseWithData, type StreamDeckProperties } from '$/types/types'
import { procedure, protectedProcedure } from '$lib/server/api'
import { closeDevice as cls, device, updateDevice } from '$lib/server/context'
import { listStreamDecks, openStreamDeck } from '@elgato-stream-deck/node'
import type { ErrorApiResponse } from '@patrick115/sveltekitapi'
import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'

const devices = procedure.GET.query(async ({ ctx }) => {
    const devices = await listStreamDecks()

    const data = {
        connected: ctx.connected
    } as
        | {
              connected: false
          }
        | {
              connected: true
              data: StreamDeckProperties
          }

    if (data.connected && ctx.connected) {
        const dev = ctx.device

        data.data = {
            firmware: await dev.getFirmwareVersion(),
            serial: ctx.serial,
            rows: dev.KEY_ROWS,
            cols: dev.KEY_COLUMNS,
            name: dev.PRODUCT_NAME,
            iconSize: dev.ICON_SIZE
        }
    }

    return {
        status: true,
        data: {
            devices,
            ...data
        }
    } satisfies ResponseWithData<
        {
            devices: typeof devices
        } & (
            | {
                  connected: false
              }
            | { connected: true; data: StreamDeckProperties }
        )
    >
})

const select = procedure.PUT.input(z.string()).query(async ({ input, ctx }) => {
    try {
        if (ctx.connected) {
            await ctx.device!.close()
        }

        const result = await Promise.race([
            openStreamDeck(input),
            new Promise<null>((resolve) => {
                setTimeout(() => {
                    resolve(null)
                }, 2000)
            })
        ])
        if (!result) {
            return {
                status: false,
                code: 500,
                message: 'Could not open device'
            } satisfies ErrorApiResponse
        }

        updateDevice(result)
    } catch (_) {
        return {
            status: false,
            code: 500,
            message: 'Could not open device'
        } satisfies ErrorApiResponse
    }

    const dev = device!

    const serial = await dev.getSerialNumber()

    return {
        status: true,
        data: {
            firmware: await dev.getFirmwareVersion(),
            serial,
            rows: dev.KEY_ROWS,
            cols: dev.KEY_COLUMNS,
            name: dev.PRODUCT_NAME,
            iconSize: dev.ICON_SIZE
        }
    } satisfies ResponseWithData<StreamDeckProperties>
})

const loadInfo = protectedProcedure.POST.input(z.string()).query(async ({ input, ctx }) => {
    if (!fs.existsSync('configs')) {
        fs.mkdirSync('configs')
    }

    const id = await ctx.device.getSerialNumber()

    if (id !== input) {
        return {
            status: false,
            code: 500,
            message: 'Device ID does not match'
        } satisfies ErrorApiResponse
    }

    const file = path.join('configs', input + '.json')

    if (!fs.existsSync(file)) {
        fs.writeFileSync(
            file,
            JSON.stringify({
                serial: input,
                brightness: 100
            } satisfies ConfigFileSchema)
        )
    }

    const raw = fs.readFileSync(file, 'utf-8')

    try {
        const obj = JSON.parse(raw)
        const data = configFileSchema.parse(obj)

        if (data.serial !== input) {
            return {
                status: false,
                code: 500,
                message: 'Device ID does not match'
            } satisfies ErrorApiResponse
        }

        await ctx.device.setBrightness(data.brightness)

        return {
            status: true,
            data
        } satisfies ResponseWithData<ConfigFileSchema>
    } catch (_) {
        /* empty */
    }

    return {
        status: false,
        code: 500,
        message: 'Could not parse config file'
    } satisfies ErrorApiResponse
})

const closeDevice = protectedProcedure.DELETE.input(z.any()).query(async () => {
    cls()

    return {
        status: true
    } satisfies Response
})

export default [devices, select, loadInfo, closeDevice]
