import './index.less'
var htmlStr = require('./index.html')

class FreelogAlphaAside extends HTMLElement {
  constructor() {
    super()
    this.innerHTML = htmlStr
    const sidebarVisible = this.getAttribute('sidebar-visible')
    const isMultiContent = this.getAttribute('is-multi-content')
    
    this.sidebarVisible = sidebarVisible === null ? false : sidebarVisible === 'false' ? false : true
    this.isMultiContent = isMultiContent === null ? false : isMultiContent === 'false' ? false : true
    this.expandBtnVisible = false
    this.sidebarTimer = null
    this.expandBtnTimer = null
    this.keyPressedMap = {}
    this.keyPressedCount = 0
    this.activeSidebarIndex = +this.getAttribute('active-sidebar-index') || 0
    this.presentablesList = []
    this.presentablesMap = {}
    this.selectedPresentableId = ''

    const listTypes = this.getAttribute('list-type')
    this.listTypes = eval(listTypes)
    this.contentWidgetName = this.getAttribute('content-widget-name') 
    this.contentWidgetParams = this.getAttribute('content-widget-params') || {}
    this.contentBg = this.getAttribute('content-background-color')
  }

  connectedCallback (){
    this.bindEvent()
    this.init()
  }

  bindEvent() {
    this.getDom()
    this.$wrapper.addEventListener('click', this.hideSidebar.bind(this), false)
    this.$expandBtn.addEventListener('click', this.toggleSidebar.bind(this), false)
    this.$tuckUpBtn.addEventListener('click', this.toggleSidebar.bind(this), false)
    this.$sidebarList.addEventListener('click', this.selectedPresentable.bind(this), false)
    this.$wrapper.addEventListener('mousemove', this.handleMouseMove.bind(this), false)
    document.addEventListener("keydown", this.handleKeyDown.bind(this), false)
    document.addEventListener("keyup", this.handleKeyUp.bind(this), false)
    window.addEventListener('popstate', this.handlePopState.bind(this), false)
  }

  getDom() {
    const $root = this

    this.$app = $root.querySelector('.freelog-alpha-aside')
    this.$wrapper = $root.querySelector('.fc-wrapper')
    this.$mainContent = $root.querySelector('#f-main-content')
    this.$nodeTitleBar = $root.querySelector('.f-node-title')
    this.$expandBtn = $root.querySelector('.side-bar-expander')
    this.$tuckUpBtn = $root.querySelector('.side-bar-tuck-up-btn')
    this.$sidebarTooltip = this.$expandBtn.querySelector('.f-sb-tooltip')
    this.$sidebarList = $root.querySelector('.sb-list ul')
  }

  init() {
    this.renderNodeTitle()
    this.getPresentableList()
    if(this.sidebarVisible) {
      this.sidebarTimer = setTimeout(() => {
        this.toggleClass(this.$app, 'hide-sidebar')
      }, 10000)
    }else {
      this.showExpanderBtn()
    }
    if(this.contentBg) {
      this.$mainContent.style = `background-color: ${this.contentBg};`
    }
  }

  getPresentableList(){
    return window.FreelogApp.QI.fetchPresentablesList({
            resourceType: this.listTypes.join(',')
          })
          .then(res => {
            if(res.errcode === 0) {
              this.presentablesList = res.data.dataList.map(p => {
                this.presentablesMap[p.presentableId] = p
                return p
              })
              this.renderSidebarList(this.presentablesList)
              this.renderMainContent(this.presentablesList)
              setTimeout(() => {
                this.renderPresentable(this.selectedPresentableId)
              }, 0)
            }
          })
          .catch(e => {
            console.log('e ---', e)
          })
  }

  renderNodeTitle() {
    if(window.__auth_info__ && window.__auth_info__.__auth_node_name__) {
      this.$nodeTitleBar.innerHTML = window.__auth_info__.__auth_node_name__
    }
  }

  renderSidebarList(list) {
    var listHTML = ''
    if(list.length) {
      this.getActiveSidebarIndexFromHash(list)
      listHTML = list.map((item, index) => {
        if(index === this.activeSidebarIndex) {
          this.selectedPresentableId = item.presentableId
          return `<li class="selected" data-presentable-id="${item.presentableId}">${item.presentableName}</li>`
        }
        return `<li data-presentable-id="${item.presentableId}">${item.presentableName}</li>`
      }).join('')
    }else {
      listHTML = `<div style="display: flex; min-height: 100vh; justify-content: center; align-items: center;">暂无数据</div>`
    }

    this.$sidebarList.innerHTML = listHTML
  }

  getActiveSidebarIndexFromHash(list) {
    const hash = decodeURIComponent(window.location.hash)
    if(hash) {
      for(let i = 0; i < list.length; i++) {
        const { presentableName } = list[i]
        if(`#/${presentableName}` === hash) {
          this.activeSidebarIndex = i
        }
      }
    }
    if(this.activeSidebarIndex > (list.length - 1)) {
      this.activeSidebarIndex = 0
    }
  }

  renderMainContent(list) {
    var contentHTML = ''
    if(list.length) {
      if(this.isMultiContent) {
        contentHTML = list.map((item, index) => {
          if(index === this.activeSidebarIndex) {
            this.selectedPresentableId = item.presentableId
            return `<div class="presentable-box visible" data-presentable-id="${item.presentableId}"></div>`
          }
          return `<div class="presentable-box" data-presentable-id="${item.presentableId}"></div>`
        }).join('')
      }else {
        contentHTML = `<div class="presentable-box visible"></div>`
      }
    }else {
      contentHTML = `<div style="display: flex; min-height: 100vh; justify-content: center; align-items: center; font-size: 20px; color: #000; ">空空如也...</div>`
    }
      
    this.$mainContent.innerHTML = contentHTML
  }

