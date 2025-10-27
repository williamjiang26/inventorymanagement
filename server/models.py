import os
import boto3
import uuid
from dotenv import load_dotenv
from botocore.config import Config
from botocore.exceptions import ClientError
from boto3.dynamodb.types import TypeDeserializer

from fastapi import FastAPI, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal

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

# Pydantic models for validation
class PhotoModel(BaseModel):
    url: str
    tag: str

class ItemModel(BaseModel):
    id: str = str(uuid.uuid4())
    # name: str
    productType: str
    style: str
    size: str
    price: Decimal
    stock: int
    photos: List[PhotoModel]

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


def create_product(product: ItemModel) -> dict:
    try:
        # response = table.scan(
        #     FilterExpression='name = :name',
        #     ExpressionAttributeValues={':name': product.name}
        # )
        # if response['Items']:
        #     raise Exception("Product with this name already exists")
        item = product.dict()
        table.put_item(Item=item)
        return item
    except ClientError as e:
        raise Exception(f"DynamoDB error: {e.response['Error']['Message']}")

def get_products():
    response = table.scan()
    items = response.get("Items", [])
    deserializedItems = []
    for item in items:
        print(item)
        formatted_item = ItemModel(
                id=item["id"],
                productType=item["productType"],
                style=item["style"],
                size=item["size"],
                price=item["price"],
                stock=item["stock"],
                photos=[
                    PhotoModel(url=photo["url"], tag=photo["tag"]) for photo in item["photos"]
                ],
            )
        deserializedItems.append(formatted_item)
    return deserializedItems


def get_productById(id: str) -> ItemModel:
    
    response = table.get_item(Key={"id": id})
    item = response.get("Item")
    
    if not item:
        return None
    if item:
        formatted_item = ItemModel(
                id=item["id"],
                productType=item["productType"],
                style=item["style"],
                size=item["size"],
                price=item["price"],
                stock=item["stock"],
                photos=[
                    PhotoModel(url=photo["url"], tag=photo["tag"]) for photo in item["photos"]
                ],
            )

    return formatted_item