/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises
const { resolve, basename } = require('path')
const glob = require('tiny-glob')

async function fixExports() {
  const rootDir = resolve('.')
  const files = await glob('*.js', {
    absolute: true,
    cwd: resolve(rootDir, './dist'),
  })
  for (const file of files) {
    console.log(`>> Fix ${basename(file)}`)
    let code = await fs.readFile(file, 'utf8')
    code = code.replace('exports.default =', 'module.exports =')
    code += 'exports.default = module.exports;'
    await fs.writeFile(file, code)
  }
}

fixExports()
