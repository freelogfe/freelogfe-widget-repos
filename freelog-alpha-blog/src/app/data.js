function createLoader(loader) {
  var loading = false;
  var handles = [];
  var value;

  return function (callback) {
    if (value) {
      callback(value)
    } else if (loading) {
      handles.push(callback)
    } else {
      loading = true;
      handles.push(callback)
      loader(function (v) {
        value = v;
        let h;
        while ((h = handles.shift())) {
          h(v)
        }
      })
    }
  }
}

var onloadAboutMe = createLoader(function (callback) {
  loadPresentablesByTags('aboutme')
    .then(data => {
      if (data.length) {
        var presentable = data[0];
        if (presentable) {
          requestPresentableData(presentable.presentableId).then(data => {
            callback(Object.assign(presentable, data));
          });
        } else {
          return ''
        }
      } else {
        window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', {response: data})
      }
    })
});

function loadPresentablesByTags(tags) {
  return window.FreelogApp.QI.pagingGetPresentables({
    tags,
    isLoadingResourceInfo: 1
  }).then(res => {
    if (res.errcode === 0) {
      return res.data.dataList
    } else {
      return res
    }
  })
}

function loadBlogConfig() {
  return loadPresentablesByTags('blog-config')
    .then(data => {
      if (data.length) {
        var presentable = data[0]
        if (presentable) {
          return window.FreelogApp.QI.getPresentableData(presentable.presentableId)
            .then(res => {
              var subReleasesText = res.headers.get('freelog-sub-dependencies')
              const entityNid = res.headers.get('freelog-entity-nid')
              try {
                let subReleases = Buffer.from(subReleasesText,'base64').toString('utf-8')
                subReleases = JSON.parse(subReleases) 
                presentable.subReleases = subReleases.map(item => {
                  item.entityNid = entityNid
                  return item
                })
              }catch(e) {
                console.error(e)
              }
              return res.json().then(data => {
                return Object.assign(presentable, data)
              })
            })
        } else {
          return null
        }
      } else {
        window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', {response: data})
      }
    })
}


const presentableMap = {}
var onloadArticles = createLoader(function (callback) {
  return window.FreelogApp.QI.pagingGetPresentables({
    tags: 'article',
    resourceType: 'markdown',
    isLoadingResourceInfo: 1,
    pageSize: 50
  }).then(res => {
    if (res.errcode === 0) {
      res.data.dataList.forEach(presentable => {
        presentableMap[presentable.presentableId] = presentable
      })
      callback(res.data.dataList.filter(p => {
        p.userDefinedTags = p.userDefinedTags.filter(tag => tag != 'article')
        return p
      }))
    } else {
      window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE', {response: res})
    }
  })
});

function loadPresentableInfo(presentableId) {
  return window.FreelogApp.QI.getPresentable(presentableId)
}

function requestPresentableData(presentableId) {
  return window.FreelogApp.QI.getPresentableData(presentableId)
    .then(res => {
      var contentType = decodeURIComponent(res.headers.get('Content-Type'))
      var article = {}
      
      if(/json/.test(contentType)) {
        return res.json().then(errResponse => {
          return loadPresentableInfo(presentableId)
            .then(data => {
              article = data.resourceInfo.meta || {}
              article.presentableId = presentableId
              article.error = errResponse
              if(presentableMap[presentableId]) {
                article.presentableName = presentableMap[presentableId].presentableName
              }

              return Object.assign(article, data);
            })
        })
      }else {
        var subReleasesText = res.headers.get('freelog-sub-dependencies')
        article.entityNid = res.headers.get('freelog-entity-nid')
        try {
          let subReleases = Buffer.from(subReleasesText,'base64').toString('utf-8')
          subReleases = JSON.parse(subReleases) 
          article.subReleases = subReleases.map(item => {
            item.entityNid = entityNid
            return item
          })
        }catch(e) {
          console.error(e)
        }
        return res.text().then(content => {
          article.content = content
          article.presentableId
          if(presentableMap[presentableId]) {
            article.presentableName = presentableMap[presentableId].presentableName
          }
          return article
        })
      }
    })
}


const presentablesDataMap = {}
function onloadPresentableData(presentableId, disabledCache) {
  if (!disabledCache && presentablesDataMap[presentableId]) {
    var res = presentablesDataMap[presentableId]
    if(presentableMap[presentableId]) {
      res = Object.assign(presentableMap[presentableId], res)
    }
    return Promise.resolve(res)
  } else {
    return requestPresentableData(presentableId).then((article) => {
      console.log('article ---', article)
      if (!article.presentableId) {
        return loadPresentableInfo(presentableId)
          .then(res => {
            presentableMap[presentableId] = res.data
            presentablesDataMap[presentableId] = article
            return Object.assign(res.data, article)
          })
      } else {
        presentablesDataMap[presentableId] = article
        return article
      }
    })
  }
}

//alias
var onloadArticleContent = onloadPresentableData

export {
  onloadAboutMe,
  onloadArticles,
  loadBlogConfig,
  loadPresentablesByTags,
  onloadPresentableData,
  onloadArticleContent
}
