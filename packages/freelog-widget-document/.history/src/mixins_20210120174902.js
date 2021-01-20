export default {
  methods: {
		loadPresentableData(presentableId) {
			return window.FreelogApp.QI.getPresentableData(presentableId).then(resp => {
				var isError = !resp.headers.get('freelog-resource-type')
        var subReleasesText = resp.headers.get('freelog-sub-dependencies')
        const entityNid = resp.headers.get('freelog-entity-nid')
				try {
					let subReleases = decodeURIComponent(subReleasesText)
					subReleases = JSON.parse(subReleases) 
				}catch(e) {
					console.error(e)
				}
				return isError ? resp.json() : resp.blob()
			})
		},
  },
  loadPresentableDataByName(resourceName) {
	//  window.__auth_info__.__auth_node_id__
	window.FreelogApp.QI.getPresentableData(presentableId)
    return window.FreelogApp.QI.fetch(`/v2/auths/presentables/nodes/${this.nodeId}/${resourceName}/fileStream`)
      .then(resp => {
        return !resp.headers.get('freelog-resource-type') ? resp.json() : resp.blob()
      })
  }
}