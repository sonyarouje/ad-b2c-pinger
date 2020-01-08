#!/bin/sh
set -e

gitRepo=$1
srcDir=/home/dev/src
gitDir=${gitRepo##*/}

#gitDir=$gitRepo | rev | cut -d / -f1 | rev
cd $srcDir


if [ "$gitRepo" != "NOTSET" ]
then
    if [ -d "${gitDir}" ] 
    then
        echo "$gitRepo already cloned"
        cd "${gitDir}"
    else
        echo "cloninng git repo $gitRepo"
        git clone "https://$gitRepo"
        echo "git repo cloned successfully"
        echo "installing npm pacakges..."
        cd "${gitDir}"
        npm install
        echo "installed all npm pacakges"
    fi
    node app.js
fi
