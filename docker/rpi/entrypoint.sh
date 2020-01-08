#!/bin/sh
echo "starting docker"
set -e

gitRepo=""
#read command line options
#e.g. option passing --gitRepo <git repo to clone>
while [ -n "$1" ]; do
  case "$1" in			
    -g|--gitRepo)
      gitRepo="$2"
      shift 2
      ;;
    --)
      shift
      break
      ;;
    *)
      echo 'invalid options'
      exit 3
      ;;
  esac
done

/get-source.sh $gitRepo

#while true; do sleep 1000; done
echo "exiting docker"