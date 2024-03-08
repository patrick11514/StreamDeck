import { z } from 'zod'

export type Response = {
    status: true
}

export type ResponseWithData<T> = Response & {
    data: T
}

export type StreamDeckProperties = {
    firmware: string
    serial: string
    name: string
    rows: number
    cols: number
    iconSize: number
}

export const keySchema = z.object({})

export const configFileSchema = z.object({
    serial: z.string(),
    brightness: z.number(),
    keys: z.record(z.string(), keySchema).optional()
})

export type KeyInfo = z.infer<typeof keySchema>
export type ConfigFileSchema = z.infer<typeof configFileSchema>
