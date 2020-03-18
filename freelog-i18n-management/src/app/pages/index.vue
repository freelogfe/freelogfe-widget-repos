<template>
  <div class="i18n-management-container">
    <div class="imc-header">
      <h2>Freelog I18n</h2>
      <div class="repos-select-box">
        <el-dropdown @command="selectRepository">
          <span class="el-dropdown-link">
            <span>仓库名称：</span>
            <a :href="reposI18nBranchUrl" target="_blank">{{selectedReposName}}</a>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item in trackedRepositories" :key="item.repositoryName" :command="item.repositoryName">
              {{item.repositoryName}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <el-button-group>
        <el-button 
          :type="item.mode === mode ? 'primary' : 'default'" 
          v-for="item in modes" 
          :key="item.mode"
          @click="mode = item.mode">
          {{item.label}}
        </el-button>
      </el-button-group>
      <div class="repos-btns-box">
        <!-- <el-button class="add-new-module-btn" type="danger" @click="showNewModuleDialog = true">新增模块</el-button> -->
        <repository-push-btn
          :repositoryName="selectedReposName"
          :repositoryChanges.sync="selectedReposChanges"></repository-push-btn>
      </div>
      <!-- <el-button type="primary" v-if="showGithubOAuthBtn">
        <a :href="githubOAuthUrl">GitHub oAuth</a>
      </el-button> -->
    </div>
    <div class="i-m-main-content" v-if="selectedRepository != null && allModuleData != null">
        <file-edit-view
          v-show="targetComponentId === modes[0].id"
          :repository="selectedRepository"
          :fetchJSONFileContent="fetchJSONFileContent"
          @update-repository-changes="updateRepositoryChanges"
          @update-cache-JSONString="updateCacheJSONString"></file-edit-view>
        <namespace-edit-view
          v-show="targetComponentId === modes[1].id"
          :repository="selectedRepository"
          :allModuleData="allModuleData"
          :selectedModuleName.sync="selectedModuleName"
          @add-new-module="showNewModuleDialog = true"
          @update-repository-changes="updateRepositoryChanges"
          @update-cache-JSONString="updateCacheJSONString"></namespace-edit-view> 
    </div>
    <el-dialog class="i-m-nem-add-dialog" title="新增模块" width="480px" center :visible.sync="showNewModuleDialog">
      <el-input placeholder="输入模块名称" v-model="newModule" @input="validateNewModule"></el-input>
      <p class="add-key-error">{{newModuleValidtedError}}</p>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="showNewModuleDialog = false">取 消</el-button>
        <el-button type="primary" size="small" :disabled="newModuleValidtedError != ''" @click="addNewModule">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import objectPath from 'object-path'
import { I18n_NOT_PUSH_MODULES } from '../enum.js'
import FileEditView from './file-edit.vue'
import NamespaceEditView from './namespace-edit-2.vue'
import RepositoryPushBtn from '../components/repository-push.vue'
const cacheJSONString = {}
export default {
  name: 'i18n-manament-home',
	components: { FileEditView, NamespaceEditView, RepositoryPushBtn },
  data() {
    return {
      mode: 'namespace-edit',
      modes: [
        { id: 'FileEditView', mode: 'file-edit', label: '文件编辑模式', icon: 'el-icon-files' }, 
        { id: 'NamespaceEditView', mode: 'namespace-edit', label: 'Key编辑模式', icon: 'el-icon-edit-outline' }
      ],
      trackedRepositories: [],
      selectedRepository: null, 
      selectedReposName: '',
      selectedModuleName: '',
      allModuleData: null,
      selectedReposChanges: [],
      showUpdatePopover: false,
      showEmptyCommitError: false,
      commitMsg: '',
      isPushing: false,
      showGithubOAuthBtn: false,
      githubUser: null,
      showNewModuleDialog: false,
      newModule: '',
      newModuleValidtedError: '',
      timer: null,
    }
  },
  computed: {
    targetComponentId() {
      const leng = this.modes.length
      for (let i = 0; i < leng; i++) {
        if (this.mode === this.modes[i].mode) {
          return this.modes[i].id
        }
      }
      return ''
    },
    githubOAuthUrl() {
      return `https://github.com/login/oauth/authorize?client_id=874c97335a3e4df726af&redirect_uri=${encodeURIComponent(window.location.href)}`
    },
    reposModulesMap() {
      const map = {}
      if (this.selectedRepository != null) {
        this.selectedRepository.directoryTree.forEach(item => {
          map[item.name] = item
        })
      }
      return map
    },
    reposI18nBranchUrl() {
      if (this.selectedRepository != null) {
        const { repositoryUrl, repositoryI18nBranch } = this.selectedRepository
        return `${repositoryUrl}/tree/${repositoryI18nBranch}`
      }
      return this.selectedRepository != null ? this.selectedRepository.repositoryUrl : ''
    },
  },
  methods: {
    async fetchTrackedRepositories() {
      const res = await window.FreelogApp.QI.fetch('//i18n.testfreelog.com/v1/i18n/trackedRepositories/list').then(res => res.json())
      if(res.errcode === 0 && res.data.length) {
        this.resolveTrackedRepositories(res.data)
        await this.fetchAllModuleData()
      }
    },
    resolveTrackedRepositories(data) {
      this.trackedRepositories = data
      this.selectedRepository = this.trackedRepositories[0]
      this.selectedReposName = this.selectedRepository.repositoryName
      this.selectedReposChanges = this.selectedRepository.repositoryChanges
    },
    async fetchAllModuleData() {
      return window.FreelogApp.QI.fetch(`//i18n.testfreelog.com/v1/i18n/trackedRepository/data?pathType=0&repositoryName=${this.selectedReposName}`)
        .then(res => res.json())
        .then(res => {
          if (res.errcode === 0) {
            this.allModuleData = res.data
          } else {
            throw new Error(res.msg)
          }
        })
        .catch(e => this.$error.showErrorMessage(e))
    },
    async fetchJSONFileContent(path, keys) {
      if (cacheJSONString[path]) {
        return cacheJSONString[path]
      } else {
        const res = await window.FreelogApp.QI.fetch(`//i18n.testfreelog.com/v1/i18n/trackedRepository/data?targetPath=${encodeURIComponent(path)}&pathType=1&repositoryName=${this.selectedReposName}`).then(res => res.json())
        if(res.errcode === 0) {
          const targetData = objectPath.get(res.data, keys)
          cacheJSONString[path] = targetData
          return targetData
        } else {
          return null
        }
      }
    },
    selectRepository(reposName) {
      this.selectedReposName = reposName
      for (const repository of this.trackedRepositories) {
        if (repository.repositoryName === reposName) {
          this.selectedRepository = repository
        }
      }
    },
    updateRepositoryChanges(changes) {
      this.selectedReposChanges = changes
    },
    updateCacheJSONString(data) {
      const { path, value } = data
      cacheJSONString[path] = value
    },
    validateNewModule(key) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        let error = ''
        key = key.replace(/^(\s*)|(\s*)$/g, '')
        if (key === '') {
          this.newModuleValidtedError = '模块名称不能为空'
          return 
        }
        const isValid = /^[-\w]+$/.test(key)
        if (!isValid) {
          this.newModuleValidtedError = '模块名称有误；由大小字母和字符（-）组合而成'
          return 
        }
        if (this.reposModulesMap[key] != null){
          this.newModuleValidtedError = '模块名称冲突： 输入的模块名称已存在！'
          return 
        } 
        this.newModuleValidtedError = ''
      }, 50)
    },
    async addNewModule() {
      const moduleName = this.newModule.replace(/^(\s*)|(\s*)$/g, '')
      if (moduleName !== '') {
        const repositoryName = this.selectedReposName
        const res = await window.FreelogApp.QI.fetch('//i18n.testfreelog.com/v1/i18n/trackedRepository/newModule', {
          method: 'POST',
          body: { 
            moduleName, repositoryName,
            languages: [ 'zh-CN', 'en' ] 
          }
        }).then(res => res.json())
        if (res.errcode === 0) {
          this.showNewModuleDialog = false
          this.resolveTrackedRepositories(res.data)
          this.saveNewModuleRecord(moduleName, repositoryName)
          await this.fetchAllModuleData()
          this.selectedModuleName = moduleName
        }
      }
    },
    saveNewModuleRecord(moduleName, repositoryName) {
      let notPushModules = localStorage.getItem(I18n_NOT_PUSH_MODULES) || '[]'
      notPushModules = JSON.parse(notPushModules)
      notPushModules.push({
        moduleName, repositoryName
      })
      localStorage.setItem(I18n_NOT_PUSH_MODULES, JSON.stringify(notPushModules))
    },
  },
  async mounted() {
    this.fetchTrackedRepositories()
  },
}
</script>

