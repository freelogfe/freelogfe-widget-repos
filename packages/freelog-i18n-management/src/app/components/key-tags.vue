<template>
  <div class="i-nem-edit-key-tags">
    <el-tag :key="tag" v-for="tag in keyTags" closable :disable-transitions="false" @close="handleClose(tag)">
        {{tag}}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"></el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新增标签</el-button>
  </div>
</template>

<script>
import objectPath from 'object-path'

var lastBreadcrumbs = []
export default {
  name: 'key-tags',
  components: {  },
  props: {
    repositoryName: String,
    selectedKeyItem: Object,
    allKeysInfo: Object,
  },
  data() {
    return {
      keyInfo: null,
      keyTags: [],
      inputValue: '',
      inputVisible: false
    }
  },
  computed: {
    moduleName() {
      return this.selectedKeyItem != null ? this.selectedKeyItem.moduleName : ''
    },
    keyName() {
      return this.selectedKeyItem != null ? this.selectedKeyItem.key : ''
    },
  },
  watch: {
    selectedKeyItem() {
      this.getKeyInfo()
    },
    keyInfo() {
      if (this.keyInfo != null) {
        this.keyTags = this.keyInfo.tags
      } else {
        this.keyTags = []
      }
    }
  },
  methods: {
    getKeyInfo() {
      if (this.selectedKeyItem != null && this.allKeysInfo != null) {
        this.keyInfo = objectPath.get(this.allKeysInfo, [ this.moduleName, this.keyName ])
      }
    },
    async handleClose(tag) {
      const index = this.keyTags.indexOf(tag)
      const tags = this.keyTags.slice()
      tags.splice(index, 1)
      const result = await this.updateKeyInfo(tags)
      if (result.errcode === 0) {
        this.keyTags.splice(index, 1)
        this.$message.success('删除tag（${tag}）成功！')
      } else {
        this.$message.error(`删除tag（${tag}）失败: ${result.msg}`)
      }
      
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async handleInputConfirm() {
      let tag = this.inputValue
      if (tag) {
        if (this.keyTags.indexOf(tag) !== -1) {
          this.$message.error(`tag（${tag}）已存在！`)
          return
        }
        const tags = this.keyTags.slice()
        tags.push(tag)
        const result = await this.updateKeyInfo(tags)
        if (result.errcode === 0) {
          this.keyTags.push(tag)
          this.$message.success('新增tag（${tag}）成功！')
        } else {
          this.$message.error(`新增tag（${tag}）失败: ${result.msg}`)
        }
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    async updateKeyInfo(keyTags) {
      const result = await window.FreelogApp.QI.fetch('//i18n.testfreelog.com/v1/i18n/trackedRepository/keyInfo', {
        method: 'PUT',
        body: {
          repositoryName: this.repositoryName,
          moduleName: this.moduleName,
          key: this.keyName,
          keyInfo: {
            tags: keyTags
          }
        }
      }).then(res => res.json()).catch(e => e)
      if (result instanceof Error) {
        return null
      } else {
        return result
        
      }
    },
  },
  async mounted() {
    this.getKeyInfo()
  },
}
</script>

<style lang="less" scoped>
.i-nem-edit-key-tags {
  margin: 20px 0; 
  span { line-height: 32px; }
  .el-tag + .el-tag { margin-left: 10px; }
  .button-new-tag {
    height: 32px; margin-left: 10px; padding-top: 0; padding-bottom: 0;
    line-height: 30px;
  }
  .input-new-tag {
    width: 90px; margin-left: 10px;
    vertical-align: bottom;
  }
  
}
</style>

<style lang="less">

</style>
