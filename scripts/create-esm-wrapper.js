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

  let outputString = `// esm-wrapper
  export * from '../${normalizedFile}';
  `

  let hasDefault = false
  for (const key of [...keys].sort()) {
    if (key === 'default') {
      hasDefault = true
      outputString += `import mod from '../${normalizedFile}';\nexport default mod.default;`
      continue
    }
    outputString += `export const ${key} = mod.${key};\n`
  }

  if (!hasDefault) {
    outputString += `export { default } from '../${normalizedFile}'`
  }

  if (!existsSync('esm')) {
    mkdirSync('esm')
  }

  writeFile(`esm/${sourceFile}`, outputString)
}

function writeFile(path, fileData) {
  writeFileSync(path, fileData)
}

main()
