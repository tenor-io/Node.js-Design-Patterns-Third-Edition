import EventEmitter from "events";

const errorMessage = "Timestamp divisible by 5";

function ticker(time, cb) {
  let localTime = time;
  let tickCount = 0;
  const emitter = new EventEmitter();
  function tick() {
    localTime -= 50;
    if (localTime <= 0) {
      cb(null, tickCount);
    } else {
      if (Date.now() % 5 === 0) {
        const error = new Error(errorMessage);
        emitter.emit("error", error);
        cb(error);
      } else {
        emitter.emit("tick", tickCount++);
        setTimeout(tick, localTime);
      }
    }
  }

  setTimeout(function initialTick() {
    tick();
  }, 0);

  return emitter;
}

ticker(500, (error, tickCount) => {
  if (error) {
    console.log(`CBError: ${error.message}`);
  } else {
    console.log(`Number of Ticks until End: ${tickCount}`);
  }
})
  .on("tick", (tickCount) => console.log("tick:", tickCount))
  .on("error", (error) => console.log(`EventError: ${error.message}`));
