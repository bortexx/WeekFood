var mini = require('@node-minify/core');
var ter = require('@node-minify/terser')
mini({
    compressor: ter,
    input: ['src/app/views/cliente/js/*.js','src/app/views/cliente/js/*/*.js'],
    output: 'dist/js/WeekFood.js',
    callback: function (err, min) { }
});