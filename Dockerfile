FROM arm64v8/alpine

RUN apk --update add build-base openssl-dev cmake musl-dev libmpdclient-dev

WORKDIR /ympd
COPY ./ ./

RUN cmake .
RUN make

EXPOSE 8080
CMD ./ympd
