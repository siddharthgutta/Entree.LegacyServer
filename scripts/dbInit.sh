#!/usr/bin/env sh

DIR=$(dirname $0)

mongo $DIR/mongoInit.js
mysql -u root -p123456 < $DIR/mysqlInit.sql

