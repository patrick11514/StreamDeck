import { DYNAMIC_IMAGES_FOLDER, isValidExtension } from '$/lib/server/variables'
import { error, type RequestHandler } from '@sveltejs/kit'
import fs from 'node:fs'
import path from 'node:path'

export const GET = (async ({ params, setHeaders }) => {
    const fullPath = path.join(DYNAMIC_IMAGES_FOLDER, params.path as string)
    const filePath = path.parse(fullPath)

    if (!isValidExtension(filePath.ext)) {
        throw error(404, 'Not Found')
    }

    if (!fs.existsSync(fullPath)) {
        throw error(404, 'Not Found')
    }

    const fileContent = fs.readFileSync(fullPath)
    const data = fs.statSync(fullPath)

    setHeaders({
        'Content-Type': 'image/' + filePath.ext.slice(1),
        'Content-Length': data.size.toString(),
        'Last-Modified': data.mtime.toUTCString(),
        'Cache-Control': 'public, max-age=600'
    })

    return new Response(fileContent)
}) satisfies RequestHandler
