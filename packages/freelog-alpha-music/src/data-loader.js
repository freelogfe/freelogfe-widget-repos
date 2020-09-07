function showErrorMessage(e) {
  console.log(e)
  const errorStr = e.toString()
  window.f_common_lib.ElementUI.Message.error(errorStr)
}

export const MENU_TAGS = [ 'song-list', 'new-song' ]

export function loadPresentableInfo(presentableId) {
  return window.FreelogApp.QI.getPresentable(presentableId)
    .catch(showErrorMessage)
    .then(res => {
      if(res.errcode === 0) {
        return Promise.resolve(res.data)
      }else {
        return showErrorMessage(res.msg)
      }
    })
}

export function loadPresentablesList(params) {
  params = Object.assign({ isLoadingResourceInfo: 1, isOnline: 1, pageSize: 20 }, params)
  return window.FreelogApp.QI.pagingGetPresentables(params)
    .catch(showErrorMessage)
    .then(res => {
      if(res.errcode === 0) {
        return Promise.resolve(res.data)
      }else {
        return showErrorMessage(res.msg)
      }
    })
}

export function loadPresentableResourceData(presentableId) {
  return window.FreelogApp.QI.getPresentableData(presentableId)
    .then(resp => {
      const isSuccess = resp.headers.get('freelog-resource-type') != null
      return isSuccess ? resp.text() : resp.json()
    })
    .then(data => {
      if(data.errcode == null) {
        return JSON.parse(data)
      }
    })
}

export function batchLoadPresentablesList({ releaseNames }) {
  return window.FreelogApp.QI.batchGetPresentables({ releaseNames: releaseNames.join(',') })
    .catch(showErrorMessage)
    .then(res => {
      if(res.errcode === 0) {
        return Promise.resolve(res.data)
      }else {
        return showErrorMessage(res.msg)
      }
    })
}
