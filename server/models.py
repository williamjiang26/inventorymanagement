import os
import boto3
import uuid
from dotenv import load_dotenv
from botocore.config import Config
from fastapi import FastAPI, HTTPException
from typing import List, Optional

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")  # default to us-east-1
DYNAMODB_TABLE = os.getenv("DYNAMODB_TABLE", "Store")  # default table name

dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)
s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,  # e.g., 'us-east-1'
    config=Config(signature_version="s3v4"),
)

table = dynamodb.Table(DYNAMODB_TABLE)


def getPresignedURL(
    bucket_name: str = "tdcstore",
    object_key: str = "my_file.txt",
    expiration: int = 3600,
):
    url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={"Bucket": bucket_name, "Key": object_key},
        ExpiresIn=expiration,
    )
    item = {"presigned_url": url, "key": object_key}
    return item


def create_product(
    name: str,
    productType: str,
    style: str,
    size: str,
    price: int,
    stock: int,
    photos: Optional[list[str]] = None,
):
    product_id = str(uuid.uuid4())
    item = {
        "id": product_id,
        "name": name,
        "productType": productType,
        "style": style,
        "size": size,
        "price": price,
        "stock": stock,
        "photos": photos,
    }

    table.put_item(Item=item)
    return item


def get_products():
    response = table.scan()
    return response.get("Items", [])
