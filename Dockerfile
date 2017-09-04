FROM node

COPY ./package.json /.
COPY node_modules /.
COPY lib /grid/lib
# COPY swagger.yml /.