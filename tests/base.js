// // Import and run artillery
// //console.log(ReadableStream)
// const { exec } = require('child_process');
// exec('artillery ./base.yml', (error, stdout, stderr) => {
//   if (typeof global.ReadableStream === 'undefined') { global.ReadableStream = require('stream').Readable; }
//   if (error) {
//     console.error(`Error: ${error.message}`);
//     return;
//   } if (stderr) {
//     console.error(`Stderr: ${stderr}`);
//     return;
//   } console.log(`Output: ${stdout}`);
// });