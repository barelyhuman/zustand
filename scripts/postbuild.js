/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises
const { resolve, basename } = require('path')
const glob = require('tiny-glob')

async function fixExports() {
  const exportDefRgx = /^exports\.(\w+)\s+=\s+(\w+)[;]?/gm
  const rootDir = resolve('.')
  const files = await glob('*.js', {
    absolute: true,
    cwd: resolve(rootDir, './dist'),
  })
  for (const file of files) {
    console.log(`>> Fix ${basename(file)}`)
    let code = await fs.readFile(file, 'utf8')
    const exportContexts = []
    const exportDefs = code.matchAll(exportDefRgx)
    for (const exportStmt of exportDefs) {
      exportContexts.push([exportStmt[1], exportStmt[2]])
    }
    const defIndex = exportContexts.findIndex((x) => x[0] === 'default')
    if (defIndex > -1) {
      const ctxValue = exportContexts[defIndex]
      exportContexts.splice(defIndex, 1)
      exportContexts.unshift(ctxValue)
    }

    exportContexts.forEach((ctx) => {
      if (ctx[0] === 'default') {
        code += `module.exports = ${ctx[1]};\n`
      } else {
        code += `module.exports.${ctx[0]} = ${ctx[1]};\n`
      }
    })
    code += 'exports.default = module.exports;'
    await fs.writeFile(file, code)
  }
}

fixExports()