<style lang="less" scoped>
.i18n-management-container {
  min-width: 1080px;
  .imc-header {
    display: flex; align-items: center; 
    position: absolute; left: 0; right: 0; z-index: 100;
    min-width: 1040px; padding: 15px 20px; border-bottom: 1px solid #e6e6e6; 
    background-color: #fff; box-shadow: 0 2px 4px 0 #d3d3d3;

    h2 { 
      position: relative;
      margin-right: 40px; color: #606060; 
      &::after { 
        content: '';
        position: absolute; right: -20px; top: 4px; 
        width: 2px; height: 24px;
        background-color: #e8e8e8;
      }
    }
    .repos-select-box { 
      margin-right: 25px; 
      font-size: 18px; font-weight: 500; color: #606060; 
      .el-dropdown {
        font-size: 16px;
        .el-dropdown-link {
          a { text-decoration: underline; color: #606266; }
        }
      }
    }
    .repos-btns-box { 
      flex: 1; text-align: right; 
      .add-new-module-btn {
        margin-right: 14px;
      }
    }
  }
  .i-m-main-content { 
    position: relative;
    box-sizing: border-box; min-height: 100vh;
    padding-top: 81px; 
  }
}

</style>

<style lang="less">
.imc-repos-changes-box {
  overflow: auto;
  max-height: 150px; margin-bottom: 15px;
  h4 { line-height: 20px; font-weight: 500; }
  .imc-repos-change-item { 
    line-height: 20px; color: #555;
    span {
      &.modified { color: #E6A23C; }
      &.deleted { color: #F56C6C; }
      &.added { color: #67C23A; }
    }
  }
}
.imc-github-user {
  margin-bottom: 10px;
  a { text-decoration: underline; }
}
.imc-repos-commit-box { 
  margin-bottom: 15px;
  p { margin-bottom: 10px; }
}
</style>
