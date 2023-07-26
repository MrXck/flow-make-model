<template>
  <div id="app" style="height: 100vh;width: 100vw">
    <div id="container" style="height: 100vh;width: 100vw"></div>
    <router-view/>
    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.upload"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <a-upload
          name="file"
          :before-upload="beforeUpload"
          :showUploadList="false"
      >
        <p>请将所有需要数据移至第一个Sheet再上传</p>
        <p>同时将标题放在第一个Sheet的第一行</p>
        <a-button>
          <a-icon type="upload"/>
          上传
        </a-button>
      </a-upload>
      <a-row v-if="draw.upload && nowOption.id in xlsxData">
        <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="xlsxData[nowOption.id].DropdownVisible">
          <a-menu slot="overlay">
            <a-menu-item v-for="(column, columnIndex) in xlsxData[nowOption.id].columns" :key="columnIndex">
              <a-checkbox :checked="column.show"
                          @change="(e)=>{xlsxData[nowOption.id].columnsCheck(e.target.checked,xlsxData[nowOption.id].columns,columnIndex)}">
                {{ column.title }}
              </a-checkbox>
            </a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> 筛选列
            <a-icon type="down"/>
          </a-button>
        </a-dropdown>
        <a-table
            style="margin-top: 10px"
            :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
            :data-source="xlsxData[nowOption.id].data"
            :pagination="xlsxData[nowOption.id].pagination"
            bordered
            @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
        </a-table>
      </a-row>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.dataFilter"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>数据筛选配置</p>
      <div v-if="draw.dataFilter && nowOption.id in xlsxData">
        <div v-if="nowOption.filterRules.length !== 0">
          <a-button @click="saveFilterRules">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="nowOption.preview = true">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <div class="filter-item" v-for="(rowItem, rowIndex) in nowOption.filterRules">
            <a-select :default-value="rowItem.column !== '' ? rowItem.column : '请选择字段'" style="width: 300px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleFilterRuleChange(rowIndex, 'column', item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-select :default-value="rowItem.filterRule !== '' ? filterConfig.filterItem.find(obj => obj.value === rowItem.filterRule).desc : '请选择筛选规则'"
                      style="width: 300px;margin: 0 10px">
              <a-select-option v-for="(item, index) in filterConfig.filterItem" :key="index" :value="index"
                               @click="handleFilterRuleChange(rowIndex, 'filterRule', item.value)">
                {{ item.desc }}
              </a-select-option>
            </a-select>

            <a-input style="width: 300px" v-model="nowOption.filterRules[rowIndex].start" @input="notPreview"/>

            <a-button style="margin-left: 10px" @click="addFilterRule" v-if="rowIndex === 0">添加配置</a-button>
            <a-button style="margin-left: 10px" @click="removeFilterRule(rowIndex)" v-if="rowIndex !== 0">删除配置
            </a-button>
          </div>
        </div>
        <div v-if="nowOption.filterRules.length === 0">
          <a-button @click="addFilterRule">添加配置</a-button>
        </div>

        <a-row v-if="draw.dataFilter && nowOption.id in xlsxData">
          <p>筛选前</p>
          <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="xlsxData[nowOption.id].DropdownVisible">
            <a-menu slot="overlay">
              <a-menu-item v-for="(column, columnIndex) in xlsxData[nowOption.id].columns" :key="columnIndex">
                <a-checkbox :checked="column.show"
                            @change="(e)=>{xlsxData[nowOption.id].columnsCheck(e.target.checked,xlsxData[nowOption.id].columns,columnIndex)}">
                  {{ column.title }}
                </a-checkbox>
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 筛选列
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
          <a-table
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="xlsxData[nowOption.id].data"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>

        <a-row v-if="draw.dataFilter && nowOption.id in xlsxData && nowOption.preview">
          <p>筛选后</p>
          <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="xlsxData[nowOption.id].DropdownVisible">
            <a-menu slot="overlay">
              <a-menu-item v-for="(column, columnIndex) in xlsxData[nowOption.id].columns" :key="columnIndex">
                <a-checkbox :checked="column.show"
                            @change="(e)=>{xlsxData[nowOption.id].columnsCheck(e.target.checked,xlsxData[nowOption.id].columns,columnIndex)}">
                  {{ column.title }}
                </a-checkbox>
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 筛选列
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
          <a-table
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="filterData(nowOption.filterRules, xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.deduplicate"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>数据去重配置</p>
      <div v-if="draw.deduplicate && nowOption.id in xlsxData">
        <div v-if="nowOption.deduplicateRules.length !== 0">
          <a-button @click="saveDeduplicateRules">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="nowOption.preview = true">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <div class="filter-item" v-for="(rowItem, rowIndex) in nowOption.deduplicateRules">
            <a-select :default-value="rowItem !== '' ? rowItem : '请选择去重字段'" style="width: 300px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleDeduplicateRuleChange(rowIndex, item)">
                {{ item }}
              </a-select-option>
            </a-select>

            <a-button style="margin-left: 10px" @click="addDeduplicateRule" v-if="rowIndex === 0">添加配置</a-button>
            <a-button style="margin-left: 10px" @click="removeDeduplicateRule(rowIndex)" v-if="rowIndex !== 0">删除配置
            </a-button>
          </div>
        </div>
        <div v-if="nowOption.deduplicateRules.length === 0">
          <a-button @click="addDeduplicateRule">添加配置</a-button>
        </div>

        <a-row v-if="draw.deduplicate && nowOption.id in xlsxData">
          <p>筛选前</p>
          <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="xlsxData[nowOption.id].DropdownVisible">
            <a-menu slot="overlay">
              <a-menu-item v-for="(column, columnIndex) in xlsxData[nowOption.id].columns" :key="columnIndex">
                <a-checkbox :checked="column.show"
                            @change="(e)=>{xlsxData[nowOption.id].columnsCheck(e.target.checked,xlsxData[nowOption.id].columns,columnIndex)}">
                  {{ column.title }}
                </a-checkbox>
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 筛选列
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
          <a-table
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="xlsxData[nowOption.id].data"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>

        <a-row v-if="draw.deduplicate && nowOption.id in xlsxData && nowOption.preview">
          <p>筛选后</p>
          <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="xlsxData[nowOption.id].DropdownVisible">
            <a-menu slot="overlay">
              <a-menu-item v-for="(column, columnIndex) in xlsxData[nowOption.id].columns" :key="columnIndex">
                <a-checkbox :checked="column.show"
                            @change="(e)=>{xlsxData[nowOption.id].columnsCheck(e.target.checked,xlsxData[nowOption.id].columns,columnIndex)}">
                  {{ column.title }}
                </a-checkbox>
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 筛选列
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
          <a-table
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="deduplicateData(nowOption.deduplicateRules, xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.related"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>数据关联配置</p>
      <div v-if="draw.related">
        <div v-if="nowOption.relatedRules.length !== 0">
          <a-button @click="saveRelatedRules">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="previewRelated">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <a-select
                    :default-value="nowOption.saveTableId !== '' ? nowOption.tableNames[nowOption.tableIds.indexOf(nowOption.saveTableId)] : '请选择保留数据的表'"
                    style="width: 300px;margin-left: 10px">
            <a-select-option v-for="(item, index) in nowOption.tableNames"
                             :key="index" :value="index"
                             @click="handleSaveTableChange(index)">
              {{ item }}
            </a-select-option>
          </a-select>
          <div class="filter-item">
            <span v-for="item in nowOption.tableNames" style="display: inline-block;width: 300px">{{ item }}</span>
            <span style="display: inline-block;width: 300px"></span>
          </div>
          <div class="filter-item" v-for="(rowItem, rowIndex) in nowOption.relatedRules">
            <a-select v-for="(selectItem, selectIndex) in nowOption.tableIds" :key="selectIndex"
                      :default-value="rowItem !== '' ? rowItem[selectItem] : '请选择关联字段'"
                      style="width: 300px;margin-left: 10px">
              <a-select-option v-for="(item, index) in xlsxData[selectItem].columnList"
                               :key="index" :value="item"
                               @click="handleRelatedChange(rowIndex, selectItem, item)">
                {{ item }}
              </a-select-option>
            </a-select>

            <a-select :default-value="rowItem.relatedRule !== '' ? relatedConfig.relatedItem.find(obj => obj.value === rowItem.relatedRule).desc : '请选择关联规则'"
                      style="width: 300px;margin-left: 10px">
              <a-select-option v-for="(item, index) in relatedConfig.relatedItem" :key="index" :value="index"
                               @click="handleRelatedChange(rowIndex, 'relatedRule', item.value)">
                {{ item.desc }}
              </a-select-option>
            </a-select>

            <a-button style="margin-left: 10px" @click="addRelatedRule" v-if="rowIndex === 0">添加配置</a-button>
            <a-button style="margin-left: 10px" @click="removeRelatedRule(rowIndex)" v-if="rowIndex !== 0">删除配置
            </a-button>
          </div>
        </div>
        <div v-if="nowOption.relatedRules.length === 0">
          <a-button @click="addRelatedRule">添加配置</a-button>
        </div>

        <a-row v-if="draw.related && nowOption.preview">
          <p>关联后</p>
          <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="xlsxData[nowOption.id].DropdownVisible">
            <a-menu slot="overlay">
              <a-menu-item v-for="(column, columnIndex) in xlsxData[nowOption.id].columns" :key="columnIndex">
                <a-checkbox :checked="column.show"
                            @change="(e)=>{xlsxData[nowOption.id].columnsCheck(e.target.checked,xlsxData[nowOption.id].columns,columnIndex)}">
                  {{ column.title }}
                </a-checkbox>
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 筛选列
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
          <a-table
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="relatedData(nowOption.relatedRules, xlsxData[nowOption.id].data, nowOption.saveTableId)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core'
import "@logicflow/core/dist/style/index.css"
import {Control, DndPanel, Menu, SelectionSelect} from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'
import {read, utils} from "xlsx";

