<template>
  <b-container fluid>
    <Network />
    <Account />
    <b-row class="hero">
      <div class="col-12 text-center text-white">
        <img src="@/assets/gomommy.png" width="200" height="200" class="my-0" />
        <h1>GoMommy</h1>
        <h2>Tokenize and sell your ENS domain</h2>
        <Search class="my-5 bigSearch" />
      </div>
    </b-row>
    <b-container  class="info">
      <b-row class="info-content">
        <div class="col-12 col-lg-4">
        <h4>
          Ethereum Name Service
        </h4>
        <p>
          ENS has similar goals to DNS, the Internet’s Domain Name Service, but has significantly different architecture, due to the capabilities and constraints provided by the Ethereum blockchain. Like DNS, ENS operates on a system of dot-separated hierarchical names called domains, with the owner of a domain having full control over subdomains.
        </p>
      </div>
      <div class="col-12 col-lg-4">
        <h4>Non-Fungible Tokens</h4>
        <p>
          Non-fungible tokens are used to create verifiable digital scarcity. NFTs are used in several specific applications that require unique digital items like crypto-collectibles and crypto-gaming. NFTs also find potential use in digital art, by helping prove authenticity and ownership.
        </p>
      </div>
            <div class="col-12 col-lg-4">
        <h4>ENS Marketplace</h4>
        <p>
          The ENS Marketplace is the place to go for ENS names that are expiring or have been put up for auction.
          Find the perfect ENS domain, or earn money with domains you already own.
        </p>
      </div>
    </b-row>
    </b-container>
  </b-container>
</template>

<script>
// @ is an alias to /src

import Network from '@/components/Network'
import Account from '@/components/Account'
import Search from '@/components/Search'
import { makeOffer } from '@/util/marketplace'
export default {
  name: 'home',
  async created () {
    try {
      await this.$store.dispatch('metamask/getMetamask')
      setInterval(() => {
        this.$store.dispatch('metamask/getMetamask')
      }, 5000)
    } catch (e) {
      console.log(e)
    }
  },
  components: {
    Network,
    Account,
    Search
  }
}
</script>

<style scoped lang="scss">
.bigSearch {
  height: 50px;
}
.hero {
  height: 60vh;
    display: flex;
  align-items: center;
  justify-content: center;
}

.info {
  height: 40vh;
}

.info-content {
  height:100%;
  padding-top:7rem;
    display: flex;
  align-items: start;
  justify-content: center;
}
</style>
