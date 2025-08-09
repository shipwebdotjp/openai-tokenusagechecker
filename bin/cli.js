#!/usr/bin/env node
import('../src/index.js')
  .then(mod => {
    if (mod && typeof mod.main === 'function') {
      // Call main() and allow it to handle its own exits/errors
      mod.main();
    } else {
      console.error('Error: CLI entry module does not export main()');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error starting CLI:', err?.message ?? err);
    process.exit(1);
  });
