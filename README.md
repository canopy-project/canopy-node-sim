# canopy-node-sim
Canopy Simulator for load testing.
Simulations spin up an Engine. An Engine creates a user that creates a determined number of devices.  Once a device is created, the user passes the credentials to the engine, which it uses to spin up a drone that initializes cloud variables and updates those cloud variables at a determined rate until the engine is shut down.

When the engine shuts down, a report prints out that shows the min, max, and average latencies for the number of active drones before deleting the drones and the user from the server. 

# Set Environment Variables
```
export CANOPY_PORT="yourport" [80 for http, 433 for https]
export CANOPY_HOST="yourSite.com"
export CANOPY_PROTOCOL='your protocol' ['http' or 'https']
export NUM_DRONES="yourNum" [number of drones in a batch]
export NUM_BATCHES="yourNum" [number of batches]
export SPIN_UP_DELAY="yourDelay" [Seconds between drone spin ups]
export BATCH_DELAY="yourDelay" [Seconds between batch spin ups]
export REPORT_PERIOD="yourReportPeriod" [Seconds between drone variable updates]
```

# Run a simulation 
```
node simulation.js
```
# To Do

Set up engine to spin up batches of drones sequentially to gather data on latencies for 10, 100, 1000, etc. drones.


```
	// LINEAR LOAD: take the total numDrones amount - divide it by numBatches, then step it up linearly
var loadDrones = function( numDrones, numBatches, batchInterval  ){
	var batch = parseInt( numDrones/numBatches );
	// spin up the first batch and let them run for batchInterval, then add the next chunk
}	

	// EXPONENTIAL LOAD: take the total numDrones amount - divide it by 10, then step it up exponentially
```
