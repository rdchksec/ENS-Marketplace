<template>
<b-container>
    <b-row>
        <div class="col-12 col-lg-12 text-center my-5">
            <h1>{{ this.$route.params.name.toUpperCase() }}</h1>
        </div>
    </b-row>
    <b-row v-if="searching === false" align="top">
        <div class="col-lg-12 my-6">
          <b-jumbotron align="center">
             <div v-if="domain.owner && domain.owner === account" align="center">
                  <b-button v-if="domain.isNft === false && domain.forSale === false" size="lg" @click="makeNFT">
                    <span v-if="domainToNft.loading === false">Turn domain into NFT</span>
                    <b-spinner variant="light" v-else />
                  </b-button>
                  <b-button v-if="domain.isNft === true && domain.owner === account && domain.forSale === false" size="lg" @click="domainFromNft">
                    <span v-if="domainFromNftStatus.loading === false">Turn NFT into Domain</span>
                    <b-spinner variant="light" v-else />
                  </b-button>
                  <div  v-if="domain.isNft && domain.owner === account" class="text-left">
                    <div v-if="domain.forSale === false">
                        <p>Plese, specify price to make an selling order for <strong> {{ this.$route.params.name }} </strong></p>
                    <b-input-group >
                        <b-form-input type="number" v-model="sellPrice" placeholder="Enter Price...">

                        </b-form-input>
                        <b-input-group-append>
                          <b-button :disabled="makingOffer.loading" @click="makeOffer" variant="primary">
                            <span v-if="makingOffer.loading === false">Sell Domain</span>
                            <b-spinner v-else variant="light"></b-spinner>
                          </b-button>
                        </b-input-group-append>
                    </b-input-group>
                    </div>
                  </div>
                  <div v-if="domain.forSale">
                    <h6>Your domain is currently for sale for {{ domain.price }} ETH</h6>
                  </div>
              </div>
            <div v-else-if="domain.owner && domain.owner.startsWith('0x000000000000')" align="center">
                <h4 class="my-5">This domain is free ! </h4>
              <b-button size="lg" @click="registerDomain" >
                  <span v-if="registering === false">Claim Domain</span>
                  <b-spinner variant="light" v-else />
              </b-button>
          </div>
          <div v-else>
            <div v-if="domain.forSale">
                <h5>This domain is currently for sale for {{domain.price }} ETH! </h5>
                <b-button :disabled="takingOffer.loading" variant="success" @click="takeOffer">
                    <span v-if="takingOffer.loading === false">Buy Domain</span>
                    <b-spinner v-else variant="light"></b-spinner>
                </b-button>
                <h6 class="my-3">
                 This domain is owned by {{ domain.owner }}
            </h6> 
            </div>
            <div v-else>
                              <h6 class="my-3">
                 This domain is owned by {{ domain.owner }}
            </h6> 
            </div>
          </div>
          </b-jumbotron>
        </div>
    </b-row>
    <b-row v-else class="text-center">
              <div class="justift-center">
          <b-spinner size="xl" variant="danger"></b-spinner>
          <br />
          <p class="my-3">{{ `Looking up ${$route.params.name}` }}</p>
      </div>
      <div v-if="searching === false && typeof error ==='string'">
          <b-alert variant="warning">{{e.message}}</b-alert>
      </div>
    </b-row>
    <b-container  class="info">
      <b-row class="info-content">
         <div>
              <p>Steps to sell ENSDomain</p>
              <b-list-group>
                <b-list-group-item>1. Transfer Ownership to NFT Contract</b-list-group-item>
                <b-list-group-item>2. Mint ENS Non-fungible token</b-list-group-item>
                <b-list-group-item>3. Create Marktplace Order</b-list-group-item>
                <b-list-group-item>4. Wait for buyer</b-list-group-item>
                <b-list-group-item>5. Profit !!!</b-list-group-item>
              </b-list-group>
            </div>
    </b-row>
    </b-container>
</b-container>
</template>

