<template>
  <div>
      <b-navbar toggleable="lg" type="dark" variant="danger">
          <b-navbar-brand @click="$router.push('/')" href="#">
            ENS Marketplace
          </b-navbar-brand>
          <b-navbar-toggle target="nav-collapse" />
      <b-collapse is-nav id="nav_collapse">
          <Search/>
          <b-navbar-nav>
 
          </b-navbar-nav>
      </b-collapse>
      </b-navbar>

    <router-view/>
  </div>
</template>

<style lang="scss">

</style>

<script>
import Search from '@/components/Search'
export default {
  name: 'default',
  components: {
    Search
  }
}
</script>
