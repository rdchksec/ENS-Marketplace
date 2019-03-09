<template>
<b-container>
    <b-row>
        <div class="col-12 col-lg-8 offset-lg-2 text-center my-5">
            <h4>{{ this.$route.params.name }} </h4>
        </div>
    </b-row>
    <b-row v-if="searching === false">
        <div v-if="owner && !owner.startsWith('0x00000000000')" class="col-12 col-lg-8 offset-lg-2 my-5 progress-box">
            <div>
                {{ owner }}
                <b-button v-if="isNFT === false" variant="primary" @click="makeNFT">Turn domain into NFT</b-button>
                <b-button v-else variant="warning" @click="domainFromNft">Turn NFT into Domain</b-button>
            </div>
            <div class="listing-progress">
                <div class="empty-circle">

                </div>
                <div>
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
            {{owner}}
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
import {owner, register, makeNFT, domainFromNft, isTokenOwner, isNFT} from '@/util/ens'

    export default {
    data () {
        return {
            searching: false,
            error: null,
            owner: undefined,
            isNFT: false,
            registering: false,
            registerError: false,
            domainToNft: {
                loading: false,
                error: null
            },
            domainFromNftStatus: {
                loading: false,
                error: null
            }
        }
    },
    async created () {
        try {
          this.searching = true
          this.owner = await owner(this.$route.params.name)
          this.isNFT = await isNFT(this.$route.params.name)
          this.searching = false 
          // console.log(await isTokenOwner(this.$route.params.name))
        } catch (e) {
            this.searching = false 
            console.log(e)
            this.error = e.message
        }
    },
    watch: {
    async '$route' (to, from) {
                  this.searching = true
          this.owner = await owner(this.$route.params.name)
          this.isNFT = await isNFT(this.$route.params.name)
          this.searching = false 
    // Whatever you need to change route
  } 
},
    methods : {
        async registerDomain () {
            try {
                this.registering = true 
                console.log(this.$route.params.name)
                await register(this.$route.params.name)
                this.owner = await owner(this.$route.params.name)
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
                this.domainToNft.loading = false
            } catch (e) {
                console.log(e)
                this.domainToNft.loading = false
                this.domainToNft.error = e.message
            }
        },
        async domainFromNft() {
            try {
                this.domainFromNftStatus.loading = true 
                await domainFromNft(this.$route.params.name)
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