<template>
	<div class="mp-loading-box" v-if="isShowLoadding">
        <div class="box loading-logo">
        <ul>
            <li class="first"><a href="#"></a></li>
            <li class="second"><a href="#"></a></li>
            <li class="third"><a href="#"></a></li>
        </ul>
        </div>
    </div>
</template>

<script>
	export default {
		name: "loadding",
		props: {
            isShowLoadding: false
		},
		data (){
			return {
				
			}
		},
		computed :{
            
		},
		methods: {
		},
		watch: {
			
		
		},
		mounted (){

		},
		destroyed (){
			clearTimeout(this.timeoutTimer)
		}
	}
</script>