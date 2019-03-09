<template>
  <div class="network text-white">
     Rinkeby
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'network',
  computed: {
      network () {
          return this.$store.state.metamask.network.name
      }
  }
  }
</script>

<style scoped lang="scss">
.network {
    position: absolute;
    top: 15px;
    left: 15px;
    padding: 5px;
    border: 1px solid white;
}
</style>