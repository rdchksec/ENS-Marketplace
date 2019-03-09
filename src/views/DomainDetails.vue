<template>
<b-container>
    <b-row>
        <div class="col-12 col-lg-8 offset-lg-2 text-center my-5">
            <h4>{{ this.$route.params.name }} </h4>
        </div>
    </b-row>
    <b-row>
        <div class="col-12 col-lg-8 offset-lg-2 my-5 progress-box">
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
    </b-row>
</b-container>
</template>

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