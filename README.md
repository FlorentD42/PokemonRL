# Pokemon x Rogue-Like (working title)

## Description
PxRL is a Javascript based game trying to mix the gameplay of Pokémon with that of Rogue-Like games (WIP). The base idea (still subject to changes) is to appear in a randomly-generated world, choose a starter, explore, battle trainers, catch wild Pokémon, win all 4 gym badges and finally beat the league.

### Some rules
- Any Pokémon that faints is considered dead (you careless monster).
- Each run should last less than 2h, so some simplifications are in order: teams of 3 Pokémon instead of 6, two random moves based on the Pokémon type (and a smaller pool of moves).
- The level of all Pokémon (caught, wild, trainers') will be based on the level of the player, which will be the number of badges they possesses. This will allow to fight gyms in any order, prevent grinding experience and favour choosing the right team. This will also affect the nature of wild Pokémon (no more Pidgeys at high level!)
- However Pokémon experience will be used to change their moveset or evolve them (some evolutions will require gym badges).
- Once the League's champion beaten, your team become theirs for the next run.
- Only the Pokédex will remain from each *successful* run. The main goal will be to complete it with the 151 Pokémon from the first generation.
- Each generated world will have its own set of catchable Pokémon and will have a small chance to spawn a map with a legendary or rare Pokémon so several runs will be necessary to complete the Pokédex.

A live demo is available [here](http://shugah.net).

## TODO List
- [x] Outdoor map generation and exploration (done before the Git upload)
- [ ] Houses and cave systems
- [ ] NPCs (idle)
- [ ] Dialog windows (for signs, items and NPCs)
- [ ] Menu (Pokédex, Pokémon, Bag, Map)
- [ ] Items to pick up
- [ ] A combat system (simplified from the original games)
- [ ] Pokémon and trainer sprites
- [ ] Pokémon progression system (how they become stronger? Evolve? Learn new moves?)
- [ ] Pokémon Centers and Poké Marts
- [ ] Special maps and NPCs (Pension to get exp, Lab to revive Pokémon, evolution stones trader, Legendary Pokémon maps, ...)
- [ ] Wild Pokémon battles
- [ ] Trainer battles
- [ ] Gym battles
- [ ] League
