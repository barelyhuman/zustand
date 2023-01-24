import fs from 'fs/promises'
import { join } from 'node:path'
import esbuild from 'esbuild'

async function* getFiles(path = `./`) {
  const entries = await fs.readdir(path, { withFileTypes: true })

  for (const file of entries) {
    const nestedPath = join(path, file.name)
    if (file.isDirectory()) {
      yield* getFiles(`${nestedPath}/`)
    } else {
      yield nestedPath
    }
  }
}

async function minifyDirectory(dir) {
  const options = {
    format: 'esm',
    minify: true,
    target: 'node12',
  }

  for await (const filePath of getFiles(dir)) {
    if (!filePath.endsWith('.js')) {
      continue
    }

    const fileContents = await fs.readFile(filePath, 'utf-8')
    const transformed = await esbuild.transform(fileContents, options)
    await fs.writeFile(
      filePath.replace(/.development.js$/, '.production.js'),
      transformed.code
    )
  }
}

await minifyDirectory('dist/umd/')
await minifyDirectory('dist/system/')
