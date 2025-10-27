import React from 'react'
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_PRODUCTS = gql`
  query {
    getProducts {
      id
      productType
      style
      price
      stock
      photos {
        url
        tag
      }
    }
  }
`;

const Gallery = () => {
    return (
      

    <div>
      
    </div>
  )
}

export default Gallery
