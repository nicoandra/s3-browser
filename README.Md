# S3 Browser

## Quick setup

1. Clone this repository and switch to it's folder
1. Create a `.env` file as follows:
```
AWS_ACCESS_KEY_ID='YOUR-ACCESS-KEY-ID'
AWS_SECRET_ACCESS_KEY='YOUR-SECRET-ACCESS-KEY'
```
1. Execute `docker-compose up frontend`
1. Browse to `http://0.0.0.0:5000`

## JSON API Swagger Interface
The API can be accessed by default at http://0.0.0.0:3000/doc

# To Do

1. Increase code coverage
1. Add code coverage check in the Pipeline
1. Fix `npm build`
1. Leverage [get-aws-profiles](https://www.npmjs.com/package/get-aws-profiles) to avoid entering credentials as environment variables
