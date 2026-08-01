const { spawnSync } = require('child_process')
const { readdirSync } = require('fs')
const { join } = require('path')

const root = join(__dirname, '..')
const files = []
const visit = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) visit(path)
    else if (entry.name.endsWith('.js')) files.push(path)
  }
}
visit(root)

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout)
    process.exit(result.status || 1)
  }
}
process.stdout.write(`Checked ${files.length} JavaScript files.\n`)
