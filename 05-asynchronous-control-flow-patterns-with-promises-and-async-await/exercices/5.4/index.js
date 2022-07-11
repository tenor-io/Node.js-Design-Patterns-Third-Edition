function asyncMap(iterable, callback, concurrency) {
	return new Promise((resolve, reject) => {
		const resolvedValues = new Array(iterable.length)
		let pendingCount = iterable.length
		const queue = []
		let running = 0
		iterable.forEach(async (item, index) =>
			queue.push(async () => {
					resolvedValues[index] = await callback(item)
					if (--pendingCount === 0) {
						resolve(resolvedValues)
					}
					return resolvedValues[index]
				}
			))

		const next = () => {
			while (running < concurrency && queue.length) {
				const task = queue.shift()
				task().finally(() => {
					running--
					next()
				})
				running++
			}
		}

		next()

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
