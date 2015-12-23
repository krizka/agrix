#!/usr/bin/env bash

SETTINGS_PATH=./
SETTINGS_NAME="settings.json"
SEQUELIZE_CLI_PATH="./packages/finance-model/.npm/package/node_modules/.bin/sequelize"

function meteor_start {
	meteor run --settings "$SETTINGS_NAME"
}

case $1 in
	run)
		if [ ! -f "$SETTINGS_PATH$SETTINGS_NAME" ]; then
		    echo "[ERROR] Can't find database params file $SETTINGS_NAME!"
		    exit 1
		else
			meteor_start
		fi
	;;
	test)
		if [ ! -f "$SETTINGS_PATH$SETTINGS_NAME" ]; then
		    echo "[ERROR] Can't find database params file $SETTINGS_NAME!"
		    exit 1
		else
			meteor test-packages --settings "$SETTINGS_NAME" $2
		fi
	;;
	sequelize)
		"$SEQUELIZE_CLI_PATH" $2
	;;
	deploy)
		if [ ! -f "$SETTINGS_PATH$SETTINGS_NAME" ]; then
		    echo "[ERROR] Can't find database params file $SETTINGS_NAME!"
		    exit 1
		else
			"$SEQUELIZE_CLI_PATH" init
			"$SEQUELIZE_CLI_PATH" db:migrate
			meteor_start
		fi
	;;
esac