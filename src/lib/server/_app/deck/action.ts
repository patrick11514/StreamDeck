/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import { protectedProcedure } from '../../api'

const data = {
    teamspeak5: ['mute_mic', 'unmute_mic', 'toggle_mic', 'mute_output', 'unmute_output', 'toggle_output']
} as const

type Data = typeof data
type Union = `${keyof Data}:${Data[keyof Data][number]}`

// oh boy don't do this
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never

// TS4.0+
type Push<T extends any[], V> = [...T, V]

// TS4.1+
type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

type Tuple = TuplifyUnion<Union>

const createArray = (array: Data): Tuple => {
    const result = []

    for (const key in array) {
        for (const value of array[key as keyof Data]) {
            result.push(`${key}:${value}`)
        }
    }

    return result as Tuple
}

const constructArray = createArray(data)

const actionName = z.union(constructArray)

export const action = protectedProcedure.POST()
