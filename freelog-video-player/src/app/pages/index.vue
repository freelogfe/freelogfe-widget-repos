<template>
  <div>

    <div class="freelog-video-player">
      <div class="freelog-video-player__container">

        <VideoCard
          v-for="(video, index) in videos"
          :title="video.title"
          description="戚薇征服年下男金瀚"
          :sources="video.sources"
          :showPlay="index === activeIndex"
          @play="activeIndex = index"
          @stop="activeIndex = -1"
        />

        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
        <div style="width: 268px;"></div>
      </div>
    </div>
  </div>
</template>

<script>
    import VideoCard from "./VideoCard/index.vue";
    // import VideoPlayer from "./VideoPlayer";

    export default {
        name: 'home-page',
        components: {
            VideoCard,
            // VideoPlayer,
        },
        data() {
            return {
                // videoOptions: {
                //     // autoplay: true,
                //     controls: true,
                //     sources: [
                //         {
                //             src: "http://localhost:9999/oceans.mp4",
                //             type: "video/mp4"
                //         }
                //     ]
                // },
                videos: [],
                activeIndex: -1,
            };
        },
        mounted() {
            this.handleData();
        },
        methods: {
            async handleData() {

                getData().then(result => {
                    console.log(result, '$$$$$$');
                    this.videos = result.dataList.map((i) => {
                        return {
                            controls: true,
                            title: i.title,
                            sources: [
                                {
                                    src: i.src,
                                    type: "video/mp4",
                                }
                            ],
                        }
                    });
                });
            },

        }
    }

    function getData() {
        return new Promise((resolve, reject) => {
            const params = {
                resourceType: 'video',
            };
            FreelogApp.QI.fetchPresentablesList(params).then(res => {

                const hostname = ['qi', ...window.location.hostname.split('.').splice(-2)].join('.');
                const prefix = `//${hostname}/v1/auths/presentables/`;
                resolve({
                        dataList: res.data.dataList.map((i) => ({
                            title: i.presentableName,
                            src: `${prefix}${i.presentableId}.file`,
                            // resourceID: i.resourceId,
                        })),
                        done: res.data.page * res.data.pageSize > res.data.totalItem,
                    }
                );
            });
        })
    }
</script>

<style lang="less" scoped>
  .freelog-video-player {

    background-color: #2e373b;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow-y: auto;

    .freelog-video-player__container {
      display: flex;
      width: 100%;
      flex-wrap: wrap;
      justify-content: center;
      align-content: flex-start;
      padding: 50px;
      box-sizing: border-box;
    }
  }
</style>
