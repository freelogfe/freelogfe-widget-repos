# freelog-alpha-comics

## 功能介绍
A freelog widget

## 节点使用说明

### 节点资源配置说明
节点中，插件须搭配如下资源方可使用

#### 资源一：`头图` 
- 描述：页面头部封面图
- 类型：image
- 是否必须：是
- 标签：无

#### 资源二：`剧集 - 导航` 
- 描述：通过给资源打标签的方式，动态控制剧集导航
- 资源类型：json
- 是否必须：是
- 标签：

|名称|是否必须 |描述|
|---|---|---|
|nav-tags|是|用于标记该JSON资源，方便接口查询|
|nav-1-200|是|表示1-200的剧集导航|

- meta: 无

- 资源内容：

```
[{}]
```

## 开发者使用说明

### 调用方式
|属性（参数）|必填|描述|
|---|---|---|
|data-widget-src|无|widget的资源ID|

```html
<!--在PB中引用-->
<freelog-comics-mobile  class="js-wc-widget" data-widget-src="d2686bda89418e51bae5739a5411f245f0e0d78c"></freelog-comics-mobile>
```

```javascript
// JS中调用
window.FreelogApp.QI.requireSubSource('d2686bda89418e51bae5739a5411f245f0e0d78c')
    .then(res => {
        var elem = document.createElement('freelog-comics-mobile')
        document.querySelector('body').append(elem)
    })
```


### 依赖资源
|资源名称|资源ID|
|---|---|
|无|无|


### 资源meta
无


### 效果图
![image](your image url)


### 一、漫画样式：封面 + 简介 + 章节目录

### 二、制作“封面 + 简介”资源：
1. 创建一个image类型的图片资源（即封面图）；完善meta信息（即漫画简介），例子如下
```json
{
  "name": "海贼王",
  "tags": "热血 冒险",
  "author": "尾田荣一郎",
  "widgetName": "",
  "introduction": "有一个梦想成为海盗的少年叫路飞，他因误食“恶魔果实”而成为了橡皮人，在获得超人能力的同时付出了一辈子无法游泳的代价。十年后，路飞为实现与因救他而断臂的杰克斯的约定而出海，开始了以成为海盗王为目标的伟大的冒险旅程！"
}
```
2. 于漫画节点添加“封面 + 简介”资源，并为该节点资源添加“cover”标签，上线后即可生成漫画封面；

### 三、制作漫画章节目录：
- 章节组成：一个json类型的资源 + N个image类型的图片资源，即一个JSON资源依赖N个image资源；
1. 先创建章节所需的图片资源：其资源名称约定为`***-序号`或`***_序号`，如例子：one-piece-image-880-08，则表示该图片在章节中排序第八；
2. 创建一个章节资源，即一个类型json资源并依赖章节的图片资源；
3. 于漫画节点中添加“章节资源”（节点资源名称即为漫画的章节名称），添加标签“chapter”与章节序号（如“880”），例子如下：![image](https://image.freelog.com/preview/194ff859-1c15-4dbe-8c6d-46529489c325.jpg)
4. 重复第2、3点，即可创建出漫画章节目录。






