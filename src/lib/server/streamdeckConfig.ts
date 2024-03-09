import { configFileSchema, type ConfigFileSchema, type KeyInfo } from '$/types/types'
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

    private _write() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.content))
    }

    setBrightness(brightness: number) {
        const data = this.content
        data.brightness = brightness

        this._write()
    }

    setKey(keyIndex: number, kData: KeyInfo) {
        const data = this.content
        if (!data.keys) {
            data.keys = {}
        }

        data.keys[keyIndex] = kData

        this._write()
    }

    setKeyData<T extends keyof KeyInfo>(keyIndex: number, key: T, value: KeyInfo[T]) {
        const data = this.content
        if (!data.keys) {
            data.keys = {}
        }

        if (!data.keys[keyIndex]) {
            data.keys[keyIndex] = {} as KeyInfo
        }

        data.keys[keyIndex][key] = value

        this._write()
    }

    existsKey(keyIndex: number) {
        const data = this.content

        if (!data.keys) {
            return false
        }

        return !!data.keys[keyIndex]
    }

    getKey(keyIndex: number): false | KeyInfo {
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