  renderPresentable(presentableId, isPushState = false) {
    if(presentableId === '') return 
    const { presentableName, releaseInfo } = this.presentablesMap[presentableId]
    const previewImg = releaseInfo.previewImages ? releaseInfo.previewImages[0] : ''
    
    if(this.isMultiContent) {
      const $targetBox = this.$mainContent.querySelector(`[data-presentable-id="${presentableId}"]`)
      if($targetBox) {
        const $widget = $targetBox.querySelector(`${this.contentWidgetName}`)
        if($widget == null){  
          $targetBox.innerHTML = `<${this.contentWidgetName} data-presentable-name="${presentableName}" data-presentable-id="${presentableId}" data-preview-image="${previewImg}"></${this.contentWidgetName}>`
        }
      }
    }else {
      const $targetBox = this.$mainContent.querySelector(`.presentable-box`)
      $targetBox.innerHTML = `<${this.contentWidgetName} data-presentable-name="${presentableName}" data-presentable-id="${presentableId}"  data-preview-image="${previewImg}"></${this.contentWidgetName}>`
    }

    if(isPushState) {
      if(window.hash !== `#/${presentableName}`) {
        window.history.pushState({ presentableName, presentableId }, presentableName, `#/${presentableName}`)
      }else {
        window.history.replaceState({ presentableName, presentableId }, presentableName, `#/${presentableName}`)
      }
    }
  }

  hideSidebar() {
    if(this.sidebarVisible) {
      this.toggleSidebar()
      this.handlerAfterHideSidebar() 
    }
  }

  toggleSidebar(event) {
    if(event) {
      event.stopPropagation()
    }
    this.sidebarVisible = !this.sidebarVisible
    this.toggleClass(this.$app, 'hide-sidebar')
    if(!this.sidebarVisible) {
      this.handlerAfterHideSidebar()
    }
  }

  handlerAfterHideSidebar() {
    this.expandBtnTimer = setTimeout(() => {
      this.expandBtnVisible = true
      this.toggleClass(this.$expandBtn, 'visible', 'add')
      this.expandBtnTimer = setTimeout(this.hideExpanderBtn.bind(this), 2000)
    }, 200)
  }

  showExpanderBtn() {
    clearTimeout(this.expandBtnTimer)
    this.expandBtnVisible = true
    this.toggleClass(this.$expandBtn, 'visible', 'add')
  }

  hideExpanderBtn() {
    clearTimeout(this.expandBtnTimer)
    this.expandBtnVisible = false
    this.toggleClass(this.$expandBtn, 'visible', 'hide')
  }

  toggleClass ($dom, className, type){
    var classList = $dom.classList
    classList = new Set(classList)
    if(type === 'add') {
      classList.add(className)
    }else if(type === 'delete'){
      classList.delete(className)
    }else {
      if(classList.has(className)) {
        classList.delete(className)
      }else {
        classList.add(className)
      }
    }
    
    $dom.className = [...classList].join(' ')
  }

  selectedPresentable(event) {
    if(event.target.dataset != null) {
      const dataset = event.target.dataset
      const { presentableId } = dataset
      if(presentableId && presentableId != this.selectedPresentableId) {
        this.changePresentable(presentableId, true)
      }
    }
  }

  changePresentable(presentableId, isPushState) {
    this.selectedPresentableId = presentableId
    this.renderPresentable(presentableId, isPushState) 
    this.toggleSidebarHighlight()
    this.isMultiContent && this.togglePresentableBox()
  }

  toggleSidebarHighlight() {
    const $formerDOM = this.querySelector('.sb-list .selected')
    const $target = this.querySelector(`[data-presentable-id="${this.selectedPresentableId}"]`)
    this.toggleClass($formerDOM, 'selected', 'delete')
    this.toggleClass($target, 'selected', 'add')
  }

  togglePresentableBox() {
    this.toggleClass(this.querySelector('.presentable-box.visible'), 'visible')
    this.toggleClass(this.querySelector(`.presentable-box[data-presentable-id="${this.selectedPresentableId}"]`), 'visible')
  }

  handleMouseMove(event) {
    const { clientX } = event
    if(clientX > 40) {
      if(this.expandBtnVisible) {
        this.expandBtnVisible = false
        this.expandBtnTimer = setTimeout(this.hideExpanderBtn.bind(this), 2000)
      }
    }else {
      if(!this.expandBtnVisible) {
        this.showExpanderBtn()
      }else {
        clearTimeout(this.expandBtnTimer)
      }
    }
  }

  handleKeyDown(event) {
    if(!this.keyPressedMap[event.which]) {
      this.keyPressedCount += 1
    }
    this.keyPressedMap[event.which] = this.keyPressedCount
    switch(event.which) {
      case 80: {
        // key p
        if(this.keyPressedMap[91] && this.keyPressedCount === 2) {
          this.toggleSidebar()
        }
        event.preventDefault()
        break
      }
      case 91: 
      case 93: {
        // 按键⌘ (command)
        this.keyPressedMap[91] = this.keyPressedCount
        break
      }
    }
  }

  handleKeyUp(event) {
    this.keyPressedCount = 0
    this.keyPressedMap = {}
  }

  handlePopState(event) {
    if(event.state) {
      const { presentableId } = event.state
      if(presentableId) {
        this.changePresentable(presentableId, false)
      }
    }
  }
}

customElements.define('freelog-alpha-aside', FreelogAlphaAside);
