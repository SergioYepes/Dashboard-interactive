#!/bin/bash

# Script para esperar a que MySQL esté listo
set -e

host="$1"
shift
cmd="$@"

until mysql -h "$host" -u "scp682" -p"Ucompensar." -e 'SELECT 1'; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "MySQL is up - executing command"
exec $cmd
