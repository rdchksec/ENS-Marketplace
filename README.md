# GoMommy 
ENS Marketplace - one stop shop to register, buy and sell ENSDomains utilizing 0x protocol.
Access the Marketplace - [134.209.87.109](http://134.209.87.109)

![https://github.com/rdchksec/ENS-Marketplace/tree/master/src/assets/gomommy.png]

## Architecture
In order to sell domain, user converts the ENSDomain to ENSToken (ERC721). After that user creates order to sell ENSToken for specified price.
After customer buys ENSToken, he can burn it and receive ENSDomain ownership.  
![](/public/Architecture.jpg)

## Project setup
Install dependencies
```
npm install
```
Compiles and deploy the staging application

```
npm run serve
```

Compiles and minifies for production
```
npm run build
```

Lints and fixes files
```
npm run lint
```
