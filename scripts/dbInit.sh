#!/usr/bin/env sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

mongo $DIR/mongoInit.js
mysql -u root -p123456 < $DIR/mysqlInit.sql

