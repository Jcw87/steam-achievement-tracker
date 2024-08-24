# Untitled Steam Achievement Tracker

A website that tracks and scores steam achievements, inspired by [AStats](https://astats.astats.nl).

## Why

This was created because [the AStats website keeps failing](https://astats.astats.nl/astats/aforum/showthread.php?tid=3192), and the owner doesn't seem interested in fixing it. The goal is to become an adequate replacement for AStats that is (mostly) open source, to avoid succumbing to the same fate.

## Pre-Alpha

This website is in a pre-alpha state. Many features are missing, and there are known issues with how it works. Everything is subject to change.

## Website URL

The website is not live yet. Among other things, it needs an actual name. Running it locally is the only way to see it for now.

## Dependencies

* [Node 20](https://nodejs.org)
* yarn
* [PostgreSQL 16](https://www.postgresql.org)
* [Redis 7.2](https://redis.io)

Earlier versions of these _may_ work, but have not been tested. Use earlier versions at your own peril.

## How to run this

1. `yarn install`
1. Set up environment variables for the frontend and backend. You can use `.env` files for this. Refer to the `.env.sample` files in each folder
1. `yarn run dev` in the frontend folder to start the frontend
1. `yarn run dev` in the backend folder to start the backend
1. `yarn run worker` in the backend folder to start a crawler worker
1. Access the frontend with `http://localhost:<frontend-port>` in your browser. Substitute `<frontend-port>` with the actual port number you configured in your environment variables
