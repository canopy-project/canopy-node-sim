Results 2015-05-03
------------------------------------------------------------------------------------------------
Host: http://dev03.canopy.link (Cisco)
Instance Type: GP2-Large | 8GB RAM | 2 VCPU | 50.0GB Disk
Behind Apache Proxy: 
500 drones reporting 1/sec

    TX:             cum:   19.8MB   peak:    218kb                                    rates:    183kb   195kb   194kb
    RX:                    9.34MB           99.7kb                                             94.3kb  94.3kb  94.2kb
    TOTAL:                 29.1MB            314kb                                              277kb   289kb   288kb

    load average: 0.20, 0.18, 0.20

    root      20   0  537588  12376   5412 S  12.9  0.2   4:42.68 canopy-server       
    root      20   0 3446232 473792  38668 S  10.9  5.8   4:19.76 java      


w/ 1000 drones:
    
    TX:             cum:   34.4MB   peak:    410kb                               rates:    383kb   363kb   364kb
    RX:                    17.5MB            198kb                                         192kb   190kb   188kb
    TOTAL:                 51.9MB            601kb                                         575kb   554kb   552kb

    load average: 1.31, 0.88, 0.52

    8210 root      20   0  430124  11664   5292 S  32.9  0.1   5:36.91 canopy-server                           
    29027 root      20   0 3546356 853208 126584 S  24.9 10.4  12:39.06 java          

Results 2015-05-01
------------------------------------------------------------------------------------------------
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
