# S3 Browser

This is a React-Based, NestJS powered, home-made Simple Storage Service -S3- Browser.

## Features
* List and browse buckets
* Download objects
* _Grep_ objects: download only the lines that contain a specific text pattern.
* _Grep_ objects through their different versions: download only the lines that contain a specific text pattern across different versions of the same object
* Allow to restrict access to a certain list of buckets only.

## Quick setup

1. Clone this repository and switch to it's folder
1. Copy `.env.sample => .env` and enter your AWS Credentials.
1. Execute `docker-compose up frontend`
1. Browse to `http://0.0.0.0:5000`

## JSON API Swagger Interface
The API can be accessed by default at http://0.0.0.0:3000/doc

# To Do

1. Ensure all methods are typed, no `any`.
1. Increase code coverage
1. Add code coverage check in the Pipeline
1. Fix `npm build`
1. Leverage [get-aws-profiles](https://www.npmjs.com/package/get-aws-profiles) to avoid entering credentials as environment variables
