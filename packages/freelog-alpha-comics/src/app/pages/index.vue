<template>
  <div class="c-container">
    <comics-header :cover-url="comicsCoverUrl" :comics-info="comicsInfo"></comics-header>
   
    <comics-tab class="c-content-mobile" :activeTabName.sync="activeTabName"  v-if="isMobile">
      <div class="comics-description" :label="tabLabels[0]" v-show="activeTabName === tabLabels[0]">
        <template v-if="comicsInfo != null">
          <h2>作品简介</h2>
          <p>{{comicsInfo && comicsInfo.intro}}</p>
          <div><span>作者：</span>{{comicsInfo && comicsInfo.author}}</div>
        </template>
      </div>
      <div :label="tabLabels[1]" v-show="activeTabName === tabLabels[1]">
        <comics-chapter
          v-for="chapter in chaptersList"
          :key="chapter.number"
          :info="chapter"
          :chapterPresentable="chapter.releaseName ? chapterPresentableMap[chapter.releaseName] : null"
          @show-chapter-detail="showChapter"
        ></comics-chapter>
        <div class="c-load-more" v-if="chaptersInfoArr" @click="loadMoreChapters">
          {{ isCanLoadMoreChapters ? '点击加载更多': '暂无更多数据...' }}
        </div>

      </div>
    </comics-tab>
    <div class="c-content" v-else>
      <div class="c-chapter-nav-tags" v-if="chaptersInfoArr">
        <el-tag 
          v-for="chapterInfo in chaptersInfoArr" 
          :key="chapterInfo.number"
          :type="activeChaptersListIndex === chapterInfo.index ? 'success' : 'info'"
          @click="exchangeChaptersList(chapterInfo)">{{chapterInfo.navTag}}</el-tag>
      </div>
      <comics-chapter
        v-for="chapter in chaptersList"
        :key="chapter.number"
        :info="chapter"
        :chapterPresentable="chapter.releaseName ? chapterPresentableMap[chapter.releaseName] : null"
        @show-chapter-detail="showChapter"
      ></comics-chapter>
      <div class="c-cont-empty-box"></div><div class="c-cont-empty-box"></div>
      <div class="c-cont-empty-box"></div><div class="c-cont-empty-box"></div>
    </div>
    
    <display-box 
      :chapter-image-urls="activeChapterImageUrls" 
      :chapter-name="activeChapterName" 
      @hide-chapter="hideChapter" 
      v-if="chapterDetailVisible"></display-box>
    
    <Loading :visible="loadingVisible" />
  </div>
</template>

