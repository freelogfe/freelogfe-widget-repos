## Theme资源名称：ww-zh/PB-freelog-widget-docs
markdown文档生成器，可支持构建多个文档，每个文档可自定义目录；文档页面适配移动端。

## 文档节点的资源配置结构
  - markdown文档节点由N个文档组成；
  - 单个文档 = 一个「目录」资源 + N个「markdown」资源；
  - 同一个文档的节点资源（即「目录」与「markdown」）须打上同一标签，如【文档1】可打标签“docs-1”，【文档2】可打标签“docs-2”。

### 目录
* 类型：catalog
* 单行目录结构：（目录名称:资源名称）
* 资源内容:（示例如下）

```txt
介绍:ww-zh/Widget-docs-介绍
快速开始:ww-zh/Widget-docs-快速开始
本地开发
  组件开发:ww-zh/Widget-docs-本地开发
  自定义pagebuild:ww-zh/Widget-docs-自定义pagebuild
  目录结构:ww-zh/Widget-docs-目录结构
  发布:ww-zh/Widget-docs-发布
  全局变量:<ww-zh/Widget-docs-全局变量>
  Freelog事件:ww-zh/Widget-docs-Freelog事件
  ExceptionsCode:ww-zh/Widget-docs-ExceptionCode
高级
  proxy配置:ww-zh/Widget-docs-proxy代理
```

### markdown
* 类型：markdown


