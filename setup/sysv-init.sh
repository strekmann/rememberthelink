#!/bin/bash
# auroris server
# chkconfig: 345 20 80
# description: backend server
# processname: boilerplate

DAEMON_PATH="/path/to/boilerplate"

DAEMON="node /path/to/boilerplate/cluster.js"
DAEMONOPTS=""

NAME=boilerplate
DESC="boilerplate"
PIDFILE=/var/run/$NAME.pid
LOGFILE=/path/to/logdir/server.log
SCRIPTNAME=/etc/init.d/$NAME

export NODE_ENV=production
export PORT=12345
export DB_NAME=test

case "$1" in
start)
    printf "%-50s" "Starting $NAME..."
    cd $DAEMON_PATH
    PID=`$DAEMON $DAEMONOPTS >> $LOGFILE 2>&1 & echo $!`
    #echo "Saving PID" $PID " to " $PIDFILE
        if [ -z $PID ]; then
            printf "%s\n" "Fail"
        else
            echo $PID > $PIDFILE
            printf "%s\n" "Ok"
        fi
;;
status)
        printf "%-50s" "Checking $NAME..."
        if [ -f $PIDFILE ]; then
            PID=`cat $PIDFILE`
            if [ -z "`ps axf | grep ${PID} | grep -v grep`" ]; then
                printf "%s\n" "Process dead but pidfile exists"
            else
                echo "Running"
            fi
        else
            printf "%s\n" "Service not running"
        fi
;;
stop)
        printf "%-50s" "Stopping $NAME"
            PID=`cat $PIDFILE`
            cd $DAEMON_PATH
        if [ -f $PIDFILE ]; then
            kill -HUP $PID
            printf "%s\n" "Ok"
            rm -f $PIDFILE
        else
            printf "%s\n" "pidfile not found"
        fi
;;
restart)
    $0 stop
    $0 start
;;

*)
        echo "Usage: $0 {status|start|stop|restart}"
        exit 1
esac
