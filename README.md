You need to have node and npm installed.

To run the server:
```
npm install
DEBUG=wizards:* bin/www
```
then go to http://localhost:3000/

I am building a better grunt-based run/build system but it's not ready yet.

Current version does not really work.

TODO goals:
===

1. Gruntfile build/run system
2. run instance of game on serverside
3. connect client code to json-loader style of running
4. make two players able to move boxes around in the same room (arbitrated by the server)
