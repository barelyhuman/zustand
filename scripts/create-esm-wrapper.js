#! /usr/bin/env node

const { writeFileSync, mkdirSync, existsSync } = require('fs')
const { resolve } = require('path')

function main() {
  const [sourceFile] = process.argv.slice(2)

  if (!sourceFile) {
    throw new Error('Please provide a source file')
  }

  let normalizedFile = sourceFile.replace('../', '').replace('./', '')
  const cjsMod = require(resolve(sourceFile))
  const keys = new Set(Object.getOwnPropertyNames(cjsMod))
  keys.delete('__esModule')

  if (keys.has('default')) {
    const outputString = `// esm-wrapper
export * from '../${normalizedFile}';
import mod from '../${normalizedFile}'
export default mod.default
  `

    if (!existsSync('esm')) {
      mkdirSync('esm')
    }
    return writeFile(`esm/${sourceFile}`, outputString)
  }

  const outputString = `// esm-wrapper
export * from '../${normalizedFile}';
export { default } from '../${normalizedFile}';
  `
  if (!existsSync('esm')) {
    mkdirSync('esm')
  }
  writeFile(`esm/${sourceFile}`, outputString)
}

function writeFile(path, fileData) {
  writeFileSync(path, fileData)
}

main()
