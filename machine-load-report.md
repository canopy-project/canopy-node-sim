1) I changed the spin up delay to .1 and left the report
delay at 1 and ran a test of 1000 machines, everything spun up and reported beautifully.

Each machine begins to report cloud variable updates
as soon as it's initialized

2) So I tried 10000 machines with the same settings.

The process hit the memory limit around 1778 and
finally the process crashed with:

'
FATAL ERROR: JS Allocation failed - process out of memory
Aborted (core dumped)
'

3) Next I tried a 1500 machine test with a 1s spin up 
test.

At this rate, it seems like it would take 25 min to spin up every machine, but since every update gets thrown 
on the event loop, the spin-up rate gradually slowed to 
1/5s at about 500 machines - and 1/6s at 600 machines.
 It seems like this might be the actual time it takes to update all of the devices since everything has the same 1 s interval.

 at 658 machines, the process was at the tipping point
 of running out of memory, so I closed the process.

4) I changed the spin up delay back to .1 and tried 1500 machines

It looks like there is a lag time from starting to update cloud vars. All drones spun up, but
the process ran out of memory when machine 662 just began posting, so I closed it.

5) I ran a test of 700 machines to see if I could get everything to spin up and post vars withoput running out of mem
    it ended up running out of memory

6)  500 machines seems to be a sweetspot, but the cpu usage on full load dances around 90%, so I'd probably dial it back a bit to make sure there are no delays. After a few minutes at that clip, cpu pushed farther into the 90s, but still did not crash...at around 8:30 into the test, cpu usage hit the 100% mark, but did not crash. I ended the test at 10:20