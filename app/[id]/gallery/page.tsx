"use client";
import React from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "@/node_modules/next/navigation";
import Image from "@/node_modules/next/image";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Slider from "react-slick";
import Link from "@/node_modules/next/link";
import { ArrowLeft } from "lucide-react";

// get product by id
const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    getProduct(id: $id) {
      id
      productType
      style
      size
      price
      stock
      photos {
        url
        tag
      }
    }
  }
`;
// Slick carousel settings
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  adaptiveHeight: true,
};

const Gallery = () => {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data.getProduct) return <p>No product found</p>;

  const groupPhotosByTag = (photos) => {
    return photos.reduce((acc, photo) => {
      const tag = photo.tag;
      if (!acc[tag]) {
        acc[tag] = [];
      }
      acc[tag].push(photo);
      return acc;
    }, {});
  };

  const photos = data?.getProduct.photos;
  const groupedPhotos = groupPhotosByTag(photos);
  console.log("🚀 ~ Gallery ~ groupedPhotos:", groupedPhotos);

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <Link
        href="/"
        className="mb-6 flex flex-row items-center space-x-1 group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 duration-200 transition-all"
        />
        <span>Back</span>
      </Link>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-115 p-5">
        {/* Left column: Tags */}
        <div className="md:col-span-1">
          {Object.keys(groupedPhotos).map((tag, index) => (
            <div
              key={tag}
              className="mb-4 sticky top-0 bg-white z-10 py-2"
              style={{ top: `${index * 4}rem` }} // Offset sticky tags
            >
              <h3 className="text-xl font-semibold text-gray-800 capitalize">
                {tag}
              </h3>
            </div>
          ))}
        </div>

        {/* Right column: Image galleries */}
        <div className="md:col-span-2">
          {Object.entries(groupedPhotos).map(([tag, tagPhotos], index) => (
            <div key={tag} className="mb-8">
              <div className="relative">
                {tagPhotos.length > 1 ? (
                  <Slider {...carouselSettings}>
                    {tagPhotos.map((photo, photoIndex) => (
                      <div key={photoIndex} className="relative w-full h-96">
                        <Image
                          src={photo.url}
                          alt={`${tag} photo ${photoIndex + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={index === 0} // Optimize loading for first gallery
                        />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <div className="relative w-full h-96">
                    <Image
                      src={tagPhotos[0].url}
                      alt={`${tag} photo`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
