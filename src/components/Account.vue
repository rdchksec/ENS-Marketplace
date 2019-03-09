<template>
  <div v-if="address" class="text-white account">
      <span class="mx-3"><img src="@/assets/eth.png" width="25" /><strong>{{ balance }}</strong></span>
     <img class="avatar" :src="$blockies.create({seed: address, size: 25, scale: 4})" />
    <div class="mx-1"> {{ address.substring(0, 9) + '...' }}</div>
 </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'network',
  computed: {
    address () {
      return this.$store.state.metamask.address
    },
    balance () {
      return this.$store.state.metamask.ethBalance
    }
  }
}
</script>

<style scoped lang="scss">
.account {
    display: flex;
    flex-direction: row;
    align-items:center;
    position: absolute;
    top: 15px;
    right: 15px;
    border: 1px solid white;
    padding: 5px;
}

.account .avatar {
    border-radius: 50%;
    height:30px;
    width: 30px;
}
</style>
