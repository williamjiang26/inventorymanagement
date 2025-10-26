"use client";
import { Button } from "@/components/ui/button";
import {
  SquarePlus,
  Plus,
  RectangleVertical,
  Rows2,
  Grid3x3,
  Shirt,
  Palette,
  Package,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ResponsiveDialog from "./components/ResponsiveDialog";
import CreateForm from "./components/CreateForm";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";

const products = [
  {
    url: "https://tdcstore.s3.us-east-1.amazonaws.com/20150815_170908.jpg",
    type: "Single",
    style: "TD-031",
    stock: 10,
    price: 2500,
  },
  {
    url: "https://tdcstore.s3.us-east-1.amazonaws.com/IMG_0022.jpg",
    type: "Double",
    style: "TD-031",
    stock: 10,
    price: 5000,
  },
];

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [layout, setLayout] = useState("grid");
  return (
    <div className="p-5 w-full">
      {/* Header */}
      <div className="flex flex-row justify-between">
        <div></div>
        <div className="relative p-1 justify-end rounded-lg hover:bg-gray-50 transition">
          <ResponsiveDialog
            isOpen={isCreateOpen}
            setIsOpen={setIsCreateOpen}
            title="Add item"
            description=""
          >
            <CreateForm setIsOpen={setIsCreateOpen} />
          </ResponsiveDialog>
          <Button
            variant="ghost"
            className="flex items-center justify-center rounded-md bg-white shadow-md hover:bg-gray-100"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add item
          </Button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-row justify-between pb-5">
          <div></div>
          <ButtonGroup className="border-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-black"
              onClick={() => setLayout("list")}
            >
              <Rows2 />
              List
            </Button>
            <ButtonGroupSeparator />
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-black"
              onClick={() => setLayout("grid")}
            >
              <Grid3x3 />
              Gallery
            </Button>
          </ButtonGroup>
        </div>

        {/* Body content */}
        {layout == "grid" ? (
          <div className="grid grid-cols-5 gap-1">
            {products.map((product, index) => (
              <div key={index}>
                <Card className="w-full max-w-sm overflow-hidden transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <CardContent className="p-0">
                    <div className="relative w-full h-64">
                      <Image
                        src={product.url}
                        alt={product.style}
                        fill
                        className="object-cover rounded-t-lg"
                        sizes="(max-width: 384px) 100vw, 384px"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start p-4 space-y-2">
                    <h3 className="text-lg font-semibold truncate w-full">
                      {product.style}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <div className="flex items-center space-x-2">
                        <Shirt className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{product.productType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Palette className="h-4 w-4 text-gray-600" />
                        <Badge variant="secondary" className="truncate">
                          {product.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">{product.stock} QTY</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">${product.price}</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Style</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <Image
                      src={product.url}
                      alt={product.style}
                      width={50}
                      height={50}
                    />
                  </TableCell>
                  <TableCell>{product.style}</TableCell>
                  <TableCell>{product.type}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            {/* <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">$2,500.00</TableCell>
              </TableRow>
            </TableFooter> */}
          </Table>
        )}
      </div>
    </div>
  );
}
