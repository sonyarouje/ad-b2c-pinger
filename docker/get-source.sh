#!/bin/sh
set -e

gitRepo=$1
srcDir=/home/dev/src
gitDir=${gitRepo##*/}
#gitDir=$gitRepo | rev | cut -d / -f1 | rev
cd $srcDir

if [ -d "${gitDir}" ] 
then
    echo "$gitRepo already cloned"
fi
if [ "$gitRepo" != "NOTSET" ]
then
    echo "cloninng git repo $gitRepo"
    git clone "https://$gitRepo"
    echo "git repo cloned successfully"
    cd "${gitDir}"
    npm install
    echo "installed all the necessary npm pacakges"
    node app.js
fi
