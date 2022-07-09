import fs from 'fs'
import path from 'path'

class Queue {
	constructor(maxConcurrency) {
		this.running = 0
		this.maxConcurrency = maxConcurrency
		this.queue = []
	}

	add(name, task) {
		console.log('task added:', name)
		this.queue.push([name, task])
		this.next()
	}

	next() {
		if (this.queue.length > 0 && this.running < this.maxConcurrency) {
			this.running++
			const task = this.queue.shift()
			console.log('task started:', task[0])
			task[1](this.done.bind(this, task[0]))
		}
	}

	done(name, err, data, cb) {
		console.log('task done:', name)
		if (cb) cb(err, data)
		this.running--
		this.next()
	}
}

function findRecursively(dir, keyword, queue, cb) {
	const matchedFiles = []
	fs.readdir(dir, (err, filenames) => {
		if (err) cb(err)
		if (filenames.length === 0) process.nextTick(cb(null, matchedFiles))
		const files = filenames.map(filename => path.join(dir, filename))
		let toComplete = files.length
		files.forEach(file => {
			fs.stat(file, (err, stats) => {
				if (err) cb(err)
				if (stats.isFile()) {
					queue.add(file, (done) => {
						fs.readFile(file, function (err, content) {
							if (err) return done(err, null, cb);
							if (content.indexOf(keyword) >= 0) {
								matchedFiles.push(file)
							}
							if (--toComplete === 0) {
								return done(null, matchedFiles, cb)
							} else {
								return done()
							}
						})
					});
				} else {
					findRecursively(file, keyword, queue, (err, data) => {
						if (err) return cb(err)
						matchedFiles.push(...data)
						return cb(null, matchedFiles)
					})
				}
			})
		})
	})
}

(function main() {
	findRecursively(process.argv[2], process.argv[3], new Queue(2), (err, data) => {
		console.log(data)
	})
})()
