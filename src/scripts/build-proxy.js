#!/usr/bin/env node

/**
 * This script was created for your convenience.
 */

'use strict'

const { writeFileSync } = require('fs')
const { resolve } = require('path')

let config

const configFile = '/etc/nodenginx/nodenginx.json'

try {
  // eslint-disable-next-line
  config = require(configFile)
} catch (e) {
  console.log(`${configFile} not found. Skipping proxy generation...`)
  process.exit(0)
}

const { proxies } = config

if (!proxies) {
  console.log(`"proxies" entry in ${configFile} not found. Skipping proxy generation...`)
  process.exit(0)
}

if (typeof proxies !== 'object' || Array.isArray(proxies)) {
  console.log(`"proxies" entry in ${configFile} must be an object. Skipping proxy generation...`)
  process.exit(0)
}

const toLowerCase = str => str.toLowerCase()

const toKebabCase =
  str => str
    .split(/[^a-z0-9]/i)
    .filter(Boolean)
    .map(toLowerCase)
    .join('-')

const template = (from, to, cors) =>
  `location ${from} {
  proxy_pass ${to};
  ${cors ? 'include /etc/nginx/cors.conf;' : ''}
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection $connection_upgrade;
  proxy_read_timeout 86400s;
}`

const build =
  ([localPath, entryConfig]) => {
    const url = typeof entryConfig === 'string' ? entryConfig : entryConfig.url
    const cors = entryConfig['enable-cors']

    return {
      name: localPath === '/' ? 'root' : toKebabCase(localPath),
      content: template(localPath, url, cors),
    }
  }

const save =
  ({ name, content }) => writeFileSync(
    resolve('/etc/nginx/conf.d/default.d', `location.${name}.conf`),
    content, 'utf8',
  )

Object
  .entries(proxies)
  .map(build)
  .forEach(save)
