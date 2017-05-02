# et-github-autorelease

[![Greenkeeper badge](https://badges.greenkeeper.io/eventEmitter/et-github-autorelease.svg)](https://greenkeeper.io/)
 

## installation

	npm install et-github-autorelease

## usage

create an upstart job

	#!upstart

	description "autorelease agent"
	author      "michael@joinbox.com"


	env PROGRAM_NAME="autorelease"
	env FULL_PATH="/apps/eventemitter/et-github-autorelease"
	env FILE_NAME="index.js"
	env NODE_PATH="/usr/local/bin/node"
	env USERNAME="root"

	start on startup
	stop on shutdown

	respawn
	respawn limit 10 90

	script
	    export HOME="/root"
	    #export NODE_ENV=staging #development/staging/production

	    echo $$ > /var/run/$PROGRAM_NAME.pid
	    cd $FULL_PATH
	    #exec sudo -u $USERNAME $NODE_PATH $FULL_PATH/$FILE_NAME >> /var/log/$PROGRAM_NAME.sys.log 2>&1
	    exec $NODE_PATH $FULL_PATH/$FILE_NAME >> /var/log/$PROGRAM_NAME.sys.log 2>&1
	end script

	pre-start script
	    # Date format same as (new Date()).toISOString() for consistency
	    echo "[`date -u +%Y-%m-%dT%T.%3NZ`] (sys) Starting" >> /var/log/$PROGRAM_NAME.sys.log
	end script

	pre-stop script
	    rm /var/run/$PROGRAM_NAME.pid
	    echo "[`date -u +%Y-%m-%dT%T.%3NZ`] (sys) Stopping" >> /var/log/$PROGRAM_NAME.sys.log
	end script