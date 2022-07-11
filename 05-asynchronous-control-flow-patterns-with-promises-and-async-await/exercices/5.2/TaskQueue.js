export class TaskQueue {
	constructor(concurrency) {
		this.concurrency = concurrency
		this.running = 0
		this.queue = []
	}

	async runTask(task) {
		return new Promise((resolve, reject) => {
		  this.queue.push(async () => {
		    try {
					const value = await task().then(resolve, reject)
					resolve(value)
				}catch (e){
					reject(e)
				}
		  })
		  process.nextTick(this.next.bind(this))
		})
	}

	async next() {
		while (this.running < this.concurrency && this.queue.length) {
			const task = this.queue.shift()
			this.running++
			await task()
			this.running--
			this.next()
		}
	}
}
