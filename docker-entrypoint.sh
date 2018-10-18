#!/bin/sh

set -e

if [ -n "$GETFLASHSERVERADDR" ]; then
    sed -i "s@{{\s*GETFLASHSERVERADDR\s*}}@$GETFLASHSERVERADDR@g" js/bundle_*.js
fi

if [ -n "$GATEWAYON" ]; then
    sed -i "s@{{\s*GATEWAYON\s*}}@$GATEWAYON@g" js/bundle_*.js
fi


if [ -n "$MULTI_LANGUAGE" ]; then
    sed -i "s@{{\s*MULTI_LANGUAGE\s*}}@$MULTI_LANGUAGE@g" js/bundle_*.js
fi


if [ -n "$TRANSLATE_ENABLED" ]; then
    sed -i "s@{{\s*TRANSLATE_ENABLED\s*}}@$TRANSLATE_ENABLED@g" js/bundle_*.js
fi

#cp -r  dist/* /opt/nginx/

exec "$@"
