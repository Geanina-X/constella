#!/bin/bash
cd "$(dirname "$0")"
npm run build --silent 2>/dev/null
nohup npx serve dist -p 3456 -s > /tmp/starwords-server.log 2>&1 &
sleep 2
open http://localhost:3456
echo "StarWords started. You can close this window."
