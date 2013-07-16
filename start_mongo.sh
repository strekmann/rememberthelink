#!/bin/bash

[ -d mongo ] || mkdir -p mongo

mongod -f mongod.cfg
