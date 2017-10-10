#!/usr/bin/env node

/**
 * This script was created for your convenience.
 */

'use strict'

const { writeFileSync } = require('fs')

let proxies

try {
  try {
    // eslint-disable-next-line
    proxies = require('/etc/nginxproxy/nginxproxy.json')
  } catch (e) {
    // eslint-disable-next-line
    proxies = require('/etc/nginxproxy/nginxproxy.js')
  }
} catch (e) {
  console.log('Proxies config not found or broken. Skipping proxy generation...')
  process.exit(0)
}

if (!proxies || typeof proxies !== 'object' || Array.isArray(proxies)) {
  console.log('Proxies config must be an object. Skipping proxy generation...')
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
    `/etc/nginx/conf.d/default.d/location.${name}.conf`,
    content, 'utf8'
  )

Object
  .entries(proxies)
  .map(build)
  .forEach(save)
