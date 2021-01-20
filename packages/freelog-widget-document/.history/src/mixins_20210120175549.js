export default {
  methods: {
		loadPresentableData(presentableId) {
			return window.FreelogApp.QI.getPresentableData(presentableId).then(resp => {
				var isError = !resp.headers.get('freelog-resource-type')
        var subReleasesText = resp.headers.get('freelog-sub-dependencies')
        const entityNid = resp.headers.get('freelog-entity-nid')
				try {
					let subReleases = Buffer.from(subReleasesText,'base64').toString('utf-8')
					subReleases = JSON.parse(subReleases) 
				}catch(e) {
					console.error(e)
				}
				return isError ? resp.json() : resp.text()
			})
		},
  },
  loadPresentableDataByName(resourceName) {
    return window.FreelogApp.QI.fetch(`/v2/auths/presentables/nodes/${this.nodeId}/${resourceName}/fileStream`)
      .then(resp => {
        return !resp.headers.get('freelog-resource-type') ? resp.json() : resp.blob()
      })
  }
}