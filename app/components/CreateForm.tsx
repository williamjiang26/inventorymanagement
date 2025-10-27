"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomFormField } from "../components/FormField";
import { Loader2, Plus, Trash2 } from "lucide-react";
import ResponsiveDialog from "./ResponsiveDialog";
import Image from "@/node_modules/next/image";
import { Card, CardContent } from "@/components/ui/card";
import { gql } from "@apollo/client";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import { Badge } from "@/components/ui/badge";

// get presignedUrl
const GET_PRESIGNEDURL = gql`
  query GetPresignedURL($filename: String!) {
    getPresignedURL(filename: $filename) {
      url
      key
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($product: ProductInput!) {
    createProduct(product: $product) {
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

const imageFormSchema = z.object({
  url: z.array(z.instanceof(File)).optional(),
  tag: z.string(),
});

type Image = {
  url: string;
  tag: string;
};

const CreateImageForm = ({
  setIsImageModalOpen,
  setImages,
}: {
  setIsImageModalOpen: Dispatch<SetStateAction<boolean>>;
  setImages: Dispatch<SetStateAction<Image[]>>;
}) => {
  const form = useForm<z.infer<typeof imageFormSchema>>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: {
      url: [],
      tag: "",
    },
  });

  const [getPresignedURL, { loading, error }] = useLazyQuery(GET_PRESIGNEDURL);

  const uploadFile = async (file: File) => {
    try {
      const { data } = await getPresignedURL({
        variables: { filename: file.name },
      });

      if (error) {
        console.error("Error fetching presigned URL:", error);
        return;
      }

      const { url: presignedUrl, key: objectKey } = data.getPresignedURL;

      const response = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        console.error("S3 upload failed with status:", response.status);
        return; // Early return on network error
      }
      return objectKey;
    } catch (e) {
      console.error("An unexpected error occurred:", e);
    }
  };

  const onPhotoSubmit = async (values: z.infer<typeof imageFormSchema>) => {
    try {
      const file = values.url[0];
      const s3ObjectKey = await uploadFile(file);

      // Update state and close modal
      const s3Url = `https://tdcstore.s3.us-east-1.amazonaws.com/${s3ObjectKey}`;
      const image = { url: s3Url, tag: values.tag };

      setImages((prev) => [...prev, image]);
      setIsImageModalOpen(false);
    } catch (e) {
      console.error("An unexpected error occurred:", e);
    }
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onPhotoSubmit)} className="w-full">
        <CustomFormField name="url" label="" type="file" accept="image/*" />

        <CustomFormField name="tag" label="Tag" type="" />

        {/* SUBMIT BUTTON - adds a produt json to the order summary list*/}
        <div className="col-span-4 flex justify-end mr-2 mt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Add Photo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const Item = ({ url, tag }) => {
  return (
    <Card className="relative w-32 h-48 overflow-hidden transition-transform transform hover:scale-105 shadow-md">
      <CardContent className="p-2 flex flex-col items-center h-full">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 rounded-full"
          onClick={() => {}}
          aria-label="Delete image"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="relative w-full h-32">
          <Image
            src={url}
            alt={tag}
            fill
            className="object-cover rounded-md"
            sizes="128px"
          />
        </div>
        <Badge variant="secondary" className="mt-2 truncate max-w-full">
          {tag}
        </Badge>
      </CardContent>
    </Card>
  );
};

const formSchema = z.object({
  productType: z.string().min(1, "Product type is required"),
  style: z.string().min(1, "Style is required"),
  size: z.string().min(1, "Size is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  stock: z.coerce.number().min(0, "Stock must be non-negative"),
});

const CreateForm = ({
  setIsOpen,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isCreateImageFormOpen, setCreateImageFormOpen] = useState(false);
  const [photos, setPhotos] = useState<Image[]>([]);
  const [createProduct] = useMutation(CREATE_PRODUCT);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productType: "",
      style: "",
      size: "",
    },
  });

  useEffect(() => {
    form.setValue("photos", photos);
  }, [photos, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log(value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { data, errors } = await createProduct({
      variables: {
        product: {
          productType: values.productType,
          style: values.style,
          size: values.size,
          price: values.price,
          stock: values.stock,
          photos: photos.length > 0 ? photos : [], // Handle optional photos
        },
      },
    });

    if (errors) {
      console.error("GraphQL errors:", errors);
      alert(
        "Failed to create product: " + errors.map((e) => e.message).join(", ")
      );
      return;
    }

    console.log("Mutation response:", data);
    setIsOpen(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 sm:px-0 px-4 w-full"
      >
        <ResponsiveDialog
          isOpen={isCreateImageFormOpen}
          setIsOpen={setCreateImageFormOpen}
          title="Add Photos"
          description=""
        >
          <CreateImageForm
            setIsImageModalOpen={setCreateImageFormOpen}
            setImages={setPhotos}
          />
        </ResponsiveDialog>
        {/* photos */}
        <div>
          <div className="flex flex-row justify-between">
            <div>Images</div>
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-8 p-0 flex items-center rounded-md bg-white shadow-md hover:bg-gray-100"
              onClick={() => {
                setCreateImageFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {photos.length > 0 ? (
              photos.map((photo, index) => <Item key={index} {...photo} />)
            ) : (
              <div>No photos in this order</div>
            )}
          </div>
        </div>

        {/* fields */}
        <CustomFormField name="productType" label="productType" type="" />
        <CustomFormField name="style" label="Style" type="" />
        <CustomFormField name="size" label="Size" type="" />
        <CustomFormField name="price" label="Price" type="number" />
        <CustomFormField name="stock" label="Stock" type="number" />

        {/* submit button */}
        <div className="flex w-full sm:justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateForm;
