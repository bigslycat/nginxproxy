#!/usr/bin/env node

'use strict'

require('fs').access(
  '/app/yarn.lock',
  (err) => {
    const pm = err ? 'npm' : 'yarn'
    const defaultCommand = `${pm} run build`

    try {
      // eslint-disable-next-line
      const { command } = require('/etc/nodenginx/nodenginx.json')

      if (
        !command ||
        typeof command !== 'string'
      ) throw new Error()

      console.log(command)
    } catch (e) {
      console.log(defaultCommand)
    }
  },
)

