import { configFileSchema, type ConfigFileSchema } from '$/types/types'
import fs from 'node:fs'
import path from 'node:path'

export class StreamDeckConfig {
    public serial: string
    private filePath: string
    private content: ConfigFileSchema

    constructor(serial: string) {
        this.serial = serial
        this.filePath = path.join('configs', `${serial}.json`)

        if (!fs.existsSync('configs')) {
            fs.mkdirSync('configs')
        }

        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(
                this.filePath,
                JSON.stringify({
                    serial,
                    brightness: 100
                } satisfies ConfigFileSchema)
            )
        }

        const data = fs.readFileSync(this.filePath, 'utf-8')

        const result = configFileSchema.safeParse(JSON.parse(data))

        if (!result.success) {
            console.error(result.error)

            throw new Error('Could not parse config file')
        }

        this.content = result.data
    }

    setBrightness(brightness: number) {
        const data = this.content
        data.brightness = brightness

        fs.writeFileSync(this.filePath, JSON.stringify(data))
    }

    setKey(keyIndex: number) {
        const data = this.content
        if (!data.keys) {
            data.keys = {}
        }

        data.keys[keyIndex] = {}

        fs.writeFileSync(this.filePath, JSON.stringify(data))
    }

    existsKey(keyIndex: number) {
        const data = this.content

        if (!data.keys) {
            return false
        }

        return !!data.keys[keyIndex]
    }

    getKey(keyIndex: number): false | object {
        const data = this.content

        if (!data.keys) {
            return false
        }

        return data.keys[keyIndex]
    }

    getKeys() {
        return this.content.keys
    }
}
