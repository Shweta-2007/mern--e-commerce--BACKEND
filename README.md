npm init -y
npm i -g typescript
npx tsc --init
npm i express dotenv mongoose
npm i --save-dev @types/express @types/node typescript
npm i --save-dev nodemon
npm i validate
npm i --save-dev @types/validator
npm i multer
npm i --save-dev @types/multer
npm i uuid
npm i --save-dev @types/uuid

# Changed these values in tsconfig file:

{
"compilerOptions": {
"target": "ES2020",
"module": "NodeNext",
"rootDir": "src",
"moduleResolution": "NodeNext",
"outDir": "dist",
"strict": true
}
}

# For running the code:

npx tsc => This will create a dist folder, inside that there will be app.js
node ./dist/app.js => because app.js is inside dist folder => This will run the code which we have written inside app.ts, which will be first converted in app.js

To avoid this we will use scripts:

"scripts": {
"start": "node dist/app.js",
"build": "tsc", => It will compile the code
"watch": "tsc -w" => This watch command will start compilation in watch mode, as soon as you make any changes, it will reflect that in dist folder
"dev": "nodemon dist/app.js =>
},

Before running any command you will have to use npm run start/build/watch

split terminal and run npm run dev => This will watch app.ts

## Steps:

- Middlewares - Admin & Mutler
  We want to add authentication for deleting user or getting access of all the users,We will have to make sure that only admin will do that. So for that we will make a middleware named auth in auth file.

app.get("/all", adminOnly, getAllUsers);

## Folder Structure

- dist
- node_modules
- src
  - controllers
    - products.ts
    - user.ts
  - middlewares
    - auth.ts
    - error.ts
    - multer.ts
  - models
    - products.ts
    - user.ts
  - routes
    - products.ts
    - user.ts
  - types
    - types.ts
  - utils
    - features.ts
    - utility-class.ts
- app.ts
- uploads

##

const products = await Product.find(baseQuery)
.sort(sort && { price: sort === "asc" ? 1 : -1 })
.limit(limit)
.skip(skip);

    const onlyFilteredProducts = await Product.find(baseQuery); // Here we want products with filters, without sorting or limiting them

    const totalPage = Math.ceil(onlyFilteredProducts.length / limit);

- Here in this we have used two awaits, it means, while first await is processing, that code has been freezed till it has been resolved, it will not go beyond that. So, we can use promise.all, with the help of this, these two will run parallel at the same time.

## Catching the data

## After making user API and product API, we will optimize our code.

- we will need a package node-cache
  npm i node-cache

# steps:

- import NodeCache from "node-cache"; in app.ts
- now we will create an instance of node cache => export const nodeCache = new myCache();
- now in product.ts controller => first API is of creating new user, there is no need of caching.
- In next API that is latest-product

export const getLatestProducts = TryCatch(async (req, res, next) => {
const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
// -1 means descending, 1 means ascending

myCache.set("latest-product", JSON.stringify(products));

return res.status(200).json({
success: true,
products,
});
});

- here when ever this function is called, products find hui aur unsab ko hmne return krne se pehle apne cache me store kr li. To agli baar jo koi dubara ye request krega toh rather than dubara search karne ke, i will search in my cache whether it exists or not, if yes then i will return that from my cahche only, no need to add query in database again.
  \*\* It will reduce the time of getting information from database
- now we will to revalidate this latest-product when new product is created or product is deleted or product is updated
- For invalidate: made a function in features.ts & updated function in product controllers.

## Next step: Order API

- order routes
- before moving further we will setup env file.
- we have already installed DOTENV package.
- we need this also npm i morgan && npm i --save-dev @types/morgan
- imported this in app.ts => import { config } from "dotenv";
- make a .env file at root level
- call this config at the top, make sure to call this above all functions.
  config({
  path: "./.env", // path of env file
  });
- made a .env file in root level
- in .env file, write PORT=3000;
- In app.ts => const port = process.env.PORT;
- Now make order schema and API
- While creating new order, we want to reduce the given stock by the quantity which we have ordered. So for reducing the stock, we will make a function in features and use that in order controller.
