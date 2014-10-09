#! /bin/sh
### BEGIN INIT INFO
# Provides:             rememberthelink
# Required-Start:       $syslog $remote_fs
# Required-Stop:        $syslog $remote_fs
# Should-Start:         $local_fs
# Should-Stop:          $local_fs
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    Strekmann boilerplate
# Description:          Strekmann boilerplate
### END INIT INFO

NAME=rememberthelink
DESC=rememberthelink
PORT=3214

# ========

DAEMON=/srv/$NAME/$NAME/cluster.js
DAEMON_ARGS=
USER=www-data
GROUP=www-data

RUNDIR=/var/run/$NAME
PIDFILE=$RUNDIR/$NAME.pid
LOGFILE=/srv/$NAME/server.log

test -x $DAEMON || exit 0

set -e

export NODE_ENV=production
export PORT
export DB_NAME=$NAME
export PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

case "$1" in
start)
    echo -n "Starting $DESC: "
    mkdir -p $RUNDIR
    touch $PIDFILE
    chown $USER:$GROUP $RUNDIR $PIDFILE
    chmod 755 $RUNDIR

    if start-stop-daemon --start --quiet --umask 007 -m --pidfile $PIDFILE --chuid $USER:$GROUP --background --exec $DAEMON >> $LOGFILE
    then
            echo "$NAME."
    else
            echo "failed"
    fi
    ;;
stop)
    echo -n "Stopping $DESC: "
    if start-stop-daemon --stop --retry forever/TERM/1 --quiet --oknodo --pidfile $PIDFILE
    then
        echo "$NAME."
    else
        echo "failed"
    fi
    rm -f $PIDFILE
    sleep 1
    ;;
restart|force-reload)
    $0 stop
    $0 start
    ;;
status)
    echo -n "$DESC is "
    if start-stop-daemon --stop --quiet --signal 0 --pidfile ${PIDFILE}
    then
            echo "running"
    else
            echo "not running"
            exit 1
    fi
    ;;

*)
    echo "Usage: $0 {start|stop|restart|force-reload|status}"
    exit 1
    ;;
esac

exit 0
