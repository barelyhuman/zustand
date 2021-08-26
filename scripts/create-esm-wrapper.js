#! /usr/bin/env node

const { writeFileSync, mkdirSync, existsSync } = require('fs')
const { resolve, dirname } = require('path')

function main() {
  const [sourceFile] = process.argv.slice(2)

  if (!sourceFile) {
    throw new Error('Please provide a source file')
  }

  let normalizedFile = sourceFile.replace('../', '').replace('./', '')
  const _cjsModule = require(resolve(sourceFile))
  const keys = new Set(Object.getOwnPropertyNames(_cjsModule))
  keys.delete('__esModule')

  if (typeof _cjsModule === 'function') {
    for (const key of ['length', 'prototype', 'name', 'caller']) {
      keys.delete(key)
    }
  }

  let outputString = `// esm-wrapper
  export * from '../${normalizedFile}';
  import _module from '../${normalizedFile}';
  `

  let hasDefault = false
  for (const key of [...keys].sort()) {
    if (key === 'default') {
      hasDefault = true
      outputString += `export default _module.default;`
      continue
    }
    outputString += `export const ${key} = _module.${key};\n`
  }

  if (!hasDefault) {
    outputString += `export default _module`
  }

  const targetFile = `esm/${sourceFile}`
  mkdirSync(dirname(targetFile), { recursive: true })
  writeFile(targetFile, outputString)
}

function writeFile(path, fileData) {
  writeFileSync(path, fileData)
}

main()
