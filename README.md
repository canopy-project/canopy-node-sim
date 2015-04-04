# canopy-node-sim
Canopy Simulator for load testing

# Set Environment Variables
```
export CANOPY_PORT="yourport" [80 for http, 433 for https]
export CANOPY_HOST="yourSite.com"
export CANOPY_PROTOCOL='your protocol' ['http' or 'https']
export NUM_DRONES="yourNum" [number of drones to spin up]
export SPIN_UP_DELAY="yourDelay" [Seconds between drone spin ups]
export REPORT_PERIOD="yourReportPeriod" [Seconds between drone variable updates]
```

# Test a User
```
node simulation.js
```

