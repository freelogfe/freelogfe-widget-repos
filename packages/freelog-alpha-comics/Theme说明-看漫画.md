## Theme资源名称：ww-zh/pb-看漫画
漫画节点，主要由「漫画封面」、「漫画介绍」、「漫画列表目录」与「漫画章节」四种资源组成；

### 资源一：漫画封面
- 资源类型：image
- 节点资源标签：'data-cover'

### 资源二：漫画介绍
- 资源类型：json
- 节点资源标签：'data-info'
- 资源内容示例如下

```json
{
  "name": "海贼王",
  "author": "尾田荣一郎",
  "area": "日本",
  "language": "日语",
  "tags": "搞笑 冒险 热血",
  "intro": "海贼王，又名航海王；传奇海盗哥尔·D·罗杰在临死前曾留下关于其毕生的财富“One Piece”的消息，由此引得群雄并起，众海盗们为了这笔传说中的巨额财富展开争夺，各种势力、政权不断交替，整个世界进入了动荡混乱的“大海贼时代”"
}
```

### 资源三：漫画列表目录
其主要用于确定漫画章节集合与章节的展示顺序

- 资源类型：json
- 节点资源标签：data-chapters-list 
- 资源内容示例如下

```json
[
  {
    "number": 44,
    "size": 20,
    "chapterTag": "OnePiece-861-880",
    "chapterList": [
      { 
        "number": 879, 
        "releaseName": "ww-zh/OnePiece-879", 
        "chapterName": "第879话 大妈3将星 山慈菇",
        "imagesList": [
          "ww-zh/one-piece-image-879-02",
          "ww-zh/one-piece-image-879-03",
          "ww-zh/one-piece-image-879-04",
          "ww-zh/one-piece-image-879-05",
          "ww-zh/one-piece-image-879-06"
        ]
      },
      { 
        "number": 880, 
        "releaseName": "ww-zh/OnePiece-880", 
        "chapterName": "第880话 退路0",
        "imagesList": [
          "ww-zh/one-piece-880-01",
          "ww-zh/one-piece-880-02",
          "ww-zh/one-piece-880-03",
          "ww-zh/one-piece-880-04",
          "ww-zh/one-piece-880-05"
        ]
      }
    ]
  },
  {
    "number": 45,
    "size": 20,
    "chapterTag": "OnePiece-881-900",
    "chapterList": [
      { 
        "number": 881, 
        "releaseName": "ww-zh/OnePiece-881", 
        "chapterName": "第881话 海浪房间",
        "imagesList": [
          "ww-zh/one-piece-881-01",
          "ww-zh/one-piece-881-02",
          "ww-zh/one-piece-881-03",
          "ww-zh/one-piece-881-04",
          "ww-zh/one-piece-881-05",
          "ww-zh/one-piece-881-06",
          "ww-zh/one-piece-881-07"
        ] 
      }
    ]
  }  
]
```

### 资源四：漫画章节
复合资源，其子资源则为某一漫画章节的图片资源；

- 资源类型：json
- 节点资源标签，即上述「漫画列表目录」示例中chapterTag属性值，如OnePiece-881-900

>PS: 每个章节UI封面则为「漫画章节」资源的预览图，PB端无章节UI封面。