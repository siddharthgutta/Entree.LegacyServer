#!/usr/bin/env bash

# this script updates the database to the latest version by applying ALL available/applicable revisions

REVISION_PATH=./../models/mysql/revisions
export MYSQL_PWD=123456;

local_revision=0
latest_revision=0

# find the latest database version
for database in $(mysql -u root --batch --silent --disable-column-names --execute="SHOW DATABASES LIKE 'entree_r%'")
do
    revision=${database#*_r}
    if [ "$revision" -gt "$local_revision" ]
    then
        local_revision=${revision}
    fi
done


# find the latest database revision script
for f in $REVISION_PATH/*to*[^a-z].sql
do
    # get the revision from file
    # Ex: Substitutes '2to' with '' in '2to3.sql'
    revision=${f##*to}
    # Ex: Substitutes '.sql' with '' in '3.sql'
    revision=${revision%.*}

    if [ "$revision" -gt "$latest_revision" ]
    then
        latest_revision=${revision}
    fi
done

# check if update is needed
if (( "$local_revision" >= "$latest_revision" ))
then
    echo "No upgrade required: entree_r${latest_revision}";
    exit
fi

echo "Local database: entree_r${local_revision}";
echo "Available revision: entree_r${latest_revision}";

echo "Incrementing revisions..."

# apply each revisions one-by-one until the latest version
for source in $(seq ${local_revision} ${latest_revision})
do
    if [ "$local_revision" == "$latest_revision" ]
    then
        echo "Finished! Local database: entree_r${local_revision}";
        exit
    fi

    target=$((${source} + 1))

    migration_pre=${REVISION_PATH}/${source}to${target}-pre.sql
    migration=${REVISION_PATH}/${source}to${target}.sql
    migration_post=${REVISION_PATH}/${source}to${target}-post.sql

    echo "     Upgrading to entree_r${target}"

    echo "          Creating target database"
    mysql -u root --batch --silent --disable-column-names --execute="CREATE SCHEMA IF NOT EXISTS entree_r${target}";

    echo "          Migrating to target database"
    mysqldump -u root entree_r${source} | mysql -u root --batch --silent entree_r${target}

    echo "          Applying revision"

    if [ -f ${migration_pre} ]; then
        echo "               Running pre-migration"
        mysql -u root --batch --silent --disable-column-names --database=entree_r${target} < ${migration_pre};
    fi

    mysql -u root --batch --silent --disable-column-names --database=entree_r${target} < ${migration};

    if [ -f ${migration_post} ]; then
        echo "               Running post-migration"
        mysql -u root --batch --silent --disable-column-names --database=entree_r${target} < ${migration_post};
    fi

    local_revision=${target}
done
