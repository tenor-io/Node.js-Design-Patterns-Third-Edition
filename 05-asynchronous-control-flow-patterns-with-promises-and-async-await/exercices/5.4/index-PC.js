function asyncMap(iterable, callback, concurrency) {
	return new Promise((resolve, reject) => {
		const resolvedValues = new Array(iterable.length)
		const consumerQueue = []
		const taskQueue = []
		let running = 0

		const getNextTask = () => {
			return new Promise((resolve) => {
				if (this.taskQueue.length !== 0) {
					return resolve(this.taskQueue.shift())
				}

				this.consumerQueue.push(resolve)
			})
		}

		const consumer = async () => {
			while (true) {
				try {
					const task = await getNextTask()
					await task()
				} catch (err) {
					console.error(err)
				}
			}
		}

		for (let i = 0; i < concurrency; i++) {
			consumer()
		}

		iterable.forEach(async (item, index) => {
			const taskWrapper = () => {
				const taskPromise = resolvedValues[index] = callback(item)
				taskPromise.then(resolve, reject)
				return taskPromise
			}

			if (consumerQueue.length !== 0) {
				const consumer = consumerQueue.shift()
				consumer(taskWrapper)
			} else {
				taskQueue.push(taskWrapper)
			}
		})

	})
}

const errorNumber = parseInt(process.argv[3]) ?? 11
const array = []
const callback = (value) => new Promise((resolve, reject) => {
	setTimeout(value === errorNumber ? () => reject(value) : () => resolve(value), value * 1000)
})
for (let count = 1; count <= 10; count++) {
	array.push(count)
}

console.log('start')
const startTime = Date.now()
const result = await asyncMap(array, callback, process.argv[2])
console.log('end:', result)
console.log('Elapsed time: ', (Date.now() - startTime) / 1000)
