

async function mountApp() {
  const result = await window.FreelogApp.QI.pagingGetPresentables({
    resourceType: 'json'
  })
  const presentable = result.data.dataList[0]
  window.FreelogApp.trigger(
    'SHOW_AUTH_DIALOG', 
    presentable, 
    function callback() {
      console.log('trigger SHOW_SIGN_DIALOG')
      // event done
    }
  )
  console.log(result.data.dataList)

}
// mountApp()




