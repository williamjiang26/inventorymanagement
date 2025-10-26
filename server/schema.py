import strawberry
from typing import List, Optional
import models


@strawberry.type
class Photo:
    id: strawberry.ID
    url: str
    tag: str



@strawberry.type
class Product:
    id: strawberry.ID
    name: str
    productType: str
    style: str
    size: str
    stock: int
    price: int
    photos: Optional[List[Photo]]


@strawberry.type
class PresignedURL:
    url: str
    key: str


@strawberry.type
class Query:
    @strawberry.field
    def get_products(self) -> List[Product]:
        return [Product(**p) for p in models.get_products()]

    @strawberry.field
    def getPresignedURL(self, filename: str) -> Optional[PresignedURL]:
        uploadUrl = models.getPresignedURL(object_key=filename)
        return PresignedURL(url=uploadUrl["presigned_url"], key=uploadUrl["key"])


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_product(
        self,
        name: str,
        productType: str,
        style: str,
        size: str,
        price: int,
        stock: int,
        photos: Optional[list[Photo]] = None,
    ) -> Product:
        item = models.create_product(
            name,
            productType,
            style,
            size,
            price,
            stock,
            photos,
        )
        return Product(**item)


# @strawberry.type
# class Mutation:
#     @strawberry.mutation
#     def create_photo(self, url: str, tag: str, orderNo: int) -> Photo:

schema = strawberry.Schema(query=Query, mutation=Mutation)
