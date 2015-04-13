# canopy-node-sim
Canopy Simulator for load testing.
Simulations spin up an Engine. An Engine creates a user that creates a determined number of devices.  Once a device is created, the user passes the credentials to the engine which it uses to spin up a drone that initializes cloud variables and updates those cloud variables at a determined rate until the engine is shut down.

When the engine shuts down, a report prints out that shows the min, max, and average Report Periods for the number of active drones before deleting the drones and the user from the server. 

Drones spin up in batches. Set NUM_DRONES for the drones per batch and NUM_BATCHES for number of batches.  Set BATCH_DELAY for the time between the start of one batch spin-up and another.

Simulation.js uses clustering. It will look to see how many cores are available on your system, then spin up one instance of engine.js per core. 
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
export CLUSTER=boolean [true or false, sets whether to use a cluster based on system cores or run a single instance]
```

# Run a simulation 
```
node simulation.js
