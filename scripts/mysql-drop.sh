#!/usr/bin/env bash

# this script drops all revisions > than the one provided

REVISION_PATH=./../models/mysql/revisions
export MYSQL_PWD=123456;

delete_from_revision=${1}
local_revision=0

# find the latest database version
for database in $(mysql -u root --batch --silent --disable-column-names --execute="SHOW DATABASES LIKE 'entree_r%'")
do
    revision=${database#*_r}
    if (( ${revision} > ${local_revision} ))
    then
        local_revision=${revision}
    fi
done

# check if requested revision is valid in current machine
if (( ${local_revision} < ${delete_from_revision} ))
then
    echo "Not a valid revision. Local database: entree_r${local_revision}";
    return;
fi

echo "WARNING: Delete ALL databases >= entree_r${delete_from_revision}. Are you sure you want proceed?"
select yn in "Yes" "No"; do
    case ${yn} in
        Yes )

        # go through and delete each revision
        for version in $(seq ${delete_from_revision} ${local_revision})
        do
            echo "Dropping database entree_r${version}"

            mysql -u root --batch --silent --disable-column-names --execute="DROP SCHEMA IF EXISTS entree_r${version}";
        done

         return;;
        No ) return;;
    esac
done