<script>
  import ComicsHeader from '../components/header.vue'
  import ComicsTab from '../components/tab.vue'
  import ComicsChapter from '../components/chapter.vue'
  import DisplayBox from '../components/display-box.vue'
  import Loading from '../components/loading.vue'

  import { loadPresentablesList, loadPresentableResourceData } from '../data-loader'
  const PRESENTABLE_TAGS_BASE = [ 'data-cover', 'data-info', 'data-chapters-list' ]

  export default {
    name: 'home-page',
    components: { ComicsHeader, ComicsTab, ComicsChapter, DisplayBox, Loading },
    data() {
      const tabLabels = ['详情', '选集']
      return {
        isMobile: window.FreelogApp.Env.isMobile,
        tabLabels,
        activeTabName: tabLabels[1],
        comicsInfo: null,
        comicsCoverUrl: '',
        coverPresentable: null,
        introPresentable: null,
  
        chaptersInfoPresentable: null,
        chaptersInfoArr: null,
        loadedChaptersInfoCount: 0,
        activeChaptersListIndex: 0,
        chaptersList: [],
        chapterPresentableMap: {}, 

        presentableAuthInfoMap: {},
        activeChapterImageUrls: [],
        activeChapterName: '',
        chapterDetailVisible: false,
        loadingVisible: false,

      }
    },
    computed: {
      isCanLoadMoreChapters (){
        return this.chaptersInfoArr && this.loadedChaptersInfoCount < this.chaptersInfoArr.length
      }
    },
    methods: {
      init() {
        console.log('run in', this.isMobile ? 'Mobile' : 'PC')
        this.loadingVisible = true
        this.getComicsBasePresentables()
          .then(() => {
            this.getComicsInfoData()
            return this.getComicsChaptersListInfoData()
          })
          .then(() => {
            this.showComicsChaptersList(this.loadedChaptersInfoCount)
            this.loadedChaptersInfoCount += 1
            this.loadingVisible = false
          })
      },
      getComicsBasePresentables() {
        return loadPresentablesList({ tags: PRESENTABLE_TAGS_BASE.join(',') })
          .then(data => {
            if (data != null) {
              data.dataList.forEach(p => {
                if(this.coverPresentable === null && p.userDefinedTags.indexOf(PRESENTABLE_TAGS_BASE[0]) !== -1 ) {
                  this.coverPresentable = p
                  this.comicsCoverUrl = window.FreelogApp.QI.resolvePresentableDataUrl(p.presentableId)
                }
                if(this.introPresentable === null && p.userDefinedTags.indexOf(PRESENTABLE_TAGS_BASE[1]) !== -1 ) {
                  this.introPresentable = p
                }
                if(this.chaptersInfoPresentable === null && p.userDefinedTags.indexOf(PRESENTABLE_TAGS_BASE[2]) !== -1 ) {
                  this.chaptersInfoPresentable = p
                }
              })
            }
          })
      },
      getComicsInfoData() {
        if(this.introPresentable != null) {
          loadPresentableResourceData(this.introPresentable.presentableId)
            .then((data) => {
              if(data != null) {
                this.comicsInfo = JSON.parse(data)
              }
            })
            .catch(e => console.warn(e))
        }
      },
      // 漫画章节信息 JSON
      getComicsChaptersListInfoData() {
        if(this.chaptersInfoPresentable != null) {
          return loadPresentableResourceData(this.chaptersInfoPresentable.presentableId)
            .then((res) => {
              if(res.errcode == null) {
                const data = JSON.parse(res)
                // 移动端：降序排列，PC端：升序排列
                data.sort((c1, c2) => {
                  if(c1.number < c2.number){
                    return this.isMobile ? 1 : -1
                  }else {
                    return this.isMobile ? -1 : 1
                  }
                })
                this.chaptersInfoArr = data.map((c, index) => {
                  c.navTag = `${(c.number - 1) * c.size + 1}-${c.number * c.size}`
                  c.index = index
                  return c
                })
              }else {
                if(res.errcode === 0) {
                  this.showErrorMsg(`授权出错：授权错误码为${res.data.authCode}`)
                }else {
                  this.showErrorMsg(res.msg)
                }
              }
            })
            .catch(e => console.warn(e))
        }else {
          return Promise.reject()
        }
      },
      // 显示 漫画章节列表
      showComicsChaptersList(chapterListNumber, isReplace = false) {
        if(this.chaptersInfoArr !== null) {
          const perChaptersInfo = this.chaptersInfoArr[chapterListNumber]
          const { chapterTag, chapterList } = perChaptersInfo
          // 移动端：降序排列，PC端：升序排列
          chapterList.sort((c1, c2) => {
            if(c1.number < c2.number){
              return this.isMobile ? 1 : -1
            }else {
              return this.isMobile ? -1 : 1
            }
          })
          if(isReplace) {
            this.chaptersList = chapterList
          }else {
            this.chaptersList.push(...chapterList)
          }
          
          this.getChaptersPresentablesList(chapterTag)
        }
      },
      getChaptersPresentablesList(chapterTag) {
        return loadPresentablesList({ tags: chapterTag })
          .then(data => {
            console.log(JSON.parse(JSON.stringify(data)))
            const map = {}
            const pids = data.dataList.map(p => {
              map[p.releaseInfo.releaseName] = p
              return p.presentableId
            }).join(',')
            this.chapterPresentableMap = Object.assign({}, this.chapterPresentableMap, map)
          })
      },
      // 显示「漫画章节」
      showChapter(data) {
        const { imagesUrlList, chapterName } = data
        this.activeChapterName = chapterName
        this.activeChapterImageUrls = imagesUrlList
        this.chapterDetailVisible = true
      },
      hideChapter() {
        this.chapterDetailVisible = false
      },
      loadMoreChapters() {
        this.showComicsChaptersList(this.loadedChaptersInfoCount)
        this.loadedChaptersInfoCount += 1
      },
      exchangeChaptersList(chapterInfo) {
        this.activeChaptersListIndex = chapterInfo.index
        this.showComicsChaptersList(chapterInfo.index, true)
      },
      showErrorMsg(msg) {
        window.FreelogApp.trigger('NOTIFY_NODE', { msg })
      },
    },
    mounted() {
      this.init()
    }
  }
</script>

<style lang="less" scoped>
  .comics-description {
    padding: .32rem; font-size: .3733333rem; color: #333;
    h2 {
      font-size: .426667rem; font-weight: 400;
    }
    p{ margin: .32rem 0; text-indent: .64rem; }
    div{ color: #666; }
  }

  .c-content {
    display: none;
    
    .c-chapter-nav-tags {
      width: 886px; 
      .el-tag { margin-right: 15px; margin-bottom: 15px; cursor: pointer; }
    }
    .c-cont-empty-box {
      overflow: hidden; position: relative;
      width: 260px; margin: 10px; padding: 5px 10px; border: 1px solid transparent;
    }
  }
  .c-load-more {
    line-height: 1.44rem;
    font-size: .37333rem; color: #666; text-align: center;
  }

  @media screen and (min-width: 768px) {
    .c-container { min-width: 990px; }
    .c-content-mobile { display: none; }
    .c-content{ 
      display: flex; flex-wrap: wrap;
      justify-content: center; align-items: center;
      width: 990px; margin: auto; padding: 30px 0; 
      background-color: #fff; 
    }
  }
</style>

<style lang="less">
  .app-footer {
    display: none;
  }

  @media screen and (min-width: 768px){
    .app-footer {
      display: block;
    }
  }
</style>