<script>
import { owner, register, makeNFT, domainFromNft, tokenOwner, isNFT, ensNFTaddress } from '@/util/ens'
import { makeOffer, takeOffer, orderbook } from '@/util/marketplace'
export default {
  data () {
    return {
      sellPrice: null,
      searching: false,
      error: null,
      domain: {
        isNft: false,
        owner: null,
        orderbook: [],
        forSale: false
      },
      registering: false,
      registerError: false,
      domainToNft: {
        loading: false,
        error: null
      },
      domainFromNftStatus: {
        loading: false,
        error: null
      },
      ensNftAddress: null,
      makingOffer: {
        loading: false,
        error: null
      },
      takingOffer: {
        loading: false,
        error: null
      }
    }
  },
  computed: {
    account () {
      return this.$store.state.metamask.address
    }
  },
  async created () {
    try {
      this.searching = true
      if (!this.$store.state.metamask.address)  await this.$store.dispatch('metamask/getMetamask')
      const info = await this.getDomainInfo()
      this.domain = info
      this.searching = false
      console.log(this.domain)
    } catch (e) {
      this.searching = false
      console.log(e)
      this.error = e.message
    }
  },
  watch: {
    async '$route' (to, from) {
      this.searching = true
      this.domain = await this.getDomainInfo()
      this.ensNftAddress = await ensNFTaddress()
      this.searching = false
    }
  },
  methods: {
    async takeOffer () {
        try {
          this.takingOffer.loading = true 
            await takeOffer(this.$route.params.name)
            setTimeout( async  () => {
              this.domain = await this.getDomainInfo()
               this.takingOffer.loading = false
            }, 15000)
            console.log(this.domain)
        } catch (e) {
                      this.takingOffer.loading = false
            console.log(e)
            this.takingOffer.error = e.message
        }
    },
    async makeOffer () {
        try {
          this.makingOffer.loading = true 
            await makeOffer(this.$route.params.name, this.sellPrice)
                  this.domain = await this.getDomainInfo()
            this.makingOffer.loading = false
        } catch (e) {
           this.makingOffer.loading = false
            console.log(e)
            this.makingOffer.error = e.message
        }
    },
    async getDomainInfo () {
      try {
        const isNft = await isNFT(this.$route.params.name)
        const ownerAddress = isNft ? await tokenOwner(this.$route.params.name) : await owner(this.$route.params.name);
        const books = await orderbook(this.$route.params.name)
        const forSale = books.asks.records.length > 0 
      const price = books.asks.records.length > 0 ? parseFloat(books.asks.records[0].order.takerAssetAmount.toString(10)).toFixed(2) : 0
        return ({
          isNft,
          owner: ownerAddress.toLowerCase(),
          orderbook: books,
          forSale,
          price
        })
      } catch (e) {
        console.log(e)
      }
    },
    async registerDomain () {
      try {
        this.registering = true
        console.log(this.$route.params.name)
        await register(this.$route.params.name)
        this.domain = await this.getDomainInfo()
        console.log(this.domain)
        this.registering = false
      } catch (e) {
        this.registering = false
        this.registerError = false
        console.log(e)
      }
    },
    async makeNFT () {
      try {
        this.domainToNft.loading = true
        await makeNFT(this.$route.params.name)
        this.domain = await this.getDomainInfo()
        this.domainToNft.loading = false
      } catch (e) {
        console.log(e)
        this.domainToNft.loading = false
        this.domainToNft.error = e.message
      }
    },
    async domainFromNft () {
      try {
        this.domainFromNftStatus.loading = true
        await domainFromNft(this.$route.params.name)
        this.domain = await this.getDomainInfo()
        this.domainFromNftStatus.loading = false
      } catch (e) {
        this.domainFromNftStatus.loading = false
        console.log(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.progress-box {
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin: 0 auto;
}

.listing-progress {
    display: flex;
    flex-direction: row;

}

.empty-circle {
    height: 20px;
    width: 20px;
    border: 1px solid black;
    border-radius: 50%;
}
</style>
