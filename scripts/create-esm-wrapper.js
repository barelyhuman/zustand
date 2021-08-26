#! /usr/bin/env node

const { writeFileSync, mkdirSync, existsSync } = require('fs')

function main() {
  const [sourceFile] = process.argv.slice(2)

  if (!sourceFile) {
    throw new Error('Please provide a source file')
  }

  const outputString = `// esm-wrapper
export * from '../${sourceFile}';
export { default } from '../${sourceFile}';
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
