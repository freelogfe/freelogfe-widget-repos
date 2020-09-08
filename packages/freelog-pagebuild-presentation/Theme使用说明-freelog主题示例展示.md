## Theme资源名称：ww-zh/PB-预览presentation

freelog主题示例展示节点，主要由「theme使用说明」和「节点地址映射表」两种资源组成

### theme使用说明
* 类型：markdown
* 封面：即资源封面
* 名称：展品（presentable）名称
* 标签：
  * 分类标签：固定标签`pd-md`
  * 内容标签：可定义，如`适配移动端`、`含左侧导航条`等
* 示例：
  ```markdown
    ## Theme资源名称：ww-zh/PB-jsnes
    web版红白机游戏，可支持多个「nes」资源，支持手柄操作。

    ### nes
    * 类型：nes
    * nes资源下载地址：
    - 国内：https://www.51nes.cn/
    - 国外：https://romsmania.cc/roms/nintendo

  ```
  
### 节点地址映射表
* 类型：json
* 映射规则：`「theme使用说明」资源名称` => `「theme资源」名称`与`示例节点地址`
* 内容示例：
  ```json
  {
    "ww-zh/PB说明-音乐播放":{
      "PB-releaseName": "ww-zh/PB-听音乐", 
      "PB-demo-site": "http://f-music.testfreelog.com"
    },
    "ww-zh/PB说明-网页版PPT":{
      "PB-releaseName": "ww-zh/pb-web-slides(ppt)", 
      "PB-demo-site": "http://p-slides.testfreelog.com"
    },
    "ww-zh/PB说明-nes-web版红白机游戏":{
      "PB-releaseName": "ww-zh/PB-jsnes", 
      "PB-demo-site": "http://f-nes.testfreelog.com"
    },
    "ww-zh/PB说明-markdown阅读":{
      "PB-releaseName": "ww-zh/PB-markdown阅读", 
      "PB-demo-site": "http://f-markdown.testfreelog.com"
    },
    "ww-zh/PB说明-markdown文档":{
      "PB-releaseName": "ww-zh/PB-freelog-widget-docs", 
      "PB-demo-site": "http://f-docs.testfreelog.com"
    },
    "ww-zh/PB说明-小说阅读":{
      "PB-releaseName": "ww-zh/pb-书籍阅读器", 
      "PB-demo-site": "http://f-novel.testfreelog.com"
    },
    "ww-zh/PB说明-视频播放器":{
      "PB-releaseName": "ww-zh/pb-video", 
      "PB-demo-site": "http://f-video.testfreelog.com"
    },
    "ww-zh/看漫画":{
      "PB-releaseName": "ww-zh/pb-看漫画", 
      "PB-demo-site": "http://f-comics.testfreelog.com"
    },
    "ww-zh/PB说明-blog":{
      "PB-releaseName": "ww-zh/pb-blog", 
      "PB-demo-site": "http://f-blog.testfreelog.com"
    }
  }
  ```

