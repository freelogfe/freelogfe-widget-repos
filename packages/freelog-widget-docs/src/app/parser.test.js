const fs = require('fs')
const data = fs.readFileSync('./widget开发文档-1.txt').toString()
const catalogParser = require('./catalog-parser')

const { catalogTreeData, catalogList } = catalogParser(data)
console.log(catalogTreeData)
