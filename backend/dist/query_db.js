"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./prisma/client"));
async function main() {
    const products = await client_1.default.product.findMany({
        include: { images: true, categories: { include: { category: true } } }
    });
    console.log("=== DB PRODUCTS ===");
    console.log(JSON.stringify(products, null, 2));
}
main()
    .catch(console.error)
    .finally(async () => {
    await client_1.default.$disconnect();
});
//# sourceMappingURL=query_db.js.map