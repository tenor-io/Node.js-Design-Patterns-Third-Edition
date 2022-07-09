import fs from 'fs'
import path from 'path'

class Queue {
	constructor(maxConcurrency) {
		this.running = 0
		this.maxConcurrency = maxConcurrency
		this.queue = []
	}

	add(task) {
		console.log('task added')
		this.queue.push(task)
		this.next()
	}

	next() {
		if (this.queue.length > 0 && this.running < this.maxConcurrency) {
			console.log('task started')
			this.running++
			this.queue.shift()(this.done.bind(this))
		}
	}

	done(err, data, cb) {
		console.log('task done')
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
		files.forEach(file => queue.add((done) => {
			fs.stat(file, (err, stats) => {
				if (err) done(err, cb)
				if (stats.isFile()) {
					fs.readFile(file, function (err, content) {
						if (err) return done(err, cb);
						if (content.indexOf(keyword) >= 0) {
							matchedFiles.push(file)
						}
						if (--toComplete === 0) {
							return done(null, matchedFiles, cb)
						}
						return done()
					});
				} else {
					findRecursively(file, keyword, queue, (err, data) => {
						if (err) return done(err,null, cb)
						if (--toComplete === 0) {
							return done(null, matchedFiles.concat(data), cb)
						}
						return done()
					})
				}
			})
		}))
	})
}

(function main() {
	findRecursively(process.argv[2], process.argv[3], new Queue(2), (err, data) => {
		console.log(data)
	})
})()
