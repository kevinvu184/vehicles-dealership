import { Stack, StackProps, aws_s3 as s3, aws_s3_deployment as s3deploy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./src')],
      destinationBucket: websiteBucket,
    });
  }
}
