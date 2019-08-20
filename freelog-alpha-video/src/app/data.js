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

const nodeId = window.__auth_info__.__auth_node_id__

function loadResourcesByTags(tags) {
  return window.FreelogApp.QI.fetchPresentablesList({ tags, "isLoadingResourceInfo": 1 })
    .then(res => {
      if (res.errcode === 0) {
        return res.data
      } else {
        return res
      }
    })
}

function loadBlogConfig() {
  return loadResourcesByTags('blog-config')
    .then(data => {
      if (data.errcode === undefined) {
        var presentable = data[0]
        if (presentable) {
          return requestPresentableData(presentable.presentableId).then(data => {
            return Object.assign(presentable, data)
          })
        } else {
          return null
        }
      } else {
        window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE',{response: data})
      }
    })
}

var onloadVideos = createLoader(function (callback) {
  window.FreelogApp.QI.fetchPresentablesList({ "resourceType": "video", "isLoadingResourceInfo": 1 })
    .then(res => {
      if (res.errcode === 0 && res.data.dataList && res.data.dataList.length) {
        callback(res.data.dataList)
      } else {
        console.log('wrong result: ', res)
      }
    })
});

// window.FreelogApp.QI.fetchPresentableInfo

function loadPresentableAuths(pids) {
  return Promise.all(pids.map(pid => {
    return window.FreelogApp.QI.fetchPresentableAuth(pid)
  }))
  .then(resultArr => {
    const presentableMap = {}
    pids.forEach((presentableId, index) => {
        presentableMap[presentableId] = resultArr[index].data
    })
    return presentableMap
  })
}


function requestPresentableData(presentableId) {
  return window.FreelogApp.QI.fetch(`/v1/auths/presentable/${presentableId}?nodeId=${nodeId}`)
    .then(res => {
      var meta = decodeURIComponent(res.headers.get('freelog-meta'))
      var token = decodeURIComponent(res.headers.get('freelog-sub-resource-auth-token'))
      var resource

      try {
        resource = JSON.parse(meta)
        token = JSON.parse(token)
      } catch (e) {
        resource = {}
      }
      if (!resource) {
        return res.json().then(errResponse => {
          return window.FreelogApp.QI.fetchPresentableInfo(presentableId)
            .then(res => {
              resource = res.data.resourceInfo.meta || {}
              resource.presentableId = presentableId
              resource.error = errResponse
              resource.token = token
              return Object.assign(resource, res.data);
            })
        })
      } else {
        return res.text().then(content => {
          resource.content = content;
          resource.token = token
          return resource
        })
      }
    })
}

function getResourceToken(pid) {
  return window.FreelogApp.QI.fetch(`/v1/auths/presentable/${pid}?nodeId=${nodeId}`)
    .then(res => {
      var token = decodeURIComponent(res.headers.get('freelog-sub-resource-auth-token'))
      // var resourceIds = decodeURIComponent(res.headers.get('freelog-sub-resourceids'))
      return token
    });
}

function resolveResourcePath(id) {
  return window.location.origin.replace(/\/\/[^.]+/,'//qi') + `/v1/auths/presentables/${id}.file`
}


var presentablesMap = {}

function onloadPresentableData(presentableId, disabledCache) {
  if (!disabledCache && presentablesMap[presentableId]) {
    return Promise.resolve(presentablesMap[presentableId])
  } else {
    return requestPresentableData(presentableId).then((resource) => {
      if (!resource.presentableId) {
        return window.FreelogApp.QI.fetchPresentableInfo(presentableId)
          .then(res => {
            presentablesMap[presentableId] = resource
            return Object.assign(res.data, resource);
          })
      } else {
        presentablesMap[presentableId] = resource
        return resource
      }
    })
  }
}


//alias
var onloadResourceContent = onloadPresentableData

export {
  getResourceToken,
  resolveResourcePath,
  onloadVideos,
  loadBlogConfig,
  loadResourcesByTags,
  onloadPresentableData,
  onloadResourceContent,
  loadPresentableAuths
}
