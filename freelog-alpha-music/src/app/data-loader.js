function showErrorMessage(e) {
  const errorStr = e.toString()
  window.f_common_lib.ElementUI.Message.error(errorStr)
}

export const MENU_TAGS = [ 'song-list', 'new-song' ]

export function loadPresentablesList(params) {
  params = Object.assign({ isLoadingResourceInfo: 1, isOnline: 1 }, params)
  return window.FreelogApp.QI.fetchPresentablesAuthList(params)
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
  return window.FreelogApp.QI.fetchPresentableResourceData(presentableId)
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
