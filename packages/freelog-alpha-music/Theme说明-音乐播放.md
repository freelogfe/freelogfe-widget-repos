    
## Theme资源名称：ww-zh/PB-听音乐
`听音乐`主题，主要「专辑💽信息」和「音乐🎵」两种资源组成；

### 专辑💽信息
- 资源类型：JSON
- 说明：专辑，又分“普通专辑”和“新歌专辑”；专辑信息，包括专辑作者（author）、专辑介绍（intro）、专辑标签（tags）、歌曲列表（songsList）。其中，歌曲列表由N个歌曲信息，每个歌曲信息包括歌曲的资源名称（releaseName）、歌曲名称（songName）、歌手（singer）、专辑（album）和时长（duration）。
- presentable标签：song-list(普通专辑)、new-song（新歌专辑）
- 示例如下：
1. 普通专辑

```json
{
  "releaseName": "ww-zh/专辑-赵雷的歌曲集合",
  "presentableTag": "song-list-zl",
  "author": "ww-zh",
  "intro": "民谣如风，吹走了我的忧伤，民谣如他，唱出了我的曾经。 民谣，民谣你为何这么简单，简单的让人不在哭泣。 愿民谣温暖你的心，今日阳光正好，微风不燥。",
  "tags": [
    "民谣", "国语"
  ],
  "songsList": [
    {
      "releaseName": "ww-zh/歌曲-赵雷-理想",
      "songName": "赵雷-理想",
      "singer": "赵雷",
      "album": "吉姆餐厅",
      "duration": "05:13"
    },
    {
      "releaseName": "ww-zh/歌曲-赵雷-成都",
      "songName": "赵雷-成都",
      "singer": "赵雷",
      "album": "成都",
      "duration": "05:28"
    }
  ]
}
```

2. 新歌专辑

```json
{
  "releaseName": "ww-zh/新歌集合",
  "presentableTag": "new-song",
  "author": "ww-zh",
  "intro": "民谣如风，吹走了我的忧伤，民谣如他，唱出了我的曾经。 民谣，民谣你为何这么简单，简单的让人不在哭泣。 愿民谣温暖你的心，今日阳光正好，微风不燥。",
  "tags": [ "民谣", "国语" ],
  "songsList": [
    {
      "releaseName": "ww-zh/歌曲-陈绮贞-距离",
      "songName": "距离",
      "singer": "陈绮贞",
      "album": "太阳",
      "duration": "03:15"
    },
    {
      "releaseName": "ww-zh/歌曲-郑钧-灰姑娘",
      "songName": "灰姑娘",
      "singer": "郑钧",
      "album": "赤裸裸",
      "duration": "05:07"
    },
    {
      "releaseName": "ww-zh/歌曲-陈奕迅-淘汰",
      "songName": "淘汰",
      "singer": "陈奕迅",
      "album": "认了吧",
      "duration": "04:45"
    }
  ]
}
```

### 音乐🎵
- 资源类型：audio
- presentab 标签：new-song(新歌专辑歌曲)、song-list-zl（普通专辑歌曲）
- 标签说明：普通专辑的歌曲标签由普通专辑信息的presentableTag



