# IPFS on S3

## Overview

This project is built using the Serverless Framework and provides a simple API for users to upload files. The uploaded files are processed using the IPFS protocol, renamed with their corresponding Content Identifier (CID), and stored in an Amazon S3 bucket. The deployment is handled seamlessly with `serverless deploy`.

## Features

- **File Uploading**: Users can upload files via a POST request to the `/` endpoint.
- **IPFS Processing**: Uploaded files are processed with the IPFS protocol to generate a CID.
- **S3 Storage**: Files are stored in an Amazon S3 bucket for durability and availability.
- **CloudFront Integration**: Optionally use AWS CloudFront for serving the files, benefiting from 1TB of free data transfer.

## Prerequisites

1. **AWS Account**: You need an AWS account to create an S3 bucket.
2. **Serverless Framework**: Ensure you have the Serverless Framework installed. You can install it globally using npm:

   ```bash
   npm install -g serverless
   ```

3. **Node.js**: Ensure you have Node.js installed on your machine.

## Setup Instructions

1. **Create S3 Bucket**: Before deploying, create an S3 bucket in your AWS account. Note the bucket name, as you will need it in the next steps.

2. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

3. **Configure Environment Variables**:
   - Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   - Open the `.env` file and modify the necessary fields, including your S3 bucket name.

4. **Deploy the Project**:
   - Deploy the service using the Serverless Framework:

   ```bash
   serverless deploy
   ```

   This command will package and deploy your application to AWS.

## API Endpoint

### POST /

This endpoint allows users to upload files.

#### Request

- **Content-Type**: `multipart/form-data`
- **Body**: The file to be uploaded.

#### Response

- On success, you will receive a JSON response containing the CID of the uploaded file.

## Usage Notes

- It is recommended to use AWS CloudFront to serve the files stored in your S3 bucket for better performance and to take advantage of the free data transfer limit.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## Contact

For any questions or suggestions, please reach out to [your-email@example.com].

---

Thank you for using this project! Happy coding!
