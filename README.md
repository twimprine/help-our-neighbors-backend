# helpful-neighbours-backend

[Helpful Neighbours](http://www.helpfulneighbours.com.au/) is a COVID-19 Support Network website.

This repo contains the code for the serverless backend hosted on AWS. It contains:
- REST API (AWS API Gateway and AWS Lambda)  
- DynamoDB Databases for Email and Listing Tables  
- API Swagger Spec  

## Requirements

* AWS Account and [IAM User with Admin Access](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html#id_users_create_console)  
* Python3  
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)  
* [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)  
* [nodejs12.x installed](https://nodejs.org/en/download/releases/)  
* [Typescript](https://www.typescriptlang.org/docs/tutorial.html)  
* [direnv](https://direnv.net/docs/installation.html)  

## Packaging and deployment

Create an IAM user and add a profile for `helpful-neighbours` to your AWS Credentials file.

Create a `.envrc` file with the following variables:
```
export AWS_PROFILE=helpful-neighbours
export AWS_REGION=ap-southeast-2
export AWS_DEFAULT_REGION=ap-southeast-2
export S3_BUCKET=helpful-neighbours-backend
export STACK_NAME=helpful-neighbours-backend
export MAIL_GUN_API_KEY=""
export DOMAIN=""
```

Run:
```
direnv allow .
```

An S3 bucket must be created before deployment to hold the lambda code. This only needs to happen once:

```bash
export S3_BUCKET=<YOUR_S3_BUCKET_NAME>
make s3-init
```

### Deployment 
```bash
direnv allow .
make deploy-stack
```

## Manual Configuration

### API Gateway Authorization

API Key authorization needs to be manually configured for API Gateway:
- [Set up API Keys](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-setup-api-key-with-console.html)  
- [Create an API Usage Plan](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html)  

### Mailgun

The Email API Service used by the project is [Mailgun](https://www.mailgun.com/):
- [Verify domain in Mailgun](https://help.mailgun.com/hc/en-us/articles/360026833053-Domain-Verification-Walkthrough)    
- Add your domain to your `.envrc` file e.g. `export DOMAIN=mg.<YOUR_DOMAIN>`  
- Add your [Mailgun API Key](https://docs.gravityforms.com/mailgun-api-key/) to your `.envrc` file e.g. `export MAIL_GUN_API_KEY=""`  

## License

This code was authored by Adam Quigley and licensed under the Apache 2.0 license.