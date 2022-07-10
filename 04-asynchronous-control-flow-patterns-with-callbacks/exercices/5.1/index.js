function promiseAll(promises) {
	let unfufilled = promises.length
	const fufilledValues = []
	return new Promise((resolve, reject) => {
		const startTime = Date.now()
		function customResolve(value) {
			fufilledValues.push(value)
			if(--unfufilled===0){
				console.log('Elapsed time: ', (Date.now() - startTime) / 1000)
				resolve(fufilledValues)
			}
		}
		function customReject(err){
			console.log('Elapsed time: ', (Date.now() - startTime) / 1000)
			reject(err)
		}
		for(const p of promises) {
			p.then(customResolve, customReject)
		}
	})
}








const errorNumber = 5
const promisses = []
for (let count = 1; count <= 10; count++ ){
	promisses.push(new Promise((resolve, reject) => {
		setTimeout(count === errorNumber ? ()=>reject(count) : ()=>resolve(count), count * 1000)
	}))
}

promiseAll(promisses).then((data)=>console.log('Resolved:', data), (err)=>console.log('Rejected:', err))