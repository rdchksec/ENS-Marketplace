<template>
<b-container>
    <b-row>
        <div class="col-12 col-lg-8 offset-lg-2 text-center my-5">
            <h4>{{ this.$route.params.name }}  </h4>
            <div v-if="domain.forSale">
                <p>This domain is for sale for {{ domain.price }} ETH ! </p> 
            <b-button variant="success" @click="takeOffer" size="xl">BUY NOW !</b-button>
            </div>
        </div>
    </b-row>
    <b-row v-if="searching === false">
        <div v-if="domain.owner && !domain.owner.startsWith('0x00000000000')" class="col-12 col-lg-8 offset-lg-2 my-5 progress-box">
            <div>

                <b-button v-if="domain.isNft === false" variant="primary" @click="makeNFT">
                    <span v-if="domainToNft.loading === false">Turn domain into NFT</span>
                   <b-spinner variant="light" v-else />
                </b-button>
                <b-button v-else variant="warning" @click="domainFromNft">
                    <span v-if="domainFromNftStatus.loading === false">Turn NFT into Domain</span>
                   <b-spinner variant="light" v-else />
                    </b-button>

                <b-input-group>
                    <b-form-input type="number" v-model="sellPrice" placeholder="Enter Price...">

                    </b-form-input>
                    <b-input-group-append>
                            <b-button  @click="makeOffer" variant="primary" v-if="domain.isNft && domain.owner && domain.owner.toLowerCase() === account">
                   Sell this domain
                </b-button>
                    </b-input-group-append>
                </b-input-group>
            </div>
            <div class="listing-progress">
                <div class="empty-circle">

                </div>
                <div>
                    {{domain.owner }} {{domain.isNft}} {{account}}
                    1. Transfer Ownership to NFT Contract
                </div>
            </div>
            <div class="listing-progress">
                <div class="empty-circle">

                </div>
                <div>
                    2. Mint ENS Non-fungible token
                </div>
            </div>
            <div class="listing-progress">
                <div class="empty-circle">

                </div>
                <div>
                    3. Create Marktplace Order
                </div>
            </div>
        </div>
        <div v-else class="col-12 col-lg-8 offset-lg-2 my-5">
            This domain name has not been claimed yet.
            <b-button variant="success" @click="registerDomain">
                <span v-if="registering === false">Claim Domain</span>
                <b-spinner variant="light" v-else />
            </b-button>
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
      ensNftAddress: null
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
      this.domain = { ...(await this.getDomainInfo()) }
      this.ensNftAddress = await ensNFTaddress()
      this.domain.orderbook = await orderbook(this.$route.params.name)
      this.domain.forSale = this.domain.orderbook.asks.records.length > 0 
      this.domain.price = this.domain.orderbook.asks.records.length > 0 ? parseFloat(this.domain.orderbook.asks.records[0].order.takerAssetAmount.toString(10)).toFixed(2) : 0
      this.searching = false
    } catch (e) {
      this.searching = false
      console.log(e)
      this.error = e.message
    }
  },
  watch: {
    async '$route' (to, from) {
      this.searching = true
      this.domain = { ...(await this.getDomainInfo()) }
      this.searching = false
    }
  },
  methods: {
    async takeOffer () {
        try {
            await takeOffer(this.$route.params.name)
        } catch (e) {
            console.log(e)
        }
    },
    async makeOffer () {
        try {
            await makeOffer(this.$route.params.name, this.sellPrice)
        } catch (e) {
            console.log(e)
        }
    },
    async getDomainInfo () {
      try {
        const isNft = await isNFT(this.$route.params.name)
        const ownerAddress = isNft ? await tokenOwner(this.$route.params.name) : await owner(this.$route.params.name)
        return {
          isNft,
          owner: ownerAddress
        }
      } catch (e) {
        console.log(e)
      }
    },
    async registerDomain () {
      try {
        this.registering = true
        console.log(this.$route.params.name)
        await register(this.$route.params.name)
        this.domain = { ...(await this.getDomainInfo()) }
        this.registering = false
      } catch (e) {
        this.registering = true
        this.registerError = false
        console.log(e)
      }
    },
    async makeNFT () {
      try {
        this.domainToNft.loading = true
        await makeNFT(this.$route.params.name)
        this.domain = { ...(await this.getDomainInfo()) }
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
        this.domain = { ...(await this.getDomainInfo()) }
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
