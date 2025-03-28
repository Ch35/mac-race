TODO:
- Implement boat edit

# Caveats
- A single admin should be viewing `/admin` at a time
  - Multiple admins clicking can cause duplicate data and other potential issues
- An admin needs to be on `/admin` before the race starts to auto initialise laps
  - If a connection error occurs, you can manually "Reset Last Laps" based on either race
  - "Reset Last Laps" only works on ACTIVE races - races that have NOT ended and HAVE started

# Notes
- The flag indicator will show up for boats if:
  - the race has started and it has no started laps
  - the current lap time exceeds the maximum lap time