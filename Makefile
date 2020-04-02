default: install build validate

s3-init:
	aws s3 mb "s3://${S3_BUCKET}"

validate:
	sam validate
	cfn-lint -t template.yaml

install:
	npm install

test:
	npm test
	
build:
	npm run build

clean:
	rm -rf ./dist
	rm -f ./handler.zip
	rm -f ./packaged.yaml
	rm -rf ./node_modules

bundle:
	echo "package src and modules into zipped handler..."
	rm -rf node_modules
	npm install --production
	cp -R node_modules dist && cd dist && rm -rf tests && zip -r -q ../handler.zip .

package: bundle
	echo "package cloudformation template..."
	aws cloudformation package \
		--template-file template.yaml \
		--output-template-file packaged.yaml \
		--s3-bucket "${S3_BUCKET}" \
		--s3-prefix sam

deploy:
	echo "deploy stack ${STACK_NAME}... "
	sam deploy \
		--template-file packaged.yaml \
		--stack-name "${STACK_NAME}" \
		--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
		--parameter-overrides \
			MailGunApiKey="${MAIL_GUN_API_KEY}" \
			Domain="${DOMAIN}" \

deploy-test: deploy

deploy-stack: clean install build package deploy

local-package: clean install validate build bundle