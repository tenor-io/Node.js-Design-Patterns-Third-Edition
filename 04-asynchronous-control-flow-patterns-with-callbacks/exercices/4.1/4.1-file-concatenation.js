import fs from 'fs'

function concatFiles(...theArgs) {
	if(theArgs.length < 3) throw new Error('Error: Missing arguments')
	const cb = theArgs.pop()
	const dest = theArgs.pop()
	const filenames = theArgs;

	function writeFile(data) {
		fs.writeFile(dest, data, (err)=> {
			cb(err, data, dest)
		})
	}

	task(filenames, null, writeFile)
}

function task(filenames, text, cb) {
	if (filenames.length === 0) return cb(text)
	fs.readFile(filenames.shift(), 'utf8', (err, newText) => {
		if (err) return cb(err)
		task(filenames, text ? `${text} ${newText}` : newText, cb)
	})
}

concatFiles('foo.txt', 'bar.txt', 'baz.txt', 'dest.txt', (err, data, dest) => {
	if(err) return console.log(err.message)
	console.log(`Text \"${data}\" written in file ${dest}`)
})


// Solutions: https://github.com/PacktPublishing/Node.js-Design-Patterns-Third-Edition/wiki/Node.js-Design-Patterns-Third-Edition---Exercise-Solutions#41-file-concatenation