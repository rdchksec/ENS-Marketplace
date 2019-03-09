<template>
  <div class="col-12 col-lg-6 offset-lg-3">
     <b-input-group v-if="searching === false " class="searchGroup">
         <b-form-input
            v-model="searchName"
            type="text"
            placeholder="Enter ENS domain"
            class="searchGroup"
            variant="warning"
         />

         </b-form-input>
         <b-input-group-append>
             <b-button @click="search" @keyup.enter="search" variant="warning">SEARCH</b-button>
         </b-input-group-append>
     </b-input-group>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: 'search',
  data () {
      return {
          searchName: null,
          searching: false,
          error: null
      }
  },
  methods: {
      async search() {
          try {
              this.searching = true
              this.error = null
              this.$router.push('/domain/'+ this.searchName)
          } catch (e) {
             this.error = e.message 
          }
      }
  }
  }
</script>

<style scoped lang="scss">
.searchGroup {
    height: 100%;
}
</style>