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

export const configFileSchema = z.object({
    serial: z.string(),
    brightness: z.number(),
    keys: z.record(z.string(), z.object({})).optional()
})

export type ConfigFileSchema = z.infer<typeof configFileSchema>
