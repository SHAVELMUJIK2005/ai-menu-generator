import { Controller, Get, Query } from "@nestjs/common";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get("search")
  search(@Query("q") q: string) {
    return this.productService.search(q);
  }

  @Get("categories")
  getCategories() {
    return this.productService.getCategories();
  }
}
