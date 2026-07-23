"""
Backblaze B2 file upload helper.

B2 provides an S3-compatible API, so we can use boto3 with a custom endpoint.
Reads B2 credentials from environment variables:
- B2_APPLICATION_KEY_ID
- B2_APPLICATION_KEY
- B2_ENDPOINT_URL (defaults to us-west-000)

Set B2_BUCKET_NAME to enable uploads. If it's not set, upload_file()
raises a clear error instead of failing silently.
"""
import os
import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError

B2_BUCKET_NAME = os.getenv("B2_BUCKET_NAME")
B2_APPLICATION_KEY_ID = os.getenv("B2_APPLICATION_KEY_ID")
B2_APPLICATION_KEY = os.getenv("B2_APPLICATION_KEY")
B2_ENDPOINT_URL = os.getenv("B2_ENDPOINT_URL", "https://s3.us-west-000.backblazeb2.com")

_s3_client = None


def _get_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=B2_ENDPOINT_URL,
            aws_access_key_id=B2_APPLICATION_KEY_ID,
            aws_secret_access_key=B2_APPLICATION_KEY,
            region_name="auto",
        )
    return _s3_client


def upload_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    if not B2_BUCKET_NAME:
        raise RuntimeError(
            "B2_BUCKET_NAME is not configured. Set it as an environment variable "
            "to enable file uploads to Backblaze B2."
        )

    key = f"attachments/{uuid.uuid4().hex}-{filename}"
    client = _get_client()

    try:
        client.put_object(
            Bucket=B2_BUCKET_NAME,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )
    except (BotoCoreError, ClientError) as exc:
        raise RuntimeError(f"Failed to upload to Backblaze B2: {exc}") from exc

    # Construct public URL for the file in B2
    # Format: https://<bucketName>.s3.<region>.backblazeb2.com/<key>
    return f"{B2_ENDPOINT_URL}/{B2_BUCKET_NAME}/{key}"
