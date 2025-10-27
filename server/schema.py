import strawberry
from typing import List, Optional
import models


@strawberry.type
class Photo:
    url: str
    tag: str

@strawberry.input
class PhotoInput:
    url: str
    tag: str

@strawberry.type
class Product:
    id: str
    # name: str
    productType: str
    style: str
    size: str
    price: float
    stock: int
    photos: List[Photo]

@strawberry.input
class ProductInput:
    # name: str
    productType: str
    style: str
    size: str
    price: float
    stock: int
    photos: List[PhotoInput]


@strawberry.type
class PresignedURL:
    url: str
    key: str


@strawberry.type
class Query:
    @strawberry.field
    def get_products(self) -> List[Product]:
        return models.get_products()
        

    @strawberry.field
    def getPresignedURL(self, filename: str) -> Optional[PresignedURL]:
        uploadUrl = models.getPresignedURL(object_key=filename)
        return PresignedURL(url=uploadUrl["presigned_url"], key=uploadUrl["key"])


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_product(self, product: ProductInput) -> Product:
        # Convert ProductInput to dict for debugging and Pydantic
        item_dict = {
            'id': str(models.uuid.uuid4()),
            # 'name': product.name,
            'productType': product.productType,
            'style': product.style,
            'size': product.size,
            'price': float(product.price),
            'stock': int(product.stock),
            'photos': [
                {'url': str(photo.url), 'tag': str(photo.tag)} for photo in product.photos
            ]
        }
        
        # Print the input for debugging
        # logger.info("Received ProductInput: %s", item_dict)
        # print("Received ProductInput:", item_dict)  # Console output
        
        # Validate with Pydantic
        try:
            pydantic_item = models.ItemModel(**item_dict)
        except ValueError as e:
            # logger.error("Pydantic validation error: %s", str(e))
            raise Exception(f"Validation error: {str(e)}")
        
        # Create product
        try:
            item = models.create_product(pydantic_item)
            # logger.info("Created product: %s", item)
            return Product(**item)
        except Exception as e:
            # logger.error("Failed to create product: %s", str(e))
            raise Exception(f"Failed to create product: {str(e)}")

# @strawberry.type
# class Mutation:
#     @strawberry.mutation
#     def create_photo(self, url: str, tag: str, orderNo: int) -> Photo:

schema = strawberry.Schema(query=Query, mutation=Mutation)
