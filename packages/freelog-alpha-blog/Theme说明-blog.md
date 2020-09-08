
### Theme资源名称：ww-zh/pb-blog
博客节点，主要由「博客基础配置」、「关于我」和「文章」三种资源组成

### 博客基础配置
* 主要包含“标题”、“博主头像”、“博客封面”、“博客介绍”四部分内容
* 类型: json
* 标签: 'blog-config'
* 例如

```json
{
  "blogTitle": "博客页面标题",
  "avatar": "博主头像资源名称",
  "postImage": "博客导航封面图资源名称",
  "blogDesc": "博客介绍"
}
```

### 关于我
* 类型: markdown
* 标签:  `aboutme`


### 文章
* 类型: markdown
* 标签: `article` 
* 资源meta，示例如下

```json
{
  "tags": ["aaa", "bbb"]
}
```