export default {
  name: "App",
  data() {
    return {
      visible: false,
      config: {
        title: ''
      },
      draw: {
        upload: false,
        dataFilter: false,
        deduplicate: false,
        related: false,
      },
      nowOption: {
        id: 0,
        preview: false
      },
      lf: null,
      xlsxData: {},
      filterConfig: {
        filterItem: [
          {
            desc: '等于',
            value: ' == '
          },
          {
            desc: '不等于',
            value: ' != '
          },
          {
            desc: '包含',
            value: '.includes'
          },
          {
            desc: '大于',
            value: ' > '
          },
          {
            desc: '小于',
            value: ' < '
          },
          {
            desc: '大于等于',
            value: ' >= '
          },
          {
            desc: '小于等于',
            value: ' <= '
          },
          {
            desc: '正则表达式',
            value: '.match'
          },
        ]
      },
      relatedConfig: {
        relatedItem: [
          {
            desc: '等于',
            value: ' == '
          },
          {
            desc: '不等于',
            value: ' != '
          }
        ]
      }
    }
  },
  methods: {
    onClose() {
      let keys = Object.keys(this.draw)
      for (let i = 0; i < keys.length; i++) {
        this.draw[keys[i]] = false
      }
    },
    async beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'text/csv'
      if (!isExcel) {
        this.$message.error('只能上传 xlsx xls csv格式')
        return new Promise((resolve, reject) => reject())
      }
      const data = await this.readFile(file)
      const workbook = read(data, {type: 'binary', cellDates: true})
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const result = utils.sheet_to_json(worksheet)
      const keys = Object.keys(result[0])
      const columns = []
      const columnList = []
      for (let i = 0; i < keys.length; i++) {
        columns.push({title: keys[i], dataIndex: keys[i], key: keys[i], show: true})
        columnList.push(keys[i])
      }
      this.$set(this.xlsxData, this.nowOption.id,
          {
            show: true,
            data: result,
            columns: columns,
            columnList: columnList,
            DropdownVisible: false,
            columnsCheck: (checked, data, index) => {
              data[index].show = checked
            },
            pagination: {
              size: 'large',
              current: 1,
              pageSize: 10,
              pageSizeOptions: ['10', '20', '30'],
              showTotal: (total, range) => {
                return '共' + total + '条'
              },
              hideOnSinglePage: false,
              showQuickJumper: true,
              showSizeChanger: true
            },
          }
      )
      return new Promise((resolve, reject) => reject())
    },
    readFile(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = (ev) => {
          resolve(ev.target.result)
        }
      })
    },
    handleFilterRuleChange(rowIndex, property, value) {
      this.nowOption.filterRules[rowIndex][property] = value
      this.notPreview()
    },
    addFilterRule() {
      this.nowOption.filterRules.push({
        start: '',
        filterRule: '',
        column: '',
        type: 'and'
      })
    },
    removeFilterRule(index) {
      this.nowOption.filterRules.splice(index, 1)
    },
    saveFilterRules() {
      const properties = this.lf.getProperties(this.nowOption.id)
      properties.filterRules = this.nowOption.filterRules
      this.lf.setProperties(this.nowOption.id, properties)
      this.saveXlsxData(this.nowOption.id, this.filterData(this.nowOption.filterRules, this.xlsxData[this.nowOption.id].data))
    },
    filterData(filterRules, dataList) {
      let list = [...dataList]
      let evalString = ''
      for (let i = 0; i < filterRules.length; i++) {
        const rule = filterRules[i]
        if (rule.filterRule.startsWith('.')) {
          if (i === 0) {
            if (rule.filterRule === '.match') {
              evalString += `/${rule.start}/.test(data['${rule.column}'].toString())`
            } else {
              evalString += `data['${rule.column}'].toString()${rule.filterRule}('${rule.start}')`
            }
          } else {
            if (rule.type === 'and') {
              evalString += ` && `
            } else {
              evalString += ` || `
            }
            if (rule.filterRule === '.match') {
              evalString += `/${rule.start}/.test(data['${rule.column}'].toString())`
            } else {
              evalString += `data['${rule.column}'].toString()${rule.filterRule}('${rule.start}')`
            }
          }
        } else {
          if (i === 0) {
            evalString += `data['${rule.column}']${rule.filterRule}'${rule.start}'`
          } else {
            if (rule.type === 'and') {
              evalString += ` && data['${rule.column}']${rule.filterRule}'${rule.start}'`
            } else {
              evalString += ` || data['${rule.column}']${rule.filterRule}'${rule.start}'`
            }
          }
        }

      }
      list = list.filter((data, index, arr) => {
        return eval(evalString)
      })
      return list
    },
    handleDeduplicateRuleChange(index, item) {
      this.nowOption.deduplicateRules[index] = item
      this.notPreview()
    },
    addDeduplicateRule() {
      this.nowOption.deduplicateRules.push('')
    },
    removeDeduplicateRule(index) {
      this.nowOption.deduplicateRules.splice(index, 1)
    },
    saveDeduplicateRules() {
      const properties = this.lf.getProperties(this.nowOption.id)
      properties.deduplicateRules = this.nowOption.deduplicateRules
      this.lf.setProperties(this.nowOption.id, properties)
      this.saveXlsxData(this.nowOption.id, this.deduplicateData(this.nowOption.deduplicateRules, this.xlsxData[this.nowOption.id].data))
    },
    deduplicateData(deduplicateRules, dataList) {
      let list = [...dataList]
      let evalString = ''
      for (let i = 0; i < deduplicateRules.length; i++) {
        if (i !== 0) {
          evalString += ` + data['${deduplicateRules[i]}']`
        } else {
          evalString += `data['${deduplicateRules[i]}']`
        }
      }
      let temp = []
      list = list.filter((data, index, arr) => {
        let result = eval(evalString)
        if (temp.indexOf(result) === -1) {
          temp.push(result)
          return true
        } else {
          return false
        }
      })
      return list
    },
    addRelatedRule() {
      let obj = {}
      for (let i = 0; i < this.nowOption.tableIds.length; i++) {
        obj[this.nowOption.tableIds[i]] = ''
      }
      obj.relatedRule = ''
      this.nowOption.relatedRules.push(obj)
    },
    saveRelatedRules() {
      if (this.nowOption.saveTableId === '') {
        this.$message.error('请选择最终保留的表')
        return
      }
      const properties = this.lf.getProperties(this.nowOption.id)
      properties.relatedRules = this.nowOption.relatedRules
      properties.saveTableId = this.nowOption.saveTableId
      properties.tableIds = this.nowOption.tableIds
      this.lf.setProperties(this.nowOption.id, properties)
      this.saveXlsxData(this.nowOption.id, this.relatedData(this.nowOption.relatedRules, this.xlsxData[this.nowOption.id].data, this.nowOption.saveTableId))
    },
    handleRelatedChange(rowIndex, type, item) {
      this.nowOption.relatedRules[rowIndex][type] = item
    },
    removeRelatedRule(index) {
      this.nowOption.relatedRules.splice(index, 1)
    },
    relatedData(relatedRule, dataList, saveTableId) {
      if (saveTableId === '') {
        this.$message.error('请选择最终保留的表')
        throw new Error('请选择最终保留的表.')
      }

      let list = [...dataList]

      if (relatedRule.length <= 0) {
        this.$message.error('请配置关联项')
        throw new Error('请配置关联项.')
      }

      let ids = Object.keys(relatedRule[0]).filter((data, index, arr) => {
        return data !== saveTableId && data !== 'relatedRule'
      })

      for (let i = 0; i < relatedRule.length; i++) {
        let evalString = 'saveTableData'
        for (let j = 0; j < ids.length; j++) {
          evalString += ` && this.xlsxData['${ids[j]}'].data.find(obj => obj['${relatedRule[i][ids[j]]}'] == saveTableData) !== undefined`
        }

        list = list.filter((data, index, arr) => {
          let saveTableData = data[relatedRule[i][saveTableId]]
          return eval(evalString)
        })
      }

      return list
    },
    handleSaveTableChange(index) {
      this.notPreview()
      let id = this.nowOption.tableIds[index]
      this.$set(this.nowOption, 'saveTableId', id)
      this.$set(this.xlsxData, this.nowOption.id, Object.assign({}, this.xlsxData[id]))
    },
    previewRelated() {
      if (this.nowOption.saveTableId === '') {
        this.$message.error('请选择最终保留的表')
        return
      }
      this.nowOption.preview = true
    },
    saveXlsxData(nodeId, dataList) {
      this.$set(this.xlsxData[nodeId], 'data', dataList)
    },
    notPreview() {
      this.nowOption.preview = false
    },
    executeFlow(lf, nodeId, xlsxData) {
      let nodeData = lf.getNodeDataById(nodeId)
      if (nodeData.properties.type !== 'upload' && lf.getNodeIncomingNode(nodeId).length === 0) {
        this.$message.error('请正确配置流程')
        throw new Error('请正确配置流程.')
      }

      this.executeBefore(lf, nodeId, xlsxData)
      let inComing = lf.getNodeIncomingNode(nodeId)
      for (let i = 0; i < inComing.length; i++) {
        console.log(inComing[i].id in xlsxData, inComing[i], xlsxData)
      }
    },
    executeBefore(lf, nodeId, xlsxData) {
      if (nodeId in xlsxData) {
        return
      }

      let inComingNodes = lf.getNodeIncomingNode(nodeId)
      if (inComingNodes.length === 0 && lf.getNodeDataById(nodeId).properties.type !== 'upload') {
        this.$message.error('请正确配置流程')
        throw new Error('请正确配置流程.')
      }
      if (inComingNodes.length === 0) {
        return
      }

      for (let i = 0; i < inComingNodes.length; i++) {
        if (!(inComingNodes[i].id in xlsxData)) {
          this.executeBefore(lf, inComingNodes[i].id, xlsxData)
        }
      }

      const properties = lf.getNodeDataById(nodeId).properties
      if (inComingNodes.length === 1) {
        let resultData = []
        if (properties.type === 'dataFilter') {
          resultData = this.filterData(properties.filterRules, xlsxData[inComingNodes[0].id].data)
        } else if (properties.type === 'deduplicate') {
          resultData = this.deduplicateData(properties.deduplicateRules, xlsxData[inComingNodes[0].id].data)
        }

        const data = Object.assign({}, this.xlsxData[inComingNodes[0].id])
        data.data = resultData
        this.$set(this.xlsxData, nodeId, data)
      } else if (inComingNodes.length > 1) {
        let resultData = []
        if (properties.type === 'related') {
          const data = Object.assign({}, this.xlsxData[properties.saveTableId])
          resultData = this.relatedData(properties.relatedRules, data.data, properties.saveTableId)
          data.data = resultData
          this.$set(this.xlsxData, nodeId, data)
          console.log('关联数据', nodeId, inComingNodes.map(data => data.id))
          console.log(this.xlsxData[nodeId])
        }
      }
    },
  },
  mounted() {
    const lf = new LogicFlow({
      container: document.querySelector("#container"),
      grid: {
        size: 20,
        visible: true,
        type: 'mesh',
        config: {
          color: '#ababab',
          thickness: 1,
        },
      },
      keyboard: {
        enabled: true
      },
      plugins: [Menu, DndPanel, SelectionSelect, Control]
    })
    lf.extension.menu.addMenuConfig({
      nodeMenu: [
        {
          text: "分享",
          callback() {
            alert("分享成功！");
          },
        },
        {
          text: "属性",
          callback(node) {
            alert(`
          节点id：${node.id}
          节点类型：${node.type}
          节点坐标：(x: ${node.x}, y: ${node.y})`);
          },
        },
      ],
      edgeMenu: [
        {
          text: "属性",
          callback(edge) {
            alert(`
          边id：${edge.id}
          边类型：${edge.type}
          边坐标：(x: ${edge.x}, y: ${edge.y})
          源节点id：${edge.sourceNodeId}
          目标节点id：${edge.targetNodeId}`);
          },
        },
      ],
      graphMenu: [
        {
          text: "分享",
          callback() {
            alert("分享成功！");
          },
        },
      ],
    });

    lf.extension.control.addItem({
      iconClass: 'custom-minimap',
      title: '执行',
      text: '执行',
      onClick: (lf, ev) => {
        const uploadNodeIds = []
        const endNodeIds = lf.getGraphData().nodes.filter((data, index, arr) => {
          if (data.properties.type !== 'upload') {
            delete this.xlsxData[data.id]
          } else {
            uploadNodeIds.push(data.id)
          }
          return lf.getNodeOutgoingNode(data.id).length === 0 && lf.getNodeIncomingNode(data.id) !== 0
        }).map(data => {
          return data.id
        })

        for (let i = 0; i < uploadNodeIds.length; i++) {
          if (!(uploadNodeIds[i] in this.xlsxData)) {
            this.$message.error('请在每个开始节点都上传了数据后再执行流程')
            return
          }
        }

        if (endNodeIds.length > 1) {
          this.$message.error('最多只能同时存在一个最终节点')
          return
        } else if (endNodeIds.length < 1) {
          this.$message.error('最少要有一个最终节点')
        }
        for (let i = 0; i < endNodeIds.length; i++) {
          this.executeFlow(lf, endNodeIds[i], this.xlsxData)
        }
      }
    })

    lf.extension.dndPanel.setPatternItems([
      {
        label: '选区',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAOVJREFUOBGtVMENwzAIjKP++2026ETdpv10iy7WFbqFyyW6GBywLCv5gI+Dw2Bluj1znuSjhb99Gkn6QILDY2imo60p8nsnc9bEo3+QJ+AKHfMdZHnl78wyTnyHZD53Zzx73MRSgYvnqgCUHj6gwdck7Zsp1VOrz0Uz8NbKunzAW+Gu4fYW28bUYutYlzSa7B84Fh7d1kjLwhcSdYAYrdkMQVpsBr5XgDGuXwQfQr0y9zwLda+DUYXLaGKdd2ZTtvbolaO87pdo24hP7ov16N0zArH1ur3iwJpXxm+v7oAJNR4JEP8DoAuSFEkYH7cAAAAASUVORK5CYII=',
        callback: () => {
          lf.extension.selectionSelect.openSelectionSelect();
          lf.once('selection:selected', () => {
            lf.extension.selectionSelect.closeSelectionSelect();
          });
        }
      },
      {
        type: 'circle',
        text: '开始',
        label: '开始节点',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAnBJREFUOBGdVL1rU1EcPfdGBddmaZLiEhdx1MHZQXApraCzQ7GKLgoRBxMfcRELuihWKcXFRcEWF8HBf0DdDCKYRZpnl7p0svLe9Zzbd29eQhTbC8nv+9zf130AT63jvooOGS8Vf9Nt5zxba7sXQwODfkWpkbjTQfCGUd9gIp3uuPP8bZ946g56dYQvnBg+b1HB8VIQmMFrazKcKSvFW2dQTxJnJdQ77urmXWOMBCmXM2Rke4S7UAW+/8ywwFoewmBps2tu7mbTdp8VMOkIRAkKfrVawalJTtIliclFbaOBqa0M2xImHeVIfd/nKAfVq/LGnPss5Kh00VEdSzfwnBXPUpmykNss4lUI9C1ga+8PNrBD5YeqRY2Zz8PhjooIbfJXjowvQJBqkmEkVnktWhwu2SM7SMx7Cj0N9IC0oQXRo8xwAGzQms+xrB/nNSUWVveI48ayrFGyC2+E2C+aWrZHXvOuz+CiV6iycWe1Rd1Q6+QUG07nb5SbPrL4426d+9E1axKjY3AoRrlEeSQo2Eu0T6BWAAr6COhTcWjRaYfKG5csnvytvUr/WY4rrPMB53Uo7jZRjXaG6/CFfNMaXEu75nG47X+oepU7PKJvvzGDY1YLSKHJrK7vFUwXKkaxwhCW3u+sDFMVrIju54RYYbFKpALZAo7sB6wcKyyrd+aBMryMT2gPyD6GsQoRFkGHr14TthZni9ck0z+Pnmee460mHXbRAypKNy3nuMdrWgVKj8YVV8E7PSzp1BZ9SJnJAsXdryw/h5ctboUVi4AFiCd+lQaYMw5z3LGTBKjLQOeUF35k89f58Vv/tGh+l+PE/wG0rgfIUbZK5AAAAABJRU5ErkJggg==',
        properties: {
          type: 'upload',
        }
      },
      {
        type: 'rect',
        text: '数据过滤',
        label: '数据过滤',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
        className: 'important-node',
        properties: {
          type: 'dataFilter',
        }
      },
      {
        type: 'rect',
        label: '关联',
        text: '关联',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
        className: 'import_icon',
        properties: {
          type: 'related',
        }
      },
      {
        type: 'rect',
        text: '去重',
        label: '去重',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
        className: 'important-node',
        properties: {
          type: 'deduplicate',
        }
      },
      {
        type: 'circle',
        text: '结束',
        label: '结束节点',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAA1BJREFUOBFtVE1IVUEYPXOf+tq40Y3vPcmFIdSjIorWoRG0ERWUgnb5FwVhYQSl72oUoZAboxKNFtWiwKRN0M+jpfSzqJAQclHo001tKkjl3emc8V69igP3znzfnO/M9zcDcKT67azmjYWTwl9Vn7Vumeqzj1DVb6cleQY4oAVnIOPb+mKAGxQmKI5CWNJ2aLPatxWa3aB9K7/fB+/Z0jUF6TmMlFLQqrkECWQzOZxYGjTlOl8eeKaIY5yHnFn486xBustDjWT6dG7pmjHOJd+33t0iitTPkK6tEvjxq4h2MozQ6WFSX/LkDUGfFwfhEZj1Auz/U4pyAi5Sznd7uKzznXeVHlI/Aywmk6j7fsUsEuCGADrWARXXwjxWQsUbIupDHJI7kF5dRktg0eN81IbiZXiTESic50iwS+t1oJgL83jAiBupLDCQqwziaWSoAFSeIR3P5Xv5az00wyIn35QRYTwdSYbz8pH8fxUUAtxnFvYmEmgI0wYXUXcCCSpeEVpXlsRhBnCEATxWylL9+EKCAYhe1NGstUa6356kS9NVvt3DU2fd+Wtbm/+lSbylJqsqkSm9CRhvoJVlvKPvF1RKY/FcPn5j4UfIMLn8D4UYb54BNsilTDXKnF4CfTobA0FpoW/LSp306wkXM+XaOJhZaFkcNM82ASNAWMrhrUbRfmyeI1FvRBTpN06WKxa9BK0o2E4Pd3zfBBEwPsv9sQBnmLVbLEIZ/Xe9LYwJu/Er17W6HYVBc7vmuk0xUQ+pqxdom5Fnp55SiytXLPYoMXNM4u4SNSCFWnrVIzKG3EGyMXo6n/BQOe+bX3FClY4PwydVhthOZ9NnS+ntiLh0fxtlUJHAuGaFoVmttpVMeum0p3WEXbcll94l1wM/gZ0Ccczop77VvN2I7TlsZCsuXf1WHvWEhjO8DPtyOVg2/mvK9QqboEth+7pD6NUQC1HN/TwvydGBARi9MZSzLE4b8Ru3XhX2PBxf8E1er2A6516o0w4sIA+lwURhAON82Kwe2iDAC1Watq4XHaGQ7skLcFOtI5lDxuM2gZe6WFIotPAhbaeYlU4to5cuarF1QrcZ/lwrLaCJl66JBocYZnrNlvm2+MBCTmUymPrYZVbjdlr/BxlMjmNmNI3SAAAAAElFTkSuQmCC',
      }
    ])

    lf.render({
      "nodes": [
        {
          "id": "4a6978b7-b8a2-4c45-b2c6-c5dde956b858",
          "type": "circle",
          "x": 420,
          "y": 120,
          "properties": {
            "type": "upload"
          },
          "text": {
            "x": 420,
            "y": 120,
            "value": "开始"
          }
        },
        {
          "id": "75fd0b3f-60fe-4b39-8d7a-a3490815b7bd",
          "type": "rect",
          "x": 620,
          "y": 120,
          "properties": {
            "type": "dataFilter",
            "filterRules": [
              {
                "start": "123",
                "filterRule": " == ",
                "column": "股份第三个发送的",
                "type": "and"
              }
            ]
          },
          "text": {
            "x": 620,
            "y": 120,
            "value": "数据过滤"
          }
        },
        {
          "id": "8ef2fe61-d012-40b5-82e9-3c75c007de52",
          "type": "circle",
          "x": 280,
          "y": 320,
          "properties": {
            "type": "upload"
          },
          "text": {
            "x": 280,
            "y": 320,
            "value": "开始"
          }
        },
        {
          "id": "24caa356-2174-4da6-9ede-825381f9a9f8",
          "type": "rect",
          "x": 1020,
          "y": 240,
          "properties": {
            "type": "related",
            "relatedRules": [
              {
                "7a25e0bc-705c-43ad-acfe-2d0ddad5861d": "4",
                "da200fe2-53ee-40f6-aa51-975261d2959b": "股份第三个发送的",
                "8d26b58d-b474-443a-a021-bdd045184200": "股份第三个发送的",
                "relatedRule": " == "
              }
            ],
            "saveTableId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
            "tableIds": [
              "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
              "da200fe2-53ee-40f6-aa51-975261d2959b",
              "8d26b58d-b474-443a-a021-bdd045184200"
            ]
          },
          "text": {
            "x": 1020,
            "y": 240,
            "value": "合并"
          }
        },
        {
          "id": "c2b84045-2263-4e41-a16a-ca85d07ed21d",
          "type": "circle",
          "x": 1280,
          "y": 240,
          "properties": {},
          "text": {
            "x": 1280,
            "y": 240,
            "value": "结束"
          }
        },
        {
          "id": "1c5031cc-7c45-4730-867e-417c6819c793",
          "type": "rect",
          "x": 520,
          "y": 320,
          "properties": {
            "type": "dataFilter",
            "filterRules": [
              {
                "start": "123777",
                "filterRule": " == ",
                "column": "1",
                "type": "and"
              }
            ]
          },
          "text": {
            "x": 520,
            "y": 320,
            "value": "数据过滤"
          }
        },
        {
          "id": "6ed2820c-c5b4-4329-9ceb-7eafc3854910",
          "type": "circle",
          "x": 280,
          "y": 500,
          "properties": {
            "type": "upload"
          },
          "text": {
            "x": 280,
            "y": 500,
            "value": "开始"
          }
        },
        {
          "id": "f942f633-2062-4e9c-b4bb-ef23e35f9a14",
          "type": "rect",
          "x": 520,
          "y": 500,
          "properties": {
            "type": "dataFilter",
            "filterRules": [
              {
                "start": "123",
                "filterRule": ".includes",
                "column": "name",
                "type": "and"
              }
            ]
          },
          "text": {
            "x": 520,
            "y": 500,
            "value": "数据过滤"
          }
        },
        {
          "id": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
          "type": "rect",
          "x": 800,
          "y": 420,
          "properties": {
            "type": "related",
            "relatedRules": [
              {
                "1c5031cc-7c45-4730-867e-417c6819c793": "4",
                "f942f633-2062-4e9c-b4bb-ef23e35f9a14": "name",
                "6cd67a1c-545b-4ff4-b651-4b4e1563c36d": "模型规则",
                "relatedRule": " != "
              }
            ],
            "saveTableId": "1c5031cc-7c45-4730-867e-417c6819c793",
            "tableIds": [
              "1c5031cc-7c45-4730-867e-417c6819c793",
              "f942f633-2062-4e9c-b4bb-ef23e35f9a14",
              "6cd67a1c-545b-4ff4-b651-4b4e1563c36d"
            ]
          },
          "text": {
            "x": 800,
            "y": 420,
            "value": "合并"
          }
        },
        {
          "id": "ab66a2ae-1b63-4497-9463-44e549c18eb3",
          "type": "circle",
          "x": 280,
          "y": 660,
          "properties": {
            "type": "upload"
          },
          "text": {
            "x": 280,
            "y": 660,
            "value": "开始"
          }
        },
        {
          "id": "6cd67a1c-545b-4ff4-b651-4b4e1563c36d",
          "type": "rect",
          "x": 520,
          "y": 660,
          "properties": {
            "type": "dataFilter",
            "filterRules": [
              {
                "start": "123",
                "filterRule": " == ",
                "column": "模型名称",
                "type": "and"
              }
            ]
          },
          "text": {
            "x": 520,
            "y": 660,
            "value": "数据过滤"
          }
        },
        {
          "id": "da200fe2-53ee-40f6-aa51-975261d2959b",
          "type": "rect",
          "x": 840,
          "y": 120,
          "properties": {
            "type": "dataFilter",
            "filterRules": [
              {
                "start": "女",
                "filterRule": " == ",
                "column": "萨达",
                "type": "and"
              }
            ]
          },
          "text": {
            "x": 840,
            "y": 120,
            "value": "数据过滤"
          }
        },
        {
          "id": "06c11828-36fc-4922-b90e-f2819ef77a6c",
          "type": "circle",
          "x": 420,
          "y": -40,
          "properties": {
            "type": "upload"
          },
          "text": {
            "x": 420,
            "y": -40,
            "value": "开始"
          }
        },
        {
          "id": "8d26b58d-b474-443a-a021-bdd045184200",
          "type": "rect",
          "x": 620,
          "y": -40,
          "properties": {
            "type": "deduplicate",
            "deduplicateRules": [
              "萨达"
            ]
          },
          "text": {
            "x": 620,
            "y": -40,
            "value": "去重"
          }
        }
      ],
      "edges": [
        {
          "id": "b1ebbcab-b169-4d89-8413-0191ef46a87e",
          "type": "polyline",
          "sourceNodeId": "4a6978b7-b8a2-4c45-b2c6-c5dde956b858",
          "targetNodeId": "75fd0b3f-60fe-4b39-8d7a-a3490815b7bd",
          "startPoint": {
            "x": 470,
            "y": 120
          },
          "endPoint": {
            "x": 570,
            "y": 120
          },
          "properties": {},
          "pointsList": [
            {
              "x": 470,
              "y": 120
            },
            {
              "x": 570,
              "y": 120
            }
          ]
        },
        {
          "id": "f25ffecf-d909-43fa-8856-78b22c3dab50",
          "type": "polyline",
          "sourceNodeId": "24caa356-2174-4da6-9ede-825381f9a9f8",
          "targetNodeId": "c2b84045-2263-4e41-a16a-ca85d07ed21d",
          "startPoint": {
            "x": 1070,
            "y": 240
          },
          "endPoint": {
            "x": 1230,
            "y": 240
          },
          "properties": {},
          "pointsList": [
            {
              "x": 1070,
              "y": 240
            },
            {
              "x": 1230,
              "y": 240
            }
          ]
        },
        {
          "id": "f28a8d17-3c53-40f5-8b0e-3c5dc9578255",
          "type": "polyline",
          "sourceNodeId": "8ef2fe61-d012-40b5-82e9-3c75c007de52",
          "targetNodeId": "1c5031cc-7c45-4730-867e-417c6819c793",
          "startPoint": {
            "x": 330,
            "y": 320
          },
          "endPoint": {
            "x": 470,
            "y": 320
          },
          "properties": {},
          "pointsList": [
            {
              "x": 330,
              "y": 320
            },
            {
              "x": 470,
              "y": 320
            }
          ]
        },
        {
          "id": "84fad638-e651-432f-8bc9-d09ce3e14908",
          "type": "polyline",
          "sourceNodeId": "6ed2820c-c5b4-4329-9ceb-7eafc3854910",
          "targetNodeId": "f942f633-2062-4e9c-b4bb-ef23e35f9a14",
          "startPoint": {
            "x": 330,
            "y": 500
          },
          "endPoint": {
            "x": 470,
            "y": 500
          },
          "properties": {},
          "pointsList": [
            {
              "x": 330,
              "y": 500
            },
            {
              "x": 470,
              "y": 500
            }
          ]
        },
        {
          "id": "8d9b770f-d5e9-4e9c-a978-e1967e46ccff",
          "type": "polyline",
          "sourceNodeId": "1c5031cc-7c45-4730-867e-417c6819c793",
          "targetNodeId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
          "startPoint": {
            "x": 570,
            "y": 320
          },
          "endPoint": {
            "x": 750,
            "y": 420
          },
          "properties": {},
          "pointsList": [
            {
              "x": 570,
              "y": 320
            },
            {
              "x": 600,
              "y": 320
            },
            {
              "x": 600,
              "y": 420
            },
            {
              "x": 750,
              "y": 420
            }
          ]
        },
        {
          "id": "b5b1dee9-c16c-49da-916a-dadab3b46bf3",
          "type": "polyline",
          "sourceNodeId": "f942f633-2062-4e9c-b4bb-ef23e35f9a14",
          "targetNodeId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
          "startPoint": {
            "x": 570,
            "y": 500
          },
          "endPoint": {
            "x": 750,
            "y": 420
          },
          "properties": {},
          "pointsList": [
            {
              "x": 570,
              "y": 500
            },
            {
              "x": 600,
              "y": 500
            },
            {
              "x": 600,
              "y": 420
            },
            {
              "x": 750,
              "y": 420
            }
          ]
        },
        {
          "id": "6f81ce20-05ad-4ad8-87da-cf814ff751d2",
          "type": "polyline",
          "sourceNodeId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
          "targetNodeId": "24caa356-2174-4da6-9ede-825381f9a9f8",
          "startPoint": {
            "x": 850,
            "y": 420
          },
          "endPoint": {
            "x": 970,
            "y": 240
          },
          "properties": {},
          "pointsList": [
            {
              "x": 850,
              "y": 420
            },
            {
              "x": 940,
              "y": 420
            },
            {
              "x": 940,
              "y": 240
            },
            {
              "x": 970,
              "y": 240
            }
          ]
        },
        {
          "id": "967416ad-99b0-40c5-9e23-8bb1aad60be9",
          "type": "polyline",
          "sourceNodeId": "ab66a2ae-1b63-4497-9463-44e549c18eb3",
          "targetNodeId": "6cd67a1c-545b-4ff4-b651-4b4e1563c36d",
          "startPoint": {
            "x": 330,
            "y": 660
          },
          "endPoint": {
            "x": 470,
            "y": 660
          },
          "properties": {},
          "pointsList": [
            {
              "x": 330,
              "y": 660
            },
            {
              "x": 470,
              "y": 660
            }
          ]
        },
        {
          "id": "57f99c69-c943-459e-a002-3f0f9c53e4ac",
          "type": "polyline",
          "sourceNodeId": "6cd67a1c-545b-4ff4-b651-4b4e1563c36d",
          "targetNodeId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
          "startPoint": {
            "x": 570,
            "y": 660
          },
          "endPoint": {
            "x": 750,
            "y": 420
          },
          "properties": {},
          "pointsList": [
            {
              "x": 570,
              "y": 660
            },
            {
              "x": 720,
              "y": 660
            },
            {
              "x": 720,
              "y": 420
            },
            {
              "x": 750,
              "y": 420
            }
          ]
        },
        {
          "id": "24c86012-23af-408e-b723-195ec4319e56",
          "type": "polyline",
          "sourceNodeId": "75fd0b3f-60fe-4b39-8d7a-a3490815b7bd",
          "targetNodeId": "da200fe2-53ee-40f6-aa51-975261d2959b",
          "startPoint": {
            "x": 670,
            "y": 120
          },
          "endPoint": {
            "x": 790,
            "y": 120
          },
          "properties": {},
          "pointsList": [
            {
              "x": 670,
              "y": 120
            },
            {
              "x": 790,
              "y": 120
            }
          ]
        },
        {
          "id": "57752aca-af2e-4e4f-a4af-f0dd56252854",
          "type": "polyline",
          "sourceNodeId": "da200fe2-53ee-40f6-aa51-975261d2959b",
          "targetNodeId": "24caa356-2174-4da6-9ede-825381f9a9f8",
          "startPoint": {
            "x": 890,
            "y": 120
          },
          "endPoint": {
            "x": 970,
            "y": 240
          },
          "properties": {},
          "pointsList": [
            {
              "x": 890,
              "y": 120
            },
            {
              "x": 940,
              "y": 120
            },
            {
              "x": 940,
              "y": 240
            },
            {
              "x": 970,
              "y": 240
            }
          ]
        },
        {
          "id": "61dd1118-f25b-4ee6-9ab3-a193ecd9c412",
          "type": "polyline",
          "sourceNodeId": "8d26b58d-b474-443a-a021-bdd045184200",
          "targetNodeId": "24caa356-2174-4da6-9ede-825381f9a9f8",
          "startPoint": {
            "x": 670,
            "y": -40
          },
          "endPoint": {
            "x": 970,
            "y": 240
          },
          "properties": {},
          "pointsList": [
            {
              "x": 670,
              "y": -40
            },
            {
              "x": 940,
              "y": -40
            },
            {
              "x": 940,
              "y": 240
            },
            {
              "x": 970,
              "y": 240
            }
          ]
        },
        {
          "id": "c89848e5-de11-4c47-b135-77d33b7e03e2",
          "type": "polyline",
          "sourceNodeId": "06c11828-36fc-4922-b90e-f2819ef77a6c",
          "targetNodeId": "8d26b58d-b474-443a-a021-bdd045184200",
          "startPoint": {
            "x": 470,
            "y": -40
          },
          "endPoint": {
            "x": 570,
            "y": -40
          },
          "properties": {},
          "pointsList": [
            {
              "x": 470,
              "y": -40
            },
            {
              "x": 570,
              "y": -40
            }
          ]
        }
      ]
    })

    lf.on('node:dbclick', (data) => {
      console.log(data)

      const inComingNodes = lf.getNodeIncomingNode(data.data.id)

      let type = data.data.properties.type

      if (type !== 'upload' && inComingNodes.length === 0) {
        this.$message.error('请配置数据源')
        return
      }

      if (inComingNodes.length > 0) {
        for (let i = 0; i < inComingNodes.length; i++) {
          if (!(inComingNodes[i].id in this.xlsxData)) {
            this.$message.error('前面有节点数据为空')
            return
          }
        }
      }

      this.config.title = data.data.text.value
      this.draw[data.data.properties.type] = true
      this.nowOption = {
        id: data.data.id,
        preview: false
      }

      if (type === 'dataFilter') {
        for (let i = 0; i < inComingNodes.length; i++) {
          this.$set(this.xlsxData, data.data.id, Object.assign({}, this.xlsxData[inComingNodes[i].id]))
        }

        if ('filterRules' in data.data.properties) {
          this.$set(this.nowOption, 'filterRules', [...data.data.properties.filterRules])
        } else {
          this.$set(this.nowOption, 'filterRules', [])
        }

      } else if (type === 'deduplicate') {
        for (let i = 0; i < inComingNodes.length; i++) {
          this.$set(this.xlsxData, data.data.id, Object.assign({}, this.xlsxData[inComingNodes[i].id]))
        }

        if ('deduplicateRules' in data.data.properties) {
          this.$set(this.nowOption, 'deduplicateRules', [...data.data.properties.deduplicateRules])
        } else {
          this.$set(this.nowOption, 'deduplicateRules', [])
        }

      } else if (type === 'related') {
        this.$set(this.nowOption, 'tableIds', inComingNodes.sort((a, b) => a.id - b.id).map(data => data.id))
        this.$set(this.nowOption, 'tableNames', inComingNodes.sort((a, b) => a.id - b.id).map(data => data.text.value))

        if ('relatedRules' in data.data.properties) {
          this.$set(this.nowOption, 'relatedRules', [...data.data.properties.relatedRules])
        } else {
          this.$set(this.nowOption, 'relatedRules', [])
        }

        if ('saveTableId' in data.data.properties) {
          this.$set(this.nowOption, 'saveTableId', data.data.properties.saveTableId)
          this.$set(this.xlsxData, data.data.id, Object.assign({}, this.xlsxData[data.data.properties.saveTableId]))
        } else {
          this.$set(this.nowOption, 'saveTableId', '')
        }

      }

      // 导出数据
      console.log(lf.getGraphData())
    })

    this.lf = lf

  }
}

</script>

<style scoped>
.filter-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
</style>
