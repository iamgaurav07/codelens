#!/bin/sh
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
exec node .next/standalone/server.js