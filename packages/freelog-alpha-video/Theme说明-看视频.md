
## Theme名称：ww-zh/pb-video
于节点中添加并上线“视频”发行即可使用。

|事项|说明|示例|
|---|---|---|
|所需发行类型|video|-|
|节点发行tags|无|-|

### 资源meta定义（必须）

- title: 视频标题
- duration: 视频时长，单位秒
- poster: 对应的视频封面图资源Id，图比例16:9

例如
```json
{
  "profile": {
    "title": "小明砸锅",
    "duration": "126",
    "poster": "1sdsasdf8sdfjakd"
  }
}
```

