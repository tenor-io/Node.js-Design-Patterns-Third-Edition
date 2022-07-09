/*
4.2 List files recursively: Write listNestedFiles(), a callback-style function that takes, as the input, the path to a
directory in the local filesystem and that asynchronously iterates over all the subdirectories to eventually return a
list of all the files discovered. Here is what the signature of the function should look like:
	function listNestedFiles (dir, cb) { /!* ... *!/ }
Bonus points if you manage to avoid callback hell. Feel free to create additional helper functions if needed.
*/

import fs from 'fs'
import path from 'path'


function listNestedFiles(dir, cb) {
	const files = []
	fs.readdir(dir, (err, data) => {
		if (err) return cb(err)
		if (data.length === 0) return process.nextTick(cb(null, files))
		data.forEach((filename, index) => {
			const file = path.join(dir, filename)
			fs.stat(file, (err, stats) => {
				if (err) return cb(err)
				if (stats.isFile()) {
					files.push(file)
					if(data.length === index + 1) {
						return cb(null, files)
					}
				}
				return listNestedFiles(file, (err, data) => {
					if (err) return cb(err)
					files.concat(data)
					return cb(null, data)
				})
			})
		})
	})
}

(function main() {
	listNestedFiles(process.argv[2], (err, data) => {
		console.log(data)
	})
})()