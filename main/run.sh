#!/usr/bin/env bash

SETTINGS_FILE="settings.json"

function meteor_start {
	meteor run --settings "$SETTINGS_FILE" --port=3012
}

function settings_not_found {
    echo "[ERROR] Can't find params file $SETTINGS_FILE! try execute 'run.sh deploy'"
    exit 1
}

case $1 in
    deploy)
        echo "copy $SETTINGS_FILE"
        cp "$SETTINGS_FILE.dist" $SETTINGS_FILE
        echo "complete."
        echo "edit $SETTINGS_FILE"
        echo "or"
        echo "execute 'run.sh run' to start app"

        exit 0;
    ;;
	run)
		if [ ! -f "$SETTINGS_FILE" ]; then
		    settings_not_found
		else
			meteor_start
		fi
	;;
	test)
		if [ ! -f "$SETTINGS_FILE" ]; then
		    settings_not_found
		else
			meteor test-packages --settings "$SETTINGS_FILE" $2
		fi
	;;
	*)
	    echo "run.sh [deploy | run | test <package>]"
	;;
esac