# helpful-neighbours-backend

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
aws s3 mb s3://BUCKET_NAME
```

#### Deployment 
```bash
direnv allow .
make deploy-stack
```

## Manual Config

### API Keys

