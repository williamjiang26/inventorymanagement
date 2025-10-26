import strawberry

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from schema import schema


@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello World"


graphql_app = GraphQLRouter(schema)

app = FastAPI()
# Add CORS middleware to fix the cross-origin error
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/graphql")
