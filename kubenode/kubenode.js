'use strict';
const { run } = require('@kubenode/cli');

async function main() {
  try {
    await run(process.argv.slice(2));
  } catch (err) {
    console.log(err.message);
  }
}

main();
